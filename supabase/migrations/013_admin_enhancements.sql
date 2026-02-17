-- Admin Dashboard Enhancements: additional config seeds

-- Add missing config seeds (using ON CONFLICT to avoid duplicates)
INSERT INTO admin_config (key, value) VALUES
  ('duel_max_per_opponent_weekly', '3'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Update feature_flags to include duels
UPDATE admin_config
SET value = jsonb_set(value, '{duels}', 'true'::jsonb)
WHERE key = 'feature_flags'
  AND NOT (value ? 'duels');
