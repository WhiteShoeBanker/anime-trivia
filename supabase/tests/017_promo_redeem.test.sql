-- pgTAP tests for redeem_promo_code()
--
-- How to run:
--   supabase test db
-- (Requires `supabase` CLI + a local dev database. pgTAP is installed
-- automatically by `supabase test db` in the CLI's managed postgres.)
--
-- These tests exercise the RPC against a real Postgres instance with
-- pgTAP assertions. Per the task spec, the Postgres function is NOT
-- mocked in client tests; this file is its source of truth.
--
-- The two-session race test lives in `concurrent_redeem.sql` (separate
-- file because it needs to COMMIT fixtures so dblink connections can
-- see them — pgTAP wraps each file in BEGIN/ROLLBACK).

BEGIN;

SELECT plan(20);

-- ── Test fixtures ────────────────────────────────────────────

INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'alice@test.local'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'bob@test.local'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'carol@test.local');

-- handle_new_user trigger creates user_profiles rows for each. After
-- migration 016 the rows start with age_group IS NULL; we set them to
-- 'full' here so the tests aren't tangled with unrelated age checks.
UPDATE user_profiles SET age_group = 'full'
  WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
  );

-- Carol starts as Pro from a non-promo source so we can test the
-- already_pro guard.
UPDATE user_profiles
  SET subscription_tier = 'pro',
      subscription_source = 'paid',
      pro_expires_at = NOW() + INTERVAL '1 month'
  WHERE id = '33333333-3333-3333-3333-333333333333';

INSERT INTO promo_codes (id, code, type, max_uses, current_uses, expires_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'VALIDMONTHLY', 'pro_monthly', 10, 0, NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'LASTSLOT',     'pro_monthly', 1,  0, NULL),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
    'STALE',        'pro_monthly', 10, 0, '2020-01-01T00:00:00Z'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd',
    'FULLUP',       'pro_monthly', 2,  2, NULL);

