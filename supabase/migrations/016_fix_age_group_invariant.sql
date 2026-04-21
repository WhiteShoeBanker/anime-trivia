-- OtakuQuiz Age-Verification Invariant
-- Enforces: age_group must be NULL until the user has actually passed the
-- age gate. No more silent default to 'full' access for unverified users.
--
-- Context: migration 004 defaulted age_group to 'full' and the handle_new_user
-- trigger inserted 'full' on every signup. App-layer guards only redirected
-- when age_group was NULL, so OAuth / brand-new users bypassed age verification
-- entirely and landed with full access to mature content.

-- =============================================================
-- 1. Drop the unsafe default on user_profiles.age_group
-- =============================================================
ALTER TABLE user_profiles
  ALTER COLUMN age_group DROP DEFAULT;

-- =============================================================
-- 2. Restore handle_new_user() — do not set age_group on insert.
--    Leaves it NULL so middleware/callback redirect to the age gate.
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 3. Backfill: NULL out age_group for users who never actually verified.
--    Heuristic: birth_year IS NULL means the age gate was never completed
--    (the gate writes both fields in the same update). These users will be
--    redirected to /auth?complete_profile on their next request.
--    Users with a real birth_year are left untouched.
-- =============================================================
UPDATE user_profiles
SET age_group = NULL
WHERE birth_year IS NULL;

-- =============================================================
-- 4. Defense-in-depth: tighten RLS so an authenticated user with a NULL
--    age_group gets the *safest* tier (junior / kid_safe), not full access.
--    Even if an app-layer redirect were bypassed, the DB cannot leak
--    mature content to an unverified session.
-- =============================================================

DROP POLICY IF EXISTS "anime_series_select" ON anime_series;
CREATE POLICY "anime_series_select" ON anime_series
  FOR SELECT USING (
    CASE
      WHEN auth.uid() IS NULL THEN true
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) IS NULL
        THEN content_rating = 'E'
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'junior'
        THEN content_rating = 'E'
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'teen'
        THEN content_rating IN ('E', 'T')
      ELSE true
    END
  );

DROP POLICY IF EXISTS "questions_select" ON questions;
CREATE POLICY "questions_select" ON questions
  FOR SELECT USING (
    CASE
      WHEN auth.uid() IS NULL THEN true
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) IS NULL
        THEN kid_safe = true AND difficulty IN ('easy', 'medium')
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'junior'
        THEN kid_safe = true AND difficulty IN ('easy', 'medium')
      WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'teen'
        THEN true
      ELSE true
    END
  );
