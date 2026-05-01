-- ═══════════════════════════════════════════════════════════════
-- Migration 025: Badges secure awarding
--
-- Drops the client-INSERT policy on user_badges. Badge awarding
-- now flows through the server route /api/badges/check, which
-- uses the service-role client to bypass RLS. Direct client
-- writes to user_badges are no longer permitted.
--
-- The UNIQUE(user_id, badge_id) constraint already on user_badges
-- (migration 006) provides idempotency for retried/duplicate
-- award attempts; the route relies on it via upsert with
-- ignoreDuplicates.
--
-- See badge-bug-2 (Session 4G) for context.
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "user_badges_insert_own" ON user_badges;
