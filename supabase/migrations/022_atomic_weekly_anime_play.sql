-- ═══════════════════════════════════════════════════════════════
-- Migration 022: Atomic Weekly Anime Play Increment
-- ═══════════════════════════════════════════════════════════════
--
-- Fixes league-bug-3: read-modify-write race on
-- weekly_anime_plays.play_count. The prior client code did
--   SELECT play_count → UPDATE play_count = N+1
-- which loses increments under concurrency (two quizzes finishing
-- ~simultaneously both read N and both write N+1, dropping one play
-- and over-rewarding XP that should have hit the diminishing-returns
-- tier).
--
-- INSERT ... ON CONFLICT ... DO UPDATE acquires a row-level lock and
-- returns the post-increment count atomically. The existing UNIQUE
-- (user_id, anime_id, week_start) constraint from migration 005 is
-- the conflict target.
--
-- SECURITY INVOKER (default) preserves the existing weekly_anime_plays
-- RLS policies (insert/update where auth.uid() = user_id).

CREATE OR REPLACE FUNCTION public.increment_weekly_anime_play(
  p_user_id uuid,
  p_anime_id uuid,
  p_week_start date
) RETURNS int
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_play_count int;
BEGIN
  INSERT INTO weekly_anime_plays (user_id, anime_id, week_start, play_count)
  VALUES (p_user_id, p_anime_id, p_week_start, 1)
  ON CONFLICT (user_id, anime_id, week_start)
  DO UPDATE SET play_count = weekly_anime_plays.play_count + 1
  RETURNING play_count INTO v_play_count;

  RETURN v_play_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_weekly_anime_play(uuid, uuid, date)
  TO authenticated;
