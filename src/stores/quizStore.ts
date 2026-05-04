import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { AnimeSeries, Question, Difficulty, AgeGroup, LeagueXpResult, Badge } from "@/types";
import { calculateQuestionXP } from "@/lib/scoring";
import { calculateLeagueXp, updateLeagueMembershipXp } from "@/lib/league-xp";
import { trackQuizStarted, trackQuizCompleted, trackBadgeEarned } from "@/lib/track-actions";

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
  newBadges: Badge[];
  // True once completeQuiz has begun submission for the current
  // session. Closes the double-fire window where React StrictMode
  // (dev) or any quizStatus oscillation would otherwise trigger
  // two /api/quiz/submit POSTs and produce duplicate quiz_sessions /
  // user_answers rows. Set synchronously before the await so
  // concurrent calls bail at the guard. Reset by resetQuiz.
  submitted: boolean;
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
  impossible: 5,
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
  newBadges: [],
  submitted: false,
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

      trackQuizStarted("anonymous", { anime_slug: animeSlug, difficulty }).catch(() => {});
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
    // Idempotency guard. /api/quiz/submit does not enforce
    // session-level uniqueness, so a double-fire (React
    // StrictMode in dev, fast-refresh, or any caller-side
    // race) would produce duplicate quiz_sessions and
    // user_answers rows. Synchronous set() before any await
    // closes the window.
    if (state.submitted) return;
    set({ submitted: true });

    try {
      // Server-trusted submission. Migration 026 dropped client
      // INSERT on quiz_sessions / user_answers and trigger-
      // protected user_profiles total_xp / rank, so /api/quiz/
      // submit is the only legitimate path. The route re-derives
      // score, correctness per answer, time-taken, and XP from
      // questions.options[].isCorrect; quiz_sessions and
      // user_answers rows are inserted server-side; total_xp and
      // rank are updated server-side. submit_quiz() daily-cap
      // backstop is invoked inside the route.
      const submitRes = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animeId: state.currentAnime.id,
          difficulty: state.difficulty,
          answers: state.answers.map((a) => ({
            questionId: a.questionId,
            selectedOption: a.selectedOption,
            timeMs: a.timeMs,
          })),
        }),
      });
      if (!submitRes.ok) return;

      const submitResult = (await submitRes.json()) as {
        sessionId: string;
        score: number;
        correctAnswers: number;
        totalQuestions: number;
        xpEarned: number;
        timeTakenSeconds: number;
      };

      // Replace the during-quiz client guesses with the server-
      // trusted numbers on the result screen.
      set({
        score: submitResult.score,
        xpEarned: submitResult.xpEarned,
      });

      trackQuizCompleted(userId, {
        anime_slug: state.currentAnime.slug,
        difficulty: state.difficulty,
        score: submitResult.score,
        total: submitResult.totalQuestions,
        xp_earned: submitResult.xpEarned,
      }).catch(() => {});

      // League XP with diminishing returns. Uses server-trusted
      // xpEarned. increment_weekly_anime_play (migration 022) is
      // SECURITY DEFINER so the per-anime play counter is also
      // server-authoritative.
      try {
        const leagueXpResult = await calculateLeagueXp(
          submitResult.xpEarned,
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

      // Badge checks via /api/badges/check — see badge-bug-2.
      try {
        const badgeRes = await fetch("/api/badges/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "quiz_session",
            id: submitResult.sessionId,
          }),
        });
        if (badgeRes.ok) {
          const { newBadges } = (await badgeRes.json()) as {
            newBadges: Badge[];
          };
          if (newBadges.length > 0) {
            set({ newBadges });
            for (const badge of newBadges) {
              trackBadgeEarned(userId, {
                badge_slug: badge.slug,
                badge_name: badge.name,
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Badge check failed — non-critical
      }
    } catch {
      // Silently fail - quiz results are still shown locally
    }
  },

  resetQuiz: () => {
    set(initialState);
  },
}));
