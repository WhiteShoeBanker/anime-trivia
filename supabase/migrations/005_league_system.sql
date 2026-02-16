-- ═══════════════════════════════════════════════════════════════
-- Migration 005: League System with Anti-Grinding Mechanics
-- ═══════════════════════════════════════════════════════════════

-- ── Weekly Anime Plays (tracks per-anime plays per week) ─────

CREATE TABLE IF NOT EXISTS weekly_anime_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES anime_series(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  play_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, anime_id, week_start)
);

CREATE INDEX idx_weekly_anime_plays_user_week
  ON weekly_anime_plays(user_id, week_start);

-- ── Leagues (6 tiers) ────────────────────────────────────────

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

-- Seed the 6 league tiers
INSERT INTO leagues (name, tier, color, promotion_slots, demotion_slots, group_size)
VALUES
  ('Bronze',    1, '#CD7F32', 10, 0,  30),
  ('Silver',    2, '#C0C0C0', 10, 10, 30),
  ('Gold',      3, '#FFD700', 10, 10, 30),
  ('Platinum',  4, '#E5E4E2', 10, 10, 30),
  ('Diamond',   5, '#B9F2FF', 10, 10, 30),
  ('Champion',  6, '#FF6B35', 0,  5,  30)
ON CONFLICT (name) DO NOTHING;

-- ── League Groups (weekly cohorts of ~30 players) ────────────

CREATE TABLE IF NOT EXISTS league_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_league_groups_active
  ON league_groups(is_active, week_start);

CREATE INDEX idx_league_groups_league_week
  ON league_groups(league_id, week_start);

-- ── League Memberships (player assignment to a group) ────────

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

CREATE INDEX idx_league_memberships_group_xp
  ON league_memberships(group_id, weekly_xp DESC);

CREATE INDEX idx_league_memberships_user
  ON league_memberships(user_id);

-- ── League History (archived weekly results) ─────────────────

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

CREATE INDEX idx_league_history_user
  ON league_history(user_id, week_start DESC);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE weekly_anime_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_history ENABLE ROW LEVEL SECURITY;

-- Leagues: everyone can read
CREATE POLICY "leagues_read" ON leagues
  FOR SELECT USING (true);

-- League groups: everyone can read
CREATE POLICY "league_groups_read" ON league_groups
  FOR SELECT USING (true);

-- League memberships: everyone can read (for leaderboards), users can update own
CREATE POLICY "league_memberships_read" ON league_memberships
  FOR SELECT USING (true);

CREATE POLICY "league_memberships_update_own" ON league_memberships
  FOR UPDATE USING (auth.uid() = user_id);

-- League history: users can read own
CREATE POLICY "league_history_read_own" ON league_history
  FOR SELECT USING (auth.uid() = user_id);

-- Weekly anime plays: users manage own
CREATE POLICY "weekly_anime_plays_read_own" ON weekly_anime_plays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "weekly_anime_plays_insert_own" ON weekly_anime_plays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "weekly_anime_plays_update_own" ON weekly_anime_plays
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role bypass for cron jobs (implicit with service key)
-- All tables allow full access via service role key
