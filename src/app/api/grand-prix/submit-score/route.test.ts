import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Tests for POST /api/grand-prix/submit-score (Session 4C, gp-bug-5
// fix). All Supabase access is mocked; no real network / DB calls.
//
// The route uses two clients:
//   - createClient (SSR) for auth.getUser only
//   - createServiceClient for grand_prix_matches and questions
// We mock both. The shared installSupabaseResponder helper covers
// the from() interception; auth.getUser is mocked separately.
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

import { POST } from "./route";
import {
  installSupabaseResponder,
  findAllCalls,
  type Responder,
} from "@/test/supabase-mock";

// ── Fixtures ─────────────────────────────────────────────────

const PLAYER1 = "user-player1-uuid";
const PLAYER2 = "user-player2-uuid";
const MATCH_ID = "match-abc-uuid";
const ASSIGNED_IDS = Array.from({ length: 10 }, (_, i) => `q-${i + 1}`);

const buildMatch = (
  overrides: Partial<{
    status: string;
    player1_id: string | null;
    player2_id: string | null;
    player1_score: number | null;
    player2_score: number | null;
    player1_time_ms: number | null;
    player2_time_ms: number | null;
    question_ids: string[] | null;
    created_at: string;
  }> = {}
) => ({
  id: MATCH_ID,
  player1_id: PLAYER1,
  player2_id: PLAYER2,
  player1_score: null,
  player2_score: null,
  player1_time_ms: null,
  player2_time_ms: null,
  status: "pending",
  question_ids: ASSIGNED_IDS,
  created_at: new Date(Date.now() - 60_000).toISOString(),
  ...overrides,
});

const buildQuestions = (correctIndex = 0) =>
  ASSIGNED_IDS.map((id) => ({
    id,
    options: [
      { isCorrect: correctIndex === 0 },
      { isCorrect: correctIndex === 1 },
      { isCorrect: correctIndex === 2 },
      { isCorrect: correctIndex === 3 },
    ],
  }));

const buildAnswers = (selectedOption: number, timeMs = 500) =>
  ASSIGNED_IDS.map((id) => ({ questionId: id, selectedOption, timeMs }));

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/grand-prix/submit-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const responder = (opts: {
  match?: ReturnType<typeof buildMatch> | null;
  questions?: ReturnType<typeof buildQuestions>;
}): Responder => (q) => {
  if (q.table === "grand_prix_matches") {
    // SELECT and UPDATE both return the match row; tests assert on
    // the captured update payload via findAllCalls.
    return { data: opts.match ?? null };
  }
  if (q.table === "questions") {
    return { data: opts.questions ?? buildQuestions() };
  }
  return { data: null };
};

const findUpdatePayload = (
  queries: ReturnType<typeof installSupabaseResponder>
): Record<string, unknown> => {
  const updateCalls = findAllCalls(queries, "grand_prix_matches", "update");
  expect(updateCalls).toHaveLength(1);
  const updateOp = updateCalls[0].ops.find((op) => op.method === "update");
  expect(updateOp).toBeDefined();
  return updateOp!.args[0] as Record<string, unknown>;
};

describe("POST /api/grand-prix/submit-score", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    mockGetUser.mockReset();
  });

  // ── Auth ─────────────────────────────────────────────────────

  it("returns 401 when no auth user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    installSupabaseResponder(serviceFrom, responder({}));

    const res = await POST(
      makeRequest({ matchId: MATCH_ID, answers: buildAnswers(0) })
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated user is neither player", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "stranger" } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ match: buildMatch() })
    );

    const res = await POST(
      makeRequest({ matchId: MATCH_ID, answers: buildAnswers(0) })
    );
    expect(res.status).toBe(403);
    expect(findAllCalls(queries, "grand_prix_matches", "update")).toHaveLength(
      0
    );
  });

  // ── Double-submission ────────────────────────────────────────

  it("returns 409 when player1 has already submitted", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: PLAYER1 } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ match: buildMatch({ status: "player1_done" }) })
    );

    const res = await POST(
      makeRequest({ matchId: MATCH_ID, answers: buildAnswers(0) })
    );
    expect(res.status).toBe(409);
    expect(findAllCalls(queries, "grand_prix_matches", "update")).toHaveLength(
      0
    );
  });

  // ── Question-set mismatch (cherry-pick defense) ──────────────

  it("returns 400 when submitted question IDs are not in the assigned set", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: PLAYER1 } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ match: buildMatch() })
    );

    const wrongAnswers = ASSIGNED_IDS.map((_, i) => ({
      questionId: `wrong-${i}`,
      selectedOption: 0,
      timeMs: 500,
    }));
    const res = await POST(
      makeRequest({ matchId: MATCH_ID, answers: wrongAnswers })
    );
    expect(res.status).toBe(400);
    expect(findAllCalls(queries, "grand_prix_matches", "update")).toHaveLength(
      0
    );
  });

  it("returns 400 when answers contain duplicate question IDs to pad the count", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: PLAYER1 } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ match: buildMatch() })
    );

    const dupAnswers = Array.from({ length: 10 }, () => ({
      questionId: ASSIGNED_IDS[0],
      selectedOption: 0,
      timeMs: 500,
    }));
    const res = await POST(
      makeRequest({ matchId: MATCH_ID, answers: dupAnswers })
    );
    expect(res.status).toBe(400);
    expect(findAllCalls(queries, "grand_prix_matches", "update")).toHaveLength(
      0
    );
  });

  // ── Score derivation ─────────────────────────────────────────

  it("derives score from server-trusted answer key (7 correct + 3 wrong → score=7)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: PLAYER1 } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ match: buildMatch(), questions: buildQuestions(0) })
    );

    const answers = ASSIGNED_IDS.map((id, i) => ({
      questionId: id,
      selectedOption: i < 7 ? 0 : 1,
      timeMs: 500,
    }));
    const res = await POST(makeRequest({ matchId: MATCH_ID, answers }));
    expect(res.status).toBe(200);

    const update = findUpdatePayload(queries);
    expect(update.player1_score).toBe(7);
  });

  // ── Time clamping ────────────────────────────────────────────

  it("clamps totalTimeMs to lower bound (5000ms) when client submits trivial values", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: PLAYER1 } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({ match: buildMatch() })
    );

    const answers = buildAnswers(0, 1); // 10 × 1ms = 10ms client total
    const res = await POST(makeRequest({ matchId: MATCH_ID, answers }));
    expect(res.status).toBe(200);

    const update = findUpdatePayload(queries);
    expect(update.player1_time_ms).toBe(5000);
  });

  it("clamps totalTimeMs to upper bound (server elapsed) when client total exceeds it", async () => {
    vi.useFakeTimers();
    const fixedNow = new Date("2026-04-26T12:00:00Z").getTime();
    vi.setSystemTime(fixedNow);

    try {
      mockGetUser.mockResolvedValue({ data: { user: { id: PLAYER1 } } });
      const queries = installSupabaseResponder(
        serviceFrom,
        responder({
          match: buildMatch({
            created_at: new Date(fixedNow - 30_000).toISOString(),
          }),
        })
      );

      const answers = buildAnswers(0, 60_000); // 10 × 60_000 = 600_000ms
      const res = await POST(makeRequest({ matchId: MATCH_ID, answers }));
      expect(res.status).toBe(200);

      const update = findUpdatePayload(queries);
      // upperBound = max(5000, 30000) = 30000
      expect(update.player1_time_ms).toBe(30_000);
    } finally {
      vi.useRealTimers();
    }
  });

  // ── Tiebreakers ──────────────────────────────────────────────

  it("breaks score-tied match by faster total time (player1 wins)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: PLAYER1 } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        match: buildMatch({
          status: "player2_done",
          player2_score: 7,
          player2_time_ms: 10_000,
        }),
        questions: buildQuestions(0),
      })
    );

    const answers = ASSIGNED_IDS.map((id, i) => ({
      questionId: id,
      selectedOption: i < 7 ? 0 : 1,
      timeMs: 500, // 10 × 500 = 5000ms (lower-bound floor)
    }));
    const res = await POST(makeRequest({ matchId: MATCH_ID, answers }));
    expect(res.status).toBe(200);

    const update = findUpdatePayload(queries);
    expect(update.status).toBe("completed");
    expect(update.winner_id).toBe(PLAYER1);
  });

  it("falls back to player1 seed when scores AND times are equal", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: PLAYER1 } } });
    const queries = installSupabaseResponder(
      serviceFrom,
      responder({
        match: buildMatch({
          status: "player2_done",
          player2_score: 7,
          player2_time_ms: 5000,
        }),
        questions: buildQuestions(0),
      })
    );

    const answers = ASSIGNED_IDS.map((id, i) => ({
      questionId: id,
      selectedOption: i < 7 ? 0 : 1,
      timeMs: 500,
    }));
    const res = await POST(makeRequest({ matchId: MATCH_ID, answers }));
    expect(res.status).toBe(200);

    const update = findUpdatePayload(queries);
    expect(update.status).toBe("completed");
    expect(update.winner_id).toBe(PLAYER1);
  });
});
