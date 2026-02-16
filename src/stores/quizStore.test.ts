import { describe, it, expect, vi, beforeEach } from "vitest";

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

vi.mock("@/lib/badges", () => ({
  checkAndAwardBadges: vi.fn().mockResolvedValue([]),
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
