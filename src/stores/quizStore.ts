import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { AnimeSeries, Question, Difficulty, AgeGroup, LeagueXpResult } from "@/types";
import { calculateQuestionXP } from "@/lib/scoring";
import { calculateLeagueXp, updateLeagueMembershipXp } from "@/lib/league-xp";

interface QuizAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeMs: number;
}

interface LeagueResultInfo {
  leagueXp: number;
  multiplier: number;
  playCount: number;
  nudge: boolean;
  previousRank: number | null;
  newRank: number | null;
}

interface QuizState {
  currentAnime: AnimeSeries | null;
  difficulty: Difficulty;
  questions: Question[];
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  score: number;
  streak: number;
  xpEarned: number;
  timePerQuestion: number;
  quizStatus: "idle" | "loading" | "playing" | "reviewing" | "completed";
  selectedAnswer: number | null;
  isRevealed: boolean;
  leagueResult: LeagueResultInfo | null;
}

interface QuizActions {
  startQuiz: (animeSlug: string, difficulty: Difficulty, ageGroup?: AgeGroup) => Promise<void>;
  selectAnswer: (optionIndex: number) => void;
  confirmAnswer: (timeMs: number) => void;
  nextQuestion: () => void;
  completeQuiz: (userId?: string) => Promise<void>;
  resetQuiz: () => void;
}

const TIME_LIMITS: Record<Difficulty, number> = {
  easy: 30,
  medium: 20,
  hard: 15,
};

const initialState: QuizState = {
  currentAnime: null,
  difficulty: "medium",
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
  leagueResult: null,
};

export const useQuizStore = create<QuizState & QuizActions>((set, get) => ({
  ...initialState,

  startQuiz: async (animeSlug, difficulty, ageGroup) => {
    set({ quizStatus: "loading", difficulty });

    try {
      const supabase = createClient();

      const { data: anime, error: animeError } = await supabase
        .from("anime_series")
        .select("*")
        .eq("slug", animeSlug)
        .single();

      if (animeError || !anime) {
        set({ quizStatus: "idle" });
        return;
      }

      let questionsQuery = supabase
        .from("questions")
        .select("*")
        .eq("anime_id", anime.id)
        .eq("difficulty", difficulty);

      if (ageGroup === "junior") {
        questionsQuery = questionsQuery.eq("kid_safe", true);
      }

      const { data: allQuestions, error: questionsError } = await questionsQuery;

      if (questionsError) {
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
        currentAnime: anime as AnimeSeries,
        difficulty,
        questions: selected,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        xpEarned: 0,
        timePerQuestion: TIME_LIMITS[difficulty],
        quizStatus: "playing",
        selectedAnswer: null,
        isRevealed: false,
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
      const answer: QuizAnswer = {
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
      ? calculateQuestionXP(
          state.difficulty,
          state.streak,
          timeMs,
          state.timePerQuestion * 1000
        )
      : 0;

    const answer: QuizAnswer = {
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

  completeQuiz: async (userId) => {
    if (!userId) return;

    const state = get();
    if (!state.currentAnime) return;

    try {
      const supabase = createClient();

      const totalTimeMs = state.answers.reduce((sum, a) => sum + a.timeMs, 0);

      const { data: session, error: sessionError } = await supabase
        .from("quiz_sessions")
        .insert({
          user_id: userId,
          anime_id: state.currentAnime.id,
          difficulty: state.difficulty,
          score: state.score,
          total_questions: state.questions.length,
          correct_answers: state.score,
          time_taken_seconds: Math.round(totalTimeMs / 1000),
          xp_earned: state.xpEarned,
        })
        .select()
        .single();

      if (sessionError || !session) return;

      const userAnswers = state.answers.map((a) => ({
        session_id: session.id,
        question_id: a.questionId,
        selected_option: a.selectedOption === -1 ? null : a.selectedOption,
        is_correct: a.isCorrect,
        time_taken_ms: a.timeMs,
      }));

      await supabase.from("user_answers").insert(userAnswers);

      // Update user XP and rank
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("total_xp")
        .eq("id", userId)
        .single();

      if (profile) {
        const newXP =
          (profile as { total_xp: number }).total_xp + state.xpEarned;

        const rankThresholds: [number, string][] = [
          [25000, "Hokage"],
          [10000, "Kage"],
          [5000, "ANBU"],
          [2000, "Jonin"],
          [500, "Chunin"],
          [0, "Genin"],
        ];

        let rank = "Genin";
        for (const [threshold, rankName] of rankThresholds) {
          if (newXP >= threshold) {
            rank = rankName;
            break;
          }
        }

        await supabase
          .from("user_profiles")
          .update({
            total_xp: newXP,
            rank,
            last_played_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }

      // League XP with diminishing returns
      try {
        const leagueXpResult = await calculateLeagueXp(
          state.xpEarned,
          state.currentAnime.id,
          userId
        );

        const rankChange = await updateLeagueMembershipXp(
          userId,
          leagueXpResult.leagueXp,
          state.currentAnime.id
        );

        set({
          leagueResult: {
            leagueXp: leagueXpResult.leagueXp,
            multiplier: leagueXpResult.multiplier,
            playCount: leagueXpResult.playCount,
            nudge: leagueXpResult.nudge,
            previousRank: rankChange?.previousRank ?? null,
            newRank: rankChange?.newRank ?? null,
          },
        });
      } catch {
        // League XP calculation failed — non-critical
      }
    } catch {
      // Silently fail - quiz results are still shown locally
    }
  },

  resetQuiz: () => {
    set(initialState);
  },
}));
