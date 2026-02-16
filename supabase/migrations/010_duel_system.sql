-- ═══════════════════════════════════════════════════════════════
-- Migration 010: 1v1 Duel System — Matchmaking, Friends, Stats
-- ═══════════════════════════════════════════════════════════════

-- ── Friendships Table ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending','accepted','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_recipient ON friendships(recipient_id);

-- ── Duel Matches Table ─────────────────────────────────────────

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

CREATE INDEX idx_duel_matches_challenger ON duel_matches(challenger_id, status);
CREATE INDEX idx_duel_matches_opponent ON duel_matches(opponent_id, status);

-- ── Duel Stats Table (denormalized) ────────────────────────────

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

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════

-- ── Friendships RLS ────────────────────────────────────────────

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendships_read_own" ON friendships
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = recipient_id
  );

CREATE POLICY "friendships_insert_own" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "friendships_update_own" ON friendships
  FOR UPDATE USING (
    auth.uid() = requester_id OR auth.uid() = recipient_id
  );

CREATE POLICY "friendships_delete_own" ON friendships
  FOR DELETE USING (
    auth.uid() = requester_id OR auth.uid() = recipient_id
  );

-- ── Duel Matches RLS ──────────────────────────────────────────

ALTER TABLE duel_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "duel_matches_read_own" ON duel_matches
  FOR SELECT USING (
    auth.uid() = challenger_id OR auth.uid() = opponent_id
  );

CREATE POLICY "duel_matches_read_waiting" ON duel_matches
  FOR SELECT USING (
    status = 'waiting' AND match_type = 'quick_match'
  );

CREATE POLICY "duel_matches_insert_challenger" ON duel_matches
  FOR INSERT WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "duel_matches_update_participant" ON duel_matches
  FOR UPDATE USING (
    auth.uid() = challenger_id OR auth.uid() = opponent_id
  );

-- ── Duel Stats RLS ────────────────────────────────────────────

ALTER TABLE duel_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "duel_stats_read_all" ON duel_stats
  FOR SELECT USING (true);

CREATE POLICY "duel_stats_insert_own" ON duel_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "duel_stats_update_own" ON duel_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Update Badges Category Constraint
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_category_check;
ALTER TABLE badges ADD CONSTRAINT badges_category_check CHECK (category IN (
  'streak','weekend','time','difficulty','breadth',
  'volume','accuracy','social','speed','daily',
  'special','league','grand_prix','duel'
));

-- ═══════════════════════════════════════════════════════════════
-- Seed Duel Badges
-- ═══════════════════════════════════════════════════════════════

INSERT INTO badges (slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity) VALUES
  ('duel-first-blood',  'First Blood',    'Win your first duel',                              'duel', 'Swords',  '#E94560', 'duel_wins',        '{"count":1}',   'common'),
  ('duel-giant-slayer', 'Giant Slayer',   'Beat an opponent 2+ league tiers above you',       'duel', 'Shield',  '#9333EA', 'duel_giant_kills',  '{"count":1}',   'epic'),
  ('duel-master',       'Duel Master',    'Win 50 duels',                                     'duel', 'Crown',   '#FFD700', 'duel_wins',        '{"count":50}',  'legendary'),
  ('duel-perfect',      'Perfect Duel',   'Answer every question correctly in a duel',        'duel', 'Target',  '#00D1B2', 'duel_perfect',      '{}',             'rare'),
  ('duel-rivalry',      'Rivalry',        'Duel the same opponent 10 times',                  'duel', 'Users',   '#FF8C00', 'duel_rivalry',      '{"count":10}',  'rare'),
  ('duel-undefeated',   'Undefeated',     'Win 10 duels in a row',                            'duel', 'Flame',   '#FF4500', 'duel_win_streak',   '{"count":10}',  'epic')
ON CONFLICT (slug) DO NOTHING;
