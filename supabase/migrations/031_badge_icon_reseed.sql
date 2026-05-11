-- Phase 5 #2b — Reassign 8 cross-category-colliding badge icon_names and
-- re-seed all 40 badge icon_color values to palette-anchored hex codes.
--
-- Icon reassignments resolve 8 cross-category collisions identified in the
-- design audit (db9baa1) + Phase 5 #2a investigation:
--   * Crown (4-way: quiz-1000, gp-3-wins, duel-master, xp-hokage)
--   * Swords (5-way: hard trio, league-champion, duel-first-blood)
--   * Flame, Target, Shield (cross-category duel-leak from migrations 009/010)
--
-- icon_color re-seed binds to the Manga Ink palette per the hybrid mapping:
--   * Brand identity: palette.primary for first-quiz, og-player, gp-winner
--   * Tier-foil ladder: palette.tier1..tier6 for rank/volume/xp ladders
--   * Category palette: warning/accent/success/primary for the remainder
--
-- Acceptable in-category ladder duplicates retained (Flame×3 streak,
-- BookOpen×3 volume, TrendingUp×2 league, Zap×2 speed).

BEGIN;

-- ============================================================
-- icon_name reassignments (8 badges)
-- ============================================================
UPDATE badges SET icon_name = 'Library'        WHERE slug = 'quiz-1000';
UPDATE badges SET icon_name = 'Rocket'         WHERE slug = 'gp-3-wins';
UPDATE badges SET icon_name = 'Skull'          WHERE slug = 'duel-master';
UPDATE badges SET icon_name = 'Castle'         WHERE slug = 'league-champion';
UPDATE badges SET icon_name = 'Drama'          WHERE slug = 'duel-first-blood';
UPDATE badges SET icon_name = 'ShieldCheck'    WHERE slug = 'duel-undefeated';
UPDATE badges SET icon_name = 'CircleCheckBig' WHERE slug = 'duel-perfect';
UPDATE badges SET icon_name = 'Mountain'       WHERE slug = 'duel-giant-slayer';

-- ============================================================
-- icon_color re-seed — palette-anchored (40 badges)
-- ============================================================

-- Brand identity (palette.primary = #d4451d)
UPDATE badges SET icon_color = '#d4451d' WHERE slug IN (
  'first-quiz', 'og-player', 'gp-winner',
  'early-bird', 'night-owl', 'daily-7'
);

-- Tier-foil ladder
UPDATE badges SET icon_color = '#a16207' WHERE slug IN ('xp-genin', 'quiz-50');
UPDATE badges SET icon_color = '#94a3b8' WHERE slug IN ('league-silver', 'quiz-100', 'first-promotion');
UPDATE badges SET icon_color = '#eab308' WHERE slug IN ('league-gold', 'quiz-500', 'weekend-warrior', 'gp-qualifier', 'gp-3-wins');
UPDATE badges SET icon_color = '#cbd5e1' WHERE slug IN ('league-platinum', 'quiz-1000', 'promo-5');
UPDATE badges SET icon_color = '#3b82f6' WHERE slug = 'league-diamond';
UPDATE badges SET icon_color = '#dc2626' WHERE slug IN ('league-champion', 'xp-hokage');

-- Category default
UPDATE badges SET icon_color = '#d97706' WHERE slug IN (
  'streak-3', 'streak-7', 'streak-30', 'speed-demon', 'lightning-hard'
);
UPDATE badges SET icon_color = '#b91c1c' WHERE slug IN (
  'hard-starter', 'hard-master', 'hard-perfect',
  'duel-first-blood', 'duel-perfect', 'duel-rivalry',
  'duel-giant-slayer', 'duel-undefeated', 'duel-master'
);
UPDATE badges SET icon_color = '#16a34a' WHERE slug IN (
  'anime-explorer', 'anime-master', 'perfect-10', 'accuracy-90'
);

-- ============================================================
-- Sanity verification (errors out if any badge has unexpected state)
-- ============================================================
DO $$
DECLARE
  unexpected_count INT;
BEGIN
  SELECT COUNT(*) INTO unexpected_count
  FROM badges
  WHERE icon_color NOT IN (
    '#d4451d','#a16207','#94a3b8','#eab308',
    '#cbd5e1','#3b82f6','#dc2626',
    '#d97706','#b91c1c','#16a34a'
  );
  IF unexpected_count > 0 THEN
    RAISE EXCEPTION 'Migration left % badges with off-palette icon_color values', unexpected_count;
  END IF;

  -- Confirm no badge still has Crown as icon_name in volume/grand_prix/duel categories
  -- (xp-hokage keeps Crown, which is correct)
  IF EXISTS (
    SELECT 1 FROM badges
    WHERE icon_name = 'Crown' AND slug != 'xp-hokage'
  ) THEN
    RAISE EXCEPTION 'Crown icon_name persists outside xp-hokage';
  END IF;

  -- Confirm Swords is only on difficulty trio (no league-champion, no duel-first-blood)
  IF EXISTS (
    SELECT 1 FROM badges
    WHERE icon_name = 'Swords' AND category != 'difficulty'
  ) THEN
    RAISE EXCEPTION 'Swords icon_name persists outside difficulty category';
  END IF;
END $$;

COMMIT;
