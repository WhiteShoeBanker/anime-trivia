// ═══════════════════════════════════════════════════════════════
// Rank thresholds — single source of truth.
//
// Ordered descending by minXp. deriveRankFromXp walks top-to-
// bottom and returns the first rank whose minXp <= totalXp,
// matching the legacy logic that previously lived inline in
// src/lib/queries.ts and src/stores/quizStore.ts. Extracted in
// Session 4H so the new /api/quiz/submit route can reuse it.
// ═══════════════════════════════════════════════════════════════

export const RANK_THRESHOLDS: ReadonlyArray<{
  rank: string;
  minXp: number;
}> = [
  { rank: "Hokage", minXp: 25000 },
  { rank: "Kage",   minXp: 10000 },
  { rank: "ANBU",   minXp: 5000 },
  { rank: "Jonin",  minXp: 2000 },
  { rank: "Chunin", minXp: 500 },
  { rank: "Genin",  minXp: 0 },
];

export const deriveRankFromXp = (totalXp: number): string => {
  for (const { rank, minXp } of RANK_THRESHOLDS) {
    if (totalXp >= minXp) return rank;
  }
  return "Genin";
};
