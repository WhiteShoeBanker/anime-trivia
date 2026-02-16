import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { submitMatchScore } from "@/lib/grand-prix";
import { calculateQuestionXP } from "@/lib/scoring";
import type { Question, GrandPrixMatch } from "@/types";

interface GPQuizAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeMs: number;
}

interface GPQuizState {
  match: GrandPrixMatch | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: GPQuizAnswer[];
  score: number;
  streak: number;
  xpEarned: number;
  timePerQuestion: number;
  quizStatus: "idle" | "loading" | "playing" | "reviewing" | "completed" | "submitted";
  selectedAnswer: number | null;
  isRevealed: boolean;
  submittedMatch: GrandPrixMatch | null;
}

interface GPQuizActions {
  startMatchQuiz: (match: GrandPrixMatch) => Promise<void>;
  selectAnswer: (optionIndex: number) => void;
  confirmAnswer: (timeMs: number) => void;
  nextQuestion: () => void;
  submitResults: (userId: string) => Promise<void>;
  resetQuiz: () => void;
}

const initialState: GPQuizState = {
  match: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  streak: 0,
  xpEarned: 0,
  timePerQuestion: 15,
  quizStatus: "idle",
  selectedAnswer: null,
  isRevealed: false,
  submittedMatch: null,
};

export const useGrandPrixStore = create<GPQuizState & GPQuizActions>((set, get) => ({
  ...initialState,

  startMatchQuiz: async (match) => {
    set({ quizStatus: "loading", match });

    try {
      const supabase = createClient();

      if (!match.anime_id) {
        set({ quizStatus: "idle" });
        return;
      }

      const { data: allQuestions, error } = await supabase
        .from("questions")
        .select("*")
        .eq("anime_id", match.anime_id)
        .eq("difficulty", "hard");

      if (error || !allQuestions) {
        set({ quizStatus: "idle" });
        return;
      }

      // Fisher-Yates shuffle
      const questions = [...(allQuestions as Question[])];
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }

      const selected = questions.slice(0, 10);

      if (selected.length === 0) {
        set({ quizStatus: "idle" });
        return;
      }

      set({
        match,
        questions: selected,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        xpEarned: 0,
        timePerQuestion: 15,
        quizStatus: "playing",
        selectedAnswer: null,
        isRevealed: false,
        submittedMatch: null,
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
      const answer: GPQuizAnswer = {
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
    const questionXP = isCorrect
      ? calculateQuestionXP("hard", state.streak, timeMs, state.timePerQuestion * 1000)
      : 0;

    const answer: GPQuizAnswer = {
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
    if (!state.match) return;

    try {
      const totalTimeMs = state.answers.reduce((sum, a) => sum + a.timeMs, 0);
      const updated = await submitMatchScore(
        state.match.id,
        userId,
        state.score,
        totalTimeMs
      );

      set({ quizStatus: "submitted", submittedMatch: updated });
    } catch {
      // Submit failed — keep completed state
    }
  },

  resetQuiz: () => {
    set(initialState);
  },
}));
