import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Tests for POST /api/quiz/submit (Session 4H, quiz-bug-N fix).
// All Supabase access is mocked — no real network / DB.
//
// The route uses two clients:
//   - createClient (SSR) for auth.getUser AND rpc("submit_quiz")
//   - createServiceClient for table reads + writes
// We mock both. @/lib/scoring (calculateQuestionXP) and
// @/lib/ranks (deriveRankFromXp) are NOT mocked — those are
// pure helpers and the tests exercise the real logic.
// ═══════════════════════════════════════════════════════════════

const mockGetUser = vi.fn();
const mockSubmitQuizRpc = vi.fn();
const serviceFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: () => mockGetUser() },
    rpc: (name: string) => {
      if (name === "submit_quiz") return mockSubmitQuizRpc();
      throw new Error(`Unexpected RPC: ${name}`);
    },
  })),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

import { POST } from "./route";
import {
  installSupabaseResponder,
  findAllCalls,
  type Responder,
  type Query,
} from "@/test/supabase-mock";

// ── Fixtures ─────────────────────────────────────────────────

const USER_A = "user-a-uuid";
const USER_STRANGER = "user-stranger-uuid";
const ANIME_ID = "anime-1";
const SESSION_ID = "session-1";
const PREVIOUS_XP = 100;

const buildQuestions = (
  ids: string[],
  correctIndex = 0,
  difficulty = "easy",
  animeId = ANIME_ID
) =>
  ids.map((id) => ({
    id,
    options: [
      { isCorrect: correctIndex === 0 },
      { isCorrect: correctIndex === 1 },
      { isCorrect: correctIndex === 2 },
      { isCorrect: correctIndex === 3 },
    ],
    difficulty,
    anime_id: animeId,
  }));

const buildAnswers = (
  ids: string[],
  selectedOption: number,
  timeMs = 1000
) =>
  ids.map((id) => ({ questionId: id, selectedOption, timeMs }));

const tenIds = () => Array.from({ length: 10 }, (_, i) => `q-${i + 1}`);

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/quiz/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// Per-table responder. Discriminates user_profiles SELECT vs
// UPDATE by inspecting the captured op chain.
interface ResponderOpts {
  questions?: ReturnType<typeof buildQuestions>;
  previousXp?: number;
  sessionId?: string;
}

const responder = (opts: ResponderOpts = {}): Responder => (q) => {
  if (q.table === "questions") {
    return { data: opts.questions ?? [] };
  }
  if (q.table === "quiz_sessions") {
    return { data: { id: opts.sessionId ?? SESSION_ID } };
  }
  if (q.table === "user_answers") {
    return { data: null };
  }
  if (q.table === "user_profiles") {
    const isUpdate = q.ops.some((op) => op.method === "update");
    if (isUpdate) return { data: null };
    return { data: { total_xp: opts.previousXp ?? PREVIOUS_XP } };
  }
  return { data: null };
};

// Helper: pull the captured insert payload for a single-table
// insert chain. Asserts there's exactly one such call.
const findInsertPayload = (
  queries: Query[],
  table: string
): Record<string, unknown> => {
  const calls = findAllCalls(queries, table, "insert");
  expect(calls).toHaveLength(1);
  const op = calls[0].ops.find((o) => o.method === "insert");
  expect(op).toBeDefined();
  return op!.args[0] as Record<string, unknown>;
};

const findUpdatePayload = (
  queries: Query[],
  table: string
): Record<string, unknown> => {
  const calls = findAllCalls(queries, table, "update");
  expect(calls).toHaveLength(1);
  const op = calls[0].ops.find((o) => o.method === "update");
  expect(op).toBeDefined();
  return op!.args[0] as Record<string, unknown>;
};

const okGate = () => ({
  data: { success: true, tier: "free", limit: 10, count: 1 },
  error: null,
});

