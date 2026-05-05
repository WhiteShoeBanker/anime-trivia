import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Supabase
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

// Mock external lib dependencies used by quizStore
vi.mock("@/lib/scoring", () => ({
  calculateQuestionXP: vi.fn((difficulty: string, streak: number) => {
    const base: Record<string, number> = { easy: 10, medium: 25, hard: 50, impossible: 100 };
    return Math.round((base[difficulty] ?? 25) * Math.min(1 + streak * 0.1, 2.0));
  }),
}));

vi.mock("@/lib/league-xp", () => ({
  calculateLeagueXp: vi.fn().mockResolvedValue({
    leagueXp: 25,
    multiplier: 1.0,
    playCount: 1,
    nudge: false,
  }),
  updateLeagueMembershipXp: vi.fn().mockResolvedValue({
    previousRank: 1,
    newRank: 1,
  }),
}));

// trackQuizStarted / trackQuizCompleted / trackBadgeEarned are
// "use server" actions that dispatch to the analytics endpoint
// via global fetch. Mock them so they don't pollute mockFetch
// when the completeQuiz tests stub global fetch.
vi.mock("@/lib/track-actions", () => ({
  trackQuizStarted: vi.fn().mockResolvedValue(undefined),
  trackQuizCompleted: vi.fn().mockResolvedValue(undefined),
  trackBadgeEarned: vi.fn().mockResolvedValue(undefined),
}));

import { useQuizStore } from "./quizStore";

// Build a chainable Supabase mock
const chain = (resolvedData: unknown, error?: unknown) => {
  const builder: Record<string, unknown> = {};
  const proxy: unknown = new Proxy(builder, {
    get(_t, prop: string) {
      if (prop === "then") {
        return (resolve: (v: unknown) => void) =>
          resolve({ data: resolvedData, error: error ?? null });
      }
      if (!builder[prop]) {
        builder[prop] = vi.fn().mockReturnValue(proxy);
      }
      return builder[prop];
    },
  });
  return proxy;
};

const mockAnime = {
  id: "anime-1",
  title: "Naruto",
  slug: "naruto",
  description: null,
  image_url: null,
  genre: ["action"],
  total_questions: 50,
  is_active: true,
  content_rating: "E",
  created_at: "2024-01-01",
};

const mockQuestions = [
  {
    id: "q1",
    anime_id: "anime-1",
    question_text: "Who is the main character of Naruto?",
    question_type: "multiple_choice",
    difficulty: "easy",
    options: [
      { text: "Naruto", isCorrect: true },
      { text: "Sasuke", isCorrect: false },
      { text: "Sakura", isCorrect: false },
      { text: "Kakashi", isCorrect: false },
    ],
    explanation: null,
    image_url: null,
    kid_safe: true,
    created_at: "2024-01-01",
  },
  {
    id: "q2",
    anime_id: "anime-1",
    question_text: "What is Naruto's dream?",
    question_type: "multiple_choice",
    difficulty: "easy",
    options: [
      { text: "Become Hokage", isCorrect: true },
      { text: "Defeat Sasuke", isCorrect: false },
      { text: "Eat ramen", isCorrect: false },
      { text: "Learn jutsu", isCorrect: false },
    ],
    explanation: null,
    image_url: null,
    kid_safe: true,
    created_at: "2024-01-01",
  },
];

