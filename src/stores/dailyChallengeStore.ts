import { create } from "zustand";
import type { Question, AgeGroup, Badge } from "@/types";
import { calculateQuestionXP } from "@/lib/scoring";
import { fetchDailyChallengeQuestions } from "@/lib/daily-challenge";
import { trackDailyChallengeCompleted, trackBadgeEarned } from "@/lib/track-actions";

interface DailyAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeMs: number;
}

type DailyStatus = "idle" | "loading" | "playing" | "reviewing" | "completed";

interface DailyChallengeState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: DailyAnswer[];
  score: number;
  streak: number;
  xpEarned: number;
  status: DailyStatus;
  selectedAnswer: number | null;
  isRevealed: boolean;
  newBadges: Badge[];
}

interface DailyChallengeActions {
  startDailyChallenge: (ageGroup?: AgeGroup) => Promise<void>;
  selectAnswer: (optionIndex: number) => void;
  confirmAnswer: (timeMs: number) => void;
  nextQuestion: () => void;
  completeDailyChallenge: (userId: string) => Promise<void>;
  reset: () => void;
}

const XP_MULTIPLIER = 1.5;

const TIME_LIMITS: Record<string, number> = {
  easy: 30,
  medium: 20,
  hard: 15,
  impossible: 5,
};

const initialState: DailyChallengeState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  streak: 0,
  xpEarned: 0,
  status: "idle",
  selectedAnswer: null,
  isRevealed: false,
  newBadges: [],
};

export const useDailyChallengeStore = create<
  DailyChallengeState & DailyChallengeActions
>((set, get) => ({
  ...initialState,

  startDailyChallenge: async (ageGroup) => {
    set({ status: "loading" });
    try {
      const questions = await fetchDailyChallengeQuestions(ageGroup);
      if (questions.length === 0) {
        set({ status: "idle" });
        return;
      }
      set({
        questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        xpEarned: 0,
        status: "playing",
        selectedAnswer: null,
        isRevealed: false,
        newBadges: [],
      });
    } catch {
      set({ status: "idle" });
    }
  },

  selectAnswer: (optionIndex) => {
    if (get().isRevealed) return;
    set({ selectedAnswer: optionIndex });
  },

  confirmAnswer: (timeMs) => {
    const state = get();
    if (state.isRevealed) return;

    const question = state.questions[state.currentQuestionIndex];
    const selectedOption = state.selectedAnswer;

    if (selectedOption === null) {
      const answer: DailyAnswer = {
        questionId: question.id,
        selectedOption: -1,
        isCorrect: false,
        timeMs,
      };
      set({
        isRevealed: true,
        status: "reviewing",
        streak: 0,
        answers: [...state.answers, answer],
      });
      return;
    }

    const isCorrect = question.options[selectedOption].isCorrect;
    const newStreak = isCorrect ? state.streak + 1 : 0;
    const timeLimit = TIME_LIMITS[question.difficulty] ?? 20;
    const baseXP = isCorrect
      ? calculateQuestionXP(question.difficulty, state.streak, timeMs, timeLimit * 1000)
      : 0;
    const questionXP = Math.round(baseXP * XP_MULTIPLIER);

    const answer: DailyAnswer = {
      questionId: question.id,
      selectedOption,
      isCorrect,
      timeMs,
    };

    set({
      isRevealed: true,
      status: "reviewing",
      selectedAnswer: selectedOption,
      streak: newStreak,
      score: state.score + (isCorrect ? 1 : 0),
      xpEarned: state.xpEarned + questionXP,
      answers: [...state.answers, answer],
    });
  },

  nextQuestion: () => {
    const state = get();
    const nextIndex = state.currentQuestionIndex + 1;

    if (nextIndex < state.questions.length) {
      set({
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        isRevealed: false,
        status: "playing",
      });
    } else {
      set({ status: "completed" });
    }
  },

  // Daily-challenge submission goes through /api/daily-challenge/submit
  // (Session 4J, daily-bug-N fix). The route re-derives score / XP from
  // the questions answer key, writes the daily_challenge_* columns and
  // total_xp / rank under service-role (bypassing the migration-028
  // and 026 triggers), and inlines the league-XP increment that the
  // pre-migration path called via calculateLeagueXp /
  // updateLeagueMembershipXp. The store's local score / xpEarned are
  // kept for UI display — the response is consulted only to decide
  // whether to fire the downstream /api/badges/check.
  completeDailyChallenge: async (userId) => {
    const state = get();
    if (state.questions.length === 0) return;

    let submitOk = false;
    try {
      const res = await fetch("/api/daily-challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animeId: state.questions[0].anime_id,
          answers: state.answers.map((a) => ({
            questionId: a.questionId,
            selectedOption: a.selectedOption,
            timeMs: a.timeMs,
          })),
        }),
      });
      // 200 OK and 409 (already played) both mean "row is server-trusted
      // for today" — fire the badge check downstream in either case.
      // Other non-OK responses are silent failures (results still shown
      // locally), matching the pre-migration save-fail behavior.
      submitOk = res.ok || res.status === 409;
    } catch {
      // Network failure — results still shown locally
    }

    if (!submitOk) return;

    trackDailyChallengeCompleted(userId, {
      score: state.score,
      total: state.questions.length,
      xp_earned: state.xpEarned,
    }).catch(() => {});

    // Badge checks via /api/badges/check — see badge-bug-2.
    try {
      const res = await fetch("/api/badges/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "daily_challenge" }),
      });
      if (res.ok) {
        const { newBadges } = (await res.json()) as { newBadges: Badge[] };
        if (newBadges.length > 0) {
          set({ newBadges });
          for (const badge of newBadges) {
            trackBadgeEarned(userId, { badge_slug: badge.slug, badge_name: badge.name }).catch(() => {});
          }
        }
      }
    } catch {
      // Badge check failed — non-critical
    }
  },

  reset: () => {
    set(initialState);
  },
}));
