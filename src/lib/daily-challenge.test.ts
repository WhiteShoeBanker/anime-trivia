import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

const mockGetDailyChallengeMix = vi.fn();
const mockGetDailyChallengeMixForAge = vi.fn();
vi.mock("@/lib/config-actions", () => ({
  getDailyChallengeMix: () => mockGetDailyChallengeMix(),
  getDailyChallengeMixForAge: (ageGroup: string) =>
    mockGetDailyChallengeMixForAge(ageGroup),
}));

import { fetchDailyChallengeQuestions } from "./daily-challenge";
import {
  installSupabaseResponder,
  findCall,
  findAllCalls,
  type Responder,
} from "@/test/supabase-mock";

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
  // Default: no age-specific override → callers fall back to base mix.
  // Tests that exercise the junior override re-set this per-test.
  mockGetDailyChallengeMixForAge.mockResolvedValue(null);
});

// ═══════════════════════════════════════════════════════════════
// Gap 2 / Bug 1 — Age-appropriate anime scoping on questions
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

  it("junior: questions query includes kid_safe=true", async () => {
    const queries = installSupabaseResponder(mockFrom, buildResponder());

    await fetchDailyChallengeQuestions("junior");

    const kidSafeCalls = findAllCalls(queries, "questions", "eq").filter((q) =>
      q.ops.some(
        (op) =>
          op.method === "eq" && op.args[0] === "kid_safe" && op.args[1] === true
      )
    );
    // One per difficulty (4 in default mix)
    expect(kidSafeCalls.length).toBeGreaterThanOrEqual(4);
  });

  it("junior: anime_series query includes content_rating='E'", async () => {
    const queries = installSupabaseResponder(mockFrom, buildResponder());

    await fetchDailyChallengeQuestions("junior");

    const animeCall = findCall(queries, "anime_series", "eq");
    expect(animeCall).toBeDefined();
    const ratingOp = animeCall!.ops.find(
      (op) => op.method === "eq" && op.args[0] === "content_rating"
    );
    expect(ratingOp?.args[1]).toBe("E");
  });
});

// ═══════════════════════════════════════════════════════════════
// Gap 4 — Config-driven distribution
// ═══════════════════════════════════════════════════════════════

