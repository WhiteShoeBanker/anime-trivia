-- ═══════════════════════════════════════════════════════════════════════
-- OtakuQuiz — Combined Catch-Up Migration (001 → 014)
-- Brings production DB in sync with all migration files.
-- Fully IDEMPOTENT: safe to run multiple times without errors.
--
-- Production tables that ALREADY EXIST:
--   anime_series, badges, grand_prix_emblems, grand_prix_matches,
--   grand_prix_tournaments, questions, quiz_sessions, user_answers,
--   user_badges, user_emblems, user_profiles
--
-- This script:
--   1. Adds missing columns to existing tables
--   2. Updates CHECK constraints
--   3. Creates all missing tables (FK-ordered)
--   4. Enables RLS on every table
--   5. Creates all RLS policies
--   6. Creates all indexes
--   7. Installs functions & triggers
--   8. Seeds badges, leagues, admin_config
--   9. Applies data updates (content ratings, kid-safe flags)
--  10. Runs ANALYZE
-- ═══════════════════════════════════════════════════════════════════════


-- ═════════════════════════════════════════════════════════════════
-- SECTION 1: ADD MISSING COLUMNS TO EXISTING TABLES
-- ═════════════════════════════════════════════════════════════════

-- 1a. anime_series — add content_rating (from 004)
ALTER TABLE anime_series ADD COLUMN IF NOT EXISTS content_rating TEXT NOT NULL DEFAULT 'E';

-- 1b. questions — add kid_safe (from 004)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS kid_safe BOOLEAN DEFAULT true;

-- 1c. user_profiles — add all missing columns
--     From 002:
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_junior BOOLEAN DEFAULT false;
--     From 004:
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT 'full';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS parent_consent_at TIMESTAMPTZ;
--     From 006 (already exists in prod, kept for idempotency):
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emblem_badge_id UUID;
--     From 011:
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_source TEXT DEFAULT 'none';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_quiz_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_quiz_reset DATE DEFAULT CURRENT_DATE;
--     From 012:
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_challenge_date DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_challenge_score INTEGER;


-- ═════════════════════════════════════════════════════════════════
-- SECTION 2: UPDATE CHECK CONSTRAINTS
-- ═════════════════════════════════════════════════════════════════

-- 2a. questions — allow 'impossible' difficulty (from 007)
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_difficulty_check;
ALTER TABLE questions ADD CONSTRAINT questions_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard', 'impossible'));

