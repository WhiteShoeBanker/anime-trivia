-- OtakuQuiz Atomic Quiz Start — Server-Authoritative Free-User Gate
--
-- Background: the prior implementation enforced the free 10-quiz daily cap
-- entirely in the browser via localStorage (see src/app/quiz/[animeSlug]/
-- QuizClient.tsx, key 'otaku_daily_quizzes'). A server-backed limiter
-- shipped in src/lib/quiz-limiter.ts but it was never on the critical
-- path — only its own tests imported it. The cap was therefore trivially
-- bypassable by clearing localStorage, opening multiple tabs, or simply
-- editing the stored JSON.
--
-- This migration moves the gate to a single SECURITY DEFINER RPC running
-- as one transaction with a row-level lock on user_profiles, so:
--   * Two concurrent tabs at count=9/10 cannot both pass (FOR UPDATE
--     serializes them; the second sees count=10 and gets rate_limited).
--   * Pro entitlement is read atomically with the counter (no client
--     round-trip in between to race against).
--   * Expired Pro is treated as free in the same transaction.
--   * The daily reset is lazy: no cron, no scheduled job. The first
--     start_quiz of a new UTC day rewrites count=0 before incrementing.
--
-- The submit_quiz RPC is the post-play backstop: if a user's daily
-- counter is in an impossible state (above the limit, only reachable by
-- bypassing start_quiz and writing the column directly), we refuse to
-- record the result so XP/awards are not granted on a tampered session.
--
-- An UPDATE trigger denies the `authenticated` role from writing the
-- gating columns directly (the original RLS policy on user_profiles
-- granted unrestricted self-update, which would have let a malicious
-- client just `UPDATE daily_quiz_count = 0` between RPC calls). The
-- trigger lets service_role and the SECURITY DEFINER function owner
-- through unchanged.