describe("quizStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuizStore.getState().resetQuiz();
  });

  // ── Initial State ──────────────────────────────────────────

  it("has correct initial state", () => {
    const state = useQuizStore.getState();
    expect(state.quizStatus).toBe("idle");
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.xpEarned).toBe(0);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.answers).toEqual([]);
    expect(state.questions).toEqual([]);
    expect(state.selectedAnswer).toBeNull();
    expect(state.isRevealed).toBe(false);
  });

  // ── startQuiz ──────────────────────────────────────────────

  it("loads anime and questions on startQuiz", async () => {
    let callNum = 0;
    mockFrom.mockImplementation((table: string) => {
      callNum++;
      if (table === "anime_series") {
        return chain(mockAnime);
      }
      if (table === "questions") {
        return chain(mockQuestions);
      }
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");

    const state = useQuizStore.getState();
    expect(state.quizStatus).toBe("playing");
    expect(state.currentAnime?.slug).toBe("naruto");
    expect(state.questions.length).toBe(2);
    expect(state.difficulty).toBe("easy");
    expect(state.timePerQuestion).toBe(30); // easy = 30s
  });

  it("sets status back to idle when anime not found", async () => {
    mockFrom.mockImplementation(() => {
      return chain(null, { code: "PGRST116" });
    });

    await useQuizStore.getState().startQuiz("nonexistent", "easy");

    expect(useQuizStore.getState().quizStatus).toBe("idle");
  });

  // ── selectAnswer ──────────────────────────────────────────

  it("sets selected answer when not revealed", async () => {
    // First set up playing state
    let callNum = 0;
    mockFrom.mockImplementation((table: string) => {
      callNum++;
      if (table === "anime_series") return chain(mockAnime);
      if (table === "questions") return chain(mockQuestions);
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");
    useQuizStore.getState().selectAnswer(2);

    expect(useQuizStore.getState().selectedAnswer).toBe(2);
  });

  it("does not change selection after reveal", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "anime_series") return chain(mockAnime);
      if (table === "questions") return chain(mockQuestions);
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");
    useQuizStore.getState().selectAnswer(0);
    useQuizStore.getState().confirmAnswer(5000);

    // Now try to change selection
    useQuizStore.getState().selectAnswer(1);
    expect(useQuizStore.getState().selectedAnswer).toBe(0); // unchanged
  });

  // ── confirmAnswer ─────────────────────────────────────────

  it("marks correct answer and increases score/streak", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "anime_series") return chain(mockAnime);
      if (table === "questions") return chain(mockQuestions);
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");

    // Select correct answer (index 0 is correct)
    useQuizStore.getState().selectAnswer(0);
    useQuizStore.getState().confirmAnswer(5000);

    const state = useQuizStore.getState();
    expect(state.score).toBe(1);
    expect(state.streak).toBe(1);
    expect(state.xpEarned).toBeGreaterThan(0);
    expect(state.isRevealed).toBe(true);
    expect(state.quizStatus).toBe("reviewing");
    expect(state.answers).toHaveLength(1);
    expect(state.answers[0].isCorrect).toBe(true);
  });

  it("marks incorrect answer and resets streak to 0", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "anime_series") return chain(mockAnime);
      if (table === "questions") return chain(mockQuestions);
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");

    // Select wrong answer (index 1 is incorrect)
    useQuizStore.getState().selectAnswer(1);
    useQuizStore.getState().confirmAnswer(5000);

    const state = useQuizStore.getState();
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.answers[0].isCorrect).toBe(false);
  });

  it("handles timeout (no selection) as incorrect", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "anime_series") return chain(mockAnime);
      if (table === "questions") return chain(mockQuestions);
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");

    // Don't select any answer — confirm with no selection (timeout)
    useQuizStore.getState().confirmAnswer(30000);

    const state = useQuizStore.getState();
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.answers[0].isCorrect).toBe(false);
    expect(state.answers[0].selectedOption).toBe(-1);
  });

  // ── nextQuestion ──────────────────────────────────────────

  it("advances to next question", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "anime_series") return chain(mockAnime);
      if (table === "questions") return chain(mockQuestions);
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");

    // Answer first question
    useQuizStore.getState().selectAnswer(0);
    useQuizStore.getState().confirmAnswer(5000);
    useQuizStore.getState().nextQuestion();

    const state = useQuizStore.getState();
    expect(state.currentQuestionIndex).toBe(1);
    expect(state.selectedAnswer).toBeNull();
    expect(state.isRevealed).toBe(false);
    expect(state.quizStatus).toBe("playing");
  });

  it("sets status to completed on last question", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "anime_series") return chain(mockAnime);
      if (table === "questions") return chain(mockQuestions);
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");

    // Answer all questions
    useQuizStore.getState().selectAnswer(0);
    useQuizStore.getState().confirmAnswer(5000);
    useQuizStore.getState().nextQuestion();

    useQuizStore.getState().selectAnswer(0);
    useQuizStore.getState().confirmAnswer(5000);
    useQuizStore.getState().nextQuestion();

    expect(useQuizStore.getState().quizStatus).toBe("completed");
  });

  // ── Full Quiz Flow ────────────────────────────────────────

  it("tracks full quiz flow: start → answer → next → complete", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "anime_series") return chain(mockAnime);
      if (table === "questions") return chain(mockQuestions);
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");

    // Q1: correct
    useQuizStore.getState().selectAnswer(0);
    useQuizStore.getState().confirmAnswer(3000);
    useQuizStore.getState().nextQuestion();

    // Q2: wrong
    useQuizStore.getState().selectAnswer(1);
    useQuizStore.getState().confirmAnswer(8000);
    useQuizStore.getState().nextQuestion();

    const state = useQuizStore.getState();
    expect(state.quizStatus).toBe("completed");
    expect(state.score).toBe(1); // 1 correct out of 2
    expect(state.answers).toHaveLength(2);
    expect(state.answers[0].isCorrect).toBe(true);
    expect(state.answers[1].isCorrect).toBe(false);
    expect(state.streak).toBe(0); // reset after wrong
  });

  // ── resetQuiz ─────────────────────────────────────────────

  it("resets all state to initial", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "anime_series") return chain(mockAnime);
      if (table === "questions") return chain(mockQuestions);
      return chain(null);
    });

    await useQuizStore.getState().startQuiz("naruto", "easy");
    useQuizStore.getState().selectAnswer(0);
    useQuizStore.getState().confirmAnswer(5000);

    useQuizStore.getState().resetQuiz();

    const state = useQuizStore.getState();
    expect(state.quizStatus).toBe("idle");
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.xpEarned).toBe(0);
    expect(state.questions).toEqual([]);
    expect(state.answers).toEqual([]);
    expect(state.currentAnime).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// completeQuiz — fetch-based flow (Session 4H, quiz-bug-N).
