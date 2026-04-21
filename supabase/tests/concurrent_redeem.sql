-- True two-session concurrency test for redeem_promo_code()
--
-- Why this is a separate file: pgTAP wraps each *.test.sql in
-- BEGIN/ROLLBACK, but dblink connections are independent libpq
-- sessions that cannot see uncommitted state from the calling
-- transaction. So this script:
--   1. Commits its fixture rows (so dblink sessions see them)
--   2. Issues two parallel RPC calls via dblink_send_query
--   3. Asserts exactly one succeeds and the other gets 'exhausted'
--   4. Cleans up its committed fixtures regardless of outcome
--
-- Prerequisites:
--   * Postgres dblink extension (`CREATE EXTENSION IF NOT EXISTS dblink`)
--   * The script must be able to make a loopback connection to itself.
--     With supabase test db this works via the local socket; for other
--     environments set the PG connection string at the top.
--
-- How to run:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/concurrent_redeem.sql
-- Exit status 0 = race produced exactly one winner. Non-zero = the
-- lock isn't doing its job; investigate before shipping.

\set ON_ERROR_STOP on

CREATE EXTENSION IF NOT EXISTS dblink;

-- ── Self-connection string ────────────────────────────────────
-- dblink needs to open a real second backend. We use the same DB
-- the script is already attached to. Override CONN_STR at the
-- psql command line if peer auth doesn't work for your env.
\set CONN_STR `echo "${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"`

-- ── Fixtures (committed so dblink sessions see them) ──────────

DO $$
BEGIN
  -- Race fixture cleanup in case a previous run aborted halfway.
  DELETE FROM promo_redemptions WHERE promo_code_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  DELETE FROM promo_codes WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  DELETE FROM user_profiles WHERE id IN (
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
  );
  DELETE FROM auth.users WHERE id IN (
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
  );
END $$;

INSERT INTO auth.users (id, email) VALUES
  ('55555555-5555-5555-5555-555555555555'::uuid, 'race-a@test.local'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'race-b@test.local');

UPDATE user_profiles SET age_group = 'full', subscription_tier = 'free'
  WHERE id IN (
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
  );

INSERT INTO promo_codes (id, code, type, max_uses, current_uses)
  VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
          'RACECODE', 'pro_monthly', 1, 0);

-- ── The race ──────────────────────────────────────────────────

DO $race$
DECLARE
  v_conn_str text := :'CONN_STR';
  v_r1 jsonb;
  v_r2 jsonb;
  v_succ_count int;
  v_exhausted_count int;
  v_final_uses int;
  v_setup_a text;
  v_setup_b text;
BEGIN
  PERFORM dblink_connect('race_a', v_conn_str);
  PERFORM dblink_connect('race_b', v_conn_str);

  -- Each session impersonates a different user (auth.uid() reads
  -- from request.jwt.claim.sub which is per-session GUC).
  v_setup_a := $$
    SELECT set_config('request.jwt.claim.sub',
                      '55555555-5555-5555-5555-555555555555', false);
    SELECT set_config('role', 'authenticated', false);
  $$;
  v_setup_b := $$
    SELECT set_config('request.jwt.claim.sub',
                      '66666666-6666-6666-6666-666666666666', false);
    SELECT set_config('role', 'authenticated', false);
  $$;
  PERFORM dblink_exec('race_a', v_setup_a);
  PERFORM dblink_exec('race_b', v_setup_b);

  -- Fire both calls non-blocking. Postgres backend B will block on
  -- backend A's FOR UPDATE lock; once A commits, B re-reads and
  -- sees current_uses=1 ≥ max_uses=1.
  PERFORM dblink_send_query('race_a',
    'SELECT redeem_promo_code(''RACECODE'')::text');
  PERFORM dblink_send_query('race_b',
    'SELECT redeem_promo_code(''RACECODE'')::text');

  SELECT result::jsonb INTO v_r1
    FROM dblink_get_result('race_a') AS t(result text);
  SELECT result::jsonb INTO v_r2
    FROM dblink_get_result('race_b') AS t(result text);

  -- Drain the empty trailing result that dblink_send_query produces.
  PERFORM * FROM dblink_get_result('race_a') AS t(result text);
  PERFORM * FROM dblink_get_result('race_b') AS t(result text);

  PERFORM dblink_disconnect('race_a');
  PERFORM dblink_disconnect('race_b');

  RAISE NOTICE 'race result A: %', v_r1;
  RAISE NOTICE 'race result B: %', v_r2;

  v_succ_count :=
    (CASE WHEN (v_r1->>'success')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (v_r2->>'success')::boolean THEN 1 ELSE 0 END);

  v_exhausted_count :=
    (CASE WHEN (v_r1->>'error_code') = 'exhausted' THEN 1 ELSE 0 END) +
    (CASE WHEN (v_r2->>'error_code') = 'exhausted' THEN 1 ELSE 0 END);

  IF v_succ_count <> 1 THEN
    RAISE EXCEPTION
      'CONCURRENCY VIOLATION: expected exactly 1 winner, got % (A=%, B=%)',
      v_succ_count, v_r1, v_r2;
  END IF;

  IF v_exhausted_count <> 1 THEN
    RAISE EXCEPTION
      'CONCURRENCY VIOLATION: expected exactly 1 exhausted result, got % (A=%, B=%)',
      v_exhausted_count, v_r1, v_r2;
  END IF;

  SELECT current_uses INTO v_final_uses
    FROM promo_codes
    WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

  IF v_final_uses <> 1 THEN
    RAISE EXCEPTION
      'CONCURRENCY VIOLATION: current_uses ended at % (expected 1)',
      v_final_uses;
  END IF;

  RAISE NOTICE 'PASS: exactly one winner, exactly one exhausted, current_uses=1';
END;
$race$;

-- ── Cleanup ──────────────────────────────────────────────────

DELETE FROM promo_redemptions WHERE promo_code_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
DELETE FROM promo_codes WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
DELETE FROM user_profiles WHERE id IN (
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
DELETE FROM auth.users WHERE id IN (
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
