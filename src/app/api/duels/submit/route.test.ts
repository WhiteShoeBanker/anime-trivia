import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Tests for POST /api/duels/submit (Session 4I, duel-bug-N fix).
// All Supabase access is mocked — no real network / DB.
//
// The route uses two clients:
//   - createClient (SSR) for auth.getUser only (no RPC for duels)
//   - createServiceClient for all duel_matches / duel_stats /
//     user_profiles / league_memberships writes (bypasses RLS +
//     migration-027 trigger on score columns).
//
// We mock both, plus getDuelMaxPerOpponentWeekly from
// @/lib/config-actions and getCurrentWeekStart from @/lib/league-xp.
// @/lib/scoring (calculateQuestionXP) and @/lib/ranks
// (deriveRankFromXp) are NOT mocked — those are pure helpers and
// the tests exercise the real logic.
// ═══════════════════════════════════════════════════════════════

const mockGetUser = vi.fn();
const serviceFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: () => mockGetUser() },
  })),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

vi.mock("@/lib/config-actions", () => ({
  getDuelMaxPerOpponentWeekly: vi.fn().mockResolvedValue(3),
}));

vi.mock("@/lib/league-xp", () => ({
  getCurrentWeekStart: vi.fn().mockReturnValue("2026-04-20"),
}));

import { POST } from "./route";
import {
  installSupabaseResponder,
  findCall,
  findAllCalls,
  type Responder,
  type Query,
  type QueryOp,
} from "@/test/supabase-mock";

// ── Fixtures ─────────────────────────────────────────────────

const CHALLENGER = "challenger-uuid";
const OPPONENT = "opponent-uuid";
const STRANGER = "stranger-uuid";
const DUEL_ID = "duel-1";
const ANIME_ID = "anime-1";

type Difficulty = "easy" | "medium" | "hard" | "impossible" | "mixed";

interface DerivedAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeMs: number;
}

interface DuelRow {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  match_type: string;
  anime_id: string | null;
  difficulty: Difficulty;
  question_count: number;
  questions: string[];
  challenger_score: number | null;
  challenger_correct: number | null;
  challenger_time_ms: number | null;
  challenger_answers: DerivedAnswer[] | null;
  challenger_completed_at: string | null;
  opponent_score: number | null;
  opponent_correct: number | null;
  opponent_time_ms: number | null;
  opponent_answers: DerivedAnswer[] | null;
  opponent_completed_at: string | null;
  winner_id: string | null;
  status: string;
  challenger_xp_earned: number;
  opponent_xp_earned: number;
  expires_at: string;
  created_at: string;
}

const buildDuel = (overrides: Partial<DuelRow> = {}): DuelRow => ({
  id: DUEL_ID,
  challenger_id: CHALLENGER,
  opponent_id: OPPONENT,
  match_type: "quick_match",
  anime_id: null, // skip updateLeagueMembershipXp branch by default
  difficulty: "medium",
  question_count: 5,
  questions: ["q1", "q2", "q3", "q4", "q5"],
  challenger_score: null,
  challenger_correct: null,
  challenger_time_ms: null,
  challenger_answers: null,
  challenger_completed_at: null,
  opponent_score: null,
  opponent_correct: null,
  opponent_time_ms: null,
  opponent_answers: null,
  opponent_completed_at: null,
  winner_id: null,
  status: "matched",
  challenger_xp_earned: 0,
  opponent_xp_earned: 0,
  expires_at: "2026-04-22T00:00:00Z",
  created_at: "2026-04-20T00:00:00Z",
  ...overrides,
});

// Five-question correct option=0 fixture.
const FIVE_IDS = ["q1", "q2", "q3", "q4", "q5"];
const buildQuestions = (
  ids: string[] = FIVE_IDS,
  correctIndex = 0
) =>
  ids.map((id) => ({
    id,
    options: [
      { isCorrect: correctIndex === 0 },
      { isCorrect: correctIndex === 1 },
      { isCorrect: correctIndex === 2 },
      { isCorrect: correctIndex === 3 },
    ],
  }));

const buildAnswers = (
  ids: string[],
  selectedOption: number,
  timeMs = 1000
) =>
  ids.map((id) => ({ questionId: id, selectedOption, timeMs }));

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/duels/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// ── Stateful responder ───────────────────────────────────────
//
// Each test seeds an initial duel + per-table responses, then the
// responder discriminates duel_matches SELECT vs Pass-1 UPDATE
// (.is(...completed_at, null)) vs Pass-2 UPDATE (.eq("status",
// "in_progress")) vs the diminishing-returns COUNT query
// (select(*, {count:'exact', head:true})).
//
// Pass-1 UPDATE returns `postClaim` (the duel after caller's slot
// is filled). Pass-2 UPDATE returns `completed`. If `postClaim`
// is set to null the test simulates the race-loss case (zero
// rows matched the conditional UPDATE).

interface ResponderOpts {
  duel: DuelRow;
  postClaim?: DuelRow | null; // null → simulate race-lost claim
  completed?: DuelRow | null; // null → simulate race-lost completion
  questions?: ReturnType<typeof buildQuestions>;
  weeklyDuelCount?: number;
  // Tier per user (for getTier); unspecified user → tier 1.
  tiersByUser?: Record<string, number>;
  // Existing duel_stats per user (or null = no row, route inserts).
  duelStatsByUser?: Record<
    string,
    {
      total_duels: number;
      wins: number;
      losses: number;
      draws: number;
      win_streak: number;
      best_win_streak: number;
      duel_xp_total: number;
      giant_kills: number;
    } | null
  >;
  // user_profiles total_xp per user (defaults to 1000).
  userXpByUser?: Record<string, number>;
}