describe("fetchDailyChallengeQuestions — config-driven distribution", () => {
  const stdAnime = [
    makeAnime("a-1", "E"),
    makeAnime("a-2", "E"),
    makeAnime("a-3", "E"),
  ];

  const buildResponder = (
    questionsByDifficulty: Record<string, ReturnType<typeof makeQuestion>[]>
  ): Responder => (q) => {
    if (q.table === "anime_series") return { data: stdAnime };
    if (q.table === "questions") {
      const difficulty = q.ops.find(
        (op) => op.method === "eq" && op.args[0] === "difficulty"
      )?.args[1] as string;
      return { data: questionsByDifficulty[difficulty] ?? [] };
    }
    return { data: null };
  };

  it("emits one questions SELECT per difficulty in mix", async () => {
    const queries = installSupabaseResponder(
      mockFrom,
      buildResponder({
        easy: [
          makeQuestion("q1", "a-1", "easy"),
          makeQuestion("q2", "a-2", "easy"),
          makeQuestion("q3", "a-3", "easy"),
        ],
        medium: [
          makeQuestion("q4", "a-1", "medium"),
          makeQuestion("q5", "a-2", "medium"),
          makeQuestion("q6", "a-3", "medium"),
        ],
        hard: [
          makeQuestion("q7", "a-1", "hard"),
          makeQuestion("q8", "a-2", "hard"),
          makeQuestion("q9", "a-3", "hard"),
        ],
        impossible: [makeQuestion("q10", "a-1", "impossible")],
      })
    );

    await fetchDailyChallengeQuestions("full");

    const difficultiesSeen = findAllCalls(queries, "questions", "eq").flatMap(
      (q) =>
        q.ops
          .filter((op) => op.method === "eq" && op.args[0] === "difficulty")
          .map((op) => op.args[1])
    );
    expect(new Set(difficultiesSeen)).toEqual(
      new Set(["easy", "medium", "hard", "impossible"])
    );
  });

  it("returns at most 10 questions even if pool is larger", async () => {
    const glut = (difficulty: string) =>
      Array.from({ length: 20 }, (_, i) =>
        makeQuestion(`q-${difficulty}-${i}`, `a-${(i % 3) + 1}`, difficulty)
      );
    installSupabaseResponder(
      mockFrom,
      buildResponder({
        easy: glut("easy"),
        medium: glut("medium"),
        hard: glut("hard"),
        impossible: glut("impossible"),
      })
    );

    const result = await fetchDailyChallengeQuestions("full");
    expect(result.length).toBe(10);
  });

  it("empty mix config yields 0 questions without crashing", async () => {
    mockGetDailyChallengeMix.mockResolvedValueOnce({});
    installSupabaseResponder(mockFrom, buildResponder({}));

    const result = await fetchDailyChallengeQuestions("full");
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// daily-bug-4 — Age-specific daily challenge mix (junior override)
// ═══════════════════════════════════════════════════════════════

describe("fetchDailyChallengeQuestions — age-specific mix override (daily-bug-4)", () => {
  it("uses the junior override (5 easy + 5 medium) when configured", async () => {
    mockGetDailyChallengeMixForAge.mockResolvedValue({ easy: 5, medium: 5 });

    const animeList = [makeAnime("a-e1", "E"), makeAnime("a-e2", "E")];
    const easyQs = Array.from({ length: 20 }, (_, i) =>
      makeQuestion(`q-easy-${i}`, animeList[i % 2].id, "easy")
    );
    const mediumQs = Array.from({ length: 20 }, (_, i) =>
      makeQuestion(`q-medium-${i}`, animeList[i % 2].id, "medium")
    );

    installSupabaseResponder(mockFrom, (q) => {
      if (q.table === "anime_series") return { data: animeList };
      if (q.table === "questions") {
        const diff = q.ops.find(
          (op) => op.method === "eq" && op.args[0] === "difficulty"
        )?.args[1] as string;
        if (diff === "easy") return { data: easyQs };
        if (diff === "medium") return { data: mediumQs };
        return { data: [] };
      }
      return { data: null };
    });

    const result = await fetchDailyChallengeQuestions("junior");

    expect(result).toHaveLength(10);
    const difficulties = result.map((q) => q.difficulty);
    expect(difficulties.filter((d) => d === "easy")).toHaveLength(5);
    expect(difficulties.filter((d) => d === "medium")).toHaveLength(5);
    expect(difficulties).not.toContain("hard");
    expect(difficulties).not.toContain("impossible");
  });

  it("junior falls back to base mix when no override is configured (returns null)", async () => {
    mockGetDailyChallengeMixForAge.mockResolvedValue(null);
    // Base mix from beforeEach: {easy:3, medium:3, hard:3, impossible:1}

    const animeList = [makeAnime("a-e1", "E")];
    installSupabaseResponder(mockFrom, (q) => {
      if (q.table === "anime_series") return { data: animeList };
      if (q.table === "questions") {
        const diff = q.ops.find(
          (op) => op.method === "eq" && op.args[0] === "difficulty"
        )?.args[1] as string;
        return {
          data: Array.from({ length: 10 }, (_, i) =>
            makeQuestion(`q-${diff}-${i}`, "a-e1", diff)
          ),
        };
      }
      return { data: null };
    });

    const result = await fetchDailyChallengeQuestions("junior");
    expect(result).toHaveLength(10); // 3+3+3+1 = base mix applied
  });

  it("teen consults getDailyChallengeMixForAge but always lands on the base mix", async () => {
    // The function is called for every age, but the production
    // implementation in config-actions.ts only returns a non-null
    // override for "junior". For teen/full the wrapper returns null,
    // callers fall back to base. The mock is null here to mirror that
    // production behavior; the assertion locks in that the call site
    // does pass the ageGroup through.
    mockGetDailyChallengeMixForAge.mockResolvedValue(null);

    const animeList = [makeAnime("a-e1", "E"), makeAnime("a-t1", "T")];
    installSupabaseResponder(mockFrom, (q) => {
      if (q.table === "anime_series") return { data: animeList };
      if (q.table === "questions") {
        const diff = q.ops.find(
          (op) => op.method === "eq" && op.args[0] === "difficulty"
        )?.args[1] as string;
        return {
          data: Array.from({ length: 5 }, (_, i) =>
            makeQuestion(`q-${diff}-${i}`, "a-e1", diff)
          ),
        };
      }
      return { data: null };
    });

    await fetchDailyChallengeQuestions("teen");
    expect(mockGetDailyChallengeMixForAge).toHaveBeenCalledWith("teen");
  });
});
