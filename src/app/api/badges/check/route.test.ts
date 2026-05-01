import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Tests for POST /api/badges/check (Session 4G, badge-bug-2 fix).
// All Supabase + engine access is mocked — no real network/DB.
//
// The route uses two clients:
//   - createClient (SSR) for auth.getUser only
//   - createServiceClient for table reads + user_badges upsert
// We mock both, plus runBadgeChecks from badges-engine. The
// trust-boundary test (#12) captures the context passed into the
// engine to prove the route ignores body extras and builds
// context exclusively from server-trusted DB row fields.
// ═══════════════════════════════════════════════════════════════

const mockGetUser = vi.fn();
const serviceFrom = vi.fn();
const runBadgeChecksMock = vi.fn().mockResolvedValue([]);

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: () => mockGetUser() },
  })),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

vi.mock("@/lib/badges-engine", () => ({
  runBadgeChecks: (...args: unknown[]) => runBadgeChecksMock(...args),
}));

import { POST } from "./route";
import {
  installSupabaseResponder,
  findAllCalls,
} from "@/test/supabase-mock";

// ── Fixtures ─────────────────────────────────────────────────

const USER_A = "user-a-uuid";
const USER_B = "user-b-uuid";
const USER_STRANGER = "user-stranger-uuid";
const QUIZ_SESSION_ID = "session-1";
const DUEL_ID = "duel-1";
const ANIME_ID = "anime-1";
const BADGE_ID = "badge-1";

const buildBadge = (id = BADGE_ID) => ({
  id,
  slug: "test-badge",
  name: "Test Badge",
  description: "for tests",
  category: "special",
  icon_name: "star",
  icon_color: "#FF6B35",
  requirement_type: "total_quizzes",
  requirement_value: { count: 1 },
  rarity: "common",
  created_at: "2024-01-01",
});

const buildQuizSession = (overrides: Record<string, unknown> = {}) => ({
  id: QUIZ_SESSION_ID,
  user_id: USER_A,
  anime_id: ANIME_ID,
  difficulty: "hard",
  score: 5,
  total_questions: 10,
  xp_earned: 50,
  ...overrides,
});

const buildUserAnswers = () => [
  { is_correct: true, time_taken_ms: 4000 },
  { is_correct: true, time_taken_ms: 3000 },
  { is_correct: false, time_taken_ms: 5000 },
  { is_correct: true, time_taken_ms: 4500 },
  { is_correct: false, time_taken_ms: 6000 },
];

const buildDuel = (overrides: Record<string, unknown> = {}) => ({
  id: DUEL_ID,
  challenger_id: USER_A,
  opponent_id: USER_B,
  status: "completed",
  question_count: 10,
  challenger_correct: 7,
  opponent_correct: 4,
  challenger_answers: [
    { questionId: "q1", selectedOption: 0, isCorrect: true, timeMs: 2000 },
    { questionId: "q2", selectedOption: 1, isCorrect: false, timeMs: 3000 },
  ],
  opponent_answers: [
    { questionId: "q1", selectedOption: 0, isCorrect: false, timeMs: 4000 },
    { questionId: "q2", selectedOption: 1, isCorrect: true, timeMs: 2500 },
  ],
  ...overrides,
});

