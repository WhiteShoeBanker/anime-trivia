-- Daily Challenge: track per-user daily challenge completion
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS daily_challenge_date DATE,
  ADD COLUMN IF NOT EXISTS daily_challenge_score INTEGER;