-- Helper to pose as a given user for the next statement. Supabase
-- derives auth.uid() from request.jwt.claim.sub.
CREATE OR REPLACE FUNCTION _test_set_user(p_user uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', p_user::text, true);
  PERFORM set_config('role', 'authenticated', true);
END;
$$ LANGUAGE plpgsql;

-- ── Scenario 1: valid redemption ─────────────────────────────

SELECT _test_set_user('11111111-1111-1111-1111-111111111111');

SELECT is(
  (SELECT (redeem_promo_code('VALIDMONTHLY')->>'success')::boolean),
  true,
  'valid code returns success=true for authenticated user'
);

SELECT is(
  (SELECT current_uses FROM promo_codes
   WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1,
  'valid redemption increments current_uses'
);

SELECT is(
  (SELECT subscription_tier FROM user_profiles
   WHERE id = '11111111-1111-1111-1111-111111111111'),
  'pro',
  'valid redemption upgrades user to pro'
);

SELECT is(
  (SELECT COUNT(*)::int FROM promo_redemptions
   WHERE user_id = '11111111-1111-1111-1111-111111111111'
     AND promo_code_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1,
  'valid redemption inserts a promo_redemptions row'
);

-- ── Scenario 2: expired code ─────────────────────────────────
-- Bob attempts STALE; assert error_code AND no DB state changed.

SELECT _test_set_user('22222222-2222-2222-2222-222222222222');

SELECT is(
  (SELECT (redeem_promo_code('STALE')->>'error_code')),
  'expired',
  'expired code returns error_code=expired'
);

SELECT is(
  (SELECT current_uses FROM promo_codes
   WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  0,
  'expired-code error did not bump current_uses'
);

SELECT is(
  (SELECT subscription_tier FROM user_profiles
   WHERE id = '22222222-2222-2222-2222-222222222222'),
  'free',
  'expired-code error did not upgrade caller to pro'
);

-- ── Scenario 3: exhausted code ───────────────────────────────

SELECT is(
  (SELECT (redeem_promo_code('FULLUP')->>'error_code')),
  'exhausted',
  'code at max_uses returns error_code=exhausted'
);

SELECT is(
  (SELECT current_uses FROM promo_codes
   WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  2,
  'exhausted-code error did not bump current_uses past max'
);

SELECT is(
  (SELECT subscription_tier FROM user_profiles
   WHERE id = '22222222-2222-2222-2222-222222222222'),
  'free',
  'exhausted-code error did not upgrade caller to pro'
);

-- ── Scenario 4: duplicate redemption by same user ────────────
-- alice redeemed VALIDMONTHLY in Scenario 1; redeeming again must
-- return already_redeemed AND must not bump current_uses again.

SELECT _test_set_user('11111111-1111-1111-1111-111111111111');

SELECT is(
  (SELECT (redeem_promo_code('VALIDMONTHLY')->>'error_code')),
  'already_redeemed',
  'same user redeeming twice returns error_code=already_redeemed'
);

SELECT is(
  (SELECT current_uses FROM promo_codes
   WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1,
  'already_redeemed error did not bump current_uses again'
);

-- ── Scenario 5: already-Pro user (different source) ──────────
-- carol was provisioned as paid Pro above. She must not be able to
-- redeem a valid code, AND no state should change.

SELECT _test_set_user('33333333-3333-3333-3333-333333333333');

SELECT is(
  (SELECT (redeem_promo_code('VALIDMONTHLY')->>'error_code')),
  'already_pro',
  'paid Pro user cannot redeem — error_code=already_pro'
);

SELECT is(
  (SELECT subscription_source FROM user_profiles
   WHERE id = '33333333-3333-3333-3333-333333333333'),
  'paid',
  'already_pro error did not overwrite subscription_source'
);

SELECT is(
  (SELECT current_uses FROM promo_codes
   WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1,
  'already_pro error did not bump current_uses'
);

-- ── Scenario 6: same-session post-lock decision (LASTSLOT) ───
--
-- The true two-session race lives in concurrent_redeem.sql. This
-- single-session test still proves the post-lock decision path: if
-- the first redeemer wins LASTSLOT, the next caller sees exhausted.

SELECT _test_set_user('22222222-2222-2222-2222-222222222222');
SELECT is(
  (SELECT (redeem_promo_code('LASTSLOT')->>'success')::boolean),
  true,
  'LASTSLOT: first redeemer wins'
);

-- bob is now pro from LASTSLOT. carol is already_pro. To test the
-- post-lock 'exhausted' branch we need a third caller who is NOT
-- already pro. Use a fresh user.
INSERT INTO auth.users (id, email)
  VALUES ('44444444-4444-4444-4444-444444444444'::uuid, 'dave@test.local');
UPDATE user_profiles SET age_group = 'full'
  WHERE id = '44444444-4444-4444-4444-444444444444';

SELECT _test_set_user('44444444-4444-4444-4444-444444444444');
SELECT is(
  (SELECT (redeem_promo_code('LASTSLOT')->>'error_code')),
  'exhausted',
  'LASTSLOT: second redeemer sees exhausted (FOR UPDATE serializes the race)'
);

-- ── Scenario 7: unauthenticated ──────────────────────────────

SELECT set_config('request.jwt.claim.sub', '', true);
SELECT is(
  (SELECT (redeem_promo_code('VALIDMONTHLY')->>'error_code')),
  'unauthenticated',
  'caller without auth.uid() returns error_code=unauthenticated'
);

-- ── Scenario 8: unknown code ─────────────────────────────────

SELECT _test_set_user('44444444-4444-4444-4444-444444444444');
SELECT is(
  (SELECT (redeem_promo_code('NOSUCHCODE')->>'error_code')),
  'invalid',
  'unknown code returns error_code=invalid'
);

-- ── Scenario 9: empty / blank input ──────────────────────────

SELECT is(
  (SELECT (redeem_promo_code('   ')->>'error_code')),
  'invalid',
  'blank input returns error_code=invalid'
);

-- ── Cleanup ──────────────────────────────────────────────────

SELECT * FROM finish();
ROLLBACK;
