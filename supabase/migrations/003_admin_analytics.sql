-- Admin Dashboard: analytics events, config, audit log

-- =============================================================
-- 1. Analytics Events
-- =============================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_name_created ON analytics_events (event_name, created_at DESC);
CREATE INDEX idx_events_user_created ON analytics_events (user_id, created_at DESC);

-- RLS: service_role only (no policies = no client access)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 2. Admin Config (public read, service_role write)
-- =============================================================
CREATE TABLE admin_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_public_read" ON admin_config
  FOR SELECT USING (true);

-- Seed defaults
INSERT INTO admin_config (key, value) VALUES
  ('free_quiz_limit', '10'::jsonb),
  ('diminishing_returns', '[1.0, 0.75, 0.50, 0.25, 0.10]'::jsonb),
  ('league_promotion_sizes', '{"bronze":10,"silver":10,"gold":10,"platinum":10,"diamond":5,"champion":0}'::jsonb),
  ('league_demotion_sizes', '{"bronze":0,"silver":10,"gold":10,"platinum":10,"diamond":10,"champion":5}'::jsonb),
  ('breadth_gates', '{"1":0,"2":2,"3":3,"4":5,"5":6}'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('feature_flags', '{"leagues":true,"badges":true,"daily_challenge":true,"grand_prix":true,"swag_shop":true}'::jsonb),
  ('announcement_banner', '""'::jsonb),
  ('daily_challenge_mix', '{"easy":3,"medium":3,"hard":3,"impossible":1}'::jsonb),
  ('ad_visibility', 'true'::jsonb);

-- =============================================================
-- 3. Admin Audit Log
-- =============================================================
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT,
  action TEXT,
  setting_key TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
-- service_role only (no policies)
