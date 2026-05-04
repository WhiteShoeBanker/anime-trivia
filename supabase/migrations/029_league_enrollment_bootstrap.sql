-- ═══════════════════════════════════════════════════════════════
-- Migration 029: League enrollment bootstrap
--
-- Closes the league enrollment gap. handle_new_user() created
-- user_profiles rows on signup but never inserted a
-- league_memberships row, and no other code path enrolled new
-- users either. Read paths assumed membership existed (badges-
-- engine tier lookup, league-xp credit, leagues page realtime),
-- and every UPDATE path silently early-returned on null
-- membership. Net effect since the league system shipped
-- (migration 005, 2026-02-16): zero users enrolled, zero
-- league XP credited, zero league standings, zero leaderboards
-- — write-to-nowhere, server-side variant of the quiz wiring
-- gap closed in commit 68b0324 (Session 4K).
--
-- Mechanism: extend handle_new_user() (last extended by
-- migration 018 for age fields) with a best-effort league
-- enrollment block. CREATE OR REPLACE preserves the
-- on_auth_user_created trigger binding from migration 001:
-- 158-161; no DROP/CREATE TRIGGER needed.
--
-- Dual-purpose:
--   (a) Going forward, every new auth.users INSERT triggers
--       atomic enrollment into a Bronze (tier=1) league_group
--       in the same transaction as the user_profiles INSERT.
--   (b) Backfill: a one-shot DO block at the end of the
--       migration enrolls every existing user_profiles row
--       that lacks a league_memberships row, using the same
--       find-or-create logic so backfilled rows are
--       indistinguishable from organically-enrolled rows.
--
-- Find-or-create logic:
--   1. Look up Bronze league (tier=1).
--   2. Read its admin-configurable group_size column (single
--      source of truth — process-leagues/route.ts:306 hardcodes
--      30 instead, a separate latent inconsistency logged for
--      future cleanup).
--   3. Search for an active Bronze league_group for the current
--      week (Monday UTC) with member_count < group_size; pack
--      into the newest such group first.
--   4. If none has capacity, create a new active Bronze group
--      and use it.
--
-- week_start uses date_trunc('week', NOW() AT TIME ZONE 'UTC')
-- ::date to match the JS getCurrentWeekStart() Monday-UTC
-- semantic at lib/league-xp.ts:20-28. PostgreSQL's
-- date_trunc('week', ...) returns Monday at 00:00.
--
-- Failure semantics: the league enrollment block is wrapped in
-- a BEGIN/EXCEPTION WHEN OTHERS clause. user_profiles is the
-- contract — a league insert failure (constraint, RLS, missing
-- seed, transient) MUST NOT abort signup. The user is still
-- created; league enrollment is best-effort and self-healing.
-- The EXCEPTION block RAISES a WARNING (not silent NULL) so
-- real bugs in the helper or schema surface in Supabase logs
-- instead of accumulating invisible debt.
--
-- Race tolerance: two concurrent signups can both find the
-- same Bronze group at capacity-1 and both insert, briefly
-- exceeding group_size by 1. UNIQUE constraint on
-- (user_id, group_id) prevents duplicate rows for the same
-- user; over-capacity by one is acceptable for pre-launch
-- volume. Future tightening would lock the league_groups row
-- via SELECT FOR UPDATE inside the helper.
--
-- Backfill safety: the DO block runs as a single implicit
-- transaction so partial failure rolls the whole backfill
-- back rather than leaving a half-enrolled state. RAISE
-- NOTICE at the end reports the enrollment count — visible
-- in Supabase SQL Editor output.
-- ═══════════════════════════════════════════════════════════════

-- =============================================================
-- 1. Helper: find or create an active Bronze group with capacity
-- =============================================================
-- Returns the group_id of an active Bronze (tier=1) league_group
-- with room for one more member, creating a new group if all
-- current ones for this week are full or none exist.
--
-- SECURITY DEFINER so it can be called from handle_new_user()
-- (which is itself SECURITY DEFINER) and from the backfill DO
-- block. Internal — no GRANT EXECUTE to authenticated/anon, so
-- clients cannot call it directly.

