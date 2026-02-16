-- OtakuQuiz Promo Code & Quiz Limiter Schema
-- Adds: subscription tracking, promo codes, daily quiz limits

-- =============================================================
-- 1. Add subscription tracking & daily quiz columns to user_profiles
-- =============================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS subscription_source TEXT DEFAULT 'none'
    CHECK (subscription_source IN ('none', 'paid', 'promo_code', 'admin_grant')),
  ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS daily_quiz_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_quiz_reset DATE DEFAULT CURRENT_DATE;

-- =============================================================
-- 2. Promo codes catalog
-- =============================================================
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL
    CHECK (type IN ('pro_monthly', 'pro_yearly', 'pro_lifetime')),
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- No client-side policies — only service_role can manage promo codes.
-- Client reads go through promo_redemptions + validated code lookup.

-- =============================================================
-- 3. Promo code redemptions
-- =============================================================
CREATE TABLE promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, promo_code_id)
);

ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own redemptions
CREATE POLICY "promo_redemptions_read_own" ON promo_redemptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own redemptions (validated in app logic)
CREATE POLICY "promo_redemptions_insert_own" ON promo_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- 4. Allow authenticated users to read promo codes for validation
-- =============================================================
CREATE POLICY "promo_codes_read_for_validation" ON promo_codes
  FOR SELECT USING (true);

-- =============================================================
-- 5. Index for fast code lookup
-- =============================================================
CREATE INDEX idx_promo_codes_code ON promo_codes (code);
CREATE INDEX idx_promo_redemptions_user ON promo_redemptions (user_id);
