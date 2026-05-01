import { create } from "zustand";
import type { Question, AgeGroup, Badge } from "@/types";
import { calculateQuestionXP } from "@/lib/scoring";
import {
  fetchDailyChallengeQuestions,
  saveDailyChallengeResult,
} from "@/lib/daily-challenge";
import { calculateLeagueXp, updateLeagueMembershipXp } from "@/lib/league-xp";
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

  // TODO(daily-bug-N) [HIGH, competitive integrity]:
  // The daily challenge result row (user_profiles.daily_challenge_*
  // columns) is written from the browser via the anon Supabase
  // client. A user can fabricate a daily_challenge_score=10 update
  // from devtools and then call /api/badges/check, which trusts the
  // row as authoritative and awards daily-streak / volume badges
  // based on the fabricated data. badge-bug-2 (Session 4G) closed
  // the direct-trust attack but does not close the row-fabrication
  // attack for context-driven badges. Full mitigation requires
  // moving daily submission to a server route with server-derived
  // score (analogous to gp-bug-5 / submit-score for Grand Prix).
  // Deferred to Session 4J.
  completeDailyChallenge: async (userId) => {
    const state = get();
    try {
      await saveDailyChallengeResult(userId, state.score, state.xpEarned);

      trackDailyChallengeCompleted(userId, {
        score: state.score,
        total: state.questions.length,
        xp_earned: state.xpEarned,
      }).catch(() => {});

      // League XP — pick the first question's anime for tracking
      try {
        if (state.questions.length > 0) {
          const animeId = state.questions[0].anime_id;
          const leagueXpResult = await calculateLeagueXp(
            state.xpEarned,
            animeId,
            userId
          );
          await updateLeagueMembershipXp(
            userId,
            leagueXpResult.leagueXp,
            animeId
          );
        }
      } catch {
        // League XP failed — non-critical
      }

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
    } catch {
      // Save failed — results still shown locally
    }
  },

  reset: () => {
    set(initialState);
  },
}));
