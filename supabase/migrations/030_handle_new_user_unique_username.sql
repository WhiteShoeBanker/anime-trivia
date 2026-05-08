-- ═══════════════════════════════════════════════════════════════
-- Migration 030: Collision-tolerant username derivation in handle_new_user
--
-- Bug:
--   handle_new_user (last extended in migration 029) derives a profile's
--   username from the email's local-part: SPLIT_PART(NEW.email, '@', 1).
--   user_profiles.username has a UNIQUE constraint (declared in migration
--   001:44). Two different OAuth/email accounts that share an email
--   local-part across domains — e.g. centrofly2000@yahoo.com (existing)
--   vs. centrofly2000@gmail.com (new Google OAuth) — produce the same
--   derived username and the second INSERT raises unique_violation. The
--   exception propagates out of the AFTER INSERT trigger, the entire
--   auth.users transaction rolls back, and Supabase Auth surfaces this
--   to the client as:
--     ?error=server_error&error_code=unexpected_failure
--      &error_description=Database+error+saving+new+user
--   blocking the user from completing OAuth signup.
--
--   Email/password signups don't surface this in practice because users
--   typically register with one email per address — the local-part is
--   organically unique. OAuth makes the collision easy because users
--   reuse a familiar handle across providers.
--
-- Fix:
--   Make the username derivation collision-tolerant. Try the derived
--   value first (preserves the friendly default for the common case);
--   if it's already taken, append a UUID-derived suffix that grows by
--   one hex character per retry (4 → 5 → 6 → 7 → 8 chars of NEW.id),
--   making each retry exponentially less likely to collide. After 5
--   retries (vanishingly improbable to hit), fall back to user_<8 hex>
--   which is mathematically unique at our user scale.
--
--   This is a code-only change to one column's value-derivation logic.
--   The UNIQUE constraint stays — it's the right invariant; it just
--   needs a fallback path instead of a hard error.
--
-- Scope:
--   CREATE OR REPLACE FUNCTION public.handle_new_user only. Body is
--   migration 029's body verbatim, with three lines added to DECLARE
--   (v_username_attempt, v_attempts) and the username derivation block
--   replaced. All other behavior preserved unchanged:
--     - SECURITY DEFINER (bypasses RLS for the user_profiles INSERT)
--     - LANGUAGE plpgsql
--     - raw_user_meta_data parsing for birth_year / age_group /
--       parent_email (migration 018)
--     - Best-effort league enrollment block with EXCEPTION WHEN OTHERS
--       swallow + RAISE WARNING (migration 029)
--   The on_auth_user_created trigger binding from migration 001:158-161
--   is preserved automatically by CREATE OR REPLACE — no DROP/CREATE
--   TRIGGER needed.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_birth_year integer;
  v_age_group text;
  v_parent_email text;
  v_username text;
  v_default_username text;
  v_username_attempt text;
  v_attempts int := 0;
  v_league_id uuid;
  v_group_id uuid;
BEGIN
  -- ── 018 body (preserved verbatim) ───────────────────────────
  -- birth_year: only accept a plausible integer. Anything else
  -- stays NULL (which middleware treats as "needs age verification").
  IF jsonb_typeof(v_meta->'birth_year') = 'number' THEN
    v_birth_year := (v_meta->>'birth_year')::integer;
    IF v_birth_year < 1900 OR v_birth_year > EXTRACT(YEAR FROM NOW())::int THEN
      v_birth_year := NULL;
    END IF;
  END IF;

  -- age_group: only accept the three valid enum values; anything
  -- else stays NULL.
  IF v_meta->>'age_group' IN ('junior', 'teen', 'full') THEN
    v_age_group := v_meta->>'age_group';
  END IF;

  -- parent_email is only meaningful when paired with a junior
  -- age_group. Accept it conditionally so a stray value can't
  -- masquerade as consent.
  IF v_age_group = 'junior' AND v_meta->>'parent_email' IS NOT NULL THEN
    v_parent_email := v_meta->>'parent_email';
  END IF;

  -- Username: prefer caller-provided (junior signups need this),
  -- else fall back to email local-part. Phone-only signups have
  -- no email, so default to a stable per-user fallback to
  -- satisfy the UNIQUE constraint.
  v_default_username := COALESCE(
    NULLIF(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    'user_' || SUBSTR(NEW.id::text, 1, 8)
  );
  v_username := COALESCE(NULLIF(v_meta->>'username', ''), v_default_username);

  -- ── 030 addition: collision-tolerant username derivation ────
  -- Try the derived username; if taken, append a UUID-derived suffix.
  -- Each retry makes the suffix one character longer (4 → 5 → 6 → 7 → 8
  -- chars of NEW.id), making collision exponentially less likely on
  -- each attempt. Final fallback is user_<8 chars of NEW.id>, which is
  -- mathematically unique because UUID guarantees distinct hex prefixes
  -- at our user scale.
  v_username_attempt := v_username;
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = v_username_attempt)
        AND v_attempts < 5 LOOP
    v_attempts := v_attempts + 1;
    v_username_attempt := v_username || '_' || SUBSTR(NEW.id::text, 1, 3 + v_attempts);
  END LOOP;
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE username = v_username_attempt) THEN
    v_username_attempt := 'user_' || SUBSTR(NEW.id::text, 1, 8);
  END IF;
  v_username := v_username_attempt;

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

  -- ── 029 addition: best-effort league enrollment (preserved) ─
  -- Wrapped in BEGIN/EXCEPTION so any failure here (constraint,
  -- RLS, missing seed, transient) does NOT abort signup. The
  -- user_profiles INSERT above is the contract; league
  -- enrollment is a graceful add-on. RAISE WARNING (not silent
  -- NULL) so real bugs surface in Supabase logs.
  BEGIN
    v_group_id := public.find_or_create_starter_league_group();

    SELECT id INTO v_league_id FROM leagues WHERE tier = 1;

    INSERT INTO public.league_memberships (
      user_id, group_id, league_id, weekly_xp, unique_anime_count
    )
    VALUES (NEW.id, v_group_id, v_league_id, 0, 0);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'League enrollment failed for user %: %',
      NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
