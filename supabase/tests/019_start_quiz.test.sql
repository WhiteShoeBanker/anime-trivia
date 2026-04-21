-- pgTAP tests for start_quiz() and submit_quiz()
--
-- How to run:
--   supabase test db
-- (Requires `supabase` CLI + a local dev database. pgTAP is installed
-- automatically by `supabase test db` in the CLI's managed postgres.)
--
-- The two-session race test for start_quiz lives in
-- concurrent_start_quiz.sql (separate file because it needs to COMMIT
-- fixtures so dblink connections can see them — pgTAP wraps each file
-- in BEGIN/ROLLBACK).

BEGIN;

SELECT plan(20);

-- ── Test fixtures ────────────────────────────────────────────

INSERT INTO auth.users (id, email) VALUES
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'free-fresh@test.local'),
  ('a0000000-0000-0000-0000-000000000002'::uuid, 'free-9@test.local'),
  ('a0000000-0000-0000-0000-000000000003'::uuid, 'free-10@test.local'),
  ('a0000000-0000-0000-0000-000000000004'::uuid, 'pro-active@test.local'),
  ('a0000000-0000-0000-0000-000000000005'::uuid, 'pro-expired@test.local'),
  ('a0000000-0000-0000-0000-000000000006'::uuid, 'free-stale@test.local'),
  ('a0000000-0000-0000-0000-000000000007'::uuid, 'free-cap-low@test.local'),
  ('a0000000-0000-0000-0000-000000000008'::uuid, 'free-tampered@test.local');

-- handle_new_user trigger creates user_profiles rows for each. After
-- migration 016 the rows start with age_group IS NULL; we set them to
-- 'full' so the tests aren't tangled with unrelated age checks.
UPDATE user_profiles SET age_group = 'full'
  WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000008'
  );

-- Today (UTC) for fixture setup.
DO $$
DECLARE
  v_today date := (NOW() AT TIME ZONE 'UTC')::date;
BEGIN
  -- Free user, count 9, today  → one slot left
  UPDATE user_profiles
    SET subscription_tier = 'free',
        daily_quiz_count = 9,
        daily_quiz_reset = v_today
    WHERE id = 'a0000000-0000-0000-0000-000000000002';

  -- Free user, count 10, today → at cap
  UPDATE user_profiles
    SET subscription_tier = 'free',
        daily_quiz_count = 10,
        daily_quiz_reset = v_today
    WHERE id = 'a0000000-0000-0000-0000-000000000003';

  -- Pro user, expires in 1 month
  UPDATE user_profiles
    SET subscription_tier = 'pro',
        subscription_source = 'paid',
        pro_expires_at = NOW() + INTERVAL '1 month',
        daily_quiz_count = 50,
        daily_quiz_reset = v_today
    WHERE id = 'a0000000-0000-0000-0000-000000000004';

  -- Pro user with expired pro_expires_at → effectively free
  UPDATE user_profiles
    SET subscription_tier = 'pro',
        subscription_source = 'paid',
        pro_expires_at = NOW() - INTERVAL '1 day',
        daily_quiz_count = 5,
        daily_quiz_reset = v_today
    WHERE id = 'a0000000-0000-0000-0000-000000000005';

  -- Stale reset: yesterday, count 10. Lazy reset must zero this out.
  UPDATE user_profiles
    SET subscription_tier = 'free',
        daily_quiz_count = 10,
        daily_quiz_reset = v_today - 1
    WHERE id = 'a0000000-0000-0000-0000-000000000006';

  -- Free user at count 3 — used to verify admin_config override (limit=3).
  UPDATE user_profiles
    SET subscription_tier = 'free',
        daily_quiz_count = 3,
        daily_quiz_reset = v_today
    WHERE id = 'a0000000-0000-0000-0000-000000000007';

  -- Tampered: count > limit (only reachable via direct DB write — the
  -- trigger blocks the client and start_quiz caps at limit). Used for
  -- the submit_quiz backstop test.
  UPDATE user_profiles
    SET subscription_tier = 'free',
        daily_quiz_count = 50,
        daily_quiz_reset = v_today
    WHERE id = 'a0000000-0000-0000-0000-000000000008';
END $$;

-- Helper: pose as a given user for the next statement.
CREATE OR REPLACE FUNCTION _test_set_user(p_user uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', p_user::text, true);
  PERFORM set_config('role', 'authenticated', true);
END;
$$ LANGUAGE plpgsql;

-- ── Scenario 1: free user, count=0, limit=10 → success, count=1 ──

SELECT _test_set_user('a0000000-0000-0000-0000-000000000001');

SELECT is(
  (SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'success')::boolean),
  true,
  'free user, count=0 → success'
);

SELECT is(
  (SELECT daily_quiz_count FROM user_profiles
   WHERE id = 'a0000000-0000-0000-0000-000000000001'),
  1,
  'free user, count=0 → counter incremented to 1'
);

