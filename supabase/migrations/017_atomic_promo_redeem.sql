-- OtakuQuiz Promo Redemption — Atomic RPC
-- Fixes the silent-failure + over-redemption bugs from the prior client-side flow.
--
-- Background: migration 011 grants clients SELECT on promo_codes but no UPDATE
-- policy. The old client code called `.update({ current_uses: ... })` directly,
-- which RLS silently denied — so current_uses NEVER incremented and max_uses
-- was never enforced. Clients also performed the three writes (redemption
-- insert, profile upgrade, counter bump) as separate round trips with no
-- transaction, so partial-failure states were possible and common.
--
-- This migration introduces a SECURITY DEFINER Postgres function that runs
-- the entire redemption flow as a single transaction, with a row lock on
-- the promo_codes row to serialize concurrent redeemers of the same code.
--
-- Duration: derived from promo_codes.type (pro_monthly → +1mo, pro_yearly →
-- +1yr, pro_lifetime → NULL/never). No separate duration column is added —
-- the type enum already encodes intent and migration 011's schema is reused
-- as-is.

CREATE OR REPLACE FUNCTION public.redeem_promo_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_code promo_codes%ROWTYPE;
  v_normalized text := UPPER(TRIM(COALESCE(p_code, '')));
  v_expires_at timestamptz;
  v_already_exists boolean;
  v_current_tier text;
  v_current_expires timestamptz;
BEGIN
  -- Identity check. SECURITY DEFINER means auth.uid() still reads from the
  -- caller's JWT (set by the supabase client), not the function owner.
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'unauthenticated'
    );
  END IF;

  IF v_normalized = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'invalid'
    );
  END IF;

  -- Row-level lock serializes concurrent redeemers of the same code.
  -- Two sessions racing on the last slot will be ordered here; the second
  -- will see current_uses already incremented and return 'exhausted'.
  SELECT * INTO v_code
  FROM promo_codes
  WHERE code = v_normalized
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'invalid'
    );
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'expired'
    );
  END IF;

  IF v_code.current_uses >= v_code.max_uses THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'exhausted'
    );
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM promo_redemptions
    WHERE user_id = v_user_id
      AND promo_code_id = v_code.id
  ) INTO v_already_exists;

  IF v_already_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'already_redeemed'
    );
  END IF;

  -- Already-Pro guard: don't double-grant Pro to a user who already has it
  -- via another channel (paid, admin_grant, or another promo). A user with
  -- an *expired* pro_expires_at falls through and is allowed to redeem.
  SELECT subscription_tier, pro_expires_at
    INTO v_current_tier, v_current_expires
  FROM user_profiles
  WHERE id = v_user_id;

  IF v_current_tier = 'pro'
     AND (v_current_expires IS NULL OR v_current_expires > NOW())
  THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'already_pro'
    );
  END IF;

  v_expires_at := CASE v_code.type
    WHEN 'pro_monthly'  THEN NOW() + INTERVAL '1 month'
    WHEN 'pro_yearly'   THEN NOW() + INTERVAL '1 year'
    WHEN 'pro_lifetime' THEN NULL::timestamptz
  END;

  -- UNIQUE(user_id, promo_code_id) on promo_redemptions is the ultimate
  -- backstop against same-user double redemption even if two sessions
  -- for the SAME user race past the pre-check.
  BEGIN
    INSERT INTO promo_redemptions (user_id, promo_code_id)
    VALUES (v_user_id, v_code.id);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'already_redeemed'
    );
  END;

  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE id = v_code.id;

  UPDATE user_profiles
  SET subscription_tier = 'pro',
      subscription_source = 'promo_code',
      pro_expires_at = v_expires_at
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'tier', v_code.type,
    'code_id', v_code.id,
    'expires_at', v_expires_at
  );
END;
$$;

-- Only authenticated users can call this. anon/public cannot.
REVOKE ALL ON FUNCTION public.redeem_promo_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(text) TO authenticated;

-- =============================================================
-- RLS verification (no changes — migration 011 already enforces
-- the right posture; this block documents and asserts it).
--
-- promo_codes:
--   * RLS enabled.
--   * SELECT policy: "promo_codes_read_for_validation" USING (true)
--     — reads are open to authenticated users (acceptable: the table
--     contains no secrets, just code strings + counters).
--   * No INSERT/UPDATE/DELETE policy → all client writes are denied.
--     The old client tried to UPDATE current_uses; that has always
--     been silently rejected (the bug). Now writes go through the
--     SECURITY DEFINER RPC, which bypasses RLS as the function owner.
--
-- promo_redemptions:
--   * RLS enabled.
--   * SELECT/INSERT policies: own rows only (auth.uid() = user_id).
--   * No UPDATE/DELETE policy → no client mutation after insert.
--   * The RPC inserts as the function owner (SECURITY DEFINER), which
--     bypasses RLS, so behavior here is unaffected by the policies.
-- =============================================================
DO $$
BEGIN
  -- Fail the migration if someone has since added an UPDATE policy
  -- to promo_codes that would re-open the original bug surface.
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'promo_codes'
      AND cmd IN ('UPDATE', 'INSERT', 'DELETE', 'ALL')
  ) THEN
    RAISE EXCEPTION
      'promo_codes has a write-side RLS policy; this migration assumes only the SECURITY DEFINER RPC mutates promo_codes. Review and remove the policy, or update this migration.';
  END IF;
END;
$$;
