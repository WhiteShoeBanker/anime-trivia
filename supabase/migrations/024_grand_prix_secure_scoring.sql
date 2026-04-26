-- ═══════════════════════════════════════════════════════════════
-- Migration 024: Grand Prix secure scoring
--
-- Two changes:
--   (a) Pre-assign question IDs at match-creation time so both
--       players answer the same set, and the server can verify
--       which questions a submission claims to have answered.
--   (b) Drop the client-side UPDATE policy on grand_prix_matches.
--       Score writes now flow through a service-role API route
--       that re-derives score/time and clamps adversarial input.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE grand_prix_matches
  ADD COLUMN IF NOT EXISTS question_ids UUID[];

-- Backfill in-flight matches so existing pending matches don't break
-- when the new client code reads match.question_ids.
UPDATE grand_prix_matches gm
SET question_ids = sub.qids
FROM (
  SELECT m.id AS match_id, array_agg(q.id) AS qids
  FROM grand_prix_matches m
  CROSS JOIN LATERAL (
    SELECT id
    FROM questions
    WHERE anime_id = m.anime_id AND difficulty = 'hard'
    ORDER BY random()
    LIMIT 10
  ) q
  WHERE m.status IN ('pending', 'player1_done', 'player2_done')
    AND m.anime_id IS NOT NULL
    AND m.question_ids IS NULL
  GROUP BY m.id
) sub
WHERE gm.id = sub.match_id;

-- Players can no longer write directly to grand_prix_matches.
-- Service-role API route is the only writer for scores.
DROP POLICY IF EXISTS "gp_matches_update_own" ON grand_prix_matches;