//
// completeQuiz no longer writes quiz_sessions / user_answers /
// user_profiles directly. It POSTs to /api/quiz/submit, lifts
// the server-trusted score / xpEarned into state, and calls
// /api/badges/check with the returned sessionId. These tests
// exercise the fetch contract and the state transitions; the
// route's own server-side logic is covered by
// src/app/api/quiz/submit/route.test.ts.
// ─────────────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const seedPlayingState = async () => {
  mockFrom.mockImplementation((table: string) => {
    if (table === "anime_series") return chain(mockAnime);
    if (table === "questions") return chain(mockQuestions);
    return chain(null);
  });
  await useQuizStore.getState().startQuiz("naruto", "easy");
  // Answer both questions so state.answers is populated.
  useQuizStore.getState().selectAnswer(0); // correct
  useQuizStore.getState().confirmAnswer(2000);
  useQuizStore.getState().nextQuestion();
  useQuizStore.getState().selectAnswer(1); // wrong
  useQuizStore.getState().confirmAnswer(3000);
  useQuizStore.getState().nextQuestion();
};

const jsonResponse = (
  body: unknown,
  init: { ok?: boolean; status?: number } = {}
) => ({
  ok: init.ok ?? true,
  status: init.status ?? 200,
  json: () => Promise.resolve(body),
});

describe("quizStore.completeQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuizStore.getState().resetQuiz();
    // Pin Math.random so the Fisher-Yates shuffle in
    // quizStore.startQuiz never swaps — questions stay in
    // input order and answer-ordering assertions below are
    // deterministic regardless of prior Math.random state.
    vi.spyOn(Math, "random").mockReturnValue(0.99);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts to /api/quiz/submit with body derived from local state", async () => {
    await seedPlayingState();

    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        sessionId: "session-1",
        score: 1,
        correctAnswers: 1,
        totalQuestions: 2,
        xpEarned: 15,
        timeTakenSeconds: 5,
      })
    );
    mockFetch.mockResolvedValueOnce(jsonResponse({ newBadges: [] }));

    await useQuizStore.getState().completeQuiz("user-a");

    const submitCall = mockFetch.mock.calls[0];
    expect(submitCall[0]).toBe("/api/quiz/submit");
    const init = submitCall[1] as { method: string; body: string };
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body) as {
      animeId: string;
      difficulty: string;
      answers: Array<{ questionId: string; selectedOption: number; timeMs: number }>;
    };
    expect(body.animeId).toBe(mockAnime.id);
    expect(body.difficulty).toBe("easy");
    expect(body.answers).toHaveLength(2);
    expect(body.answers[0]).toEqual({
      questionId: "q1",
      selectedOption: 0,
      timeMs: 2000,
    });
    expect(body.answers[1]).toEqual({
      questionId: "q2",
      selectedOption: 1,
      timeMs: 3000,
    });
  });

  it("returns early without /api/badges/check when /api/quiz/submit responds non-ok (rate limited)", async () => {
    await seedPlayingState();

    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        { error: "Daily limit reached", error_code: "rate_limited" },
        { ok: false, status: 429 }
      )
    );

    await useQuizStore.getState().completeQuiz("user-a");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/quiz/submit");
    // No /api/badges/check fetch.
    expect(
      mockFetch.mock.calls.some((c) => c[0] === "/api/badges/check")
    ).toBe(false);
    // newBadges stays empty.
    expect(useQuizStore.getState().newBadges).toEqual([]);
  });

  it("happy path: lifts server-trusted score/xpEarned into state and POSTs sessionId to /api/badges/check", async () => {
    await seedPlayingState();

    // Local state from confirmAnswer() will have score=1
    // (one correct, one wrong) and a small xpEarned. Server
    // returns DIFFERENT numbers — we assert the state lifts
    // the server values, not the local guesses.
    const SERVER_SCORE = 7;
    const SERVER_XP = 333;
    const SERVER_SESSION_ID = "session-server-trusted";

    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        sessionId: SERVER_SESSION_ID,
        score: SERVER_SCORE,
        correctAnswers: SERVER_SCORE,
        totalQuestions: 2,
        xpEarned: SERVER_XP,
        timeTakenSeconds: 5,
      })
    );
    mockFetch.mockResolvedValueOnce(jsonResponse({ newBadges: [] }));

    await useQuizStore.getState().completeQuiz("user-a");

    const state = useQuizStore.getState();
    expect(state.score).toBe(SERVER_SCORE);
    expect(state.xpEarned).toBe(SERVER_XP);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    const badgeCall = mockFetch.mock.calls[1];
    expect(badgeCall[0]).toBe("/api/badges/check");
    const badgeInit = badgeCall[1] as { method: string; body: string };
    expect(badgeInit.method).toBe("POST");
    expect(JSON.parse(badgeInit.body)).toEqual({
      kind: "quiz_session",
      id: SERVER_SESSION_ID,
    });
  });

  it("returns early without any fetch when no userId is provided", async () => {
    await seedPlayingState();

    await useQuizStore.getState().completeQuiz(undefined);

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
