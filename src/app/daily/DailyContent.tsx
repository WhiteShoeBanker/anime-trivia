"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Zap, Trophy, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyChallengeStore } from "@/stores/dailyChallengeStore";
import { checkDailyChallengePlayed } from "@/lib/daily-challenge";
import QuizCard from "@/components/QuizCard";
import ProgressBar from "@/components/ProgressBar";
import ScoreDisplay from "@/components/ScoreDisplay";
import BadgeIcon from "@/components/BadgeIcon";
import { calculateMaxScore } from "@/lib/scoring";

const DailyContent = () => {
  const { user, profile, ageGroup, isLoading: authLoading } = useAuth();
  const {
    questions,
    currentQuestionIndex,
    score,
    xpEarned,
    status,
    selectedAnswer,
    isRevealed,
    newBadges,
    startDailyChallenge,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    completeDailyChallenge,
    reset,
  } = useDailyChallengeStore();

  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check if user already played today
  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    const check = async () => {
      const result = await checkDailyChallengePlayed(user.id);
      setAlreadyPlayed(result.played);
      setPreviousScore(result.score);
      setChecking(false);
    };
    check();
  }, [user]);

  // Timer logic
  const currentQuestion = questions[currentQuestionIndex];
  const TIME_LIMITS: Record<string, number> = {
    easy: 30,
    medium: 20,
    hard: 15,
    impossible: 5,
  };
  const totalTime = currentQuestion ? (TIME_LIMITS[currentQuestion.difficulty] ?? 20) : 20;

  useEffect(() => {
    if (status === "playing" && currentQuestion) {
      setTimeLeft(totalTime);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            const elapsed = Date.now() - startTimeRef.current;
            confirmAnswer(elapsed);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [status, currentQuestionIndex, currentQuestion, totalTime, confirmAnswer]);

  // Stop timer on reveal
  useEffect(() => {
    if (isRevealed && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [isRevealed]);

  // Complete challenge when status becomes completed
  useEffect(() => {
    if (status === "completed" && user) {
      completeDailyChallenge(user.id);
    }
  }, [status, user, completeDailyChallenge]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Instant answer: select + confirm in one tap (matches regular quiz flow)
  const handleAnswer = useCallback(
    (index: number) => {
      if (isRevealed) return;
      const timeMs = Date.now() - startTimeRef.current;
      selectAnswer(index);
      confirmAnswer(timeMs);
    },
    [isRevealed, selectAnswer, confirmAnswer]
  );

  // Auto-advance to next question after 2s feedback pause
  useEffect(() => {
    if (status !== "reviewing") return;

    const timeout = setTimeout(() => {
      nextQuestion();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [status, currentQuestionIndex, nextQuestion]);

  // Countdown until midnight
  const getCountdown = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Calendar size={48} className="mx-auto text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Daily Challenge</h1>
        <p className="text-white/50 mb-6">
          Sign in to play today&apos;s daily challenge and earn 1.5x XP!
        </p>
        <Link
          href="/auth"
          className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
        >
          Sign In to Play
        </Link>
      </div>
    );
  }

  // Already played today
  if (alreadyPlayed && status !== "playing" && status !== "reviewing" && status !== "completed") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle size={48} className="mx-auto text-success mb-4" />
        <h1 className="text-2xl font-bold mb-2">Challenge Complete!</h1>
        <p className="text-white/50 mb-2">
          You scored <span className="text-primary font-bold">{previousScore}/10</span> today.
        </p>
        <div className="flex items-center justify-center gap-2 text-white/40 text-sm mb-6">
          <Clock size={14} />
          <span>Next challenge in {getCountdown()}</span>
        </div>
        <Link
          href="/browse"
          className="inline-block px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
        >
          Browse More Quizzes
        </Link>
      </div>
    );
  }

  // Ready to start (intro)
  if (status === "idle" || status === "loading") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Calendar size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Daily Challenge</h1>
          <p className="text-white/50 mb-6">
            10 questions across multiple anime. Mixed difficulty.
          </p>

          <div className="bg-surface rounded-xl border border-white/10 p-4 mb-6 inline-flex items-center gap-3">
            <Zap size={20} className="text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">
              1.5x XP Bonus!
            </span>
          </div>

          <div className="space-y-3 text-sm text-white/40 mb-8">
            <p>One attempt per day</p>
            <p>Questions from different anime series</p>
            <p>Easy, medium & hard mixed together</p>
          </div>

          <button
            onClick={() => startDailyChallenge(ageGroup)}
            disabled={status === "loading"}
            className="px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              "Start Challenge"
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  // Playing / Reviewing
  if ((status === "playing" || status === "reviewing") && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">Daily Challenge</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold">
            <Zap size={14} />
            1.5x XP
          </div>
        </div>

        <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />

        <div className="mt-6">
          <QuizCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            isRevealed={isRevealed}
            selectedAnswer={selectedAnswer}
            timeLeft={timeLeft}
            totalTime={totalTime}
          />
        </div>
      </div>
    );
  }

  // Completed
  if (status === "completed") {
    const maxScore = questions.reduce((sum, q) => {
      return sum + calculateMaxScore(q.difficulty, 1);
    }, 0);

    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy size={24} className="text-primary" />
            <h1 className="text-2xl font-bold">Daily Challenge Complete!</h1>
          </div>

          <div className="bg-surface rounded-xl border border-white/10 p-2 mb-4 inline-flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400">
              1.5x XP Bonus Applied
            </span>
          </div>

          <div className="mb-8">
            <ScoreDisplay
              score={xpEarned}
              maxScore={Math.round(maxScore * 1.5)}
              correct={score}
              total={questions.length}
              xpEarned={xpEarned}
            />
          </div>

          {/* New badges */}
          {newBadges.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-white/50 mb-3">
                Badges Earned!
              </h3>
              <div className="flex justify-center gap-3 flex-wrap">
                {newBadges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center gap-1">
                    <BadgeIcon
                      iconName={badge.icon_name}
                      iconColor={badge.icon_color}
                      rarity={badge.rarity}
                      size="lg"
                      earned
                    />
                    <span className="text-xs text-white/60">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-white/40 text-sm mb-6">
            <Clock size={14} />
            <span>Next challenge in {getCountdown()}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/browse"
              className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
            >
              Browse More Quizzes
            </Link>
            <Link
              href="/profile"
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default DailyContent;
