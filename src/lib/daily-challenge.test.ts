import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

const mockGetDailyChallengeMix = vi.fn();
vi.mock("@/lib/config-actions", () => ({
  getDailyChallengeMix: () => mockGetDailyChallengeMix(),
}));

import { fetchDailyChallengeQuestions } from "./daily-challenge";
import { installSupabaseResponder, type Responder } from "@/test/supabase-mock";

// ── Fixtures ─────────────────────────────────────────────────

const makeAnime = (id: string, content_rating: "E" | "T" | "M") => ({
  id,
  content_rating,
});

const makeQuestion = (
  id: string,
  anime_id: string,
  difficulty: string,
  kid_safe = true
) => ({
  id,
  anime_id,
  difficulty,
  kid_safe,
  options: [
    { text: "A", isCorrect: true },
    { text: "B", isCorrect: false },
  ],
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGetDailyChallengeMix.mockResolvedValue({
    easy: 3,
    medium: 3,
    hard: 3,
    impossible: 1,
  });
});

// ═══════════════════════════════════════════════════════════════
// Bug 1 — Teen content-safety: questions MUST be scoped by
// age-appropriate anime list. The fetchDailyChallengeQuestions
// function was computing an age-filtered anime_series list but
// never applying it to the questions query, leaving teens exposed
// to M-rated content. Fix adds .in("anime_id", allowedAnimeIds)
// on every questions query.
// ═══════════════════════════════════════════════════════════════

describe("fetchDailyChallengeQuestions — age-appropriate anime scoping", () => {
  const anime = {
    e1: makeAnime("a-e1", "E"),
    e2: makeAnime("a-e2", "E"),
    e3: makeAnime("a-e3", "E"),
    t1: makeAnime("a-t1", "T"),
    t2: makeAnime("a-t2", "T"),
    m1: makeAnime("a-m1", "M"),
    m2: makeAnime("a-m2", "M"),
  };

  // Questions exist at every difficulty for every anime, all kid_safe=true.
  // The kid_safe=true on M-rated rows proves the age filter acts on
  // content_rating, not on kid_safe.
  const allQuestions: ReturnType<typeof makeQuestion>[] = [];
  for (const difficulty of ["easy", "medium", "hard", "impossible"]) {
    for (const [key, a] of Object.entries(anime)) {
      allQuestions.push(
        makeQuestion(`q-${key}-${difficulty}`, a.id, difficulty, true)
      );
    }
  }

  // Honor the IN("id") and IN("anime_id") filters in the mock, mirroring
  // Supabase's real filter semantics.
  const buildResponder = (): Responder => (q) => {
    if (q.table === "anime_series") {
      const inRating = q.ops.find(
        (op) => op.method === "in" && op.args[0] === "content_rating"
      );
      const eqRating = q.ops.find(
        (op) => op.method === "eq" && op.args[0] === "content_rating"
      );
      let allowed: string[];
      if (inRating) allowed = inRating.args[1] as string[];
      else if (eqRating) allowed = [eqRating.args[1] as string];
      else allowed = ["E", "T", "M"];
      return {
        data: Object.values(anime).filter((a) =>
          allowed.includes(a.content_rating)
        ),
      };
    }
    if (q.table === "questions") {
      const difficulty = q.ops.find(
        (op) => op.method === "eq" && op.args[0] === "difficulty"
      )?.args[1] as string;
      const animeScope = q.ops.find(
        (op) => op.method === "in" && op.args[0] === "anime_id"
      )?.args[1] as string[] | undefined;
      const kidSafe = q.ops.find(
        (op) => op.method === "eq" && op.args[0] === "kid_safe"
      )?.args[1] as boolean | undefined;

      let rows = allQuestions.filter((x) => x.difficulty === difficulty);
      if (animeScope) rows = rows.filter((x) => animeScope.includes(x.anime_id));
      if (kidSafe !== undefined) rows = rows.filter((x) => x.kid_safe === kidSafe);
      return { data: rows };
    }
    return { data: null };
  };

  it("teen: returns only questions from anime with content_rating IN ('E','T')", async () => {
    installSupabaseResponder(mockFrom, buildResponder());

    const result = await fetchDailyChallengeQuestions("teen");

    expect(result.length).toBeGreaterThan(0);
    const mAnimeIds = new Set([anime.m1.id, anime.m2.id]);
    const leaked = result.filter((q) => mAnimeIds.has(q.anime_id));
    expect(leaked).toEqual([]);
  });
});