-- ── Scenario 2: free user, count=9, limit=10 → success, count=10 ──

SELECT _test_set_user('a0000000-0000-0000-0000-000000000002');

SELECT is(
  (SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'success')::boolean),
  true,
  'free user, count=9 → success (last allowed slot)'
);

SELECT is(
  (SELECT daily_quiz_count FROM user_profiles
   WHERE id = 'a0000000-0000-0000-0000-000000000002'),
  10,
  'free user, count=9 → counter incremented to 10'
);

-- ── Scenario 3: free user, count=10, limit=10 → rate_limited ─────

SELECT _test_set_user('a0000000-0000-0000-0000-000000000003');

SELECT is(
  (SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'error_code')),
  'rate_limited',
  'free user, count=10 → rate_limited'
);

SELECT is(
  (SELECT daily_quiz_count FROM user_profiles
   WHERE id = 'a0000000-0000-0000-0000-000000000003'),
  10,
  'rate_limited rejection did not bump counter'
);

-- ── Scenario 4: active Pro → success, counter NOT incremented ────

SELECT _test_set_user('a0000000-0000-0000-0000-000000000004');

SELECT is(
  (SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'tier')),
  'pro',
  'active pro_expires_at → tier=pro'
);

SELECT is(
  (SELECT daily_quiz_count FROM user_profiles
   WHERE id = 'a0000000-0000-0000-0000-000000000004'),
  50,
  'pro user counter NOT incremented'
);

SELECT is(
  (SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'quizzes_remaining')),
  NULL,
  'pro user quizzes_remaining=null (unlimited)'
);

-- ── Scenario 5: expired Pro → treated as free ────────────────────
-- Profile is subscription_tier='pro' but pro_expires_at is in the past.
-- Effective tier must be free. The first call must enter the free-user
-- branch and increment count from 5 → 6.

SELECT _test_set_user('a0000000-0000-0000-0000-000000000005');

SELECT is(
  (SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'tier')),
  'free',
  'expired pro_expires_at → tier=free'
);

SELECT is(
  (SELECT daily_quiz_count FROM user_profiles
   WHERE id = 'a0000000-0000-0000-0000-000000000005'),
  6,
  'expired pro → counter incremented like free user'
);

-- ── Scenario 6: stale reset date → lazy resets to 0, then proceeds ──
-- Fixture: count=10, reset=yesterday. Without lazy reset this would
-- be rate_limited; with lazy reset count→0 then→1 and call succeeds.

SELECT _test_set_user('a0000000-0000-0000-0000-000000000006');

SELECT is(
  (SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'success')::boolean),
  true,
  'stale reset → lazy resets and succeeds'
);

SELECT is(
  (SELECT daily_quiz_count FROM user_profiles
   WHERE id = 'a0000000-0000-0000-0000-000000000006'),
  1,
  'stale reset → counter is 1 (not 11)'
);

SELECT is(
  (SELECT daily_quiz_reset FROM user_profiles
   WHERE id = 'a0000000-0000-0000-0000-000000000006'),
  (NOW() AT TIME ZONE 'UTC')::date,
  'stale reset → reset date advanced to today (UTC)'
);

-- ── Scenario 7: admin_config override (free_quiz_limit=3) ────────
-- Fixture: free user at count=3. With limit=3 they must be rate_limited.

UPDATE admin_config SET value = '3'::jsonb WHERE key = 'free_quiz_limit';

SELECT _test_set_user('a0000000-0000-0000-0000-000000000007');

SELECT is(
  (SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'error_code')),
  'rate_limited',
  'admin_config override: limit=3, count=3 → rate_limited'
);

SELECT is(
  ((SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'limit'))::int),
  3,
  'admin_config override: returned limit reflects override'
);

-- Restore default for downstream tests.
UPDATE admin_config SET value = '10'::jsonb WHERE key = 'free_quiz_limit';

-- ── Scenario 8: submit_quiz backstop ─────────────────────────────
-- Fixture: count=50, limit=10 (only reachable via tamper). Submit MUST
-- reject so XP/awards never get granted on a bypassed session.

SELECT _test_set_user('a0000000-0000-0000-0000-000000000008');

SELECT is(
  (SELECT (submit_quiz()->>'error_code')),
  'rate_limited',
  'submit backstop: count > limit (tampered) → rate_limited'
);

-- ── Scenario 9: not authenticated ────────────────────────────────

SELECT set_config('request.jwt.claim.sub', '', true);

SELECT is(
  (SELECT (start_quiz('00000000-0000-0000-0000-000000000000'::uuid)->>'error_code')),
  'not_authenticated',
  'no auth.uid() → error_code=not_authenticated'
);

SELECT is(
  (SELECT (submit_quiz()->>'error_code')),
  'not_authenticated',
  'submit_quiz with no auth.uid() → error_code=not_authenticated'
);

-- ── Cleanup ──────────────────────────────────────────────────

SELECT * FROM finish();
ROLLBACK;
