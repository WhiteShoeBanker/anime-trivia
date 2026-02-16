-- ═══════════════════════════════════════════════════════════════
-- Migration 006: Badge / Achievement System
-- ═══════════════════════════════════════════════════════════════

-- ── Badges Table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'streak','weekend','time','difficulty','breadth',
    'volume','accuracy','social','speed','daily',
    'special','league'
  )),
  icon_name TEXT NOT NULL,
  icon_color TEXT NOT NULL DEFAULT '#FFFFFF',
  requirement_type TEXT NOT NULL,
  requirement_value JSONB NOT NULL DEFAULT '{}',
  rarity TEXT NOT NULL CHECK (rarity IN (
    'common','uncommon','rare','epic','legendary'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── User Badges Table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);

-- ── Add emblem to user_profiles ──────────────────────────────

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS emblem_badge_id UUID REFERENCES badges(id);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_read_all" ON badges
  FOR SELECT USING (true);

CREATE POLICY "user_badges_read_own" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_badges_insert_own" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Seed Badges
-- ═══════════════════════════════════════════════════════════════

-- ── STREAK BADGES ────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('streak-3',   'Hot Streak',      'Play 3 days in a row',                   'streak', 'Flame',       '#FF6B35', 'streak_days',         '{"days":3}',    'common'),
  ('streak-7',   'Weekly Warrior',  'Play 7 days in a row',                   'streak', 'Flame',       '#FF8C00', 'streak_days',         '{"days":7}',    'uncommon'),
  ('streak-30',  'Month of Mastery','Play 30 days in a row',                  'streak', 'Flame',       '#FF4500', 'streak_days',         '{"days":30}',   'epic')
ON CONFLICT (slug) DO NOTHING;

-- ── WEEKEND BADGES ───────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('weekend-warrior', 'Weekend Warrior', 'Play on both Saturday and Sunday in the same weekend', 'weekend', 'Calendar', '#00D1B2', 'weekend_both_days', '{}', 'uncommon')
ON CONFLICT (slug) DO NOTHING;

-- ── TIME BADGES ──────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('early-bird',   'Early Bird',     'Complete a quiz before 8 AM local time',       'time', 'Sunrise',  '#FFD700', 'hour_before', '{"hour":8}',  'uncommon'),
  ('night-owl',    'Night Owl',      'Complete a quiz after 11 PM local time',       'time', 'Moon',     '#6366F1', 'hour_after',  '{"hour":23}', 'uncommon')
ON CONFLICT (slug) DO NOTHING;

-- ── DIFFICULTY BADGES ────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('hard-starter',  'Challenge Accepted', 'Complete your first Hard quiz',                          'difficulty', 'Swords',    '#E94560', 'hard_quiz_count',    '{"count":1}',               'common'),
  ('hard-master',   'Hard Mode Master',   'Score 80%+ on a Hard quiz',                              'difficulty', 'Swords',    '#E94560', 'hard_score_percent',  '{"percent":80}',            'rare'),
  ('hard-perfect',  'Flawless Victory',   'Get a perfect score on a Hard quiz',                     'difficulty', 'Swords',    '#FF0000', 'hard_score_percent',  '{"percent":100}',           'epic'),
  ('first-quiz',    'First Steps',        'Complete your very first quiz',                           'difficulty', 'Sparkles',  '#00D1B2', 'total_quizzes',       '{"count":1}',               'common')
ON CONFLICT (slug) DO NOTHING;

-- ── BREADTH BADGES ───────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('anime-explorer',  'Anime Explorer',    'Play quizzes on 4 different anime',     'breadth', 'Compass',  '#00D1B2', 'unique_anime', '{"count":4}',  'common'),
  ('anime-master',    'Anime Completionist','Play quizzes on every available anime', 'breadth', 'Globe',    '#B9F2FF', 'unique_anime', '{"all":true}', 'legendary')
ON CONFLICT (slug) DO NOTHING;

-- ── VOLUME BADGES ────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('quiz-50',     'Quiz Enthusiast', 'Complete 50 quizzes',                   'volume', 'BookOpen',  '#FF6B35', 'total_quizzes', '{"count":50}',   'common'),
  ('quiz-100',    'Century Club',    'Complete 100 quizzes',                  'volume', 'BookOpen',  '#FF6B35', 'total_quizzes', '{"count":100}',  'uncommon'),
  ('quiz-500',    'Quiz Addict',     'Complete 500 quizzes',                  'volume', 'BookOpen',  '#FF8C00', 'total_quizzes', '{"count":500}',  'rare'),
  ('quiz-1000',   'Grand Master',    'Complete 1,000 quizzes',               'volume', 'Crown',     '#FFD700', 'total_quizzes', '{"count":1000}', 'epic')
ON CONFLICT (slug) DO NOTHING;

-- ── ACCURACY BADGES ──────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('perfect-10',     'Perfect Round',    'Answer 10 questions correctly in a row',  'accuracy', 'Target',    '#00D1B2', 'consecutive_correct', '{"count":10}', 'rare'),
  ('accuracy-90',    'Sharp Shooter',    'Maintain 90%+ accuracy across 10 quizzes','accuracy', 'Crosshair', '#00D1B2', 'accuracy_percent',    '{"percent":90,"quizzes":10}', 'epic')
ON CONFLICT (slug) DO NOTHING;

-- ── SPEED BADGES ─────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('speed-demon',    'Speed Demon',    'Answer all questions in a quiz under 5 seconds each', 'speed', 'Zap',  '#FFD700', 'all_under_time', '{"ms":5000}', 'rare'),
  ('lightning-hard',  'Lightning Reflexes', 'Answer all Hard questions under 5s each',        'speed', 'Zap',  '#FF4500', 'all_under_time_difficulty', '{"ms":5000,"difficulty":"hard"}', 'epic')
ON CONFLICT (slug) DO NOTHING;

-- ── DAILY BADGES ─────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('daily-7', 'Daily Devotee', 'Complete daily challenges 7 days in a row', 'daily', 'CalendarCheck', '#00D1B2', 'daily_challenge_streak', '{"days":7}', 'rare')
ON CONFLICT (slug) DO NOTHING;

-- ── LEAGUE BADGES ────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('league-silver',    'Silver Climber',     'Reach Silver League',       'league', 'Medal',   '#C0C0C0', 'league_tier', '{"tier":2}', 'common'),
  ('league-gold',      'Gold Standard',      'Reach Gold League',         'league', 'Star',    '#FFD700', 'league_tier', '{"tier":3}', 'uncommon'),
  ('league-platinum',  'Platinum Elite',     'Reach Platinum League',     'league', 'Gem',     '#E5E4E2', 'league_tier', '{"tier":4}', 'rare'),
  ('league-diamond',   'Diamond Legend',     'Reach Diamond League',      'league', 'Award',   '#B9F2FF', 'league_tier', '{"tier":5}', 'epic'),
  ('league-champion',  'Champion Supreme',   'Reach Champion League',     'league', 'Swords',  '#FF6B35', 'league_tier', '{"tier":6}', 'legendary'),
  ('first-promotion',  'Moving On Up',       'Get promoted for the first time', 'league', 'TrendingUp', '#00D1B2', 'promotion_count', '{"count":1}', 'common'),
  ('promo-5',          'Serial Climber',     'Get promoted 5 times',      'league', 'TrendingUp', '#FFD700', 'promotion_count', '{"count":5}', 'rare')
ON CONFLICT (slug) DO NOTHING;

-- ── SPECIAL BADGES ───────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('og-player',      'OG Player',       'Joined OtakuQuiz in the first month',      'special', 'Shield',    '#FF6B35', 'joined_before',   '{"date":"2026-04-01"}', 'epic'),
  ('xp-genin',       'Genin Graduate',  'Reach Chunin rank (500 XP)',               'special', 'GraduationCap', '#00D1B2', 'total_xp', '{"xp":500}',   'common'),
  ('xp-hokage',      'Hokage Legend',   'Reach Hokage rank (25,000 XP)',            'special', 'Crown',     '#FFD700', 'total_xp', '{"xp":25000}', 'legendary')
ON CONFLICT (slug) DO NOTHING;
