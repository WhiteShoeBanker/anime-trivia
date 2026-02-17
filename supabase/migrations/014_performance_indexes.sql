-- Performance indexes for high-traffic queries
-- All use IF NOT EXISTS for idempotent application

-- Quiz results
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_created
  ON quiz_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_anime_difficulty
  ON quiz_results(anime_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created
  ON quiz_results(created_at DESC);

-- Analytics events
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created
  ON analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON analytics_events(user_id, created_at DESC);

-- League memberships
CREATE INDEX IF NOT EXISTS idx_league_memberships_group_xp
  ON league_memberships(group_id, weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_league_memberships_user
  ON league_memberships(user_id);

-- Weekly anime plays
CREATE INDEX IF NOT EXISTS idx_weekly_anime_plays_user_week
  ON weekly_anime_plays(user_id, week_start);

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_age_group
  ON user_profiles(age_group);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription
  ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created
  ON user_profiles(created_at DESC);

-- User badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user
  ON user_badges(user_id);

-- League history
CREATE INDEX IF NOT EXISTS idx_league_history_user
  ON league_history(user_id, week_start DESC);

-- Questions
CREATE INDEX IF NOT EXISTS idx_questions_anime_difficulty_safe
  ON questions(anime_id, difficulty, kid_safe);

-- Anime series
CREATE INDEX IF NOT EXISTS idx_anime_series_rating
  ON anime_series(content_rating);

-- Duel matches
CREATE INDEX IF NOT EXISTS idx_duel_matches_challenger
  ON duel_matches(challenger_id, status);
CREATE INDEX IF NOT EXISTS idx_duel_matches_opponent
  ON duel_matches(opponent_id, status);
CREATE INDEX IF NOT EXISTS idx_duel_matches_status_expires
  ON duel_matches(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_duel_matches_created
  ON duel_matches(created_at DESC);

-- Friendships
CREATE INDEX IF NOT EXISTS idx_friendships_requester
  ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_recipient
  ON friendships(recipient_id, status);

-- Promo codes
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user
  ON promo_redemptions(user_id);

-- Update query planner statistics
ANALYZE;