-- =============================================================
-- 1. start_quiz(p_anime_id) — atomic gate at quiz start
-- =============================================================
CREATE OR REPLACE FUNCTION public.start_quiz(p_anime_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_tier text;
  v_expires timestamptz;
  v_count int;
  v_reset date;
  v_today date := (NOW() AT TIME ZONE 'UTC')::date;
  v_limit int;
  v_limit_jsonb jsonb;
  v_effective_tier text;
BEGIN
  -- Ignore the anime_id for now — kept in the signature so future
  -- per-anime cooldowns can be added without a client-API breakage.
  PERFORM p_anime_id;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'not_authenticated'
    );
  END IF;

  -- Single FOR UPDATE lock serializes two-tab races against the same
  -- profile. Without this, both tabs read count=9, both pass the cap
  -- check, both increment to 10 — and the second write is the one
  -- that "wins", leaving count=10 with two quizzes started.
  SELECT subscription_tier, pro_expires_at, daily_quiz_count, daily_quiz_reset
    INTO v_tier, v_expires, v_count, v_reset
  FROM user_profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'not_authenticated'
    );
  END IF;

  -- Expired pro_expires_at falls through to free. NULL expiry is
  -- treated as lifetime/never-expires (matches admin_grant lifetime
  -- and the redeem_promo_code 'pro_lifetime' branch).
  v_effective_tier := CASE
    WHEN v_tier = 'pro' AND (v_expires IS NULL OR v_expires > NOW())
      THEN 'pro'
    ELSE 'free'
  END;

  -- Lazy daily reset (no cron). A NULL reset is treated as stale so
  -- the very first call ever for a profile rolls over cleanly.
  IF v_reset IS NULL OR v_reset < v_today THEN
    v_count := 0;
    v_reset := v_today;
  END IF;

  -- Pro: unlimited, do NOT consume a counter slot. Counter still
  -- gets the lazy-reset write so the displayed count is correct
  -- if the user later downgrades.
  IF v_effective_tier = 'pro' THEN
    UPDATE user_profiles
       SET daily_quiz_count = v_count,
           daily_quiz_reset = v_reset
     WHERE id = v_user_id;

    RETURN jsonb_build_object(
      'success', true,
      'tier', 'pro',
      'count', v_count,
      'limit', NULL,
      'quizzes_remaining', NULL
    );
  END IF;

  -- Read free_quiz_limit from admin_config. The key was seeded in
  -- migration 003_admin_analytics.sql as '10'::jsonb. If it has been
  -- deleted or stored as a non-numeric value, fall back to 10.
  SELECT value INTO v_limit_jsonb
  FROM admin_config
  WHERE key = 'free_quiz_limit';

  IF v_limit_jsonb IS NULL THEN
    v_limit := 10;
  ELSE
    BEGIN
      v_limit := (v_limit_jsonb #>> '{}')::int;
    EXCEPTION WHEN OTHERS THEN
      v_limit := 10;
    END;
  END IF;

  IF v_count >= v_limit THEN
    -- Even on the rejection path we persist the lazy reset so the
    -- next day's start doesn't re-trigger the rollover.
    UPDATE user_profiles
       SET daily_quiz_count = v_count,
           daily_quiz_reset = v_reset
     WHERE id = v_user_id;

    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'rate_limited',
      'tier', 'free',
      'limit', v_limit,
      'count', v_count
    );
  END IF;

  UPDATE user_profiles
     SET daily_quiz_count = v_count + 1,
         daily_quiz_reset = v_reset
   WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'tier', 'free',
    'count', v_count + 1,
    'limit', v_limit,
    'quizzes_remaining', v_limit - (v_count + 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.start_quiz(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_quiz(uuid) TO authenticated;

-- =============================================================
-- 2. submit_quiz() — backstop at quiz submission
-- =============================================================
-- Verifies the user's gating state is consistent with a legitimate
-- start_quiz having advanced the counter. Rejects "submit without a
-- matching successful start" by detecting the only state that
-- requires bypass: count > limit (start_quiz never produces this).
--
-- Effectively-Pro users always pass. Free users with count <= limit
-- pass (count == limit is the legitimate last-quiz-of-the-day case).
-- Anything else returns rate_limited and the caller MUST NOT award
-- XP / insert a quiz_session.
CREATE OR REPLACE FUNCTION public.submit_quiz()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_tier text;
  v_expires timestamptz;
  v_count int;
  v_reset date;
  v_today date := (NOW() AT TIME ZONE 'UTC')::date;
  v_limit int;
  v_limit_jsonb jsonb;
  v_effective_tier text;
  v_effective_count int;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'not_authenticated'
    );
  END IF;

  SELECT subscription_tier, pro_expires_at, daily_quiz_count, daily_quiz_reset
    INTO v_tier, v_expires, v_count, v_reset
  FROM user_profiles
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'not_authenticated'
    );
  END IF;

  v_effective_tier := CASE
    WHEN v_tier = 'pro' AND (v_expires IS NULL OR v_expires > NOW())
      THEN 'pro'
    ELSE 'free'
  END;

  IF v_effective_tier = 'pro' THEN
    RETURN jsonb_build_object('success', true, 'tier', 'pro');
  END IF;

  v_effective_count := CASE
    WHEN v_reset IS NULL OR v_reset < v_today THEN 0
    ELSE v_count
  END;

  SELECT value INTO v_limit_jsonb
  FROM admin_config
  WHERE key = 'free_quiz_limit';

  IF v_limit_jsonb IS NULL THEN
    v_limit := 10;
  ELSE
    BEGIN
      v_limit := (v_limit_jsonb #>> '{}')::int;
    EXCEPTION WHEN OTHERS THEN
      v_limit := 10;
    END;
  END IF;

  -- Backstop: count > limit is reachable ONLY by bypassing start_quiz
  -- (which caps at limit) and writing the column directly. The trigger
  -- defined below makes this practically impossible from the client,
  -- but defense in depth: reject anyway.
  IF v_effective_count > v_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'rate_limited',
      'tier', 'free',
      'limit', v_limit,
      'count', v_effective_count
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'tier', 'free',
    'limit', v_limit,
    'count', v_effective_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_quiz() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz() TO authenticated;

-- =============================================================
-- 3. Trigger: lock down gating columns from client-side writes
-- =============================================================
-- The user_profiles_update RLS policy from migration 001 grants
-- self-update to the authenticated role with no column restriction.
-- That policy is correct for cosmetic fields (display_name, avatar)
-- but lets a malicious client UPDATE daily_quiz_count = 0, defeating
-- the new RPC entirely.
--
-- We keep the RLS policy intact (other code paths legitimately update
-- total_xp, rank, last_played_at, etc.) and add a column-level guard
-- via a BEFORE UPDATE trigger. The trigger only fires for the
-- 'authenticated' and 'anon' roles; SECURITY DEFINER functions run
-- as the function owner (postgres / supabase_admin) and pass through.
-- service_role direct writes from server actions also pass through.
CREATE OR REPLACE FUNCTION public.protect_user_profile_gating_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.daily_quiz_count IS DISTINCT FROM OLD.daily_quiz_count THEN
      RAISE EXCEPTION
        'daily_quiz_count is server-managed; use start_quiz() RPC'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.daily_quiz_reset IS DISTINCT FROM OLD.daily_quiz_reset THEN
      RAISE EXCEPTION
        'daily_quiz_reset is server-managed; use start_quiz() RPC'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
      RAISE EXCEPTION
        'subscription_tier is server-managed; use redeem_promo_code() or admin grant'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.subscription_source IS DISTINCT FROM OLD.subscription_source THEN
      RAISE EXCEPTION
        'subscription_source is server-managed'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.pro_expires_at IS DISTINCT FROM OLD.pro_expires_at THEN
      RAISE EXCEPTION
        'pro_expires_at is server-managed'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_profile_gating_columns_trg
  ON public.user_profiles;

CREATE TRIGGER protect_user_profile_gating_columns_trg
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_profile_gating_columns();

-- =============================================================
-- 4. RLS posture documentation
-- =============================================================
-- user_profiles RLS is unchanged from migration 001:
--   * SELECT: USING (true) — public profiles
--   * INSERT: WITH CHECK (auth.uid() = id) — own row only
--   * UPDATE: USING (auth.uid() = id) — own row only
--   * DELETE: USING (auth.uid() = id) — own row only
--
-- The trigger above narrows UPDATE so that the gating columns
-- (daily_quiz_count, daily_quiz_reset, subscription_tier,
-- subscription_source, pro_expires_at) cannot be mutated except
-- through the SECURITY DEFINER RPCs or by the service_role client
-- used in admin actions (src/app/admin/actions.ts).
--
-- admin_config RLS unchanged: public SELECT, no client write policy.
-- The RPCs read free_quiz_limit via the admin_config table directly
-- (SECURITY DEFINER bypasses RLS for reads as well).
