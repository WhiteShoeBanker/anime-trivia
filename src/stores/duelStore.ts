import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { submitDuelResults } from "@/lib/duels";
import { calculateQuestionXP } from "@/lib/scoring";
import { trackDuelCompleted } from "@/lib/track-actions";
import type { Question, DuelMatch, Difficulty, DuelDifficulty } from "@/types";

interface DuelQuizAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeMs: number;
}

interface DuelQuizState {
  duel: DuelMatch | null;
  submittedDuel: DuelMatch | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: DuelQuizAnswer[];
  score: number;
  streak: number;
  xpEarned: number;
  timePerQuestion: number;
  quizStatus: "idle" | "loading" | "playing" | "reviewing" | "completed" | "submitted";
  selectedAnswer: number | null;
  isRevealed: boolean;
}

interface DuelQuizActions {
  startDuelQuiz: (duel: DuelMatch) => Promise<void>;
  selectAnswer: (optionIndex: number) => void;
  confirmAnswer: (timeMs: number) => void;
  nextQuestion: () => void;
  submitResults: (userId: string) => Promise<void>;
  resetQuiz: () => void;
}

const TIME_LIMITS: Record<string, number> = {
  easy: 30,
  medium: 20,
  hard: 15,
  impossible: 5,
  mixed: 20,
};

const getDifficultyForXP = (difficulty: DuelDifficulty): Difficulty => {
  if (difficulty === "mixed") return "medium";
  return difficulty;
};

const initialState: DuelQuizState = {
  duel: null,
  submittedDuel: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  streak: 0,
  xpEarned: 0,
  timePerQuestion: 20,
  quizStatus: "idle",
  selectedAnswer: null,
  isRevealed: false,
};

export const useDuelStore = create<DuelQuizState & DuelQuizActions>((set, get) => ({
  ...initialState,

  startDuelQuiz: async (duel) => {
    set({ quizStatus: "loading", duel });

    try {
      const supabase = createClient();

      const { data: fetchedQuestions, error } = await supabase
        .from("questions")
        .select("*")
        .in("id", duel.questions);

      if (error || !fetchedQuestions) {
        set({ quizStatus: "idle" });
        return;
      }

      // Reorder to match duel.questions array order so both players see identical sequence
      const questionMap = new Map(
        (fetchedQuestions as Question[]).map((q) => [q.id, q])
      );
      const questions: Question[] = [];
      for (const qId of duel.questions) {
        const q = questionMap.get(qId);
        if (q) questions.push(q);
      }

      if (questions.length === 0) {
        set({ quizStatus: "idle" });
        return;
      }

      const timePerQuestion = TIME_LIMITS[duel.difficulty] ?? 20;

      set({
        duel,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        xpEarned: 0,
        timePerQuestion,
        quizStatus: "playing",
        selectedAnswer: null,
        isRevealed: false,
        submittedDuel: null,
      });
    } catch {
      set({ quizStatus: "idle" });
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
      const answer: DuelQuizAnswer = {
        questionId: question.id,
        selectedOption: -1,
        isCorrect: false,
        timeMs,
      };
      set({
        isRevealed: true,
        quizStatus: "reviewing",
        streak: 0,
        answers: [...state.answers, answer],
      });
      return;
    }

    const isCorrect = question.options[selectedOption].isCorrect;
    const newStreak = isCorrect ? state.streak + 1 : 0;
    const difficulty = state.duel
      ? getDifficultyForXP(state.duel.difficulty)
      : "medium";
    const questionXP = isCorrect
      ? calculateQuestionXP(difficulty, state.streak, timeMs, state.timePerQuestion * 1000)
      : 0;

    const answer: DuelQuizAnswer = {
      questionId: question.id,
      selectedOption,
      isCorrect,
      timeMs,
    };

    set({
      isRevealed: true,
      quizStatus: "reviewing",
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
        quizStatus: "playing",
      });
    } else {
      set({ quizStatus: "completed" });
    }
  },

  submitResults: async (userId) => {
    const state = get();
    if (!state.duel) return;

    try {
      const totalTimeMs = state.answers.reduce((sum, a) => sum + a.timeMs, 0);
      const updated = await submitDuelResults(
        state.duel.id,
        userId,
        state.answers,
        totalTimeMs
      );

      set({ quizStatus: "submitted", submittedDuel: updated });

      if (updated && updated.status === "completed") {
        trackDuelCompleted(userId, {
          duel_id: updated.id,
          match_type: updated.match_type,
          winner_id: updated.winner_id,
          xp_earned: updated.challenger_id === userId
            ? updated.challenger_xp_earned
            : updated.opponent_xp_earned,
        }).catch(() => {});
      }
    } catch {
      // Submit failed — keep completed state
    }
  },

  resetQuiz: () => {
    set(initialState);
  },
}));