const findEqArg = (ops: QueryOp[], col: string): unknown => {
  const op = ops.find(
    (o) => o.method === "eq" && (o.args[0] as string) === col
  );
  return op?.args[1];
};

const responder = (opts: ResponderOpts): Responder => (q) => {
  const ops = q.ops;
  if (q.table === "duel_matches") {
    const isUpdate = ops.some((op) => op.method === "update");
    const selectOp = ops.find((op) => op.method === "select");
    const isCount =
      selectOp !== undefined &&
      typeof selectOp.args[1] === "object" &&
      selectOp.args[1] !== null &&
      (selectOp.args[1] as { count?: string }).count === "exact";
    if (isCount) {
      return { count: opts.weeklyDuelCount ?? 0 };
    }
    if (isUpdate) {
      const hasIsNull = ops.some((op) => op.method === "is");
      const hasInProgressGuard = ops.some(
        (op) =>
          op.method === "eq" &&
          (op.args[0] as string) === "status" &&
          (op.args[1] as string) === "in_progress"
      );
      if (hasIsNull) {
        return { data: opts.postClaim ?? null };
      }
      if (hasInProgressGuard) {
        return { data: opts.completed ?? null };
      }
    }
    // Plain SELECT (initial fetch OR refetch after race-lost pass-2).
    return { data: opts.duel };
  }
  if (q.table === "questions") {
    return { data: opts.questions ?? buildQuestions() };
  }
  if (q.table === "league_memberships") {
    const isUpdate = ops.some((op) => op.method === "update");
    if (isUpdate) return { data: null };
    const userId = findEqArg(ops, "user_id") as string | undefined;
    const tier = userId ? opts.tiersByUser?.[userId] : undefined;
    if (tier === undefined) return { data: null };
    return { data: { leagues: { tier } } };
  }
  if (q.table === "weekly_anime_plays") {
    return { count: 0 };
  }
  if (q.table === "duel_stats") {
    const isUpdate = ops.some((op) => op.method === "update");
    const isInsert = ops.some((op) => op.method === "insert");
    if (isUpdate || isInsert) return { data: null };
    const userId = findEqArg(ops, "user_id") as string | undefined;
    const row = userId ? opts.duelStatsByUser?.[userId] : undefined;
    return { data: row ?? null };
  }
  if (q.table === "user_profiles") {
    const isUpdate = ops.some((op) => op.method === "update");
    if (isUpdate) return { data: null };
    const userId = findEqArg(ops, "id") as string | undefined;
    const xp =
      (userId ? opts.userXpByUser?.[userId] : undefined) ?? 1000;
    return { data: { total_xp: xp } };
  }
  return { data: null };
};

// Build the post-claim row mirroring what the route would compute,
// but for the *other* side already filled. The opposite-side fields
// passed in are what was previously stored from the first submitter.
//
// After Pass-1, the row contains BOTH sides if the test simulates
// "second submitter". Side-effects + winner are decided in Pass-2.
const postClaimWithBothSides = (
  initial: DuelRow,
  side: "challenger" | "opponent",
  derived: {
    score: number;
    correct: number;
    timeMs: number;
    answers: DerivedAnswer[];
  }
): DuelRow => ({
  ...initial,
  [`${side}_score`]: derived.score,
  [`${side}_correct`]: derived.correct,
  [`${side}_time_ms`]: derived.timeMs,
  [`${side}_answers`]: derived.answers,
  [`${side}_completed_at`]: new Date().toISOString(),
  status: "in_progress",
});

const completedDuel = (
  duel: DuelRow,
  winnerId: string | null,
  challengerXp = 0,
  opponentXp = 0
): DuelRow => ({
  ...duel,
  status: "completed",
  winner_id: winnerId,
  challenger_xp_earned: challengerXp,
  opponent_xp_earned: opponentXp,
});

