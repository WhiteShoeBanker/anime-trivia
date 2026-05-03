-- ═══════════════════════════════════════════════════════════════
-- Migration 027: Duels secure submission
--
-- Companion to 024 (Grand Prix), 025 (badges), 026 (quiz). Duel
-- score submission moves from the browser to /api/duels/submit,
-- which re-derives score / isCorrect / XP from the questions
-- answer key under the service-role client.
--
-- Two separate concerns:
--   (a) duel_matches: clients legitimately need UPDATE for
--       findQuickMatch claim (waiting → matched) and declineDuel
--       (waiting → declined). Wholesale policy drop would break
--       both flows. Use a column-protection trigger instead —
--       same shape migrations 019 and 026 use for user_profiles.
--       Locks score / answer / time / winner / xp columns and
--       restricts status transitions to the two client paths.
--   (b) duel_stats: written ONLY by submitDuelResults today (no
--       other client write paths), so the policy drop is clean.
--       Service-role from the new route is the sole writer
--       post-migration; duel_stats_read_all stays for
--       leaderboards and the badges-engine fetch.
--
-- This migration is dual-purpose. It closes duel-bug-N (row
-- fabrication via the anon Supabase client driving badge engine
-- contexts), AND it resolves a latent regression introduced
-- transiently by migration 026: that migration extended the
-- protect_user_profile_gating_columns trigger to also block
-- client writes to user_profiles.total_xp / rank, but
-- src/lib/duels.ts:awardDuelXp was still the duel completion's
-- only XP-credit path and writes total_xp via the anon client.
-- Since migration 026 landed, every duel second-submitter has
-- been silently failing to credit XP (the lib's outer try/catch
-- swallowed the 42501). Pre-launch with no real users, this
-- was an acceptable transient. The new route uses the
-- service-role client for awardUserProfileXp, bypassing both
-- the 026 trigger and this migration's new trigger.
--
-- See duel-bug-N (Session 4I) and quiz-bug-N (Session 4H).
-- ═══════════════════════════════════════════════════════════════

-- (a) duel_matches column-protection trigger.

CREATE OR REPLACE FUNCTION public.protect_duel_matches_score_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    -- Score / correct / time / answers / completed_at / xp_earned for
    -- both sides, plus winner_id. These columns are written exclusively
    -- by /api/duels/submit (service-role) post-migration. Any client
    -- attempt to mutate them is a fabrication attempt.
    IF NEW.challenger_score IS DISTINCT FROM OLD.challenger_score THEN
      RAISE EXCEPTION
        'challenger_score is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.challenger_correct IS DISTINCT FROM OLD.challenger_correct THEN
      RAISE EXCEPTION
        'challenger_correct is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.challenger_time_ms IS DISTINCT FROM OLD.challenger_time_ms THEN
      RAISE EXCEPTION
        'challenger_time_ms is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.challenger_answers IS DISTINCT FROM OLD.challenger_answers THEN
      RAISE EXCEPTION
        'challenger_answers is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.challenger_completed_at IS DISTINCT FROM OLD.challenger_completed_at THEN
      RAISE EXCEPTION
        'challenger_completed_at is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.challenger_xp_earned IS DISTINCT FROM OLD.challenger_xp_earned THEN
      RAISE EXCEPTION
        'challenger_xp_earned is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.opponent_score IS DISTINCT FROM OLD.opponent_score THEN
      RAISE EXCEPTION
        'opponent_score is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.opponent_correct IS DISTINCT FROM OLD.opponent_correct THEN
      RAISE EXCEPTION
        'opponent_correct is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.opponent_time_ms IS DISTINCT FROM OLD.opponent_time_ms THEN
      RAISE EXCEPTION
        'opponent_time_ms is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.opponent_answers IS DISTINCT FROM OLD.opponent_answers THEN
      RAISE EXCEPTION
        'opponent_answers is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.opponent_completed_at IS DISTINCT FROM OLD.opponent_completed_at THEN
      RAISE EXCEPTION
        'opponent_completed_at is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.opponent_xp_earned IS DISTINCT FROM OLD.opponent_xp_earned THEN
      RAISE EXCEPTION
        'opponent_xp_earned is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.winner_id IS DISTINCT FROM OLD.winner_id THEN
      RAISE EXCEPTION
        'winner_id is server-managed; use /api/duels/submit'
        USING ERRCODE = '42501';
    END IF;

    -- Status transitions: client roles may only flip 'waiting' →
    -- 'matched' (findQuickMatch claim) or 'waiting' → 'declined'
    -- (declineDuel). All other transitions — to 'in_progress',
    -- 'completed', or 'expired' — are server-managed:
    --   - in_progress / completed: /api/duels/submit (service-role)
    --   - expired:                 expire-duels cron (service-role)
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT (
        OLD.status = 'waiting'
        AND NEW.status IN ('matched', 'declined')
      ) THEN
        RAISE EXCEPTION
          'duel_matches.status transition % → % is server-managed',
          OLD.status, NEW.status
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- New trigger (no prior binding to carry over — this is a
-- fresh per-table trigger, unlike 026 which replaced 019's
-- function body and reused its existing trigger binding).
DROP TRIGGER IF EXISTS protect_duel_matches_score_columns ON duel_matches;
CREATE TRIGGER protect_duel_matches_score_columns
  BEFORE UPDATE ON duel_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_duel_matches_score_columns();

-- (b) duel_stats: drop client write policies. The new route is
-- the sole writer (service-role bypasses RLS). Read policy
-- stays for leaderboards and the badges-engine fetch.

DROP POLICY IF EXISTS "duel_stats_insert_own" ON duel_stats;
DROP POLICY IF EXISTS "duel_stats_update_own" ON duel_stats;

-- =============================================================
-- RLS posture documentation
-- =============================================================
-- duel_matches RLS unchanged from migration 010. The new
-- protect_duel_matches_score_columns trigger covers thirteen
-- columns plus status transitions. findQuickMatch claim
-- (waiting → matched) and declineDuel (waiting → declined)
-- both remain functional.
--
-- duel_stats RLS after this migration:
--   * SELECT: USING (true)        — unchanged
--   * INSERT: dropped              — service-role API route only
--   * UPDATE: dropped              — service-role API route only
--
-- user_profiles RLS unchanged from migrations 001 / 019 / 026.
-- The 026 trigger guards on total_xp / rank already cover the
-- new route's user_profiles writes; service-role bypasses both
-- 026's trigger and this migration's trigger.