CREATE OR REPLACE FUNCTION public.find_or_create_starter_league_group()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_league_id uuid;
  v_group_size int;
  v_week_start date := date_trunc('week', NOW() AT TIME ZONE 'UTC')::date;
  v_group_id uuid;
BEGIN
  -- Resolve Bronze (tier=1). group_size lives on this row as
  -- single-source-of-truth; the cron's hardcoded 30 is a
  -- separate latent inconsistency.
  SELECT id, group_size INTO v_league_id, v_group_size
  FROM leagues
  WHERE tier = 1;

  IF v_league_id IS NULL THEN
    RAISE EXCEPTION 'Bronze (tier=1) league not seeded';
  END IF;

  -- Belt-and-suspenders fallback. The seed in migration 005
  -- sets DEFAULT 30 NOT NULL, but a future admin edit could
  -- in principle leave the column at 0 or NULL. Don't let
  -- that block enrollment.
  IF v_group_size IS NULL OR v_group_size <= 0 THEN
    v_group_size := 30;
  END IF;

  -- Find an active Bronze group for the current week with
  -- capacity. ORDER BY created_at DESC packs into the newest
  -- still-open group first (older groups fill and stay full
  -- until the cron rotates).
  SELECT lg.id INTO v_group_id
  FROM league_groups lg
  WHERE lg.league_id = v_league_id
    AND lg.week_start = v_week_start
    AND lg.is_active = true
    AND (
      SELECT COUNT(*) FROM league_memberships lm
      WHERE lm.group_id = lg.id
    ) < v_group_size
  ORDER BY lg.created_at DESC
  LIMIT 1;

  IF v_group_id IS NOT NULL THEN
    RETURN v_group_id;
  END IF;

  -- No open group → create one.
  INSERT INTO league_groups (league_id, week_start, is_active)
  VALUES (v_league_id, v_week_start, true)
  RETURNING id INTO v_group_id;

  RETURN v_group_id;
END;
$$;

REVOKE ALL ON FUNCTION public.find_or_create_starter_league_group()
  FROM PUBLIC;

-- =============================================================
-- 2. Extend handle_new_user() with the enrollment block
-- =============================================================
-- Body is migration 018's body verbatim, with a new best-effort
-- league enrollment block appended before RETURN NEW. CREATE OR
-- REPLACE keeps the on_auth_user_created trigger binding from
-- migration 001:158-161; the trigger continues to fire AFTER
-- INSERT ON auth.users.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_birth_year integer;
  v_age_group text;
  v_parent_email text;
  v_username text;
  v_default_username text;
  v_league_id uuid;
  v_group_id uuid;
