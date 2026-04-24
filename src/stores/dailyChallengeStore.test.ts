import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────
// Stub everything the store calls into so the tests are pure — the
// goal is to exercise XP accumulation and the handoff to
// saveDailyChallengeResult, not the downstream plumbing.

vi.mock("@/lib/daily-challenge", () => ({
  fetchDailyChallengeQuestions: vi.fn(),
  saveDailyChallengeResult: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/league-xp", () => ({
  calculateLeagueXp: vi.fn().mockResolvedValue({
    leagueXp: 0,
    multiplier: 1.0,
    playCount: 1,
    nudge: false,
  }),
  updateLeagueMembershipXp: vi.fn().mockResolvedValue({
    previousRank: 1,
    newRank: 1,
  }),
}));

vi.mock("@/lib/badges", () => ({
  checkAndAwardBadges: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/track-actions", () => ({
  trackDailyChallengeCompleted: vi.fn().mockResolvedValue(undefined),
  trackBadgeEarned: vi.fn().mockResolvedValue(undefined),
}));

// Use the real calculateQuestionXP so we're testing the actual
// XP_MULTIPLIER round-trip against the production scoring formula.

import { useDailyChallengeStore } from "./dailyChallengeStore";
import {
  fetchDailyChallengeQuestions,
  saveDailyChallengeResult,
} from "@/lib/daily-challenge";
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

  it("completeDailyChallenge: passes accumulated xpEarned verbatim to saveDailyChallengeResult", async () => {
    const questions = [
      makeQuestion("q1", "easy"),
      makeQuestion("q2", "medium"),
    ];
    vi.mocked(fetchDailyChallengeQuestions).mockResolvedValueOnce(questions);

    const store = useDailyChallengeStore;
    await store.getState().startDailyChallenge("full");

    // Simulate two correct answers at fast time
    store.getState().selectAnswer(0);
    store.getState().confirmAnswer(1000);
    store.getState().nextQuestion();
    store.getState().selectAnswer(0);
    store.getState().confirmAnswer(1000);

    const accumulated = store.getState().xpEarned;
    expect(accumulated).toBeGreaterThan(0);

    await store.getState().completeDailyChallenge("user-1");

    expect(vi.mocked(saveDailyChallengeResult)).toHaveBeenCalledTimes(1);
    // Third arg is xpEarned; must equal the store's accumulated value.
    // If anyone accidentally multiplied by 1.5 again at save time,
    // this would fail.
    expect(vi.mocked(saveDailyChallengeResult)).toHaveBeenCalledWith(
      "user-1",
      expect.any(Number),
      accumulated
    );
  });
});