describe("POST /api/quiz/submit", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    mockGetUser.mockReset();
    mockSubmitQuizRpc.mockReset();
  });

  // ── 1. Unauthenticated ───────────────────────────────────────

  it("returns 401 when no auth user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const queries = installSupabaseResponder(serviceFrom, responder());

    const ids = tenIds();
    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: buildAnswers(ids, 0),
      })
    );
    expect(res.status).toBe(401);
    expect(mockSubmitQuizRpc).not.toHaveBeenCalled();
    expect(findAllCalls(queries, "quiz_sessions", "insert")).toHaveLength(0);
    expect(findAllCalls(queries, "user_answers", "insert")).toHaveLength(0);
  });

  // ── 2. Invalid body shapes ───────────────────────────────────

  describe("body validation", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    });

    it.each([
      [
        "empty animeId",
        { animeId: "", difficulty: "easy", answers: [{ questionId: "q1", selectedOption: 0, timeMs: 0 }] },
      ],
      [
        "missing answers",
        { animeId: ANIME_ID, difficulty: "easy" },
      ],
      [
        "empty answers array",
        { animeId: ANIME_ID, difficulty: "easy", answers: [] },
      ],
      [
        "more than 10 answers",
        {
          animeId: ANIME_ID,
          difficulty: "easy",
          answers: Array.from({ length: 11 }, (_, i) => ({
            questionId: `q-${i}`,
            selectedOption: 0,
            timeMs: 1000,
          })),
        },
      ],
      [
        "difficulty not allowed",
        {
          animeId: ANIME_ID,
          difficulty: "extreme",
          answers: [{ questionId: "q1", selectedOption: 0, timeMs: 0 }],
        },
      ],
      [
        "non-integer selectedOption",
        {
          animeId: ANIME_ID,
          difficulty: "easy",
          answers: [{ questionId: "q1", selectedOption: 1.5, timeMs: 0 }],
        },
      ],
      [
        "non-finite timeMs",
        {
          animeId: ANIME_ID,
          difficulty: "easy",
          answers: [
            { questionId: "q1", selectedOption: 0, timeMs: Number.NaN },
          ],
        },
      ],
    ])("returns 400 when %s", async (_label, body) => {
      const queries = installSupabaseResponder(serviceFrom, responder());

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
      // Validation runs BEFORE the rate-limit RPC and BEFORE
      // any DB access.
      expect(mockSubmitQuizRpc).not.toHaveBeenCalled();
      expect(findAllCalls(queries, "quiz_sessions", "insert")).toHaveLength(0);
    });
  });

  // ── 3. Rate-limit RPC error ──────────────────────────────────

  it("returns 502 when submit_quiz RPC errors out", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });
    const queries = installSupabaseResponder(serviceFrom, responder());

    const ids = tenIds();
    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: buildAnswers(ids, 0),
      })
    );
    expect(res.status).toBe(502);
    expect(findAllCalls(queries, "quiz_sessions", "insert")).toHaveLength(0);
    expect(findAllCalls(queries, "user_answers", "insert")).toHaveLength(0);
    expect(findAllCalls(queries, "user_profiles", "update")).toHaveLength(0);
  });

  // ── 4. Rate-limited ──────────────────────────────────────────

  it("returns 429 when submit_quiz returns success:false", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue({
      data: { success: false, error_code: "rate_limited", limit: 10, count: 10 },
      error: null,
    });
    const queries = installSupabaseResponder(serviceFrom, responder());

    const ids = tenIds();
    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: buildAnswers(ids, 0),
      })
    );
    expect(res.status).toBe(429);
    const json = (await res.json()) as { error_code?: string };
    expect(json.error_code).toBe("rate_limited");
    expect(findAllCalls(queries, "quiz_sessions", "insert")).toHaveLength(0);
    expect(findAllCalls(queries, "user_answers", "insert")).toHaveLength(0);
    expect(findAllCalls(queries, "user_profiles", "update")).toHaveLength(0);
  });

  // ── 5. Unknown questionId ────────────────────────────────────

  it("returns 400 when service returns fewer rows than submitted ids", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue(okGate());
    const ids = tenIds();
    // Service returns only 9 of the 10 requested ids → unknown id.
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids.slice(0, 9), 0, "easy") })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: buildAnswers(ids, 0),
      })
    );
    expect(res.status).toBe(400);
    expect(findAllCalls(queries, "quiz_sessions", "insert")).toHaveLength(0);
  });

  // ── 6. Cross-anime salt ──────────────────────────────────────

  it("returns 400 when one returned question has anime_id mismatch", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue(okGate());
    const ids = tenIds();
    const tainted = buildQuestions(ids, 0, "easy");
    tainted[3].anime_id = "different-anime";
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: tainted })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: buildAnswers(ids, 0),
      })
    );
    expect(res.status).toBe(400);
    expect(findAllCalls(queries, "quiz_sessions", "insert")).toHaveLength(0);
  });

  // ── 7. Cross-difficulty salt ─────────────────────────────────

  it("returns 400 when one returned question has difficulty mismatch", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue(okGate());
    const ids = tenIds();
    const tainted = buildQuestions(ids, 0, "easy");
    tainted[5].difficulty = "hard";
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: tainted })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: buildAnswers(ids, 0),
      })
    );
    expect(res.status).toBe(400);
    expect(findAllCalls(queries, "quiz_sessions", "insert")).toHaveLength(0);
  });

  // ── 8. Happy path — all correct ──────────────────────────────

  it("happy path all-correct: derives score=10, server XP, clamped time, full insert/update payloads", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue(okGate());
    const ids = tenIds();
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    const start = Date.now();
    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: buildAnswers(ids, 0, 1000),
      })
    );
    expect(res.status).toBe(200);

    // BASE_XP[easy]=10; streakMultiplier=1+i*0.1 for i=0..9;
    // timeBonus=1.5 (timeMs 1000 < 5000 threshold).
    // xp[i] = round(10 * (1 + i*0.1) * 1.5)
    // = 15, 17, 18, 20, 21, 23, 24, 26, 27, 29 → sum = 220
    const EXPECTED_XP = 220;
    const totalTimeMs = 10 * 1000;
    const EXPECTED_TIME_S = Math.round(totalTimeMs / 1000); // 10

    const sessionInsert = findInsertPayload(queries, "quiz_sessions");
    expect(sessionInsert).toMatchObject({
      user_id: USER_A,
      anime_id: ANIME_ID,
      difficulty: "easy",
      score: 10,
      total_questions: 10,
      correct_answers: 10,
      time_taken_seconds: EXPECTED_TIME_S,
      xp_earned: EXPECTED_XP,
    });

    const answerInsertCalls = findAllCalls(queries, "user_answers", "insert");
    expect(answerInsertCalls).toHaveLength(1);
    const answerOp = answerInsertCalls[0].ops.find(
      (op) => op.method === "insert"
    );
    const answerRows = answerOp!.args[0] as Array<Record<string, unknown>>;
    expect(answerRows).toHaveLength(10);
    for (const row of answerRows) {
      expect(row.session_id).toBe(SESSION_ID);
      expect(row.is_correct).toBe(true);
      expect(row.time_taken_ms).toBe(1000);
      expect(row.selected_option).toBe(0);
    }

    const profileUpdate = findUpdatePayload(queries, "user_profiles");
    expect(profileUpdate.total_xp).toBe(PREVIOUS_XP + EXPECTED_XP);
    expect(profileUpdate.rank).toBe("Genin"); // 100+220 = 320 < 500
    expect(typeof profileUpdate.last_played_at).toBe("string");
    const lastPlayedTime = Date.parse(profileUpdate.last_played_at as string);
    expect(lastPlayedTime).toBeGreaterThanOrEqual(start);
    expect(lastPlayedTime).toBeLessThanOrEqual(Date.now() + 1_000);

    const json = (await res.json()) as {
      sessionId: string;
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      xpEarned: number;
      timeTakenSeconds: number;
    };
    expect(json).toEqual({
      sessionId: SESSION_ID,
      score: 10,
      correctAnswers: 10,
      totalQuestions: 10,
      xpEarned: EXPECTED_XP,
      timeTakenSeconds: EXPECTED_TIME_S,
    });
  });

  // ── 9. Happy path — partial + timeout ────────────────────────

  it("happy path partial: per-answer is_correct, timeout stored as null, score counts correct only", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue(okGate());
    const ids = ["q1", "q2", "q3", "q4", "q5"];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    // q1 correct (option 0), q2 wrong (option 1), q3 correct,
    // q4 timeout (selectedOption -1), q5 correct.
    const answers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 1, timeMs: 2000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1500 },
      { questionId: "q4", selectedOption: -1, timeMs: 30_000 },
      { questionId: "q5", selectedOption: 0, timeMs: 800 },
    ];
    const res = await POST(
      makeRequest({ animeId: ANIME_ID, difficulty: "easy", answers })
    );
    expect(res.status).toBe(200);

    const sessionInsert = findInsertPayload(queries, "quiz_sessions");
    expect(sessionInsert.score).toBe(3);
    expect(sessionInsert.correct_answers).toBe(3);
    expect(sessionInsert.total_questions).toBe(5);

    const answerOp = findAllCalls(queries, "user_answers", "insert")[0].ops.find(
      (op) => op.method === "insert"
    );
    const rows = answerOp!.args[0] as Array<Record<string, unknown>>;
    expect(rows.map((r) => r.is_correct)).toEqual([
      true,
      false,
      true,
      false,
      true,
    ]);
    expect(rows[3].selected_option).toBeNull();
    expect(rows[3].time_taken_ms).toBe(30_000);
    expect(rows[3].is_correct).toBe(false);

    // xp_earned matches sum of correct-answer XP (real
    // calculateQuestionXP, no mock). q1 streak=0, q3 streak=1
    // (q2 wrong reset streak), q5 streak=2 (q4 timeout reset).
    // q1: round(10 * 1.0 * 1.5) = 15 (timeMs 1000 < 5000)
    // q3: round(10 * 1.0 * 1.5) = 15 (streak reset by q2;
    //     timeMs 1500 < 5000)
    // q5: round(10 * 1.0 * 1.5) = 15 (streak reset by q4;
    //     timeMs 800 < 5000)
    // Total = 45.
    expect(sessionInsert.xp_earned).toBe(45);

    const json = (await res.json()) as { score: number; xpEarned: number };
    expect(json.score).toBe(3);
    expect(json.xpEarned).toBe(45);
  });

  // ── 10. Time clamping ────────────────────────────────────────

  it("clamps per-answer timeMs to MAX_PER_ANSWER_MS=60000", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue(okGate());
    const ids = ["q1"];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: [
          { questionId: "q1", selectedOption: 0, timeMs: 999_999_999 },
        ],
      })
    );
    expect(res.status).toBe(200);

    const answerOp = findAllCalls(queries, "user_answers", "insert")[0].ops.find(
      (op) => op.method === "insert"
    );
    const rows = answerOp!.args[0] as Array<Record<string, unknown>>;
    expect(rows[0].time_taken_ms).toBe(60_000);

    const sessionInsert = findInsertPayload(queries, "quiz_sessions");
    // 60_000 ms ÷ 1000 = 60 s.
    expect(sessionInsert.time_taken_seconds).toBe(60);
    // timeBonus is 1.0 because clamped 60000 >= 5000 threshold.
    // streak=0 → multiplier=1.0. xp = round(10 * 1.0 * 1.0) = 10.
    expect(sessionInsert.xp_earned).toBe(10);
  });

  // ── 11. Streak reset semantics ───────────────────────────────

  it("streak resets after a wrong answer — XP for next correct uses streak=0, not running count", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue(okGate());
    const ids = ["q1", "q2", "q3", "q4", "q5"];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    // 3 correct, 1 wrong, 1 correct. All fast (timeBonus=1.5).
    // Without streak reset: q5 would have streak=3 → xp=20.
    // With streak reset:    q5 has   streak=0 → xp=15.
    const answers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 }, // correct, streak 0 → 15
      { questionId: "q2", selectedOption: 0, timeMs: 1000 }, // correct, streak 1 → 17
      { questionId: "q3", selectedOption: 0, timeMs: 1000 }, // correct, streak 2 → 18
      { questionId: "q4", selectedOption: 1, timeMs: 1000 }, // wrong, streak resets
      { questionId: "q5", selectedOption: 0, timeMs: 1000 }, // correct, streak 0 → 15
    ];
    const res = await POST(
      makeRequest({ animeId: ANIME_ID, difficulty: "easy", answers })
    );
    expect(res.status).toBe(200);

    const sessionInsert = findInsertPayload(queries, "quiz_sessions");
    // 15 + 17 + 18 + 0 + 15 = 65.
    // If streak DIDN'T reset, q5 xp would be 20 (mult 1.3) and
    // total would be 70 — that's the regression this test
    // catches.
    expect(sessionInsert.xp_earned).toBe(65);
    expect(sessionInsert.score).toBe(4);
  });

  // ── 12. Trust boundary ───────────────────────────────────────

  it("ignores all body fields outside {animeId, difficulty, answers} — server-derived values overwrite bogus extras", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue(okGate());
    const ids = tenIds();
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: buildAnswers(ids, 0, 1000),
        // Bogus extras — the route MUST ignore these.
        score: 999,
        total_questions: 999,
        correct_answers: 999,
        xp_earned: 9999,
        time_taken_seconds: 1,
        time_taken: 1,
        isDuel: true,
        userId: USER_STRANGER,
        user_id: USER_STRANGER,
        difficulty_override: "impossible",
      })
    );
    expect(res.status).toBe(200);

    const EXPECTED_XP = 220;
    const sessionInsert = findInsertPayload(queries, "quiz_sessions");
    // user_id is the auth user, NOT the stranger from the body.
    expect(sessionInsert.user_id).toBe(USER_A);
    expect(sessionInsert.user_id).not.toBe(USER_STRANGER);
    // score/total/correct/xp/time come from the derivation, not
    // from the bogus body extras.
    expect(sessionInsert.score).toBe(10);
    expect(sessionInsert.total_questions).toBe(10);
    expect(sessionInsert.correct_answers).toBe(10);
    expect(sessionInsert.xp_earned).toBe(EXPECTED_XP);
    expect(sessionInsert.time_taken_seconds).toBe(10);

    const json = (await res.json()) as {
      score: number;
      xpEarned: number;
      totalQuestions: number;
      timeTakenSeconds: number;
    };
    expect(json.score).toBe(10);
    expect(json.xpEarned).toBe(EXPECTED_XP);
    expect(json.totalQuestions).toBe(10);
    expect(json.timeTakenSeconds).toBe(10);
  });

  // ── 13. user_profiles UPDATE regression guard ────────────────

  it("user_profiles UPDATE captures expected payload shape and filters by auth user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockSubmitQuizRpc.mockResolvedValue(okGate());
    const ids = tenIds();
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        difficulty: "easy",
        answers: buildAnswers(ids, 0, 1000),
      })
    );
    expect(res.status).toBe(200);

    const updateCalls = findAllCalls(queries, "user_profiles", "update");
    expect(updateCalls).toHaveLength(1);
    const updateOp = updateCalls[0].ops.find((op) => op.method === "update");
    const eqOp = updateCalls[0].ops.find((op) => op.method === "eq");
    expect(updateOp).toBeDefined();
    expect(eqOp).toBeDefined();

    const payload = updateOp!.args[0] as Record<string, unknown>;
    expect(typeof payload.total_xp).toBe("number");
    expect(typeof payload.rank).toBe("string");
    expect(typeof payload.last_played_at).toBe("string");
    // Numeric sanity: previous + EXPECTED_XP.
    expect(payload.total_xp).toBe(PREVIOUS_XP + 220);

    expect(eqOp!.args).toEqual(["id", USER_A]);
  });
});
