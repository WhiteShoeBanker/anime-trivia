-- Daily Challenge Streak: track consecutive-day daily challenge completions
-- per user. Maintained by saveDailyChallengeResult in src/lib/daily-challenge.ts:
--   - previous daily_challenge_date = yesterday (UTC) -> increment
--   - previous daily_challenge_date = today (UTC)     -> keep (idempotent)
--   - otherwise                                        -> reset to 1
--
-- Consumed by the daily_challenge_streak badge checker in src/lib/badges.ts.
-- Replaces a total_quizzes fallback that wrongly awarded Daily Devotee.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS daily_challenge_streak INTEGER NOT NULL DEFAULT 0;
