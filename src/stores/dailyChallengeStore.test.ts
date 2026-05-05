import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────
// Stub everything the store calls into so the tests are pure — the
// goal is to exercise XP accumulation and the handoff to
// saveDailyChallengeResult, not the downstream plumbing.

vi.mock("@/lib/daily-challenge", () => ({
  fetchDailyChallengeQuestions: vi.fn(),
}));

vi.mock("@/lib/track-actions", () => ({
  trackDailyChallengeCompleted: vi.fn().mockResolvedValue(undefined),
  trackBadgeEarned: vi.fn().mockResolvedValue(undefined),
}));

// Use the real calculateQuestionXP so we're testing the actual
// XP_MULTIPLIER round-trip against the production scoring formula.

import { useDailyChallengeStore } from "./dailyChallengeStore";
import { fetchDailyChallengeQuestions } from "@/lib/daily-challenge";
import { calculateQuestionXP } from "@/lib/scoring";
import type { Question } from "@/types";

// ── Fixtures ─────────────────────────────────────────────────

const makeQuestion = (id: string, difficulty: Question["difficulty"]): Question =>
  ({
    id,
    anime_id: `anime-${id}`,
    difficulty,
    text: `Q ${id}?`,
    options: [
      { text: "correct", isCorrect: true },
      { text: "wrong", isCorrect: false },
    ],
    kid_safe: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  }) as unknown as Question;

beforeEach(() => {
  vi.clearAllMocks();
  useDailyChallengeStore.getState().reset();
});

// ═══════════════════════════════════════════════════════════════
// Gap 3 — 1.5x XP multiplier round-trip
//
// XP_MULTIPLIER (src/stores/dailyChallengeStore.ts:43) is applied
// per question inside confirmAnswer:
//   questionXP = Math.round(baseXP * XP_MULTIPLIER)
// where baseXP = calculateQuestionXP(...). Tests verify:
//   1. correct answer awards round(baseXP * 1.5)
//   2. wrong answer awards 0 and resets streak
//   3. completeDailyChallenge passes accumulated xpEarned verbatim
//      (no double-multiplying at save time)
// ═══════════════════════════════════════════════════════════════

describe("dailyChallengeStore — XP 1.5x multiplier round-trip", () => {
  it("confirmAnswer: correct answer awards round(baseXP × 1.5) to xpEarned", async () => {
    const question = makeQuestion("q1", "easy");
    vi.mocked(fetchDailyChallengeQuestions).mockResolvedValueOnce([question]);

    const store = useDailyChallengeStore;
    await store.getState().startDailyChallenge("full");

    // Fast time (< 5000ms easy threshold) triggers 1.5x time bonus in the
    // scoring formula. streak starts at 0, so streakMultiplier = 1.0.
    // baseXP (easy, streak=0, 1000ms) = round(10 * 1.0 * 1.5) = 15
    // questionXP = round(15 * 1.5) = 23
    const fastTimeMs = 1000;
    store.getState().selectAnswer(0); // isCorrect=true
    store.getState().confirmAnswer(fastTimeMs);

    const expectedBaseXP = calculateQuestionXP("easy", 0, fastTimeMs, 30000);
    const expectedQuestionXP = Math.round(expectedBaseXP * 1.5);

    const state = store.getState();
    expect(state.xpEarned).toBe(expectedQuestionXP);
    expect(state.score).toBe(1);
    expect(state.streak).toBe(1);
  });

  it("confirmAnswer: wrong answer adds 0 xp and resets streak to 0", async () => {
    const question = makeQuestion("q1", "easy");
    vi.mocked(fetchDailyChallengeQuestions).mockResolvedValueOnce([question]);

    const store = useDailyChallengeStore;
    await store.getState().startDailyChallenge("full");

    // Seed the store with a non-zero streak and xpEarned to prove
    // the wrong answer doesn't reset them silently.
    store.setState({ streak: 3, xpEarned: 42 });

    store.getState().selectAnswer(1); // isCorrect=false
    store.getState().confirmAnswer(1000);

    const state = store.getState();
    expect(state.xpEarned).toBe(42); // unchanged — no XP added
    expect(state.streak).toBe(0); // reset
    expect(state.score).toBe(0); // not incremented
  });

});