-- 2b. anime_series — content_rating values
DO $$ BEGIN
  ALTER TABLE anime_series ADD CONSTRAINT anime_series_content_rating_check
    CHECK (content_rating IN ('E', 'T', 'M'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2c. user_profiles — subscription_tier
DO $$ BEGIN
  ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check
    CHECK (subscription_tier IN ('free', 'pro'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2d. user_profiles — age_group
DO $$ BEGIN
  ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_age_group_check
    CHECK (age_group IN ('junior', 'teen', 'full'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2e. user_profiles — subscription_source
DO $$ BEGIN
  ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_source_check
    CHECK (subscription_source IN ('none', 'paid', 'promo_code', 'admin_grant'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2f. badges — category must include grand_prix + duel (from 009, 010)
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_category_check;
ALTER TABLE badges ADD CONSTRAINT badges_category_check CHECK (category IN (
  'streak','weekend','time','difficulty','breadth',
  'volume','accuracy','social','speed','daily',
  'special','league','grand_prix','duel'
));


-- ═════════════════════════════════════════════════════════════════
-- SECTION 3: CREATE MISSING TABLES (FK-dependency ordered)
-- ═════════════════════════════════════════════════════════════════

-- ── Tier 0: no FK deps on other missing tables ──────────────────

-- star_league_waitlist (from 002)
CREATE TABLE IF NOT EXISTS star_league_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  signed_up_at TIMESTAMPTZ DEFAULT NOW()
);

-- cosmetics (from 002)
CREATE TABLE IF NOT EXISTS cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('avatar_frame', 'badge', 'title', 'theme')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  price_coins INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- analytics_events (from 003)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- admin_config (from 003)
CREATE TABLE IF NOT EXISTS admin_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- admin_audit_log (from 003)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT,
  action TEXT,
  setting_key TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- leagues (from 005)
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  tier INT NOT NULL UNIQUE,
  icon_url TEXT,
  color TEXT NOT NULL DEFAULT '#FFFFFF',
  promotion_slots INT NOT NULL DEFAULT 10,
  demotion_slots INT NOT NULL DEFAULT 10,
  group_size INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- promo_codes (from 011)
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('pro_monthly', 'pro_yearly', 'pro_lifetime')),
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- friendships (from 010)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending','accepted','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- duel_stats (from 010)
CREATE TABLE IF NOT EXISTS duel_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_duels INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  draws INT NOT NULL DEFAULT 0,
  win_streak INT NOT NULL DEFAULT 0,
  best_win_streak INT NOT NULL DEFAULT 0,
  giant_kills INT NOT NULL DEFAULT 0,
  duel_xp_total INT NOT NULL DEFAULT 0
);

-- ── Tier 1: depend on tier-0 tables ─────────────────────────────

-- user_cosmetics (from 002, depends on cosmetics)
CREATE TABLE IF NOT EXISTS user_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cosmetic_id UUID NOT NULL REFERENCES cosmetics(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cosmetic_id)
);

-- weekly_anime_plays (from 005)
CREATE TABLE IF NOT EXISTS weekly_anime_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES anime_series(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  play_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, anime_id, week_start)
);

-- league_groups (from 005, depends on leagues)
CREATE TABLE IF NOT EXISTS league_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- duel_matches (from 010)
CREATE TABLE IF NOT EXISTS duel_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('quick_match','friend_challenge')),
  anime_id UUID REFERENCES anime_series(id),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard','impossible','mixed')),
  question_count INT NOT NULL DEFAULT 10 CHECK (question_count IN (5, 10)),
  questions JSONB NOT NULL,
  challenger_score INT,
  challenger_correct INT,
  challenger_time_ms INT,
  challenger_answers JSONB,
  challenger_completed_at TIMESTAMPTZ,
  opponent_score INT,
  opponent_correct INT,
  opponent_time_ms INT,
  opponent_answers JSONB,
  opponent_completed_at TIMESTAMPTZ,
  winner_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN (
    'waiting','matched','in_progress','completed','expired','declined'
  )),
  challenger_xp_earned INT NOT NULL DEFAULT 0,
  opponent_xp_earned INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- promo_redemptions (from 011, depends on promo_codes)
CREATE TABLE IF NOT EXISTS promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, promo_code_id)
);

-- ── Tier 2: depend on tier-1 tables ─────────────────────────────

