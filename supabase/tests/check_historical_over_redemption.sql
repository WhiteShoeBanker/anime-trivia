-- One-shot audit: flag any promo_code where the count of redemption
-- rows exceeds the recorded current_uses. Such a row indicates a past
-- over-redemption (very likely from the pre-migration-017 client-side
-- flow, where the UPDATE that bumped current_uses was silently denied
-- by RLS while the redemption INSERT succeeded — so users got Pro
-- without the counter advancing).
--
-- Expected result on a clean DB: 0 rows.
-- Any row returned needs manual review:
--   * Decide whether to refund / claw back / leave the over-grant in place
--   * If keeping the over-grant, reconcile the counter:
--       UPDATE promo_codes SET current_uses = <real_count> WHERE id = ...;
--   * Optionally raise max_uses to match if the code was meant to be
--     widely available
--
-- How to run:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/check_historical_over_redemption.sql

SELECT
  pc.id          AS code_id,
  pc.code        AS code,
  pc.type        AS code_type,
  pc.max_uses,
  pc.current_uses,
  COUNT(pr.id)   AS actual_redemptions,
  COUNT(pr.id) - pc.current_uses AS over_redemption_delta
FROM promo_codes pc
LEFT JOIN promo_redemptions pr ON pr.promo_code_id = pc.id
GROUP BY pc.id, pc.code, pc.type, pc.max_uses, pc.current_uses
HAVING COUNT(pr.id) > pc.current_uses
ORDER BY (COUNT(pr.id) - pc.current_uses) DESC, pc.code;
