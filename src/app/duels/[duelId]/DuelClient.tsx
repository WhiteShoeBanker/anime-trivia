"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Swords, User, Clock, Shield } from "lucide-react";
import { useDuelStore } from "@/stores/duelStore";
import { createDuel } from "@/lib/duels";
import { createClient } from "@/lib/supabase/client";
import { checkAndAwardBadges } from "@/lib/badges";
import ProgressBar from "@/components/ProgressBar";
import QuizCard from "@/components/QuizCard";
import DuelResults from "@/components/DuelResults";
import ChallengeModal from "@/components/ChallengeModal";
import type { DuelMatch, DuelDifficulty, Badge } from "@/types";

interface DuelClientProps {
  duel: DuelMatch;
  userId: string;
  animeName: string;
  opponentName: string;
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: "Easy", color: "text-emerald-400 bg-emerald-500/20" },
  medium: { label: "Medium", color: "text-yellow-400 bg-yellow-500/20" },
  hard: { label: "Hard", color: "text-red-400 bg-red-500/20" },
  impossible: { label: "Impossible", color: "text-purple-400 bg-purple-500/20" },
  mixed: { label: "Mixed", color: "text-blue-400 bg-blue-500/20" },
};

const DuelClient = ({
  duel: initialDuel,
  userId,
  animeName,
  opponentName,
}: DuelClientProps) => {
  const router = useRouter();
  const {
    quizStatus,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    isRevealed,
    score,
    xpEarned,
    answers,
    timePerQuestion,
    submittedDuel,
    startDuelQuiz,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    submitResults,
    resetQuiz,
  } = useDuelStore();

  const [timeLeft, setTimeLeft] = useState(20);
  const [latestDuel, setLatestDuel] = useState<DuelMatch>(initialDuel);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const questionStartRef = useRef(Date.now());

  // Determine if user already played
  const isChallenger = initialDuel.challenger_id === userId;
  const alreadyPlayed = isChallenger
    ? initialDuel.challenger_completed_at !== null
    : initialDuel.opponent_completed_at !== null;

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

  // Auto-submit when quiz completes
  useEffect(() => {
    if (quizStatus === "completed") {
      submitResults(userId);
    }
  }, [quizStatus, userId, submitResults]);

  // Poll for duel status after submission
  const pollDuel = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("duel_matches")
      .select("*")
      .eq("id", initialDuel.id)
      .single();
    if (data) {
      setLatestDuel(data as DuelMatch);
      // Check for new badges when duel completes
      if (data.status === "completed" && newBadges.length === 0) {
        try {
          const awarded = await checkAndAwardBadges({
            userId,
            quizScore: score,
            quizTotal: initialDuel.question_count,
            answers: answers.map((a) => ({
              isCorrect: a.isCorrect,
              timeMs: a.timeMs,
            })),
            isDuel: true,
            duelOpponentId: isChallenger
              ? initialDuel.opponent_id ?? undefined
              : initialDuel.challenger_id,
          });
          if (awarded && awarded.length > 0) {
            setNewBadges(awarded);
          }
        } catch {
          // Badge check failed silently
        }
      }
    }
  }, [initialDuel.id, initialDuel.question_count, initialDuel.opponent_id, initialDuel.challenger_id, isChallenger, userId, score, answers, newBadges.length]);

  useEffect(() => {
    if (quizStatus !== "submitted") return;

    pollDuel();
    const interval = setInterval(pollDuel, 10000);
    return () => clearInterval(interval);
  }, [quizStatus, pollDuel]);

  // Reset on unmount
  useEffect(() => {
    return () => resetQuiz();
  }, [resetQuiz]);

  const handleAnswer = (index: number) => {
    if (isRevealed) return;
    const timeMs = Date.now() - questionStartRef.current;
    selectAnswer(index);
    confirmAnswer(timeMs);
  };

  const handleStartDuel = () => {
    startDuelQuiz(initialDuel);
  };

  const handleRematch = async () => {
    try {
      const opponentId = isChallenger
        ? initialDuel.opponent_id
        : initialDuel.challenger_id;
      const newDuel = await createDuel(userId, {
        match_type: initialDuel.match_type,
        anime_id: initialDuel.anime_id ?? undefined,
        difficulty: initialDuel.difficulty,
        question_count: initialDuel.question_count as 5 | 10,
        opponent_id: opponentId ?? undefined,
      });
      if (newDuel) {
        router.push(`/duels/${newDuel.id}`);
      }
    } catch {
      // Rematch creation failed
    }
  };

  const handleNewChallenge = () => {
    setChallengeOpen(true);
  };

  const handleSendChallenge = async (options: {
    anime_id: string | null;
    difficulty: DuelDifficulty;
    question_count: 5 | 10;
  }) => {
    try {
      const opponentId = isChallenger
        ? initialDuel.opponent_id
        : initialDuel.challenger_id;
      const newDuel = await createDuel(userId, {
        match_type: "friend_challenge",
        anime_id: options.anime_id ?? undefined,
        difficulty: options.difficulty,
        question_count: options.question_count,
        opponent_id: opponentId ?? undefined,
      });
      setChallengeOpen(false);
      if (newDuel) {
        router.push(`/duels/${newDuel.id}`);
      }
    } catch {
      setChallengeOpen(false);
    }
  };

  const diffInfo = DIFFICULTY_LABELS[initialDuel.difficulty] ?? DIFFICULTY_LABELS.medium;
  const duelNow = submittedDuel ?? latestDuel;

  // ── Already Played ────────────────────────────────────────────
  if (alreadyPlayed && quizStatus === "idle") {
    const isDuelCompleted = latestDuel.status === "completed";

    if (isDuelCompleted) {
      return (
        <>
          <DuelResults
            duel={latestDuel}
            userId={userId}
            opponentName={opponentName}
            animeName={animeName}
            myAnswers={
              ((isChallenger
                ? latestDuel.challenger_answers
                : latestDuel.opponent_answers) as { questionId: string; selectedOption: number; isCorrect: boolean; timeMs: number }[] | null) ?? []
            }
            xpEarned={
              isChallenger
                ? latestDuel.challenger_xp_earned
                : latestDuel.opponent_xp_earned
            }
            onRematch={handleRematch}
            onNewChallenge={handleNewChallenge}
            onBack={() => router.push("/duels")}
          />
          <ChallengeModal
            isOpen={challengeOpen}
            onClose={() => setChallengeOpen(false)}
            opponent={{
              id: (isChallenger ? initialDuel.opponent_id : initialDuel.challenger_id) ?? "",
              username: opponentName,
              display_name: opponentName,
            }}
            onSend={handleSendChallenge}
          />
        </>
      );
    }

    // Waiting for opponent
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Clock size={32} className="mx-auto text-yellow-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Score Submitted!</h1>
          <p className="text-white/50 mb-4">
            Your score:{" "}
            <strong className="text-primary">
              {isChallenger
                ? latestDuel.challenger_correct
                : latestDuel.opponent_correct}
              /{latestDuel.question_count}
            </strong>
          </p>
          <p className="text-sm text-white/30 mb-6">
            Waiting for {opponentName} to play their match...
          </p>
          <button
            onClick={() => router.push("/duels")}
            className="inline-block px-6 py-3 font-bold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Back to Duels
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Pre-Match ─────────────────────────────────────────────────
  if (quizStatus === "idle" || quizStatus === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Swords size={40} className="mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">1v1 Duel</h1>
          <p className="text-xs text-white/30 mb-6 capitalize">
            {initialDuel.match_type.replace("_", " ")}
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={20} className="text-primary" />
              </div>
              <p className="text-sm font-semibold">You</p>
            </div>
            <span className="text-white/30 font-bold">VS</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <User size={20} className="text-accent" />
              </div>
              <p className="text-sm font-semibold">{opponentName}</p>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-white/10 p-4 mb-6 max-w-xs mx-auto space-y-2">
            <div>
              <p className="text-xs text-white/40">Anime</p>
              <p className="font-semibold">{animeName}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Difficulty</p>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${diffInfo.color}`}
              >
                {diffInfo.label}
              </span>
            </div>
            <div>
              <p className="text-xs text-white/40">Questions</p>
              <p className="text-sm font-medium">{initialDuel.question_count}</p>
            </div>
          </div>

          <button
            onClick={handleStartDuel}
            disabled={quizStatus === "loading"}
            className="px-8 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {quizStatus === "loading" ? "Loading..." : "Start Duel"}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── During Quiz ───────────────────────────────────────────────
  if (quizStatus === "playing" || quizStatus === "reviewing") {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
            <Swords size={12} />
            DUEL vs {opponentName}
          </div>
        </div>
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

  // ── Submitted / Waiting ───────────────────────────────────────
  if (quizStatus === "completed" || quizStatus === "submitted") {
    const isDuelDone = duelNow.status === "completed";

    if (isDuelDone) {
      return (
        <>
          <DuelResults
            duel={duelNow}
            userId={userId}
            opponentName={opponentName}
            animeName={animeName}
            myAnswers={answers}
            xpEarned={xpEarned}
            newBadges={newBadges}
            onRematch={handleRematch}
            onNewChallenge={handleNewChallenge}
            onBack={() => router.push("/duels")}
          />
          <ChallengeModal
            isOpen={challengeOpen}
            onClose={() => setChallengeOpen(false)}
            opponent={{
              id: (isChallenger ? initialDuel.opponent_id : initialDuel.challenger_id) ?? "",
              username: opponentName,
              display_name: opponentName,
            }}
            onSend={handleSendChallenge}
          />
        </>
      );
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Clock size={32} className="mx-auto text-yellow-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Score Submitted!</h1>
          <p className="text-lg mb-2">
            You scored{" "}
            <span className="text-primary font-bold">{score}</span>/
            {questions.length}
          </p>
          <p className="text-sm text-white/30 mb-6">
            Waiting for {opponentName} to complete their quiz...
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-white/20 mb-6">
            <Shield size={12} />
            Auto-refreshing every 10s
          </div>
          <button
            onClick={() => router.push("/duels")}
            className="inline-block px-6 py-3 font-bold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Back to Duels
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default DuelClient;
