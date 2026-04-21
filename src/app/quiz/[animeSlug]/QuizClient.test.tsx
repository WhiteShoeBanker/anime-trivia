/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import QuizClient from "./QuizClient";
import type { AnimeSeries } from "@/types";

// ── Mocks ─────────────────────────────────────────────────────

// Capture every supabase.rpc(name, args) call so tests can assert
// gating behavior without a real database.
const rpcMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    rpc: (name: string, args: unknown) => rpcMock(name, args),
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
    }),
  }),
}));

// Spy: fail loudly if the quiz store actually tries to load questions
// when the gate refused. The store calls supabase.from(...) — the mock
// above returns an empty chain, but the assertion is "startQuiz never
// got called" because handleStartQuiz returns before invoking it.
const startQuizSpy = vi.fn();
vi.mock("@/stores/quizStore", () => ({
  useQuizStore: Object.assign(
    (selector?: (s: unknown) => unknown) => {
      const state = {
        quizStatus: "idle" as const,
        difficulty: "medium" as const,
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswer: null,
        isRevealed: false,
        xpEarned: 0,
        answers: [],
        timePerQuestion: 20,
        leagueResult: null,
        newBadges: [],
        startQuiz: startQuizSpy,
        selectAnswer: vi.fn(),
        confirmAnswer: vi.fn(),
        nextQuestion: vi.fn(),
        resetQuiz: vi.fn(),
      };
      return selector ? selector(state) : state;
    },
    { getState: () => ({ quizStatus: "idle" }) }
  ),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    profile: { subscription_tier: "free" },
    isLoading: false,
  }),
}));

vi.mock("@/app/actions", () => ({
  trackClientEvent: vi.fn(),
}));

// Stub UI children that pull in framer-motion / extra context the
// gating tests don't care about.
vi.mock("@/components/AdBanner", () => ({ default: () => null }));
vi.mock("@/components/AnimeDiversityTracker", () => ({ default: () => null }));
vi.mock("@/components/LeagueNudge", () => ({ default: () => null }));
vi.mock("@/components/BadgeCelebration", () => ({ default: () => null }));
vi.mock("@/components/DifficultySelector", () => ({ default: () => null }));
vi.mock("@/components/QuizCard", () => ({ default: () => null }));
vi.mock("@/components/ProgressBar", () => ({ default: () => null }));
vi.mock("@/components/ScoreDisplay", () => ({ default: () => null }));

// jsdom doesn't ship matchMedia. A few of the stubbed-out children
// would normally hit it; harmless no-op satisfies any survivors.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (() => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const HINT_KEY = "otaku_daily_quizzes";

const anime: AnimeSeries = {
  id: "anime-1",
  title: "Test Anime",
  slug: "test-anime",
  description: null,
  image_url: null,
  genre: [],
  total_questions: 10,
  is_active: true,
  content_rating: "T",
  created_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  rpcMock.mockReset();
  startQuizSpy.mockReset();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// Pull the "Start Quiz" button by its accessible name. The pre-quiz
// state shows "Start Quiz" as the only primary CTA.
const findStartButton = async () =>
  screen.findByRole("button", { name: /start quiz/i });

describe("QuizClient gating", () => {
  it("free user within limit can start: server RPC returns success", async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        success: true,
        tier: "free",
        count: 3,
        limit: 10,
        quizzes_remaining: 7,
      },
      error: null,
    });

    render(
      <QuizClient anime={anime} freeQuizLimit={10} userId="user-1" />
    );

    const button = await findStartButton();
    await act(async () => {
      button.click();
    });

    expect(rpcMock).toHaveBeenCalledWith("start_quiz", { p_anime_id: "anime-1" });
    expect(startQuizSpy).toHaveBeenCalledWith("test-anime", "medium", undefined);
  });

  it("server rate_limited blocks start AND prevents question fetch", async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        success: false,
        error_code: "rate_limited",
        tier: "free",
        limit: 10,
        count: 10,
      },
      error: null,
    });

    render(
      <QuizClient anime={anime} freeQuizLimit={10} userId="user-1" />
    );

    const button = await findStartButton();
    await act(async () => {
      button.click();
    });

    // Upgrade modal/CTA renders
    await waitFor(() =>
      expect(screen.getByText(/Daily Limit Reached/i)).toBeTruthy()
    );

    // Critical assertion: startQuiz (which fetches questions) was NEVER called.
    // This is what closes the original exploit — the rate-limit decision
    // happens server-side BEFORE the client ever loads question content.
    expect(startQuizSpy).not.toHaveBeenCalled();
  });

  it("localStorage tampering does NOT bypass server enforcement", async () => {
    // Attacker sets count=0 in devtools.
    localStorage.setItem(
      HINT_KEY,
      JSON.stringify({ date: new Date().toDateString(), count: 0 })
    );
    // Server still says rate_limited (the truth lives in user_profiles).
    rpcMock.mockResolvedValueOnce({
      data: {
        success: false,
        error_code: "rate_limited",
        tier: "free",
        limit: 10,
        count: 10,
      },
      error: null,
    });

    render(
      <QuizClient anime={anime} freeQuizLimit={10} userId="user-1" />
    );

    const button = await findStartButton();
    await act(async () => {
      button.click();
    });

    await waitFor(() =>
      expect(screen.getByText(/Daily Limit Reached/i)).toBeTruthy()
    );
    expect(startQuizSpy).not.toHaveBeenCalled();

    // The UX hint also reconciled to the server-known count, so the
    // user can no longer mislead themselves about their remaining slots.
    const stored = JSON.parse(localStorage.getItem(HINT_KEY) ?? "{}");
    expect(stored.count).toBe(10);
  });

  it("UX hint count is overwritten from server response after start", async () => {
    // Local hint says 2 used.
    localStorage.setItem(
      HINT_KEY,
      JSON.stringify({ date: new Date().toDateString(), count: 2 })
    );
    // But server actually has them at 7 (e.g., they played on another device).
    rpcMock.mockResolvedValueOnce({
      data: {
        success: true,
        tier: "free",
        count: 8, // server-incremented from 7 → 8
        limit: 10,
        quizzes_remaining: 2,
      },
      error: null,
    });

    render(
      <QuizClient anime={anime} freeQuizLimit={10} userId="user-1" />
    );

    const button = await findStartButton();
    await act(async () => {
      button.click();
    });

    const stored = JSON.parse(localStorage.getItem(HINT_KEY) ?? "{}");
    expect(stored.count).toBe(8);
  });

  it("RPC error fails closed (does not allow start)", async () => {
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { message: "network error" },
    });

    render(
      <QuizClient anime={anime} freeQuizLimit={10} userId="user-1" />
    );

    const button = await findStartButton();
    await act(async () => {
      button.click();
    });

    expect(startQuizSpy).not.toHaveBeenCalled();
  });
});

describe("QuizClient gating — Pro user", () => {
  beforeEach(() => {
    vi.doMock("@/contexts/AuthContext", () => ({
      useAuth: () => ({
        user: { id: "user-pro" },
        profile: { subscription_tier: "pro" },
        isLoading: false,
      }),
    }));
  });

  it("Pro user receives unlimited (no rate-limit UI)", async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        success: true,
        tier: "pro",
        count: 50,
        limit: null,
        quizzes_remaining: null,
      },
      error: null,
    });

    render(
      <QuizClient anime={anime} freeQuizLimit={10} userId="user-pro" />
    );

    const button = await findStartButton();
    await act(async () => {
      button.click();
    });

    expect(screen.queryByText(/Daily Limit Reached/i)).toBeNull();
    expect(startQuizSpy).toHaveBeenCalled();
  });
});
