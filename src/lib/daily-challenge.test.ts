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

import {
  fetchDailyChallengeQuestions,
  saveDailyChallengeResult,
} from "./daily-challenge";
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

const todayUtc = () => new Date().toISOString().split("T")[0];
const dateDaysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

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
// Gap 1 — Streak / double-play behavior in saveDailyChallengeResult
// ═══════════════════════════════════════════════════════════════

describe("saveDailyChallengeResult — streak & idempotency", () => {
  const captureProfileUpdates = (
    priorRow: {
      daily_challenge_date: string | null;
      daily_challenge_streak: number;
    },
    totalXp: number
  ) => {
    const updates: Record<string, unknown>[] = [];

    const responder: Responder = (q) => {
      if (q.table === "user_profiles") {
        const hasUpdate = q.ops.some((op) => op.method === "update");
        const hasSelect = q.ops.some((op) => op.method === "select");

        if (hasUpdate) {
          const updateOp = q.ops.find((op) => op.method === "update")!;
          updates.push(updateOp.args[0] as Record<string, unknown>);
          return { data: null };
        }
        if (hasSelect) {
          const selectOp = q.ops.find((op) => op.method === "select")!;
          const cols = selectOp.args[0] as string;
          if (cols.includes("daily_challenge_date")) return { data: priorRow };
          if (cols.includes("total_xp")) return { data: { total_xp: totalXp } };
        }
      }
      return { data: null };
    };

    return { responder, updates };
  };

  it("keeps streak unchanged when priorDate === today (idempotent on streak)", async () => {
    const { responder, updates } = captureProfileUpdates(
      { daily_challenge_date: todayUtc(), daily_challenge_streak: 5 },
      1000
    );
    installSupabaseResponder(mockFrom, responder);

    await saveDailyChallengeResult("user-1", 7, 50);

    const firstUpdate = updates[0];
    expect(firstUpdate.daily_challenge_streak).toBe(5);
    expect(firstUpdate.daily_challenge_date).toBe(todayUtc());
  });

  it("increments streak when priorDate === yesterday", async () => {
    const { responder, updates } = captureProfileUpdates(
      { daily_challenge_date: dateDaysAgo(1), daily_challenge_streak: 4 },
      1000
    );
    installSupabaseResponder(mockFrom, responder);

    await saveDailyChallengeResult("user-1", 8, 60);

    expect(updates[0].daily_challenge_streak).toBe(5);
  });

  it("resets streak to 1 when prior date is neither today nor yesterday", async () => {
    const { responder, updates } = captureProfileUpdates(
      { daily_challenge_date: dateDaysAgo(3), daily_challenge_streak: 10 },
      1000
    );
    installSupabaseResponder(mockFrom, responder);

    await saveDailyChallengeResult("user-1", 6, 40);

    expect(updates[0].daily_challenge_streak).toBe(1);
  });

  it("TODO(daily-bug-2): re-adds xpEarned on same-day repeat (double-play exploit)", async () => {
    // Documents current buggy behavior: when priorDate === today, the
    // streak stays idempotent but total_xp still gets incremented by
    // xpEarned on every call. The intended behavior (and the Session 4D
    // fix) is to skip the XP update entirely when priorDate === today.
    // This test should FAIL once the fix lands, which is the signal to
    // rewrite it as a positive "xp is idempotent on same-day repeat" test.
    const { responder, updates } = captureProfileUpdates(
      { daily_challenge_date: todayUtc(), daily_challenge_streak: 3 },
      1000
    );
    installSupabaseResponder(mockFrom, responder);

    await saveDailyChallengeResult("user-1", 7, 50);

    // Two updates: (1) streak/date/score, (2) total_xp/rank/last_played_at
    expect(updates.length).toBe(2);
    const xpUpdate = updates[1];
    // Bug: total_xp = 1000 + 50 = 1050 even though priorDate === today.
    // Ideal: second update should be skipped entirely.
    expect(xpUpdate.total_xp).toBe(1050);
  });
});
