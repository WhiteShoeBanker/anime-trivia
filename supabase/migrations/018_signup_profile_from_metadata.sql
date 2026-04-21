-- OtakuQuiz Signup Profile Persistence — From auth metadata
--
-- Background: prior to this migration, the signup flow worked in two steps:
--   1. supabase.auth.signUp(...)  — creates the auth user + bare profile row
--      (handle_new_user trigger).
--   2. updateProfileAfterSignup(...)  — server action that writes age fields,
--      parent consent, and (for juniors) username.
--
-- Step 2 had two failure modes that silently lost the user's age data:
--   * Email/password with email-confirmation enabled in Supabase: signUp
--     does not create a session, so the server action's getUser() returns
--     null and the action errors. The user has to redo age verification on
--     their next visit.
--   * Phone OTP: the auth/page.tsx code ignored the action's return value,
--     so any failure was completely silent. User lands on /browse with a
--     null age_group, gets bounced back to /auth?complete_profile, and is
--     understandably confused.
--
-- Fix: extend handle_new_user() to read profile fields from
-- raw_user_meta_data (passed via auth.signUp options.data /
-- auth.signInWithOtp options.data). The trigger now atomically creates the
-- profile WITH the age fields, in the same transaction as the auth user.
-- No second round-trip, no session-not-yet-ready races, no silent loss.
--
-- The auth-page server action is still used for the OAuth complete-profile
-- flow, where the user already exists and we are updating, not inserting.

-- =============================================================
-- 1. Extend handle_new_user() to read raw_user_meta_data
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_birth_year integer;
  v_age_group text;
  v_parent_email text;
  v_username text;
  v_default_username text;
BEGIN
  -- birth_year: only accept a plausible integer. Anything else stays NULL
  -- (which middleware treats as "needs age verification").
  IF jsonb_typeof(v_meta->'birth_year') = 'number' THEN
    v_birth_year := (v_meta->>'birth_year')::integer;
    IF v_birth_year < 1900 OR v_birth_year > EXTRACT(YEAR FROM NOW())::int THEN
      v_birth_year := NULL;
    END IF;
  END IF;

  -- age_group: only accept the three valid enum values; anything else stays
  -- NULL. The CHECK constraint on user_profiles.age_group would reject bad
  -- values anyway, but rejecting them here keeps signup from failing outright.
  IF v_meta->>'age_group' IN ('junior', 'teen', 'full') THEN
    v_age_group := v_meta->>'age_group';
  END IF;

  -- parent_email is only meaningful when paired with a junior age_group.
  -- Accept it conditionally so a stray value can't masquerade as consent.
  IF v_age_group = 'junior' AND v_meta->>'parent_email' IS NOT NULL THEN
    v_parent_email := v_meta->>'parent_email';
  END IF;

  -- Username: prefer caller-provided (junior signups need this), else fall
  -- back to email local-part. Phone-only signups have no email, so default
  -- to a stable per-user fallback to satisfy the UNIQUE constraint.
  v_default_username := COALESCE(
    NULLIF(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    'user_' || SUBSTR(NEW.id::text, 1, 8)
  );
  v_username := COALESCE(NULLIF(v_meta->>'username', ''), v_default_username);

  INSERT INTO public.user_profiles (
    id,
    username,
    display_name,
    birth_year,
    age_group,
    is_junior,
    parent_email,
    parent_consent_at
  )
  VALUES (
    NEW.id,
    v_username,
    v_username,
    v_birth_year,
    v_age_group,
    v_age_group = 'junior',
    v_parent_email,
    CASE WHEN v_parent_email IS NOT NULL THEN NOW() ELSE NULL END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger itself was already created in migration 001; CREATE OR REPLACE
-- on the function is sufficient. No need to drop/re-create the trigger.
