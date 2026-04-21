-- True two-session concurrency test for start_quiz()
--
-- Why this is a separate file: pgTAP wraps each *.test.sql in
-- BEGIN/ROLLBACK, but dblink connections are independent libpq
-- sessions that cannot see uncommitted state from the calling
-- transaction. So this script:
--   1. Commits its fixture rows (so dblink sessions see them)
--   2. Issues two parallel start_quiz calls via dblink_send_query
--   3. Asserts exactly one succeeds and the other gets rate_limited
--   4. Cleans up its committed fixtures regardless of outcome
--
-- The exploit this proves we close: a single user opens two tabs
-- with daily_quiz_count=9 and clicks "Start Quiz" on both. With the
-- old localStorage gate both would pass and consume two slots while
-- the counter only advanced by one. With the FOR UPDATE row lock
-- in start_quiz, the second backend blocks until the first commits,
-- then re-reads count=10 and returns rate_limited.
--
-- Prerequisites:
--   * Postgres dblink extension (`CREATE EXTENSION IF NOT EXISTS dblink`)
--   * Loopback connection. With supabase test db this works via the
--     local socket; for other environments set CONN_STR explicitly.
--
-- How to run:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/concurrent_start_quiz.sql
-- Exit status 0 = race produced exactly one winner. Non-zero = the
-- lock isn't doing its job; investigate before shipping.

\set ON_ERROR_STOP on

CREATE EXTENSION IF NOT EXISTS dblink;

\set CONN_STR `echo "${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"`

-- ── Fixtures (committed so dblink sessions see them) ──────────

DO $$
BEGIN
  -- Cleanup in case a prior run aborted partway.
  DELETE FROM user_profiles WHERE id = 'b0000000-0000-0000-0000-000000000099';
  DELETE FROM auth.users WHERE id = 'b0000000-0000-0000-0000-000000000099';
END $$;

INSERT INTO auth.users (id, email)
  VALUES ('b0000000-0000-0000-0000-000000000099'::uuid, 'race-quiz@test.local');

UPDATE user_profiles
  SET age_group = 'full',
      subscription_tier = 'free',
      daily_quiz_count = 9,
      daily_quiz_reset = (NOW() AT TIME ZONE 'UTC')::date
  WHERE id = 'b0000000-0000-0000-0000-000000000099';

-- ── The race: same user, two backends, last slot ──────────────

DO $race$
DECLARE
  v_conn_str text := :'CONN_STR';
  v_r1 jsonb;
  v_r2 jsonb;
  v_succ_count int;
  v_rate_count int;
  v_final_count int;
  v_setup text;
BEGIN
  PERFORM dblink_connect('quiz_a', v_conn_str);
  PERFORM dblink_connect('quiz_b', v_conn_str);

  -- Same user on both connections — the multi-tab exploit. auth.uid()
  -- is read from request.jwt.claim.sub, which is per-session GUC.
  v_setup := $$
    SELECT set_config('request.jwt.claim.sub',
                      'b0000000-0000-0000-0000-000000000099', false);
    SELECT set_config('role', 'authenticated', false);
  $$;
  PERFORM dblink_exec('quiz_a', v_setup);
  PERFORM dblink_exec('quiz_b', v_setup);

  -- Fire both calls non-blocking. Backend B will block on backend
  -- A's FOR UPDATE lock; once A commits, B sees count=10 and returns
  -- rate_limited.
  PERFORM dblink_send_query('quiz_a',
    'SELECT start_quiz(''00000000-0000-0000-0000-000000000000''::uuid)::text');
  PERFORM dblink_send_query('quiz_b',
    'SELECT start_quiz(''00000000-0000-0000-0000-000000000000''::uuid)::text');

  SELECT result::jsonb INTO v_r1
    FROM dblink_get_result('quiz_a') AS t(result text);
  SELECT result::jsonb INTO v_r2
    FROM dblink_get_result('quiz_b') AS t(result text);

  -- Drain the empty trailing result that dblink_send_query produces.
  PERFORM * FROM dblink_get_result('quiz_a') AS t(result text);
  PERFORM * FROM dblink_get_result('quiz_b') AS t(result text);

  PERFORM dblink_disconnect('quiz_a');
  PERFORM dblink_disconnect('quiz_b');

  RAISE NOTICE 'race result A: %', v_r1;
  RAISE NOTICE 'race result B: %', v_r2;

  v_succ_count :=
    (CASE WHEN (v_r1->>'success')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (v_r2->>'success')::boolean THEN 1 ELSE 0 END);

  v_rate_count :=
    (CASE WHEN (v_r1->>'error_code') = 'rate_limited' THEN 1 ELSE 0 END) +
    (CASE WHEN (v_r2->>'error_code') = 'rate_limited' THEN 1 ELSE 0 END);

  IF v_succ_count <> 1 THEN
    RAISE EXCEPTION
      'CONCURRENCY VIOLATION: expected exactly 1 winner, got % (A=%, B=%)',
      v_succ_count, v_r1, v_r2;
  END IF;

  IF v_rate_count <> 1 THEN
    RAISE EXCEPTION
      'CONCURRENCY VIOLATION: expected exactly 1 rate_limited, got % (A=%, B=%)',
      v_rate_count, v_r1, v_r2;
  END IF;

  SELECT daily_quiz_count INTO v_final_count
    FROM user_profiles
    WHERE id = 'b0000000-0000-0000-0000-000000000099';

  IF v_final_count <> 10 THEN
    RAISE EXCEPTION
      'CONCURRENCY VIOLATION: daily_quiz_count ended at % (expected 10)',
      v_final_count;
  END IF;

  RAISE NOTICE 'PASS: exactly one winner, exactly one rate_limited, count=10';
END;
$race$;

-- ── Cleanup ──────────────────────────────────────────────────

DELETE FROM user_profiles WHERE id = 'b0000000-0000-0000-0000-000000000099';
DELETE FROM auth.users WHERE id = 'b0000000-0000-0000-0000-000000000099';