// ═══════════════════════════════════════════════════════════════
// completeDailyChallenge — Session 4J caller migration
//
// Verifies the store now POSTs to /api/daily-challenge/submit
// (no body `difficulty` field), treats 409 as success (server
// row trusted either way), and silently fails on 500.
// ═══════════════════════════════════════════════════════════════

describe("dailyChallengeStore.completeDailyChallenge — server route caller", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    // Release the stubbed fetch so it doesn't leak across
    // test files (vitest doesn't auto-restore stubGlobal).
    vi.unstubAllGlobals();
  });

  const jsonResponse = (
    body: unknown,
    init: { ok?: boolean; status?: number } = {}
  ) => ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: () => Promise.resolve(body),
  });

  const seedCompletedState = async () => {
    const questions = [
      makeQuestion("q1", "easy"),
      makeQuestion("q2", "medium"),
    ];
    vi.mocked(fetchDailyChallengeQuestions).mockResolvedValueOnce(questions);
    const store = useDailyChallengeStore;
    await store.getState().startDailyChallenge("full");
    store.getState().selectAnswer(0);
    store.getState().confirmAnswer(1000);
    store.getState().nextQuestion();
    store.getState().selectAnswer(0);
    store.getState().confirmAnswer(2000);
  };

  it("POSTs /api/daily-challenge/submit with body shape derived from local state", async () => {
    await seedCompletedState();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        score: 2,
        correctAnswers: 2,
        totalQuestions: 2,
        xpEarned: 50,
        timeTakenSeconds: 3,
        streak: 1,
      })
    );
    fetchMock.mockResolvedValueOnce(jsonResponse({ newBadges: [] }));

    await useDailyChallengeStore.getState().completeDailyChallenge("user-1");

    const submitCall = fetchMock.mock.calls[0];
    expect(submitCall[0]).toBe("/api/daily-challenge/submit");
    const init = submitCall[1] as { method: string; body: string };
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body) as {
      animeId: string;
      answers: Array<{
        questionId: string;
        selectedOption: number;
        timeMs: number;
      }>;
    };
    // animeId comes from the first question; no `difficulty` field
    // on this body (asymmetric from /api/quiz/submit).
    expect(body.animeId).toBe("anime-q1");
    expect(body).not.toHaveProperty("difficulty");
    expect(body.answers).toHaveLength(2);
    expect(body.answers[0]).toMatchObject({
      questionId: "q1",
      selectedOption: 0,
    });
    expect(body.answers[1]).toMatchObject({
      questionId: "q2",
      selectedOption: 0,
    });
  });

  it("treats 409 already-played as success — still fires /api/badges/check", async () => {
    await seedCompletedState();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Already played today" }, { ok: false, status: 409 })
    );
    fetchMock.mockResolvedValueOnce(jsonResponse({ newBadges: [] }));

    await useDailyChallengeStore.getState().completeDailyChallenge("user-1");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/daily-challenge/submit");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/badges/check");
  });

  it("silently skips badge check when /api/daily-challenge/submit responds 500", async () => {
    await seedCompletedState();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "boom" }, { ok: false, status: 500 })
    );

    await useDailyChallengeStore.getState().completeDailyChallenge("user-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(
      fetchMock.mock.calls.some((c) => c[0] === "/api/badges/check")
    ).toBe(false);
  });

  it("returns early without fetching when there are no questions in state", async () => {
    // Fresh store, no startDailyChallenge call → questions array empty.
    useDailyChallengeStore.getState().reset();

    await useDailyChallengeStore.getState().completeDailyChallenge("user-1");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