describe("POST /api/duels/submit", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    mockGetUser.mockReset();
  });

  // ═════════════════════════════════════════════════════════════
  // Auth + body validation
  // ═════════════════════════════════════════════════════════════

  it("returns 401 when no auth user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ duel: buildDuel() })
    );

    const res = await POST(
      makeRequest({ duelId: DUEL_ID, answers: buildAnswers(FIVE_IDS, 0) })
    );
    expect(res.status).toBe(401);
    expect(findAllCalls(queries, "duel_matches", "update")).toHaveLength(0);
  });

  describe("body validation", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    });

    it.each([
      ["missing duelId", { answers: buildAnswers(FIVE_IDS, 0) }],
      [
        "non-array answers",
        { duelId: DUEL_ID, answers: "not-an-array" },
      ],
      [
        "empty answers array",
        { duelId: DUEL_ID, answers: [] },
      ],
      [
        "more than 10 answers",
        {
          duelId: DUEL_ID,
          answers: Array.from({ length: 11 }, (_, i) => ({
            questionId: `q-${i}`,
            selectedOption: 0,
            timeMs: 1000,
          })),
        },
      ],
      [
        "non-integer selectedOption",
        {
          duelId: DUEL_ID,
          answers: [{ questionId: "q1", selectedOption: 1.5, timeMs: 0 }],
        },
      ],
      [
        "non-finite timeMs",
        {
          duelId: DUEL_ID,
          answers: [
            { questionId: "q1", selectedOption: 0, timeMs: Number.NaN },
          ],
        },
      ],
    ])("returns 400 when %s", async (_label, body) => {
      const queries = installSupabaseResponder(
        serviceFrom,
        responder({ duel: buildDuel() })
      );

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
      // Validation runs BEFORE any DB access.
      expect(queries).toHaveLength(0);
    });
  });

  it("returns 400 when answers count differs from duel.question_count", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ duel: buildDuel({ question_count: 5 }) })
    );

    // 4 answers vs question_count=5
    const res = await POST(
      makeRequest({
        duelId: DUEL_ID,
        answers: buildAnswers(["q1", "q2", "q3", "q4"], 0),
      })
    );
    expect(res.status).toBe(400);
    expect(findAllCalls(queries, "duel_matches", "update")).toHaveLength(0);
  });

  it("returns 400 when submitted question IDs differ from the assigned set", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ duel: buildDuel() })
    );

    // 5 ids but they don't match duel.questions (q1..q5).
    const wrong = ["q1", "q2", "q3", "q4", "q-extra"];
    const res = await POST(
      makeRequest({ duelId: DUEL_ID, answers: buildAnswers(wrong, 0) })
    );
    expect(res.status).toBe(400);
    expect(findAllCalls(queries, "duel_matches", "update")).toHaveLength(0);
  });

  // ═════════════════════════════════════════════════════════════
  // Authorization
  // ═════════════════════════════════════════════════════════════

  it("returns 404 when duel not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "duel_matches") return { data: null };
      return { data: null };
    });

    const res = await POST(
      makeRequest({ duelId: DUEL_ID, answers: buildAnswers(FIVE_IDS, 0) })
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when caller is neither challenger nor opponent", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: STRANGER } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ duel: buildDuel() })
    );

    const res = await POST(
      makeRequest({ duelId: DUEL_ID, answers: buildAnswers(FIVE_IDS, 0) })
    );
    expect(res.status).toBe(403);
    expect(findAllCalls(queries, "duel_matches", "update")).toHaveLength(0);
  });

  // ═════════════════════════════════════════════════════════════
  // Race + already-submitted
  // ═════════════════════════════════════════════════════════════

  it("returns 409 when caller's *_completed_at is already non-null (pre-check)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: buildDuel({
          challenger_completed_at: "2026-04-21T12:00:00Z",
          status: "in_progress",
        }),
      })
    );

    const res = await POST(
      makeRequest({ duelId: DUEL_ID, answers: buildAnswers(FIVE_IDS, 0) })
    );
    expect(res.status).toBe(409);
    expect(findAllCalls(queries, "duel_matches", "update")).toHaveLength(0);
  });

  it("returns 409 when conditional Pass-1 UPDATE matches zero rows (race-loss)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    installSupabaseResponder(
      serviceFrom,
      responder({
        duel: buildDuel(),
        postClaim: null, // simulate concurrent writer beat us to it
      })
    );

    const res = await POST(
      makeRequest({ duelId: DUEL_ID, answers: buildAnswers(FIVE_IDS, 0) })
    );
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Concurrent submission");
  });

  it.each([["completed"], ["expired"], ["declined"]])(
    "returns 409 when duel.status is %s",
    async (status) => {
      mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
      const queries = installSupabaseResponder(
        serviceFrom,
        responder({ duel: buildDuel({ status }) })
      );

      const res = await POST(
        makeRequest({ duelId: DUEL_ID, answers: buildAnswers(FIVE_IDS, 0) })
      );
      expect(res.status).toBe(409);
      expect(findAllCalls(queries, "duel_matches", "update")).toHaveLength(0);
    }
  );

  // ═════════════════════════════════════════════════════════════
  // Status transitions — first vs second submitter
  // ═════════════════════════════════════════════════════════════

  it("first submitter: pass-1 update only, status='in_progress', no winner_id, xpEarned=0", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    const initial = buildDuel();
    const postClaim = postClaimWithBothSides(initial, "challenger", {
      score: 0,
      correct: 5,
      timeMs: 5000,
      answers: [],
    });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ duel: initial, postClaim })
    );

    const res = await POST(
      makeRequest({
        duelId: DUEL_ID,
        answers: buildAnswers(FIVE_IDS, 0, 1000),
      })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      xpEarned: number;
      winnerId: string | null;
      score: number;
      duel: { status: string };
    };
    expect(body.xpEarned).toBe(0);
    expect(body.winnerId).toBeNull();
    expect(body.score).toBe(5);
    expect(body.duel.status).toBe("in_progress");

    // Only Pass-1 update should have run; no Pass-2 (status=in_progress
    // guard) update because the other side hadn't submitted yet.
    const updates = findAllCalls(queries, "duel_matches", "update");
    expect(updates).toHaveLength(1);
    const pass1 = updates[0];
    expect(pass1.ops.some((op) => op.method === "is")).toBe(true);

    // No side-effects fired (no duel_stats / user_profiles writes).
    expect(findAllCalls(queries, "duel_stats", "update")).toHaveLength(0);
    expect(findAllCalls(queries, "duel_stats", "insert")).toHaveLength(0);
    expect(findAllCalls(queries, "user_profiles", "update")).toHaveLength(0);
  });

  it("second submitter: pass-2 completes duel, status='completed', winner_id set, XP credited", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    // Challenger completed first with 5 correct.
    const initial = buildDuel({
      status: "in_progress",
      challenger_correct: 5,
      challenger_score: 100,
      challenger_time_ms: 5000,
      challenger_answers: buildAnswers(FIVE_IDS, 0, 1000).map((a) => ({
        ...a,
        isCorrect: true,
      })),
      challenger_completed_at: "2026-04-21T12:00:00Z",
    });
    // Opponent submits with 3/5 correct → challenger wins.
    const opponentDerived = {
      score: 0,
      correct: 3,
      timeMs: 5000,
      answers: [],
    };
    const postClaim = postClaimWithBothSides(
      initial,
      "opponent",
      opponentDerived
    );
    const completed = completedDuel(postClaim, CHALLENGER, 50, 10);

    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 1 },
      })
    );

    // Opponent: 3 correct (q1-q3 selectedOption=0), 2 wrong.
    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 1, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    const res = await POST(
      makeRequest({ duelId: DUEL_ID, answers: opponentAnswers })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      xpEarned: number;
      winnerId: string | null;
      duel: { status: string };
    };
    expect(body.duel.status).toBe("completed");
    expect(body.winnerId).toBe(CHALLENGER);
    // Caller is opponent, lost → 10 XP.
    expect(body.xpEarned).toBe(10);

    // Both Pass-1 (is null) and Pass-2 (status=in_progress guard) updates ran.
    const updates = findAllCalls(queries, "duel_matches", "update");
    expect(updates).toHaveLength(2);
    expect(updates[0].ops.some((op) => op.method === "is")).toBe(true);
    expect(
      updates[1].ops.some(
        (op) =>
          op.method === "eq" &&
          op.args[0] === "status" &&
          op.args[1] === "in_progress"
      )
    ).toBe(true);
  });

  // ═════════════════════════════════════════════════════════════
  // Server-derived score / trust boundary
  // ═════════════════════════════════════════════════════════════

  it("derives isCorrect from server answer key — body's claimed isCorrect ignored", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    const initial = buildDuel();
    const postClaim = postClaimWithBothSides(initial, "challenger", {
      score: 0,
      correct: 0,
      timeMs: 5000,
      answers: [],
    });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        questions: buildQuestions(FIVE_IDS, 0), // option 0 is correct
      })
    );

    // All wrong: selectedOption=1 (option 0 is correct), but body
    // *claims* isCorrect=true on every answer. The route ignores
    // the body's isCorrect and re-derives from the question key.
    const cheaty = FIVE_IDS.map((id) => ({
      questionId: id,
      selectedOption: 1,
      timeMs: 1000,
      isCorrect: true, // bogus — ignored
    }));
    const res = await POST(
      makeRequest({ duelId: DUEL_ID, answers: cheaty })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { score: number };
    expect(body.score).toBe(0);

    // Pass-1 UPDATE payload also reflects derived correct=0.
    const updates = findAllCalls(queries, "duel_matches", "update");
    const pass1Op = updates[0].ops.find((op) => op.method === "update")!;
    const payload = pass1Op.args[0] as Record<string, unknown>;
    expect(payload.challenger_correct).toBe(0);
    expect(payload.challenger_score).toBe(0); // no XP either
    const writtenAnswers = payload.challenger_answers as DerivedAnswer[];
    for (const a of writtenAnswers) {
      expect(a.isCorrect).toBe(false);
    }
  });

  it("ignores all body fields outside {duelId, answers} — server-derived values overwrite bogus extras", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    const initial = buildDuel();
    const postClaim = postClaimWithBothSides(initial, "challenger", {
      score: 0,
      correct: 5,
      timeMs: 5000,
      answers: [],
    });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ duel: initial, postClaim })
    );

    const res = await POST(
      makeRequest({
        duelId: DUEL_ID,
        answers: buildAnswers(FIVE_IDS, 0, 1000),
        // Bogus extras — the route MUST ignore these.
        score: 999,
        correct: 999,
        winner_id: STRANGER,
        userId: STRANGER,
        user_id: STRANGER,
        xpEarned: 9999,
        challenger_score: 9999,
        opponent_score: 9999,
        status: "completed",
      })
    );
    expect(res.status).toBe(200);

    const updates = findAllCalls(queries, "duel_matches", "update");
    const pass1Payload = updates[0].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;

    // The payload's challenger_score is the server-derived XP sum,
    // NOT the bogus 9999 from the body.
    expect(pass1Payload.challenger_score).not.toBe(9999);
    expect(pass1Payload.challenger_correct).toBe(5);
    // Status was forced back to "in_progress" by the route, NOT
    // "completed" from the body.
    expect(pass1Payload.status).toBe("in_progress");

    // Pass-1 chain filtered by duel.id (from URL/body.duelId) — no
    // .eq("user_id", STRANGER) attack reaches the WHERE clause.
    const eqOps = updates[0].ops.filter((op) => op.method === "eq");
    expect(
      eqOps.some((op) => op.args[0] === "id" && op.args[1] === DUEL_ID)
    ).toBe(true);
    expect(
      eqOps.some((op) => op.args[1] === STRANGER)
    ).toBe(false);
  });

  it("clamps per-answer timeMs to MAX_PER_ANSWER_MS=60000", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    const initial = buildDuel();
    const postClaim = postClaimWithBothSides(initial, "challenger", {
      score: 0,
      correct: 0,
      timeMs: 0,
      answers: [],
    });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ duel: initial, postClaim })
    );

    const inflated = FIVE_IDS.map((id) => ({
      questionId: id,
      selectedOption: 0,
      timeMs: 999_999_999,
    }));
    const res = await POST(makeRequest({ duelId: DUEL_ID, answers: inflated }));
    expect(res.status).toBe(200);

    const updates = findAllCalls(queries, "duel_matches", "update");
    const pass1Payload = updates[0].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    // 5 × 60_000 = 300_000ms total.
    expect(pass1Payload.challenger_time_ms).toBe(300_000);
    const writtenAnswers = pass1Payload.challenger_answers as DerivedAnswer[];
    for (const a of writtenAnswers) {
      expect(a.timeMs).toBe(60_000);
    }
  });

  // ═════════════════════════════════════════════════════════════
  // XP and difficulty
  // ═════════════════════════════════════════════════════════════

  it("mixed difficulty falls back to medium baseXP for question XP", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: CHALLENGER } } });
    const initial = buildDuel({ difficulty: "mixed" });
    const postClaim = postClaimWithBothSides(initial, "challenger", {
      score: 0,
      correct: 5,
      timeMs: 5000,
      answers: [],
    });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ duel: initial, postClaim })
    );

    const res = await POST(
      makeRequest({
        duelId: DUEL_ID,
        answers: buildAnswers(FIVE_IDS, 0, 1000),
      })
    );
    expect(res.status).toBe(200);

    // baseXP[medium]=25; timeMs 1000 < 5000 → timeBonus 1.5;
    // streak 0..4 → multipliers 1.0,1.1,1.2,1.3,1.4
    // xp[i] = round(25 * (1 + i*0.1) * 1.5)
    //       = 38, 41, 45, 49, 53 → sum = 226
    const updates = findAllCalls(queries, "duel_matches", "update");
    const pass1Payload = updates[0].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(pass1Payload.challenger_score).toBe(226);
  });

  // ── Tier-multiplier matrix (winner XP, loser XP) ─────────────

  const setupTwoSubmitMatch = (
    callerId: string,
    callerCorrect: number,
    otherCorrect: number,
    overrides: Partial<DuelRow> = {}
  ) => {
    const isChallenger = callerId === CHALLENGER;
    const otherSide: "challenger" | "opponent" = isChallenger
      ? "opponent"
      : "challenger";

    // Build initial with the OTHER side already completed.
    const otherFields: Partial<DuelRow> = {
      [`${otherSide}_correct`]: otherCorrect,
      [`${otherSide}_score`]: 0,
      [`${otherSide}_time_ms`]: 5000,
      [`${otherSide}_answers`]: [],
      [`${otherSide}_completed_at`]: "2026-04-21T12:00:00Z",
    } as Partial<DuelRow>;
    const initial = buildDuel({
      status: "in_progress",
      ...otherFields,
      ...overrides,
    });

    // Post-claim: callers's slot also filled.
    const callerSide: "challenger" | "opponent" = isChallenger
      ? "challenger"
      : "opponent";
    const postClaim = postClaimWithBothSides(initial, callerSide, {
      score: 0,
      correct: callerCorrect,
      timeMs: 5000,
      answers: [],
    });
    return { initial, postClaim };
  };

  it("same-tier win: 50 XP / 10 XP", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    // Challenger 5 correct, opponent 3 → challenger wins, same tier.
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 3, 5);
    const completed = completedDuel(postClaim, CHALLENGER, 50, 10);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 2, [OPPONENT]: 2 },
      })
    );

    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 1, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    const res = await POST(
      makeRequest({ duelId: DUEL_ID, answers: opponentAnswers })
    );
    expect(res.status).toBe(200);

    const updates = findAllCalls(queries, "duel_matches", "update");
    const completionPayload = updates[1].ops.find(
      (op) => op.method === "update"
    )!.args[0] as Record<string, unknown>;
    expect(completionPayload.challenger_xp_earned).toBe(50);
    expect(completionPayload.opponent_xp_earned).toBe(10);
  });

  it("up-tier win: challenger (tier 1) beats opponent (tier 3) → 150 / 5", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 3, 5);
    const completed = completedDuel(postClaim, CHALLENGER, 150, 5);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        // Add prior duel_stats so giant-kill update runs (tier diff=2).
        duelStatsByUser: {
          [CHALLENGER]: {
            total_duels: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            win_streak: 0,
            best_win_streak: 0,
            duel_xp_total: 0,
            giant_kills: 0,
          },
          [OPPONENT]: null,
        },
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 3 },
      })
    );

    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 1, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const updates = findAllCalls(queries, "duel_matches", "update");
    const payload = updates[1].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    // winner (up-tier diff=+2): 50 * 3.0 = 150
    expect(payload.challenger_xp_earned).toBe(150);
    // loser (down-tier diff=-2): 10 * 0.5 = 5
    expect(payload.opponent_xp_earned).toBe(5);
  });

  it("down-tier win: challenger (tier 3) beats opponent (tier 1) → 25 / 30", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 3, 5);
    const completed = completedDuel(postClaim, CHALLENGER, 25, 30);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 3, [OPPONENT]: 1 },
      })
    );

    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 1, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const updates = findAllCalls(queries, "duel_matches", "update");
    const payload = updates[1].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    // winner (down-tier diff=-2): 50 * 0.5 = 25
    expect(payload.challenger_xp_earned).toBe(25);
    // loser (up-tier diff=+2): 10 * 3.0 = 30
    expect(payload.opponent_xp_earned).toBe(30);
  });

  it("draw with tier diff: each side applies its own multiplier on DRAW base 20 → 60 / 10", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    // Both sides identical 5-correct fixture so winner=null (no
    // streak/time tiebreaker advantage).
    const sharedAnswers: DerivedAnswer[] = FIVE_IDS.map((id) => ({
      questionId: id,
      selectedOption: 0,
      isCorrect: true,
      timeMs: 1000,
    }));
    const initial = buildDuel({
      status: "in_progress",
      challenger_correct: 5,
      challenger_score: 0,
      challenger_time_ms: 5000,
      challenger_answers: sharedAnswers,
      challenger_completed_at: "2026-04-21T12:00:00Z",
    });
    const postClaim = postClaimWithBothSides(initial, "opponent", {
      score: 0,
      correct: 5,
      timeMs: 5000,
      answers: sharedAnswers,
    });
    const completed = completedDuel(postClaim, null, 60, 10);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 3 },
      })
    );

    const opponentAnswers = buildAnswers(FIVE_IDS, 0, 1000);
    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const updates = findAllCalls(queries, "duel_matches", "update");
    const payload = updates[1].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(payload.winner_id).toBeNull();
    // challenger (tier 1, opp tier 3 → diff +2): 20 * 3.0 = 60
    expect(payload.challenger_xp_earned).toBe(60);
    // opponent (tier 3, opp tier 1 → diff -2): 20 * 0.5 = 10
    expect(payload.opponent_xp_earned).toBe(10);
  });

  // ═════════════════════════════════════════════════════════════
  // Diminishing returns
  // ═════════════════════════════════════════════════════════════

  it("diminishing returns below threshold (count=2, max=3): full XP", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 3, 5);
    const completed = completedDuel(postClaim, CHALLENGER, 50, 10);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 1 },
        weeklyDuelCount: 2,
      })
    );

    await POST(
      makeRequest({
        duelId: DUEL_ID,
        answers: [
          { questionId: "q1", selectedOption: 0, timeMs: 1000 },
          { questionId: "q2", selectedOption: 0, timeMs: 1000 },
          { questionId: "q3", selectedOption: 0, timeMs: 1000 },
          { questionId: "q4", selectedOption: 1, timeMs: 1000 },
          { questionId: "q5", selectedOption: 1, timeMs: 1000 },
        ],
      })
    );

    const updates = findAllCalls(queries, "duel_matches", "update");
    const payload = updates[1].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(payload.challenger_xp_earned).toBe(50);
    expect(payload.opponent_xp_earned).toBe(10);

    // Confirm the count query was issued and used the bidirectional OR.
    const countQuery = queries.find(
      (q) =>
        q.table === "duel_matches" &&
        q.ops.some((op) => op.method === "or")
    );
    expect(countQuery).toBeDefined();
    const orArg = countQuery!.ops.find((op) => op.method === "or")!
      .args[0] as string;
    expect(orArg).toContain(`challenger_id.eq.${CHALLENGER}`);
    expect(orArg).toContain(`challenger_id.eq.${OPPONENT}`);
  });

  it("diminishing returns at threshold (count=3, max=3): 25% XP factor", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 3, 5);
    const completed = completedDuel(postClaim, CHALLENGER, 13, 3);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 1 },
        weeklyDuelCount: 3,
      })
    );

    await POST(
      makeRequest({
        duelId: DUEL_ID,
        answers: [
          { questionId: "q1", selectedOption: 0, timeMs: 1000 },
          { questionId: "q2", selectedOption: 0, timeMs: 1000 },
          { questionId: "q3", selectedOption: 0, timeMs: 1000 },
          { questionId: "q4", selectedOption: 1, timeMs: 1000 },
          { questionId: "q5", selectedOption: 1, timeMs: 1000 },
        ],
      })
    );

    const updates = findAllCalls(queries, "duel_matches", "update");
    const payload = updates[1].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    // 50 * 1.0 * 0.25 = 12.5 → 13
    expect(payload.challenger_xp_earned).toBe(13);
    // 10 * 1.0 * 0.25 = 2.5 → 3
    expect(payload.opponent_xp_earned).toBe(3);
  });

  // ═════════════════════════════════════════════════════════════
  // Winner determination (migrated from src/lib/duels.test.ts)
  // ═════════════════════════════════════════════════════════════

  it("winner determined by highest correct count", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    const initial = buildDuel({
      status: "in_progress",
      challenger_correct: 3,
      challenger_score: 0,
      challenger_time_ms: 5000,
      challenger_answers: [
        { questionId: "q1", selectedOption: 0, isCorrect: true, timeMs: 1000 },
        { questionId: "q2", selectedOption: 0, isCorrect: true, timeMs: 1000 },
        { questionId: "q3", selectedOption: 0, isCorrect: true, timeMs: 1000 },
        { questionId: "q4", selectedOption: 1, isCorrect: false, timeMs: 1000 },
        { questionId: "q5", selectedOption: 1, isCorrect: false, timeMs: 1000 },
      ],
      challenger_completed_at: "2026-04-21T12:00:00Z",
    });
    // Opponent gets 4 correct → opponent wins.
    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 0, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    const postClaim = postClaimWithBothSides(initial, "opponent", {
      score: 0,
      correct: 4,
      timeMs: 5000,
      answers: opponentAnswers.map((a, i) => ({
        ...a,
        isCorrect: i < 4,
      })),
    });
    const completed = completedDuel(postClaim, OPPONENT, 10, 50);

    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 1 },
      })
    );

    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const updates = findAllCalls(queries, "duel_matches", "update");
    const payload = updates[1].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(payload.winner_id).toBe(OPPONENT);
    expect(payload.status).toBe("completed");
  });

  it("ties on correct count → faster total time wins", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    // Challenger: 4 correct, time=8000ms.
    const initial = buildDuel({
      status: "in_progress",
      challenger_correct: 4,
      challenger_score: 0,
      challenger_time_ms: 8000,
      challenger_answers: [
        { questionId: "q1", selectedOption: 0, isCorrect: true, timeMs: 2000 },
        { questionId: "q2", selectedOption: 0, isCorrect: true, timeMs: 2000 },
        { questionId: "q3", selectedOption: 0, isCorrect: true, timeMs: 2000 },
        { questionId: "q4", selectedOption: 0, isCorrect: true, timeMs: 2000 },
        { questionId: "q5", selectedOption: 1, isCorrect: false, timeMs: 0 },
      ],
      challenger_completed_at: "2026-04-21T12:00:00Z",
    });
    // Opponent: 4 correct, time=4000ms (faster).
    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 0, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 0 },
    ];
    const postClaim = postClaimWithBothSides(initial, "opponent", {
      score: 0,
      correct: 4,
      timeMs: 4000,
      answers: opponentAnswers.map((a, i) => ({ ...a, isCorrect: i < 4 })),
    });
    const completed = completedDuel(postClaim, OPPONENT, 10, 50);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 1 },
      })
    );

    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const updates = findAllCalls(queries, "duel_matches", "update");
    const payload = updates[1].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(payload.winner_id).toBe(OPPONENT); // faster
  });

  it("ties on correct + time → longest streak wins", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    // Challenger: 4 correct, streak peak=2 (T,T,F,T,T pattern).
    const initial = buildDuel({
      status: "in_progress",
      challenger_correct: 4,
      challenger_score: 0,
      challenger_time_ms: 5000,
      challenger_answers: [
        { questionId: "q1", selectedOption: 0, isCorrect: true, timeMs: 1000 },
        { questionId: "q2", selectedOption: 0, isCorrect: true, timeMs: 1000 },
        { questionId: "q3", selectedOption: 1, isCorrect: false, timeMs: 1000 },
        { questionId: "q4", selectedOption: 0, isCorrect: true, timeMs: 1000 },
        { questionId: "q5", selectedOption: 0, isCorrect: true, timeMs: 1000 },
      ],
      challenger_completed_at: "2026-04-21T12:00:00Z",
    });
    // Opponent: 4 correct, same time, streak peak=4 (T,T,T,T,F).
    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 0, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    const postClaim = postClaimWithBothSides(initial, "opponent", {
      score: 0,
      correct: 4,
      timeMs: 5000,
      answers: opponentAnswers.map((a, i) => ({ ...a, isCorrect: i < 4 })),
    });
    const completed = completedDuel(postClaim, OPPONENT, 10, 50);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 1 },
      })
    );

    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const updates = findAllCalls(queries, "duel_matches", "update");
    const payload = updates[1].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(payload.winner_id).toBe(OPPONENT); // longer streak (4 > 2)
  });

  it("all equal → draw (winner_id=null)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    // Identical: 3 correct, same time, same streak pattern.
    const sharedAnswers: DerivedAnswer[] = [
      { questionId: "q1", selectedOption: 0, isCorrect: true, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, isCorrect: true, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, isCorrect: true, timeMs: 1000 },
      { questionId: "q4", selectedOption: 1, isCorrect: false, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, isCorrect: false, timeMs: 1000 },
    ];
    const initial = buildDuel({
      status: "in_progress",
      challenger_correct: 3,
      challenger_score: 0,
      challenger_time_ms: 5000,
      challenger_answers: sharedAnswers,
      challenger_completed_at: "2026-04-21T12:00:00Z",
    });
    const opponentAnswers = sharedAnswers.map((a) => ({
      questionId: a.questionId,
      selectedOption: a.selectedOption,
      timeMs: a.timeMs,
    }));
    const postClaim = postClaimWithBothSides(initial, "opponent", {
      score: 0,
      correct: 3,
      timeMs: 5000,
      answers: sharedAnswers,
    });
    const completed = completedDuel(postClaim, null, 20, 20);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 1 },
      })
    );

    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const updates = findAllCalls(queries, "duel_matches", "update");
    const payload = updates[1].ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(payload.winner_id).toBeNull();
    expect(payload.status).toBe("completed");
  });

  // ═════════════════════════════════════════════════════════════
  // Giant kill (migrated from src/lib/duels-xp.test.ts)
  // ═════════════════════════════════════════════════════════════

  it("giant kill: tier diff = 2 → winner's giant_kills incremented", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    // Challenger (tier 1) beats opponent (tier 3) — 2-tier diff.
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 3, 5);
    const completed = completedDuel(postClaim, CHALLENGER, 150, 5);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 3 },
        duelStatsByUser: {
          [CHALLENGER]: {
            total_duels: 2,
            wins: 1,
            losses: 1,
            draws: 0,
            win_streak: 0,
            best_win_streak: 1,
            duel_xp_total: 100,
            giant_kills: 5,
          },
          [OPPONENT]: {
            total_duels: 2,
            wins: 0,
            losses: 2,
            draws: 0,
            win_streak: 0,
            best_win_streak: 0,
            duel_xp_total: 20,
            giant_kills: 0,
          },
        },
      })
    );

    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 1, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    // The last duel_stats UPDATE should be the giant_kills increment.
    const duelStatsUpdates = findAllCalls(queries, "duel_stats", "update");
    const gkUpdate = duelStatsUpdates[duelStatsUpdates.length - 1];
    const payload = gkUpdate.ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(payload.giant_kills).toBe(6); // 5 + 1
    // Filtered to the winner.
    expect(
      gkUpdate.ops.some(
        (op) => op.method === "eq" && op.args[1] === CHALLENGER
      )
    ).toBe(true);
  });

  it("giant kill: tier diff = 1 → no giant_kills update", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 3, 5);
    const completed = completedDuel(postClaim, CHALLENGER, 100, 8);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 2, [OPPONENT]: 3 },
        duelStatsByUser: { [CHALLENGER]: null, [OPPONENT]: null },
      })
    );

    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 1, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    // No duel_stats UPDATE should carry a giant_kills field.
    const duelStatsUpdates = findAllCalls(queries, "duel_stats", "update");
    for (const u of duelStatsUpdates) {
      const payload = u.ops.find((op) => op.method === "update")!
        .args[0] as Record<string, unknown>;
      expect(payload).not.toHaveProperty("giant_kills");
    }
  });

  it("giant kill: draw with 2-tier diff → no giant_kills update", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 5, 5);
    const completed = completedDuel(postClaim, null, 60, 10);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 3 },
        duelStatsByUser: { [CHALLENGER]: null, [OPPONENT]: null },
      })
    );

    const opponentAnswers = buildAnswers(FIVE_IDS, 0, 1000);
    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const duelStatsUpdates = findAllCalls(queries, "duel_stats", "update");
    for (const u of duelStatsUpdates) {
      const payload = u.ops.find((op) => op.method === "update")!
        .args[0] as Record<string, unknown>;
      expect(payload).not.toHaveProperty("giant_kills");
    }
  });

  // ═════════════════════════════════════════════════════════════
  // Side-effect verification
  // ═════════════════════════════════════════════════════════════

  it("duel_stats: both players' wins/losses/win_streak updated on completion", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 3, 5);
    const completed = completedDuel(postClaim, CHALLENGER, 50, 10);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 1 },
        duelStatsByUser: {
          [CHALLENGER]: {
            total_duels: 4,
            wins: 2,
            losses: 2,
            draws: 0,
            win_streak: 0,
            best_win_streak: 2,
            duel_xp_total: 200,
            giant_kills: 0,
          },
          [OPPONENT]: {
            total_duels: 3,
            wins: 1,
            losses: 2,
            draws: 0,
            win_streak: 0,
            best_win_streak: 1,
            duel_xp_total: 80,
            giant_kills: 0,
          },
        },
      })
    );

    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 1, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const duelStatsUpdates = findAllCalls(queries, "duel_stats", "update");
    expect(duelStatsUpdates).toHaveLength(2);

    // Find each player's update by the .eq("user_id", X) filter.
    const challengerUpdate = duelStatsUpdates.find((u) =>
      u.ops.some(
        (op) => op.method === "eq" && op.args[1] === CHALLENGER
      )
    );
    const opponentUpdate = duelStatsUpdates.find((u) =>
      u.ops.some(
        (op) => op.method === "eq" && op.args[1] === OPPONENT
      )
    );
    expect(challengerUpdate).toBeDefined();
    expect(opponentUpdate).toBeDefined();

    const cPayload = challengerUpdate!.ops.find(
      (op) => op.method === "update"
    )!.args[0] as Record<string, unknown>;
    expect(cPayload.total_duels).toBe(5);
    expect(cPayload.wins).toBe(3);
    expect(cPayload.losses).toBe(2);
    expect(cPayload.win_streak).toBe(1);
    expect(cPayload.best_win_streak).toBe(2);
    expect(cPayload.duel_xp_total).toBe(250);

    const oPayload = opponentUpdate!.ops.find(
      (op) => op.method === "update"
    )!.args[0] as Record<string, unknown>;
    expect(oPayload.total_duels).toBe(4);
    expect(oPayload.wins).toBe(1);
    expect(oPayload.losses).toBe(3);
    expect(oPayload.win_streak).toBe(0);
    expect(oPayload.duel_xp_total).toBe(90);
  });

  it("user_profiles: total_xp + rank updated for both players via service-role client", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OPPONENT } } });
    const { initial, postClaim } = setupTwoSubmitMatch(OPPONENT, 3, 5);
    const completed = completedDuel(postClaim, CHALLENGER, 50, 10);
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        duel: initial,
        postClaim,
        completed,
        tiersByUser: { [CHALLENGER]: 1, [OPPONENT]: 1 },
        userXpByUser: {
          [CHALLENGER]: 450,    // 450 + 50 = 500 → Chunin
          [OPPONENT]: 9990,     // 9990 + 10 = 10000 → Kage
        },
      })
    );

    const opponentAnswers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 0, timeMs: 1000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1000 },
      { questionId: "q4", selectedOption: 1, timeMs: 1000 },
      { questionId: "q5", selectedOption: 1, timeMs: 1000 },
    ];
    await POST(makeRequest({ duelId: DUEL_ID, answers: opponentAnswers }));

    const updates = findAllCalls(queries, "user_profiles", "update");
    expect(updates).toHaveLength(2);

    const cUpdate = updates.find((u) =>
      u.ops.some((op) => op.method === "eq" && op.args[1] === CHALLENGER)
    );
    const oUpdate = updates.find((u) =>
      u.ops.some((op) => op.method === "eq" && op.args[1] === OPPONENT)
    );
    expect(cUpdate).toBeDefined();
    expect(oUpdate).toBeDefined();

    const cPayload = cUpdate!.ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(cPayload.total_xp).toBe(500);
    expect(cPayload.rank).toBe("Chunin");
    expect(typeof cPayload.last_played_at).toBe("string");

    const oPayload = oUpdate!.ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(oPayload.total_xp).toBe(10_000);
    expect(oPayload.rank).toBe("Kage");

    // Confirm the diminishing-returns query targets the bidirectional
    // pair (regression guard for the OR clause).
    const countQuery = findCall(queries, "duel_matches", "or");
    expect(countQuery).toBeDefined();
  });
});
