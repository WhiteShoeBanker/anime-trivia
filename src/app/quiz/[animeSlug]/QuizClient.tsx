"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { AnimeSeries, Difficulty } from "@/types";
import { useQuizStore } from "@/stores/quizStore";
import { calculateMaxScore } from "@/lib/scoring";
import DifficultySelector from "@/components/DifficultySelector";
import ProgressBar from "@/components/ProgressBar";
import QuizCard from "@/components/QuizCard";
import ScoreDisplay from "@/components/ScoreDisplay";
import AdBanner from "@/components/AdBanner";

const FREE_DAILY_LIMIT = 10;
const QUIZ_LIMIT_KEY = "otaku_daily_quizzes";

const getQuizCountToday = (): number => {
  try {
    const stored = localStorage.getItem(QUIZ_LIMIT_KEY);
    if (!stored) return 0;
    const { date, count } = JSON.parse(stored);
    if (date !== new Date().toDateString()) return 0;
    return count;
  } catch {
    return 0;
  }
};

const incrementQuizCount = () => {
  const today = new Date().toDateString();
  const count = getQuizCountToday() + 1;
  localStorage.setItem(
    QUIZ_LIMIT_KEY,
    JSON.stringify({ date: today, count })
  );
};

interface QuizClientProps {
  anime: AnimeSeries;
}

const QuizClient = ({ anime }: QuizClientProps) => {
  const {
    quizStatus,
    difficulty,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    isRevealed,
    xpEarned,
    answers,
    timePerQuestion,
    startQuiz,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    resetQuiz,
  } = useQuizStore();

  const [localDifficulty, setLocalDifficulty] = useState<Difficulty>("medium");
  const [timeLeft, setTimeLeft] = useState(30);
  const [copied, setCopied] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const questionStartRef = useRef(Date.now());

  // Auth placeholders — will be connected when auth is implemented
  const isPro = false;
  const isJunior = false;

  // Timer countdown
  useEffect(() => {
    if (quizStatus !== "playing") return;

    setTimeLeft(timePerQuestion);
    questionStartRef.current = Date.now();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStatus, currentQuestionIndex, timePerQuestion]);

  // Auto-confirm on timeout
  useEffect(() => {
    if (timeLeft === 0 && quizStatus === "playing") {
      confirmAnswer(timePerQuestion * 1000);
    }
  }, [timeLeft, quizStatus, timePerQuestion, confirmAnswer]);

  // Auto-advance after reveal
  useEffect(() => {
    if (quizStatus !== "reviewing") return;

    const timeout = setTimeout(() => {
      nextQuestion();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [quizStatus, currentQuestionIndex, nextQuestion]);

  // Reset quiz state on unmount
  useEffect(() => {
    return () => resetQuiz();
  }, [resetQuiz]);

  const handleStartQuiz = async () => {
    if (!isPro && getQuizCountToday() >= FREE_DAILY_LIMIT) {
      setLimitReached(true);
      return;
    }
    incrementQuizCount();
    await startQuiz(anime.slug, localDifficulty);
  };

  const handleAnswer = (index: number) => {
    if (isRevealed) return;
    const timeMs = Date.now() - questionStartRef.current;
    selectAnswer(index);
    confirmAnswer(timeMs);
  };

  const handlePlayAgain = async () => {
    const currentDifficulty = difficulty;
    resetQuiz();
    await startQuiz(anime.slug, currentDifficulty);
  };

  const handleTryDifferentDifficulty = () => {
    resetQuiz();
  };

  const handleShareResults = async () => {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const text = `I scored ${correctCount}/${questions.length} on ${anime.title} (${difficulty}) in OtakuQuiz!`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  // STATE 1 - Pre-quiz setup
  if (quizStatus === "idle" || quizStatus === "loading") {
    const quizzesToday = typeof window !== "undefined" ? getQuizCountToday() : 0;
    const remaining = Math.max(FREE_DAILY_LIMIT - quizzesToday, 0);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {anime.title}
          </h1>
          {anime.description && (
            <p className="text-white/60 mb-8 text-lg">{anime.description}</p>
          )}

          <div className="mb-8 max-w-sm mx-auto">
            <h2 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-wider">
              Select Difficulty
            </h2>
            <DifficultySelector
              selected={localDifficulty}
              onSelect={setLocalDifficulty}
            />
          </div>

          {/* Daily quiz counter */}
          {!isPro && (
            <p className="text-xs text-white/40 mb-4">
              {remaining} of {FREE_DAILY_LIMIT} free quizzes remaining today
            </p>
          )}

          {/* Limit reached */}
          {limitReached ? (
            <div className="max-w-sm mx-auto">
              <div className="p-5 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
                <p className="font-semibold text-accent mb-1">Daily Limit Reached</p>
                <p className="text-sm text-white/60">
                  Free players get {FREE_DAILY_LIMIT} quizzes per day. Upgrade to Pro for unlimited quizzes!
                </p>
              </div>
              <Link
                href="/stats"
                className="w-full block px-6 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors text-center"
              >
                Upgrade to Pro
              </Link>
            </div>
          ) : (
            <button
              onClick={handleStartQuiz}
              disabled={quizStatus === "loading"}
              className="w-full max-w-sm mx-auto block px-6 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {quizStatus === "loading" ? "Loading..." : "Start Quiz"}
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // STATE 2 - During quiz
  if (quizStatus === "playing" || quizStatus === "reviewing") {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
          />
        </div>

        <QuizCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          isRevealed={isRevealed}
          selectedAnswer={selectedAnswer}
          timeLeft={timeLeft}
          totalTime={timePerQuestion}
        />
      </div>
    );
  }

  // STATE 3 - Completed
  if (quizStatus === "completed") {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const maxScore = calculateMaxScore(difficulty, questions.length);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-center mb-8">
            Quiz Complete!
          </h1>

          <ScoreDisplay
            score={xpEarned}
            maxScore={maxScore}
            correct={correctCount}
            total={questions.length}
            xpEarned={xpEarned}
          />

          {/* Ad banner — hidden for Pro and junior users */}
          <AdBanner isPro={isPro} isJunior={isJunior} />

          <div className="grid grid-cols-2 gap-3 mt-8 max-w-sm mx-auto">
            <button
              onClick={handlePlayAgain}
              className="px-4 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={handleTryDifferentDifficulty}
              className="px-4 py-3 text-sm font-semibold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Try Different Difficulty
            </button>
            <Link
              href="/browse"
              className="px-4 py-3 text-sm font-semibold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-center"
            >
              Browse More Anime
            </Link>
            <button
              onClick={handleShareResults}
              className="px-4 py-3 text-sm font-semibold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {copied ? "Copied!" : "Share Results"}
            </button>
          </div>

          {/* Sign up banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/30 text-center"
          >
            <p className="text-sm text-white/70">
              Sign up to save your score and compete on leaderboards!
            </p>
            <Link
              href="/auth"
              className="inline-block mt-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default QuizClient;
