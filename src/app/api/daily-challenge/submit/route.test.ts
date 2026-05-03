import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Tests for POST /api/daily-challenge/submit (Session 4J,
// daily-bug-N fix). All Supabase access is mocked — no real
// network / DB.
//
// The route uses two clients:
//   - createServerClient (SSR) for auth.getUser only
//   - createServiceClient for table reads/writes AND for the
//     increment_weekly_anime_play RPC
//
// We mock both, plus @/lib/config-actions (mix + diminishing
// returns). @/lib/scoring (calculateQuestionXP) and @/lib/ranks
// (deriveRankFromXp) and @/lib/league-xp (getCurrentWeekStart,
// getLeagueXpMultiplier) are NOT mocked — pure helpers, the
// tests exercise the real logic.
// ═══════════════════════════════════════════════════════════════

const mockGetUser = vi.fn();
const serviceFrom = vi.fn();
const serviceRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: () => mockGetUser() },
  })),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom, rpc: serviceRpc }),
}));

const mockGetDailyChallengeMix = vi.fn();
const mockGetDailyChallengeMixForAge = vi.fn();
const mockGetDiminishingReturns = vi.fn();

vi.mock("@/lib/config-actions", () => ({
  getDailyChallengeMix: () => mockGetDailyChallengeMix(),
  getDailyChallengeMixForAge: (ageGroup: string) =>
    mockGetDailyChallengeMixForAge(ageGroup),
  getDiminishingReturns: () => mockGetDiminishingReturns(),
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
const PREVIOUS_XP = 100;

const todayUtc = (): string => new Date().toISOString().split("T")[0];
const dateDaysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

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
  new Request("http://localhost/api/daily-challenge/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// Per-table responder. Discriminates user_profiles SELECT vs
// UPDATE by inspecting the captured op chain.
interface ResponderOpts {
  questions?: ReturnType<typeof buildQuestions>;
  previousXp?: number;
  priorDate?: string | null;
  priorStreak?: number;
  ageGroup?: "junior" | "teen" | "full" | null;
  membership?: { id: string; weekly_xp: number } | null;
  uniqueAnimeCount?: number;
}

const responder = (opts: ResponderOpts = {}): Responder => (q) => {
  if (q.table === "user_profiles") {
    const isUpdate = q.ops.some((op) => op.method === "update");
    if (isUpdate) return { data: null };
    return {
      data: {
        age_group: opts.ageGroup ?? "full",
        total_xp: opts.previousXp ?? PREVIOUS_XP,
        daily_challenge_date: opts.priorDate ?? null,
        daily_challenge_streak: opts.priorStreak ?? 0,
      },
    };
  }
  if (q.table === "questions") {
    return { data: opts.questions ?? [] };
  }
  if (q.table === "league_memberships") {
    const isUpdate = q.ops.some((op) => op.method === "update");
    if (isUpdate) return { data: null };
    return {
      data:
        opts.membership === undefined
          ? { id: "lm-1", weekly_xp: 0 }
          : opts.membership,
    };
  }
  if (q.table === "weekly_anime_plays") {
    return { data: null, count: opts.uniqueAnimeCount ?? 1 };
  }
  return { data: null };
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

describe("POST /api/daily-challenge/submit", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    serviceRpc.mockReset();
    mockGetUser.mockReset();
    mockGetDailyChallengeMix.mockReset();
    mockGetDailyChallengeMixForAge.mockReset();
    mockGetDiminishingReturns.mockReset();

    // Sensible defaults: base mix sums to 10, no junior override,
    // no diminishing return penalty (multiplier 1.0), RPC returns
    // playCount 1.
    mockGetDailyChallengeMix.mockResolvedValue({
      easy: 3,
      medium: 3,
      hard: 3,
      impossible: 1,
    });
    mockGetDailyChallengeMixForAge.mockResolvedValue(null);
    mockGetDiminishingReturns.mockResolvedValue([1.0, 0.75, 0.5, 0.25, 0.1]);
    serviceRpc.mockResolvedValue({ data: 1, error: null });
  });

  // ── 1. Unauthenticated ─────────────────────────────────────

  it("returns 401 when no auth user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const queries = installSupabaseResponder(serviceFrom, responder());

    const ids = tenIds();
    const res = await POST(
      makeRequest({ animeId: ANIME_ID, answers: buildAnswers(ids, 0) })
    );
    expect(res.status).toBe(401);
    expect(findAllCalls(queries, "user_profiles", "update")).toHaveLength(0);
  });

  // ── 2. Body validation ─────────────────────────────────────

  describe("body validation", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    });

    it.each([
      [
        "missing animeId",
        { answers: [{ questionId: "q1", selectedOption: 0, timeMs: 0 }] },
      ],
      [
        "empty animeId",
        {
          animeId: "",
          answers: [{ questionId: "q1", selectedOption: 0, timeMs: 0 }],
        },
      ],
      ["missing answers", { animeId: ANIME_ID }],
      ["non-array answers", { animeId: ANIME_ID, answers: "not-an-array" }],
      ["empty answers array", { animeId: ANIME_ID, answers: [] }],
      [
        "more than 10 answers",
        {
          animeId: ANIME_ID,
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
          animeId: ANIME_ID,
          answers: [{ questionId: "q1", selectedOption: 1.5, timeMs: 0 }],
        },
      ],
      [
        "non-finite timeMs",
        {
          animeId: ANIME_ID,
          answers: [
            { questionId: "q1", selectedOption: 0, timeMs: Number.NaN },
          ],
        },
      ],
      [
        "missing questionId on item",
        {
          animeId: ANIME_ID,
          answers: [{ selectedOption: 0, timeMs: 1000 }],
        },
      ],
    ])("returns 400 when %s", async (_label, body) => {
      const queries = installSupabaseResponder(serviceFrom, responder());

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
      // Validation runs BEFORE any DB access.
      expect(findAllCalls(queries, "user_profiles", "update")).toHaveLength(0);
      expect(findAllCalls(queries, "questions", "select")).toHaveLength(0);
    });
  });

  // ── 3. Unknown questionId ──────────────────────────────────

  it("returns 400 when service returns fewer rows than submitted ids", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    const ids = tenIds();
    // Service returns only 9 of 10.
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids.slice(0, 9), 0, "easy") })
    );

    const res = await POST(
      makeRequest({ animeId: ANIME_ID, answers: buildAnswers(ids, 0) })
    );
    expect(res.status).toBe(400);
    expect(findAllCalls(queries, "user_profiles", "update")).toHaveLength(0);
  });

  // ── 4. Already played today ────────────────────────────────

  it("returns 409 when daily_challenge_date === today", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    const ids = tenIds();
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        priorDate: todayUtc(),
        priorStreak: 4,
        questions: buildQuestions(ids, 0, "easy"),
      })
    );

    const res = await POST(
      makeRequest({ animeId: ANIME_ID, answers: buildAnswers(ids, 0) })
    );
    expect(res.status).toBe(409);
    // No further DB writes after the 409.
    expect(findAllCalls(queries, "user_profiles", "update")).toHaveLength(0);
    expect(findAllCalls(queries, "questions", "select")).toHaveLength(0);
  });

  // ── 5. Happy path — all correct ────────────────────────────

  it("happy path all-correct: derives score=10, applies XP_MULTIPLIER 1.5", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    const ids = tenIds();
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    const start = Date.now();
    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        answers: buildAnswers(ids, 0, 1000),
      })
    );
    expect(res.status).toBe(200);

    // calculateQuestionXP(easy, streak, 1000ms, 30000ms):
    //   baseXP=10, streakMult=1+streak*0.1, timeBonus=1.5
    //   (1000 < 5000 threshold)
    // round(10 * (1 + i*0.1) * 1.5) for i=0..9:
    //   15, 17, 18, 20, 21, 23, 24, 26, 27, 29
    // Daily multiplier 1.5 applied per-question round() then sum:
    //   round(15*1.5)=23, round(17*1.5)=26, round(18*1.5)=27,
    //   round(20*1.5)=30, round(21*1.5)=32, round(23*1.5)=35,
    //   round(24*1.5)=36, round(26*1.5)=39, round(27*1.5)=41,
    //   round(29*1.5)=44
    // Sum = 333.
    const EXPECTED_XP = 333;

    const profileUpdate = findUpdatePayload(queries, "user_profiles");
    expect(profileUpdate.daily_challenge_date).toBe(todayUtc());
    expect(profileUpdate.daily_challenge_score).toBe(10);
    // priorDate=null → newStreak=1.
    expect(profileUpdate.daily_challenge_streak).toBe(1);
    expect(profileUpdate.total_xp).toBe(PREVIOUS_XP + EXPECTED_XP);
    expect(profileUpdate.rank).toBe("Genin"); // 100 + 333 < 500
    expect(typeof profileUpdate.last_played_at).toBe("string");
    const lastPlayedTime = Date.parse(profileUpdate.last_played_at as string);
    expect(lastPlayedTime).toBeGreaterThanOrEqual(start);
    expect(lastPlayedTime).toBeLessThanOrEqual(Date.now() + 1_000);

    const json = (await res.json()) as {
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      xpEarned: number;
      timeTakenSeconds: number;
      streak: number;
    };
    expect(json).toEqual({
      score: 10,
      correctAnswers: 10,
      totalQuestions: 10,
      xpEarned: EXPECTED_XP,
      timeTakenSeconds: 10,
      streak: 1,
    });
  });

  // ── 6. Happy path — partial correct ───────────────────────

  it("happy path partial: per-answer correctness, XP only for correct", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    // Override mix so 5-answer submission passes exact-length.
    mockGetDailyChallengeMix.mockResolvedValue({ easy: 5 });
    const ids = ["q1", "q2", "q3", "q4", "q5"];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    // q1 correct (streak 0 → 23), q2 wrong (streak resets), q3
    // correct (streak 0 → 23), q4 timeout (-1, wrong), q5 correct
    // (streak 0 → 23). Total xp = 23 + 23 + 23 = 69.
    const answers = [
      { questionId: "q1", selectedOption: 0, timeMs: 1000 },
      { questionId: "q2", selectedOption: 1, timeMs: 2000 },
      { questionId: "q3", selectedOption: 0, timeMs: 1500 },
      { questionId: "q4", selectedOption: -1, timeMs: 30_000 },
      { questionId: "q5", selectedOption: 0, timeMs: 800 },
    ];
    const res = await POST(makeRequest({ animeId: ANIME_ID, answers }));
    expect(res.status).toBe(200);

    const profileUpdate = findUpdatePayload(queries, "user_profiles");
    expect(profileUpdate.daily_challenge_score).toBe(3);
    expect(profileUpdate.total_xp).toBe(PREVIOUS_XP + 69);

    const json = (await res.json()) as { score: number; xpEarned: number };
    expect(json.score).toBe(3);
    expect(json.xpEarned).toBe(69);
  });

  // ── 7. Time clamping ──────────────────────────────────────

  it("clamps per-answer timeMs to MAX_PER_ANSWER_MS=60000", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockGetDailyChallengeMix.mockResolvedValue({ easy: 1 });
    const ids = ["q1"];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        answers: [
          { questionId: "q1", selectedOption: 0, timeMs: 999_999_999 },
        ],
      })
    );
    expect(res.status).toBe(200);

    const profileUpdate = findUpdatePayload(queries, "user_profiles");
    // Clamped to 60_000ms → 60s.
    // calculateQuestionXP(easy, 0, 60000, 30000): timeBonus=1.0
    // (60000 >= 5000 threshold). baseXP=10, streakMult=1.0.
    // round(10 * 1.0 * 1.0) = 10. Daily mult: round(10 * 1.5) = 15.
    expect(profileUpdate.total_xp).toBe(PREVIOUS_XP + 15);

    const json = (await res.json()) as {
      timeTakenSeconds: number;
      xpEarned: number;
    };
    expect(json.timeTakenSeconds).toBe(60);
    expect(json.xpEarned).toBe(15);
  });

  // ── 8. Streak +1 (yesterday) ──────────────────────────────

  it("streak increments when priorDate === yesterday", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockGetDailyChallengeMix.mockResolvedValue({ easy: 1 });
    const ids = ["q1"];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        questions: buildQuestions(ids, 0, "easy"),
        priorDate: dateDaysAgo(1),
        priorStreak: 4,
      })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        answers: [{ questionId: "q1", selectedOption: 0, timeMs: 1000 }],
      })
    );
    expect(res.status).toBe(200);

    const profileUpdate = findUpdatePayload(queries, "user_profiles");
    expect(profileUpdate.daily_challenge_streak).toBe(5);

    const json = (await res.json()) as { streak: number };
    expect(json.streak).toBe(5);
  });

  // ── 9. Streak reset (gap day) ─────────────────────────────

  it("streak resets to 1 when priorDate is more than 1 day old", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockGetDailyChallengeMix.mockResolvedValue({ easy: 1 });
    const ids = ["q1"];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        questions: buildQuestions(ids, 0, "easy"),
        priorDate: dateDaysAgo(3),
        priorStreak: 10,
      })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        answers: [{ questionId: "q1", selectedOption: 0, timeMs: 1000 }],
      })
    );
    expect(res.status).toBe(200);

    const profileUpdate = findUpdatePayload(queries, "user_profiles");
    expect(profileUpdate.daily_challenge_streak).toBe(1);
  });

  // ── 10. Streak fresh (no prior) ───────────────────────────

  it("streak is 1 when priorDate is null (first-ever play)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockGetDailyChallengeMix.mockResolvedValue({ easy: 1 });
    const ids = ["q1"];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        questions: buildQuestions(ids, 0, "easy"),
        priorDate: null,
        priorStreak: 0,
      })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        answers: [{ questionId: "q1", selectedOption: 0, timeMs: 1000 }],
      })
    );
    expect(res.status).toBe(200);

    const profileUpdate = findUpdatePayload(queries, "user_profiles");
    expect(profileUpdate.daily_challenge_streak).toBe(1);
  });

  // ── 11. Trust boundary ────────────────────────────────────

  it("ignores body fields outside {animeId, answers} — server values overwrite bogus extras", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    const ids = tenIds();
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        answers: buildAnswers(ids, 0, 1000),
        // Bogus extras — the route MUST ignore these.
        score: 999,
        correctAnswers: 999,
        xpEarned: 99999,
        userId: USER_STRANGER,
        user_id: USER_STRANGER,
        total_xp: 999999,
        daily_challenge_streak: 99,
        difficulty: "impossible",
        isDuel: true,
      })
    );
    expect(res.status).toBe(200);

    const updateCalls = findAllCalls(queries, "user_profiles", "update");
    expect(updateCalls).toHaveLength(1);
    const updateOp = updateCalls[0].ops.find((op) => op.method === "update");
    const eqOp = updateCalls[0].ops.find((op) => op.method === "eq");

    const payload = updateOp!.args[0] as Record<string, unknown>;
    // Score / XP / streak are server-derived, not body claims.
    expect(payload.daily_challenge_score).toBe(10);
    expect(payload.total_xp).toBe(PREVIOUS_XP + 333);
    expect(payload.daily_challenge_streak).toBe(1); // priorDate=null
    // .eq filters by AUTH user, not stranger.
    expect(eqOp!.args).toEqual(["id", USER_A]);

    const json = (await res.json()) as {
      score: number;
      xpEarned: number;
      streak: number;
    };
    expect(json.score).toBe(10);
    expect(json.xpEarned).toBe(333);
    expect(json.streak).toBe(1);
  });

  // ── 12. user_profiles UPDATE payload shape regression guard

  it("user_profiles UPDATE captures the expected payload keys (single update)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    const ids = tenIds();
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        answers: buildAnswers(ids, 0, 1000),
      })
    );
    expect(res.status).toBe(200);

    const profileUpdate = findUpdatePayload(queries, "user_profiles");
    // Locks the contract: only these six keys are written.
    expect(Object.keys(profileUpdate).sort()).toEqual(
      [
        "daily_challenge_date",
        "daily_challenge_score",
        "daily_challenge_streak",
        "last_played_at",
        "rank",
        "total_xp",
      ].sort()
    );
  });

  // ── 13. League XP RPC + league_memberships UPDATE ─────────

  it("calls increment_weekly_anime_play RPC and updates league_memberships.weekly_xp", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    const ids = tenIds();
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        questions: buildQuestions(ids, 0, "easy"),
        membership: { id: "lm-1", weekly_xp: 50 },
        uniqueAnimeCount: 4,
      })
    );

    const res = await POST(
      makeRequest({
        animeId: ANIME_ID,
        answers: buildAnswers(ids, 0, 1000),
      })
    );
    expect(res.status).toBe(200);

    // RPC fired with the auth user, body animeId, and a week start.
    expect(serviceRpc).toHaveBeenCalledWith(
      "increment_weekly_anime_play",
      expect.objectContaining({
        p_user_id: USER_A,
        p_anime_id: ANIME_ID,
      })
    );
    const rpcArgs = serviceRpc.mock.calls[0][1] as { p_week_start: string };
    expect(typeof rpcArgs.p_week_start).toBe("string");

    const lmUpdates = findAllCalls(queries, "league_memberships", "update");
    expect(lmUpdates).toHaveLength(1);
    const updateOp = lmUpdates[0].ops.find((op) => op.method === "update");
    const payload = updateOp!.args[0] as Record<string, unknown>;
    // playCount=1 → multiplier=1.0; leagueXp = round(333 * 1.0) = 333.
    expect(payload.weekly_xp).toBe(50 + 333);
    expect(payload.unique_anime_count).toBe(4);
  });

  // ── 14. Per-question time limit (mixed difficulty) ────────

  it("uses per-question difficulty for TIME_LIMITS lookup (mixed difficulty)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    mockGetDailyChallengeMix.mockResolvedValue({ easy: 1, impossible: 1 });
    const questions = [
      ...buildQuestions(["q-easy"], 0, "easy"),
      ...buildQuestions(["q-imp"], 0, "impossible"),
    ];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions })
    );

    // timeMs=4000:
    //   easy threshold = 5000 → 4000 < 5000 → timeBonus=1.5
    //   impossible threshold = 3000 → 4000 ≥ 3000 → timeBonus=1.0
    // Order matters (sequential streak):
    //   q-easy first (streak 0): xp_pre = round(10*1.0*1.5) = 15;
    //                            xp_daily = round(15*1.5) = 23
    //   q-imp second (streak 1): xp_pre = round(100*1.1*1.0) = 110;
    //                            xp_daily = round(110*1.5) = 165
    // Total = 188. If route incorrectly used easy threshold for
    // both, impossible's 4000ms would still get 1.5 bonus →
    // xp_pre = round(100*1.1*1.5) = 165; xp_daily = round(165*1.5)
    // = 248; total = 271 (regression).
    const answers = [
      { questionId: "q-easy", selectedOption: 0, timeMs: 4000 },
      { questionId: "q-imp", selectedOption: 0, timeMs: 4000 },
    ];
    const res = await POST(makeRequest({ animeId: ANIME_ID, answers }));
    expect(res.status).toBe(200);

    const profileUpdate = findUpdatePayload(queries, "user_profiles");
    expect(profileUpdate.total_xp).toBe(PREVIOUS_XP + 188);

    const json = (await res.json()) as { xpEarned: number; score: number };
    expect(json.xpEarned).toBe(188);
    expect(json.score).toBe(2);
  });

  // ── 15. Partial-completion bypass ────────────────────────

  it("returns 400 when answers count differs from mix-derived expectedCount", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    // Default mix sums to 10; submit only 5 answers.
    const ids = ["q1", "q2", "q3", "q4", "q5"];
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ questions: buildQuestions(ids, 0, "easy") })
    );

    const res = await POST(
      makeRequest({ animeId: ANIME_ID, answers: buildAnswers(ids, 0) })
    );
    expect(res.status).toBe(400);
    expect(findAllCalls(queries, "user_profiles", "update")).toHaveLength(0);
    expect(findAllCalls(queries, "questions", "select")).toHaveLength(0);
  });
});