-- league_memberships (from 005, depends on league_groups, leagues)
CREATE TABLE IF NOT EXISTS league_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES league_groups(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  weekly_xp INT NOT NULL DEFAULT 0,
  unique_anime_count INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- league_history (from 005, depends on league_groups, leagues)
CREATE TABLE IF NOT EXISTS league_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES league_groups(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  final_rank INT NOT NULL,
  weekly_xp INT NOT NULL DEFAULT 0,
  unique_anime_count INT NOT NULL DEFAULT 0,
  result TEXT NOT NULL CHECK (result IN ('promoted', 'stayed', 'demoted', 'missed_promotion')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═════════════════════════════════════════════════════════════════
-- SECTION 4: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- (Running ENABLE twice is a no-op — safe)
-- ═════════════════════════════════════════════════════════════════

ALTER TABLE anime_series          ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges           ENABLE ROW LEVEL SECURITY;
ALTER TABLE grand_prix_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grand_prix_matches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE grand_prix_emblems    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_emblems          ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_league_waitlist  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosmetics             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cosmetics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config          ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_anime_plays    ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues               ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_groups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_memberships    ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_history        ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships           ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_matches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_stats            ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions     ENABLE ROW LEVEL SECURITY;


-- ═════════════════════════════════════════════════════════════════
-- SECTION 5: RLS POLICIES
-- Each wrapped in DO/EXCEPTION for idempotency
-- ═════════════════════════════════════════════════════════════════

-- ── anime_series (age-filtered select from 004) ─────────────────
DROP POLICY IF EXISTS "anime_series_select" ON anime_series;
DO $$ BEGIN
  CREATE POLICY "anime_series_select" ON anime_series
    FOR SELECT USING (
      CASE
        WHEN auth.uid() IS NULL THEN true
        WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'junior'
          THEN content_rating = 'E'
        WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'teen'
          THEN content_rating IN ('E', 'T')
        ELSE true
      END
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── questions (age-filtered select from 004) ────────────────────
DROP POLICY IF EXISTS "questions_select" ON questions;
DO $$ BEGIN
  CREATE POLICY "questions_select" ON questions
    FOR SELECT USING (
      CASE
        WHEN auth.uid() IS NULL THEN true
        WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'junior'
          THEN kid_safe = true AND difficulty IN ('easy', 'medium')
        WHEN (SELECT age_group FROM user_profiles WHERE id = auth.uid()) = 'teen'
          THEN true
        ELSE true
      END
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── user_profiles ───────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "user_profiles_delete" ON user_profiles FOR DELETE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── quiz_sessions ───────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "quiz_sessions_select" ON quiz_sessions FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "quiz_sessions_insert" ON quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── user_answers ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "user_answers_select" ON user_answers
    FOR SELECT USING (session_id IN (SELECT id FROM quiz_sessions WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "user_answers_insert" ON user_answers
    FOR INSERT WITH CHECK (session_id IN (SELECT id FROM quiz_sessions WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── badges ──────────────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "badges_read_all" ON badges FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── user_badges ─────────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "user_badges_read_own" ON user_badges FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "user_badges_insert_own" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── grand_prix_tournaments ──────────────────────────────────────
DO $$ BEGIN CREATE POLICY "gp_tournaments_read_all" ON grand_prix_tournaments FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── grand_prix_matches ──────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "gp_matches_read_all" ON grand_prix_matches FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "gp_matches_update_own" ON grand_prix_matches
    FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── grand_prix_emblems ──────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "gp_emblems_read_all" ON grand_prix_emblems FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── user_emblems ────────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "user_emblems_read_own" ON user_emblems FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── star_league_waitlist ────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "waitlist_anyone_can_join" ON star_league_waitlist FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "waitlist_public_count" ON star_league_waitlist FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── cosmetics ───────────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "cosmetics_public_read" ON cosmetics FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── user_cosmetics ──────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "user_cosmetics_read_own" ON user_cosmetics FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "user_cosmetics_insert_own" ON user_cosmetics FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── admin_config (public read, service_role write) ──────────────
DO $$ BEGIN CREATE POLICY "config_public_read" ON admin_config FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── analytics_events — service_role only (no client policies) ───
-- ── admin_audit_log  — service_role only (no client policies) ───

-- ── weekly_anime_plays ──────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "weekly_anime_plays_read_own" ON weekly_anime_plays FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "weekly_anime_plays_insert_own" ON weekly_anime_plays FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "weekly_anime_plays_update_own" ON weekly_anime_plays FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── leagues ─────────────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "leagues_read" ON leagues FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── league_groups ───────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "league_groups_read" ON league_groups FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── league_memberships ──────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "league_memberships_read" ON league_memberships FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "league_memberships_update_own" ON league_memberships FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── league_history ──────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "league_history_read_own" ON league_history FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── friendships ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "friendships_read_own" ON friendships
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "friendships_insert_own" ON friendships
    FOR INSERT WITH CHECK (auth.uid() = requester_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "friendships_update_own" ON friendships
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "friendships_delete_own" ON friendships
    FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── duel_matches ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "duel_matches_read_own" ON duel_matches
    FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "duel_matches_read_waiting" ON duel_matches
    FOR SELECT USING (status = 'waiting' AND match_type = 'quick_match');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "duel_matches_insert_challenger" ON duel_matches
    FOR INSERT WITH CHECK (auth.uid() = challenger_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "duel_matches_update_participant" ON duel_matches
    FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── duel_stats ──────────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "duel_stats_read_all" ON duel_stats FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "duel_stats_insert_own" ON duel_stats FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "duel_stats_update_own" ON duel_stats FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── promo_codes ─────────────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "promo_codes_read_for_validation" ON promo_codes FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── promo_redemptions ───────────────────────────────────────────
DO $$ BEGIN CREATE POLICY "promo_redemptions_read_own" ON promo_redemptions FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "promo_redemptions_insert_own" ON promo_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ═════════════════════════════════════════════════════════════════
-- SECTION 6: INDEXES (all IF NOT EXISTS)
-- ═════════════════════════════════════════════════════════════════

-- questions
CREATE INDEX IF NOT EXISTS idx_questions_anime_difficulty
  ON questions(anime_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_anime_difficulty_safe
  ON questions(anime_id, difficulty, kid_safe);
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_anime_id_question_text
  ON questions(anime_id, question_text);

-- user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp
  ON user_profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_age_group
  ON user_profiles(age_group);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription
  ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created
  ON user_profiles(created_at DESC);

-- quiz_sessions (mapped from 014's quiz_results references)
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_completed
  ON quiz_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_anime_difficulty
  ON quiz_sessions(anime_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed
  ON quiz_sessions(completed_at DESC);

-- anime_series
CREATE INDEX IF NOT EXISTS idx_anime_series_rating
  ON anime_series(content_rating);

-- analytics_events
CREATE INDEX IF NOT EXISTS idx_events_name_created
  ON analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_created
  ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created
  ON analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON analytics_events(user_id, created_at DESC);

-- weekly_anime_plays
CREATE INDEX IF NOT EXISTS idx_weekly_anime_plays_user_week
  ON weekly_anime_plays(user_id, week_start);

-- league_groups
CREATE INDEX IF NOT EXISTS idx_league_groups_active
  ON league_groups(is_active, week_start);
CREATE INDEX IF NOT EXISTS idx_league_groups_league_week
  ON league_groups(league_id, week_start);

-- league_memberships
CREATE INDEX IF NOT EXISTS idx_league_memberships_group_xp
  ON league_memberships(group_id, weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_league_memberships_user
  ON league_memberships(user_id);

-- league_history
CREATE INDEX IF NOT EXISTS idx_league_history_user
  ON league_history(user_id, week_start DESC);

-- user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user
  ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge
  ON user_badges(badge_id);

-- grand_prix_matches
CREATE INDEX IF NOT EXISTS idx_gp_matches_tournament
  ON grand_prix_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_gp_matches_players
  ON grand_prix_matches(player1_id, player2_id);

-- user_emblems
CREATE INDEX IF NOT EXISTS idx_user_emblems_user
  ON user_emblems(user_id);

-- friendships (composite with status from 014)
CREATE INDEX IF NOT EXISTS idx_friendships_requester
  ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_recipient
  ON friendships(recipient_id, status);

-- duel_matches
CREATE INDEX IF NOT EXISTS idx_duel_matches_challenger
  ON duel_matches(challenger_id, status);
CREATE INDEX IF NOT EXISTS idx_duel_matches_opponent
  ON duel_matches(opponent_id, status);
CREATE INDEX IF NOT EXISTS idx_duel_matches_status_expires
  ON duel_matches(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_duel_matches_created
  ON duel_matches(created_at DESC);

-- promo_codes & promo_redemptions
CREATE INDEX IF NOT EXISTS idx_promo_codes_code
  ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user
  ON promo_redemptions(user_id);


-- ═════════════════════════════════════════════════════════════════
-- SECTION 7: FUNCTIONS & TRIGGERS
-- ═════════════════════════════════════════════════════════════════

-- Auto-create user_profiles on signup (latest version from 004)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, age_group)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    SPLIT_PART(NEW.email, '@', 1),
    'full'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger idempotently
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ═════════════════════════════════════════════════════════════════
-- SECTION 8: SEED DATA (all ON CONFLICT DO NOTHING)
-- ═════════════════════════════════════════════════════════════════

-- ── 8a. League tiers (from 005) ─────────────────────────────────

INSERT INTO leagues (name, tier, color, promotion_slots, demotion_slots, group_size)
VALUES
  ('Bronze',    1, '#CD7F32', 10, 0,  30),
  ('Silver',    2, '#C0C0C0', 10, 10, 30),
  ('Gold',      3, '#FFD700', 10, 10, 30),
  ('Platinum',  4, '#E5E4E2', 10, 10, 30),
  ('Diamond',   5, '#B9F2FF', 10, 10, 30),
  ('Champion',  6, '#FF6B35', 0,  5,  30)
ON CONFLICT (name) DO NOTHING;

-- ── 8b. Admin config defaults (from 003 + 013) ─────────────────

INSERT INTO admin_config (key, value) VALUES
  ('free_quiz_limit',        '10'::jsonb),
  ('diminishing_returns',    '[1.0, 0.75, 0.50, 0.25, 0.10]'::jsonb),
  ('league_promotion_sizes', '{"bronze":10,"silver":10,"gold":10,"platinum":10,"diamond":5,"champion":0}'::jsonb),
  ('league_demotion_sizes',  '{"bronze":0,"silver":10,"gold":10,"platinum":10,"diamond":10,"champion":5}'::jsonb),
  ('breadth_gates',          '{"1":0,"2":2,"3":3,"4":5,"5":6}'::jsonb),
  ('maintenance_mode',       'false'::jsonb),
  ('feature_flags',          '{"leagues":true,"badges":true,"daily_challenge":true,"grand_prix":true,"swag_shop":true,"duels":true}'::jsonb),
  ('announcement_banner',    '""'::jsonb),
  ('daily_challenge_mix',    '{"easy":3,"medium":3,"hard":3,"impossible":1}'::jsonb),
  ('ad_visibility',          'true'::jsonb),
  ('duel_max_per_opponent_weekly', '3'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── 8c. Badges — Streak (from 006) ──────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('streak-3',   'Hot Streak',       'Play 3 days in a row',    'streak', 'Flame', '#FF6B35', 'streak_days', '{"days":3}',  'common'),
  ('streak-7',   'Weekly Warrior',   'Play 7 days in a row',    'streak', 'Flame', '#FF8C00', 'streak_days', '{"days":7}',  'uncommon'),
  ('streak-30',  'Month of Mastery', 'Play 30 days in a row',   'streak', 'Flame', '#FF4500', 'streak_days', '{"days":30}', 'epic')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Weekend ────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('weekend-warrior', 'Weekend Warrior', 'Play on both Saturday and Sunday in the same weekend', 'weekend', 'Calendar', '#00D1B2', 'weekend_both_days', '{}', 'uncommon')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Time ───────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('early-bird', 'Early Bird', 'Complete a quiz before 8 AM local time',  'time', 'Sunrise', '#FFD700', 'hour_before', '{"hour":8}',  'uncommon'),
  ('night-owl',  'Night Owl',  'Complete a quiz after 11 PM local time',  'time', 'Moon',    '#6366F1', 'hour_after',  '{"hour":23}', 'uncommon')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Difficulty ─────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('hard-starter', 'Challenge Accepted', 'Complete your first Hard quiz',             'difficulty', 'Swords',   '#E94560', 'hard_quiz_count',   '{"count":1}',    'common'),
  ('hard-master',  'Hard Mode Master',   'Score 80%+ on a Hard quiz',                 'difficulty', 'Swords',   '#E94560', 'hard_score_percent', '{"percent":80}',  'rare'),
  ('hard-perfect', 'Flawless Victory',   'Get a perfect score on a Hard quiz',        'difficulty', 'Swords',   '#FF0000', 'hard_score_percent', '{"percent":100}', 'epic'),
  ('first-quiz',   'First Steps',        'Complete your very first quiz',              'difficulty', 'Sparkles', '#00D1B2', 'total_quizzes',     '{"count":1}',    'common')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Breadth ────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('anime-explorer', 'Anime Explorer',     'Play quizzes on 4 different anime',      'breadth', 'Compass', '#00D1B2', 'unique_anime', '{"count":4}',  'common'),
  ('anime-master',   'Anime Completionist','Play quizzes on every available anime',   'breadth', 'Globe',   '#B9F2FF', 'unique_anime', '{"all":true}', 'legendary')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Volume ─────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('quiz-50',   'Quiz Enthusiast', 'Complete 50 quizzes',    'volume', 'BookOpen', '#FF6B35', 'total_quizzes', '{"count":50}',   'common'),
  ('quiz-100',  'Century Club',    'Complete 100 quizzes',   'volume', 'BookOpen', '#FF6B35', 'total_quizzes', '{"count":100}',  'uncommon'),
  ('quiz-500',  'Quiz Addict',     'Complete 500 quizzes',   'volume', 'BookOpen', '#FF8C00', 'total_quizzes', '{"count":500}',  'rare'),
  ('quiz-1000', 'Grand Master',    'Complete 1,000 quizzes', 'volume', 'Crown',    '#FFD700', 'total_quizzes', '{"count":1000}', 'epic')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Accuracy ───────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('perfect-10',  'Perfect Round', 'Answer 10 questions correctly in a row',   'accuracy', 'Target',    '#00D1B2', 'consecutive_correct', '{"count":10}',                  'rare'),
  ('accuracy-90', 'Sharp Shooter', 'Maintain 90%+ accuracy across 10 quizzes', 'accuracy', 'Crosshair', '#00D1B2', 'accuracy_percent',    '{"percent":90,"quizzes":10}',   'epic')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Speed ──────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('speed-demon',   'Speed Demon',        'Answer all questions in a quiz under 5 seconds each', 'speed', 'Zap', '#FFD700', 'all_under_time',            '{"ms":5000}',                          'rare'),
  ('lightning-hard', 'Lightning Reflexes', 'Answer all Hard questions under 5s each',             'speed', 'Zap', '#FF4500', 'all_under_time_difficulty',  '{"ms":5000,"difficulty":"hard"}',       'epic')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Daily ──────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('daily-7', 'Daily Devotee', 'Complete daily challenges 7 days in a row', 'daily', 'CalendarCheck', '#00D1B2', 'daily_challenge_streak', '{"days":7}', 'rare')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — League ─────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('league-silver',   'Silver Climber',   'Reach Silver League',              'league', 'Medal',      '#C0C0C0', 'league_tier',      '{"tier":2}',  'common'),
  ('league-gold',     'Gold Standard',    'Reach Gold League',                'league', 'Star',       '#FFD700', 'league_tier',      '{"tier":3}',  'uncommon'),
  ('league-platinum', 'Platinum Elite',   'Reach Platinum League',            'league', 'Gem',        '#E5E4E2', 'league_tier',      '{"tier":4}',  'rare'),
  ('league-diamond',  'Diamond Legend',   'Reach Diamond League',             'league', 'Award',      '#B9F2FF', 'league_tier',      '{"tier":5}',  'epic'),
  ('league-champion', 'Champion Supreme', 'Reach Champion League',            'league', 'Swords',     '#FF6B35', 'league_tier',      '{"tier":6}',  'legendary'),
  ('first-promotion', 'Moving On Up',     'Get promoted for the first time',  'league', 'TrendingUp', '#00D1B2', 'promotion_count',  '{"count":1}', 'common'),
  ('promo-5',         'Serial Climber',   'Get promoted 5 times',             'league', 'TrendingUp', '#FFD700', 'promotion_count',  '{"count":5}', 'rare')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Special ────────────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('og-player',  'OG Player',      'Joined OtakuQuiz in the first month', 'special', 'Shield',        '#FF6B35', 'joined_before', '{"date":"2026-04-01"}', 'epic'),
  ('xp-genin',   'Genin Graduate', 'Reach Chunin rank (500 XP)',          'special', 'GraduationCap', '#00D1B2', 'total_xp',      '{"xp":500}',           'common'),
  ('xp-hokage',  'Hokage Legend',  'Reach Hokage rank (25,000 XP)',       'special', 'Crown',         '#FFD700', 'total_xp',      '{"xp":25000}',         'legendary')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Grand Prix (from 009) ──────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('gp-qualifier', 'Grand Prix Qualifier', 'Qualify for the Otaku Grand Prix tournament', 'grand_prix', 'Flag',   '#FFD700', 'gp_qualifier_count', '{"count":1}', 'rare'),
  ('gp-winner',    'Grand Prix Champion',  'Win an Otaku Grand Prix tournament',          'grand_prix', 'Trophy', '#FFD700', 'gp_win_count',       '{"count":1}', 'legendary'),
  ('gp-3-wins',    'Triple Crown',         'Win 3 Otaku Grand Prix tournaments',          'grand_prix', 'Crown',  '#FFD700', 'gp_win_count',       '{"count":3}', 'legendary')
ON CONFLICT (slug) DO NOTHING;

-- ── Badges — Duel (from 010) ────────────────────────────────────

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('duel-first-blood',  'First Blood',  'Win your first duel',                          'duel', 'Swords', '#E94560', 'duel_wins',       '{"count":1}',  'common'),
  ('duel-giant-slayer', 'Giant Slayer', 'Beat an opponent 2+ league tiers above you',   'duel', 'Shield', '#9333EA', 'duel_giant_kills', '{"count":1}',  'epic'),
  ('duel-master',       'Duel Master',  'Win 50 duels',                                 'duel', 'Crown',  '#FFD700', 'duel_wins',       '{"count":50}', 'legendary'),
  ('duel-perfect',      'Perfect Duel', 'Answer every question correctly in a duel',    'duel', 'Target', '#00D1B2', 'duel_perfect',     '{}',            'rare'),
  ('duel-rivalry',      'Rivalry',      'Duel the same opponent 10 times',              'duel', 'Users',  '#FF8C00', 'duel_rivalry',     '{"count":10}', 'rare'),
  ('duel-undefeated',   'Undefeated',   'Win 10 duels in a row',                        'duel', 'Flame',  '#FF4500', 'duel_win_streak',  '{"count":10}', 'epic')
ON CONFLICT (slug) DO NOTHING;


-- ═════════════════════════════════════════════════════════════════
-- SECTION 9: DATA UPDATES
-- ═════════════════════════════════════════════════════════════════

-- 9a. Set content ratings by slug (from 004, idempotent UPDATEs)
UPDATE anime_series SET content_rating = 'E'
  WHERE slug IN ('dragon-ball-z', 'my-hero-academia', 'naruto', 'one-piece');

UPDATE anime_series SET content_rating = 'T'
  WHERE slug IN ('demon-slayer', 'jujutsu-kaisen');

UPDATE anime_series SET content_rating = 'M'
  WHERE slug IN ('death-note', 'attack-on-titan');

-- 9b. Mark non-kid-safe questions (from 004)
UPDATE questions SET kid_safe = false
  WHERE question_text IN (
    'What is the name of Sasuke''s older brother?',
    'What is Kakashi''s father''s name and his famous nickname?',
    'What is the name of the forbidden jutsu that reanimates the dead, used extensively by Kabuto during the Fourth Great Ninja War?',
    'What organization does Itachi join after leaving the Hidden Leaf Village?',
    'According to Madara Uchiha, what is the purpose of the Infinite Tsukuyomi?',
    'What is the name of the hero killer who targets heroes he considers unworthy?',
    'What is Eri''s Quirk and why is it significant to the villain Overhaul?',
    'Who is the galactic Emperor who destroyed Planet Vegeta?',
    'Who defeats Cell in the Cell Games?',
    'Who are the Five Elders (Gorosei)?'
  );

-- 9c. Update total question counts (from 008e)
UPDATE anime_series SET total_questions = (
  SELECT COUNT(*) FROM questions WHERE anime_id = anime_series.id
);

-- 9d. Ensure feature_flags includes duels (from 013)
UPDATE admin_config
SET value = jsonb_set(value, '{duels}', 'true'::jsonb)
WHERE key = 'feature_flags'
  AND NOT (value ? 'duels');


-- ═════════════════════════════════════════════════════════════════
-- SECTION 10: REFRESH QUERY PLANNER STATS
-- ═════════════════════════════════════════════════════════════════

ANALYZE;
