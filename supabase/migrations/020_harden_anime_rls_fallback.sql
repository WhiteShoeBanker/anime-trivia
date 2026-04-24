-- OtakuQuiz RLS Hardening: remove auth.uid() IS NULL footgun
--
-- Context: migration 016 tightened the unverified-age branch but kept the
--   WHEN auth.uid() IS NULL THEN true
-- fallback on both anime_series_select and questions_select. That branch
-- returned every row (including M-rated content) to any request where
-- Postgres did not see an authenticated session — which turned a
-- middleware cookie-propagation bug into an SSR content leak instead of
-- failing safe.
--
-- Product intent (post Fix 2): there are no legitimate guest queries.
-- Middleware now redirects every unauthenticated request away from
-- content pages. Any auth.uid() IS NULL query reaching RLS is therefore
-- either an internal service-role call (which bypasses RLS entirely) or
-- a broken/expired session — in both cases the safe answer is deny.
--
-- This migration is the database-layer companion to the auth-required
-- middleware change; together they ensure mature content cannot leak to
-- any request lacking a verified, authenticated user.

-- =============================================================
-- 1. anime_series: deny unauthenticated, otherwise filter by age_group
-- =============================================================
DROP POLICY IF EXISTS "anime_series_select" ON anime_series;

CREATE POLICY "anime_series_select" ON anime_series
  FOR SELECT USING (
    CASE
      WHEN auth.uid() IS NULL THEN false
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) IS NULL
        THEN content_rating = 'E'
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'junior'
        THEN content_rating = 'E'
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'teen'
        THEN content_rating IN ('E', 'T')
      ELSE true
    END
  );

-- =============================================================
-- 2. questions: same fallback fix
-- =============================================================
DROP POLICY IF EXISTS "questions_select" ON questions;

CREATE POLICY "questions_select" ON questions
  FOR SELECT USING (
    CASE
      WHEN auth.uid() IS NULL THEN false
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) IS NULL
        THEN kid_safe = true AND difficulty IN ('easy', 'medium')
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'junior'
        THEN kid_safe = true AND difficulty IN ('easy', 'medium')
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'teen'
        THEN true
      ELSE true
    END
  );