BEGIN
  -- ── 018 body (preserved verbatim) ───────────────────────────
  -- birth_year: only accept a plausible integer. Anything else
  -- stays NULL (which middleware treats as "needs age verification").
  IF jsonb_typeof(v_meta->'birth_year') = 'number' THEN
    v_birth_year := (v_meta->>'birth_year')::integer;
    IF v_birth_year < 1900 OR v_birth_year > EXTRACT(YEAR FROM NOW())::int THEN
      v_birth_year := NULL;
    END IF;
  END IF;

  -- age_group: only accept the three valid enum values; anything
  -- else stays NULL.
  IF v_meta->>'age_group' IN ('junior', 'teen', 'full') THEN
    v_age_group := v_meta->>'age_group';
  END IF;

  -- parent_email is only meaningful when paired with a junior
  -- age_group. Accept it conditionally so a stray value can't
  -- masquerade as consent.
  IF v_age_group = 'junior' AND v_meta->>'parent_email' IS NOT NULL THEN
    v_parent_email := v_meta->>'parent_email';
  END IF;

  -- Username: prefer caller-provided (junior signups need this),
  -- else fall back to email local-part. Phone-only signups have
  -- no email, so default to a stable per-user fallback to
  -- satisfy the UNIQUE constraint.
  v_default_username := COALESCE(
    NULLIF(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    'user_' || SUBSTR(NEW.id::text, 1, 8)
  );
  v_username := COALESCE(NULLIF(v_meta->>'username', ''), v_default_username);

  INSERT INTO public.user_profiles (
    id,
    username,
    display_name,
    birth_year,
    age_group,
    is_junior,
    parent_email,
    parent_consent_at
  )
  VALUES (
    NEW.id,
    v_username,
    v_username,
    v_birth_year,
    v_age_group,
    v_age_group = 'junior',
    v_parent_email,
    CASE WHEN v_parent_email IS NOT NULL THEN NOW() ELSE NULL END
  );

  -- ── 029 addition: best-effort league enrollment ─────────────
  -- Wrapped in BEGIN/EXCEPTION so any failure here (constraint,
  -- RLS, missing seed, transient) does NOT abort signup. The
  -- user_profiles INSERT above is the contract; league
  -- enrollment is a graceful add-on. A failed enrollment leaves
  -- the user without a row — same state as every account that
  -- existed before this migration — and the read paths handle
  -- that case (silent early-return on null membership).
  --
  -- RAISE WARNING (not silent NULL) so real bugs in the helper
  -- or schema surface in Supabase logs. The user is still signed
  -- up; the warning makes the failure visible without aborting.
  BEGIN
    v_group_id := public.find_or_create_starter_league_group();

    SELECT id INTO v_league_id FROM leagues WHERE tier = 1;

    INSERT INTO public.league_memberships (
      user_id, group_id, league_id, weekly_xp, unique_anime_count
    )
    VALUES (NEW.id, v_group_id, v_league_id, 0, 0);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'League enrollment failed for user %: %',
      NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 3. Backfill: enroll existing user_profiles with no membership
-- =============================================================
-- Wrapped in DO block as a single implicit transaction so a
-- partial failure rolls the whole backfill back rather than
-- leaving a half-enrolled state. Each user gets find-or-create
-- treatment — same logic the trigger uses, so the backfilled
-- rows are indistinguishable from organically-enrolled rows.
--
-- This block intentionally does NOT swallow exceptions: a
-- failure here is a real bug (e.g., the helper function or
-- league_memberships schema is broken) and should fail the
-- migration loudly, NOT half-enroll users and continue.

DO $$
DECLARE
  v_user_id uuid;
  v_league_id uuid;
  v_group_id uuid;
  v_count int := 0;
BEGIN
  SELECT id INTO v_league_id FROM leagues WHERE tier = 1;
  IF v_league_id IS NULL THEN
    RAISE EXCEPTION 'Bronze (tier=1) league not seeded — cannot backfill';
  END IF;

  FOR v_user_id IN
    SELECT up.id
    FROM user_profiles up
    WHERE NOT EXISTS (
      SELECT 1 FROM league_memberships lm WHERE lm.user_id = up.id
    )
  LOOP
    v_group_id := public.find_or_create_starter_league_group();

    INSERT INTO public.league_memberships (
      user_id, group_id, league_id, weekly_xp, unique_anime_count
    )
    VALUES (v_user_id, v_group_id, v_league_id, 0, 0);

    v_count := v_count + 1;
  END LOOP;

  RAISE NOTICE 'Migration 029 backfill: enrolled % users into Bronze', v_count;
END;
$$;

-- =============================================================
-- 4. RLS posture documentation
-- =============================================================
-- league_memberships RLS unchanged from migration 005:
--   * SELECT: USING (true)                — public for leaderboards
--   * UPDATE: USING (auth.uid() = user_id) — own rank only
--   * INSERT: no policy at all            — service-role only;
--                                           SECURITY DEFINER
--                                           trigger / helper
--                                           bypass RLS
-- league_groups RLS unchanged.
-- The trigger and find_or_create_starter_league_group() both
-- run as SECURITY DEFINER (function owner = postgres /
-- supabase_admin) so they bypass RLS for both the league_groups
-- INSERT and the league_memberships INSERT. Clients still
-- cannot directly INSERT into either table.