const todayUtc = () => new Date().toISOString().split("T")[0];

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/badges/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/badges/check", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    mockGetUser.mockReset();
    runBadgeChecksMock.mockReset();
    runBadgeChecksMock.mockResolvedValue([]);
  });

  // ── Auth / validation ────────────────────────────────────────

  it("returns 401 when no auth user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    installSupabaseResponder(serviceFrom, () => ({ data: null }));

    const res = await POST(
      makeRequest({ kind: "quiz_session", id: QUIZ_SESSION_ID })
    );
    expect(res.status).toBe(401);
    expect(runBadgeChecksMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid kind", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    const queries = installSupabaseResponder(serviceFrom, () => ({ data: null }));

    const res = await POST(makeRequest({ kind: "bogus", id: "x" }));
    expect(res.status).toBe(400);
    expect(queries).toHaveLength(0);
    expect(runBadgeChecksMock).not.toHaveBeenCalled();
  });

  it("returns 400 when kind is quiz_session but id is missing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    const queries = installSupabaseResponder(serviceFrom, () => ({ data: null }));

    const res = await POST(makeRequest({ kind: "quiz_session" }));
    expect(res.status).toBe(400);
    expect(queries).toHaveLength(0);
    expect(runBadgeChecksMock).not.toHaveBeenCalled();
  });

  // ── quiz_session row checks ──────────────────────────────────

  it("returns 404 when quiz_session row is not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "quiz_sessions") return { data: null };
      return { data: null };
    });

    const res = await POST(
      makeRequest({ kind: "quiz_session", id: QUIZ_SESSION_ID })
    );
    expect(res.status).toBe(404);
    expect(runBadgeChecksMock).not.toHaveBeenCalled();
  });

  it("returns 403 when quiz_session row belongs to a different user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_STRANGER } } });
    const queries = installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "quiz_sessions") return { data: buildQuizSession() };
      return { data: null };
    });

    const res = await POST(
      makeRequest({ kind: "quiz_session", id: QUIZ_SESSION_ID })
    );
    expect(res.status).toBe(403);
    expect(runBadgeChecksMock).not.toHaveBeenCalled();
    expect(findAllCalls(queries, "user_badges", "upsert")).toHaveLength(0);
  });

  // ── duel_match row checks ────────────────────────────────────

  it("returns 404 when duel_match row is not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "duel_matches") return { data: null };
      return { data: null };
    });

    const res = await POST(makeRequest({ kind: "duel_match", id: DUEL_ID }));
    expect(res.status).toBe(404);
    expect(runBadgeChecksMock).not.toHaveBeenCalled();
  });

  it("returns 403 when duel_match caller is neither challenger nor opponent", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_STRANGER } } });
    installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "duel_matches") return { data: buildDuel() };
      return { data: null };
    });

    const res = await POST(makeRequest({ kind: "duel_match", id: DUEL_ID }));
    expect(res.status).toBe(403);
    expect(runBadgeChecksMock).not.toHaveBeenCalled();
  });

  // ── Happy paths ──────────────────────────────────────────────

  it("quiz_session happy path: builds context from row + user_answers and upserts new badges", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    runBadgeChecksMock.mockResolvedValue([buildBadge()]);

    const queries = installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "quiz_sessions") return { data: buildQuizSession() };
      if (q.table === "user_answers") return { data: buildUserAnswers() };
      return { data: null };
    });

    const res = await POST(
      makeRequest({ kind: "quiz_session", id: QUIZ_SESSION_ID })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { newBadges: { id: string }[] };
    expect(body.newBadges.map((b) => b.id)).toEqual([BADGE_ID]);

    expect(runBadgeChecksMock).toHaveBeenCalledTimes(1);
    const ctx = runBadgeChecksMock.mock.calls[0][0] as Record<string, unknown>;
    expect(ctx.userId).toBe(USER_A);
    expect(ctx.quizScore).toBe(5);
    expect(ctx.quizTotal).toBe(10);
    expect(ctx.difficulty).toBe("hard");
    expect(ctx.animeId).toBe(ANIME_ID);
    expect(ctx.xpEarned).toBe(50);
    expect(ctx.answers).toEqual([
      { isCorrect: true, timeMs: 4000 },
      { isCorrect: true, timeMs: 3000 },
      { isCorrect: false, timeMs: 5000 },
      { isCorrect: true, timeMs: 4500 },
      { isCorrect: false, timeMs: 6000 },
    ]);

    const upsertCalls = findAllCalls(queries, "user_badges", "upsert");
    expect(upsertCalls).toHaveLength(1);
    const upsertOp = upsertCalls[0].ops.find((op) => op.method === "upsert")!;
    expect(upsertOp.args[0]).toEqual([
      { user_id: USER_A, badge_id: BADGE_ID },
    ]);
  });

  it("duel_match happy path challenger side: context uses challenger_correct + answers, opponent_id as duelOpponentId", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });

    installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "duel_matches") return { data: buildDuel() };
      return { data: null };
    });

    const res = await POST(makeRequest({ kind: "duel_match", id: DUEL_ID }));
    expect(res.status).toBe(200);

    const ctx = runBadgeChecksMock.mock.calls[0][0] as Record<string, unknown>;
    expect(ctx.userId).toBe(USER_A);
    expect(ctx.quizScore).toBe(7);
    expect(ctx.quizTotal).toBe(10);
    expect(ctx.isDuel).toBe(true);
    expect(ctx.duelOpponentId).toBe(USER_B);
    expect(ctx.answers).toEqual([
      { isCorrect: true, timeMs: 2000 },
      { isCorrect: false, timeMs: 3000 },
    ]);
  });

  it("duel_match happy path opponent side: context uses opponent_correct + answers, challenger_id as duelOpponentId", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_B } } });

    installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "duel_matches") return { data: buildDuel() };
      return { data: null };
    });

    const res = await POST(makeRequest({ kind: "duel_match", id: DUEL_ID }));
    expect(res.status).toBe(200);

    const ctx = runBadgeChecksMock.mock.calls[0][0] as Record<string, unknown>;
    expect(ctx.userId).toBe(USER_B);
    expect(ctx.quizScore).toBe(4);
    expect(ctx.quizTotal).toBe(10);
    expect(ctx.isDuel).toBe(true);
    expect(ctx.duelOpponentId).toBe(USER_A);
    expect(ctx.answers).toEqual([
      { isCorrect: false, timeMs: 4000 },
      { isCorrect: true, timeMs: 2500 },
    ]);
  });

  // ── Idempotency ──────────────────────────────────────────────

  it("upsert is called with onConflict and ignoreDuplicates so re-running is safe", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });
    runBadgeChecksMock.mockResolvedValue([buildBadge()]);

    const queries = installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "quiz_sessions") return { data: buildQuizSession() };
      if (q.table === "user_answers") return { data: buildUserAnswers() };
      return { data: null };
    });

    const res = await POST(
      makeRequest({ kind: "quiz_session", id: QUIZ_SESSION_ID })
    );
    expect(res.status).toBe(200);

    const upsertCalls = findAllCalls(queries, "user_badges", "upsert");
    expect(upsertCalls).toHaveLength(1);
    const upsertOp = upsertCalls[0].ops.find((op) => op.method === "upsert")!;
    expect(upsertOp.args[1]).toEqual({
      onConflict: "user_id,badge_id",
      ignoreDuplicates: true,
    });
  });

  // ── Trust boundary ───────────────────────────────────────────

  it("body's bogus quizScore/isDuel/answers are ignored — context is built from the DB row", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });

    installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "quiz_sessions") return { data: buildQuizSession() };
      if (q.table === "user_answers") return { data: buildUserAnswers() };
      return { data: null };
    });

    const res = await POST(
      makeRequest({
        kind: "quiz_session",
        id: QUIZ_SESSION_ID,
        // Bogus extras — the route MUST ignore these.
        userId: USER_STRANGER,
        quizScore: 999,
        quizTotal: 999,
        difficulty: "impossible",
        isDuel: true,
        duelOpponentId: USER_STRANGER,
        answers: [{ isCorrect: true, timeMs: 1 }],
        xpEarned: 9999,
      })
    );
    expect(res.status).toBe(200);
    expect(runBadgeChecksMock).toHaveBeenCalledTimes(1);

    const ctx = runBadgeChecksMock.mock.calls[0][0] as Record<string, unknown>;
    // Server-trusted: from auth user + quiz_sessions row.
    expect(ctx.userId).toBe(USER_A);
    expect(ctx.quizScore).toBe(5);
    expect(ctx.quizTotal).toBe(10);
    expect(ctx.difficulty).toBe("hard");
    expect(ctx.xpEarned).toBe(50);
    // Duel fields must NOT be set on a quiz_session call, regardless
    // of body content.
    expect(ctx.isDuel).toBeUndefined();
    expect(ctx.duelOpponentId).toBeUndefined();
    // Answers come from user_answers, not the body.
    expect(ctx.answers).toHaveLength(5);
    expect((ctx.answers as unknown[])[0]).toEqual({
      isCorrect: true,
      timeMs: 4000,
    });
  });

  // ── daily_challenge happy path ───────────────────────────────

  it("daily_challenge happy path when daily_challenge_date matches today (UTC)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_A } } });

    installSupabaseResponder(serviceFrom, (q) => {
      if (q.table === "user_profiles") {
        return {
          data: {
            daily_challenge_date: todayUtc(),
            daily_challenge_score: 8,
          },
        };
      }
      return { data: null };
    });

    const res = await POST(makeRequest({ kind: "daily_challenge" }));
    expect(res.status).toBe(200);

    const ctx = runBadgeChecksMock.mock.calls[0][0] as Record<string, unknown>;
    expect(ctx.userId).toBe(USER_A);
    expect(ctx.quizScore).toBe(8);
    expect(ctx.quizTotal).toBe(10); // DAILY_CHALLENGE_QUESTION_COUNT
    expect(ctx.answers).toEqual([]);
    expect(ctx.isDuel).toBeUndefined();
  });
});
