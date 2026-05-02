-- ═══════════════════════════════════════════════════════════════
-- Migration 026: Quiz secure submission
--
-- Two changes that mirror migration 024 (Grand Prix) and 025
-- (badges):
--   (a) Drop client-INSERT policies on quiz_sessions and
--       user_answers. Inserts now flow through the server route
--       /api/quiz/submit using the service-role client, which
--       re-derives score / xp / correctness from the questions
--       table. quiz_sessions_select and user_answers_select
--       remain unchanged so the browser can still read history.
--   (b) Tighten user_profiles UPDATE: deny client-side mutation
--       of total_xp and rank. These are now server-managed, set
--       by /api/quiz/submit (and future Sessions 4I / 4J duel +
--       daily routes that will write the same columns). Other
--       columns (display_name, avatar_url, last_played_at,
--       daily_challenge_*) remain client-writable per migrations
--       001 / 019.
--
-- Mechanism for (b): extend the existing
-- protect_user_profile_gating_columns trigger from migration 019
-- rather than adding a parallel one. Single function = single
-- discoverable place where the user_profiles lockdown lives.
-- The trigger only raises for current_user IN ('authenticated',
-- 'anon'); service_role and SECURITY DEFINER owners pass through,
-- so the new route's writes succeed.
--
-- See quiz-bug-N (Session 4H).
-- ═══════════════════════════════════════════════════════════════

-- (a) Drop client INSERT policies on quiz_sessions and user_answers.
-- Service-role API route is the only writer for these rows.

DROP POLICY IF EXISTS "quiz_sessions_insert" ON quiz_sessions;
DROP POLICY IF EXISTS "user_answers_insert"  ON user_answers;

-- (b) Extend the gating-columns trigger to also protect total_xp
-- and rank. The 019 guards (daily_quiz_count, daily_quiz_reset,
-- subscription_tier, subscription_source, pro_expires_at) are
-- preserved verbatim — CREATE OR REPLACE replaces the function
-- body in place. The trigger from 019 already binds to the
-- function name, so no DROP/CREATE TRIGGER is required.

CREATE OR REPLACE FUNCTION public.protect_user_profile_gating_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    -- ── 019 guards (subscription + daily-quiz limiter) ──────────
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

    -- ── 026 guards (XP / rank) ──────────────────────────────────
    IF NEW.total_xp IS DISTINCT FROM OLD.total_xp THEN
      RAISE EXCEPTION
        'total_xp is server-managed; XP is awarded by /api/quiz/submit and equivalents'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.rank IS DISTINCT FROM OLD.rank THEN
      RAISE EXCEPTION
        'rank is server-managed; derived from total_xp by the awarding routes'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================================
-- RLS posture documentation
-- =============================================================
-- quiz_sessions RLS after this migration:
--   * SELECT: USING (auth.uid() = user_id) — unchanged
--   * INSERT: dropped — service-role API route only
--
-- user_answers RLS after this migration:
--   * SELECT: USING (session_id IN (...)) — unchanged
--   * INSERT: dropped — service-role API route only
--
-- user_profiles RLS unchanged from migration 001 / 019. The
-- protect_user_profile_gating_columns trigger now covers seven
-- columns: daily_quiz_count, daily_quiz_reset, subscription_tier,
-- subscription_source, pro_expires_at, total_xp, rank. All other
-- columns remain self-updatable by the row owner.
