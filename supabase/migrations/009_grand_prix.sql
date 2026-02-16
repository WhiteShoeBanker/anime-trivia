-- ═══════════════════════════════════════════════════════════════
-- Migration 009: Otaku Grand Prix — Monthly Champion Tournament
-- ═══════════════════════════════════════════════════════════════

-- ── Grand Prix Tournaments ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS grand_prix_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_start DATE NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('qualifying','in_progress','completed')),
  bracket_data JSONB,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Grand Prix Matches ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grand_prix_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES grand_prix_tournaments(id) ON DELETE CASCADE,
  round INT NOT NULL,
  match_number INT NOT NULL,
  player1_id UUID REFERENCES auth.users(id),
  player2_id UUID REFERENCES auth.users(id),
  player1_score INT,
  player2_score INT,
  player1_time_ms INT,
  player2_time_ms INT,
  winner_id UUID REFERENCES auth.users(id),
  anime_id UUID REFERENCES anime_series(id),
  difficulty TEXT NOT NULL DEFAULT 'hard',
  status TEXT NOT NULL CHECK (status IN ('pending','player1_done','player2_done','completed','forfeit')),
  deadline_at TIMESTAMPTZ,
  played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, round, match_number)
);

CREATE INDEX idx_gp_matches_tournament ON grand_prix_matches(tournament_id);
CREATE INDEX idx_gp_matches_players ON grand_prix_matches(player1_id, player2_id);

-- ── Grand Prix Emblems ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grand_prix_emblems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL UNIQUE REFERENCES grand_prix_tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  icon_color TEXT NOT NULL DEFAULT '#FFD700',
  month_label TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'legendary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── User Emblems ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_emblems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emblem_id UUID NOT NULL REFERENCES grand_prix_emblems(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, emblem_id)
);

CREATE INDEX idx_user_emblems_user ON user_emblems(user_id);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE grand_prix_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grand_prix_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE grand_prix_emblems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_emblems ENABLE ROW LEVEL SECURITY;

-- Everyone can read tournaments, matches, emblems (spectating)
CREATE POLICY "gp_tournaments_read_all" ON grand_prix_tournaments
  FOR SELECT USING (true);

CREATE POLICY "gp_matches_read_all" ON grand_prix_matches
  FOR SELECT USING (true);

CREATE POLICY "gp_emblems_read_all" ON grand_prix_emblems
  FOR SELECT USING (true);

-- Users read own emblems
CREATE POLICY "user_emblems_read_own" ON user_emblems
  FOR SELECT USING (auth.uid() = user_id);

-- Service role handles inserts (via cron + submitMatchScore uses service role patterns)
-- Players can update their own match scores
CREATE POLICY "gp_matches_update_own" ON grand_prix_matches
  FOR UPDATE USING (
    auth.uid() = player1_id OR auth.uid() = player2_id
  );

-- ═══════════════════════════════════════════════════════════════
-- Update badges category constraint to include 'grand_prix'
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_category_check;
ALTER TABLE badges ADD CONSTRAINT badges_category_check CHECK (category IN (
  'streak','weekend','time','difficulty','breadth',
  'volume','accuracy','social','speed','daily',
  'special','league','grand_prix'
));

-- ═══════════════════════════════════════════════════════════════
-- Seed Grand Prix Badges
-- ═══════════════════════════════════════════════════════════════

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('gp-qualifier',  'Grand Prix Qualifier',  'Qualify for the Otaku Grand Prix tournament',         'grand_prix', 'Flag',   '#FFD700', 'gp_qualifier_count', '{"count":1}', 'rare'),
  ('gp-winner',     'Grand Prix Champion',   'Win an Otaku Grand Prix tournament',                  'grand_prix', 'Trophy', '#FFD700', 'gp_win_count',       '{"count":1}', 'legendary'),
  ('gp-3-wins',     'Triple Crown',          'Win 3 Otaku Grand Prix tournaments',                  'grand_prix', 'Crown',  '#FFD700', 'gp_win_count',       '{"count":3}', 'legendary')
ON CONFLICT (slug) DO NOTHING;
