-- ═══════════════════════════════════════════════════════════════
-- Migration 023: Age-Specific Daily Challenge Mix (junior override)
-- ═══════════════════════════════════════════════════════════════
--
-- Closes daily-bug-4 from Session 4A audit. The base
-- daily_challenge_mix admin_config row was applied to all ages, but
-- the junior product spec calls for 5 easy + 5 medium (no
-- hard/impossible). This migration seeds a separate
-- daily_challenge_mix_junior key so the override is discoverable and
-- editable in the same admin_config table as the base mix.
--
-- Code-side fallback: src/lib/admin-config.ts DEFAULTS already
-- includes the same value, so juniors get 5+5 even if this migration
-- is not applied. The migration only ensures the row exists in the
-- database for admin discoverability.
--
-- Idempotent — ON CONFLICT DO NOTHING preserves any value an admin
-- has already set.

INSERT INTO admin_config (key, value)
VALUES (
  'daily_challenge_mix_junior',
  '{"easy":5,"medium":5}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
