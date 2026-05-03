-- ═══════════════════════════════════════════════════════════════
-- Migration 028: Daily challenge secure submission
--
-- Companion to 024 (Grand Prix), 025 (badges), 026 (quiz), 027
-- (duels). Daily challenge result writes move from the browser
-- to /api/daily-challenge/submit, which re-derives score / XP
-- from the questions answer key under the service-role client.
--
-- Mechanism: extend the existing protect_user_profile_gating_columns
-- trigger function (in place since migration 019, last extended by
-- 026) to also lock daily_challenge_date / _score / _streak from
-- authenticated/anon roles. CREATE OR REPLACE replaces the function
-- body in place; the trigger binding from 019
-- (protect_user_profile_gating_columns_trg) carries over — same
-- pattern 026 used. No new trigger or per-table trigger required.
--
-- This migration is dual-purpose. It closes daily-bug-N (row
-- fabrication via the anon Supabase client driving badge engine
-- contexts), AND it resolves a latent regression introduced
-- transiently by migration 026: that migration extended the
-- trigger to block client writes to user_profiles.total_xp /
-- rank, but src/lib/daily-challenge.ts:saveDailyChallengeResult
-- was still writing total_xp / rank via the anon client on
-- new-day daily challenge completions. Since 026 landed, every
-- new-day daily challenge has been silently failing to credit XP
-- (the store's outer try/catch swallowed the 42501). Same-day
-- repeats correctly skipped the XP block per daily-bug-2 and
-- so did not error. Pre-launch with no real users, this was an
-- acceptable transient. The new route uses service-role for both
-- the daily_challenge_* update and the total_xp / rank update,
-- bypassing the trigger.
--
-- See daily-bug-N (Session 4J), quiz-bug-N (Session 4H), and
-- duel-bug-N (Session 4I) for the companion fixes.
-- ═══════════════════════════════════════════════════════════════

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

    -- ── 028 guards (daily challenge result) ─────────────────────
    IF NEW.daily_challenge_date IS DISTINCT FROM OLD.daily_challenge_date THEN
      RAISE EXCEPTION
        'daily_challenge_date is server-managed; use /api/daily-challenge/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.daily_challenge_score IS DISTINCT FROM OLD.daily_challenge_score THEN
      RAISE EXCEPTION
        'daily_challenge_score is server-managed; use /api/daily-challenge/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.daily_challenge_streak IS DISTINCT FROM OLD.daily_challenge_streak THEN
      RAISE EXCEPTION
        'daily_challenge_streak is server-managed; use /api/daily-challenge/submit'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================================
-- RLS posture documentation
-- =============================================================
-- user_profiles RLS unchanged from migration 001 / 019 / 026.
-- The protect_user_profile_gating_columns trigger now covers
-- ten columns: daily_quiz_count, daily_quiz_reset,
-- subscription_tier, subscription_source, pro_expires_at,
-- total_xp, rank, daily_challenge_date, daily_challenge_score,
-- daily_challenge_streak. All other columns (display_name,
-- avatar_url, last_played_at, age_group, etc.) remain
-- self-updatable by the row owner.
