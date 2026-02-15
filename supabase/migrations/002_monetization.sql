-- OtakuQuiz Monetization Schema
-- Adds: subscription tiers, star league waitlist, cosmetics

-- =============================================================
-- 1. Add subscription & age fields to user_profiles
-- =============================================================
ALTER TABLE user_profiles
  ADD COLUMN subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro')),
  ADD COLUMN is_junior BOOLEAN DEFAULT false;

-- =============================================================
-- 2. Star League waitlist
-- =============================================================
CREATE TABLE star_league_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  signed_up_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE star_league_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_anyone_can_join" ON star_league_waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "waitlist_public_count" ON star_league_waitlist
  FOR SELECT USING (true);

-- =============================================================
-- 3. Cosmetics catalog
-- =============================================================
CREATE TABLE cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL
    CHECK (type IN ('avatar_frame', 'badge', 'title', 'theme')),
  rarity TEXT DEFAULT 'common'
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  price_coins INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cosmetics_public_read" ON cosmetics
  FOR SELECT USING (true);

-- =============================================================
-- 4. User cosmetics (inventory)
-- =============================================================
CREATE TABLE user_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cosmetic_id UUID NOT NULL REFERENCES cosmetics(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cosmetic_id)
);

ALTER TABLE user_cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_cosmetics_read_own" ON user_cosmetics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_cosmetics_insert_own" ON user_cosmetics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
