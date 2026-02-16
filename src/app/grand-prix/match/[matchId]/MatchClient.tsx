"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Swords, Trophy, Clock, User } from "lucide-react";
import { useGrandPrixStore } from "@/stores/grandPrixStore";
import { getMatchById } from "@/lib/grand-prix";
import ProgressBar from "@/components/ProgressBar";
import QuizCard from "@/components/QuizCard";
import type { GrandPrixMatch } from "@/types";

interface MatchClientProps {
  match: GrandPrixMatch;
  userId: string;
  animeName: string;
  opponentName: string;
}

const MatchClient = ({
  match: initialMatch,
  userId,
  animeName,
  opponentName,
}: MatchClientProps) => {
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
    submittedMatch,
    startMatchQuiz,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    submitResults,
    resetQuiz,
  } = useGrandPrixStore();

  const [timeLeft, setTimeLeft] = useState(15);
  const [latestMatch, setLatestMatch] = useState<GrandPrixMatch>(initialMatch);
  const questionStartRef = useRef(Date.now());

  // Check if user already played their part
  const isPlayer1 = initialMatch.player1_id === userId;
  const alreadyPlayed = isPlayer1
    ? initialMatch.status === "player1_done" ||
      initialMatch.status === "completed" ||
      initialMatch.status === "forfeit"
    : initialMatch.status === "player2_done" ||
      initialMatch.status === "completed" ||
      initialMatch.status === "forfeit";

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

  // Poll for opponent result after submission
  const pollMatch = useCallback(async () => {
    const updated = await getMatchById(initialMatch.id);
    if (updated) setLatestMatch(updated);
  }, [initialMatch.id]);

  useEffect(() => {
    if (quizStatus !== "submitted") return;

    pollMatch();
    const interval = setInterval(pollMatch, 10000);
    return () => clearInterval(interval);
  }, [quizStatus, pollMatch]);

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

  const handleStartMatch = () => {
    startMatchQuiz(initialMatch);
  };

  // ── Already Played ────────────────────────────────────────────
  if (alreadyPlayed) {
    const myScore = isPlayer1
      ? latestMatch.player1_score
      : latestMatch.player2_score;
    const theirScore = isPlayer1
      ? latestMatch.player2_score
      : latestMatch.player1_score;
    const isCompleted =
      latestMatch.status === "completed" || latestMatch.status === "forfeit";
    const iWon = latestMatch.winner_id === userId;

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isCompleted ? (
            <>
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                iWon ? "bg-success/20" : "bg-accent/20"
              }`}>
                <Trophy
                  size={28}
                  className={iWon ? "text-success" : "text-accent"}
                />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {iWon ? "Victory!" : "Defeated"}
              </h1>
              <p className="text-white/50 mb-6">
                {iWon
                  ? "You advance to the next round!"
                  : "Better luck next time, champion."}
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
                <div className="bg-surface rounded-xl border border-white/10 p-3">
                  <p className="text-xs text-white/40">Your Score</p>
                  <p className="text-xl font-bold text-primary">{myScore ?? "-"}</p>
                </div>
                <div className="bg-surface rounded-xl border border-white/10 p-3">
                  <p className="text-xs text-white/40">{opponentName}</p>
                  <p className="text-xl font-bold text-white/70">{theirScore ?? "-"}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <Clock size={32} className="mx-auto text-yellow-400 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Score Submitted!</h1>
              <p className="text-white/50 mb-4">
                Your score: <strong className="text-primary">{myScore}</strong>
              </p>
              <p className="text-sm text-white/30">
                Waiting for {opponentName} to play their match...
              </p>
            </>
          )}

          <Link
            href="/grand-prix"
            className="inline-block mt-6 px-6 py-3 font-bold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Back to Grand Prix
          </Link>
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
          <h1 className="text-2xl font-bold mb-2">Grand Prix Match</h1>
          <p className="text-sm text-white/40 mb-6">
            Round {initialMatch.round}, Match {initialMatch.match_number}
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

          <div className="bg-surface rounded-xl border border-white/10 p-4 mb-6 max-w-xs mx-auto">
            <p className="text-xs text-white/40 mb-1">Anime</p>
            <p className="font-semibold">{animeName}</p>
            <p className="text-xs text-white/40 mt-2">Difficulty</p>
            <p className="text-sm font-medium text-accent">Hard</p>
          </div>

          <button
            onClick={handleStartMatch}
            disabled={quizStatus === "loading"}
            className="px-8 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {quizStatus === "loading" ? "Loading..." : "Start Match"}
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
          <p className="text-xs text-yellow-400 font-semibold">
            Grand Prix — Round {initialMatch.round}
          </p>
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
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const matchNow = submittedMatch ?? latestMatch;
    const isMatchDone =
      matchNow.status === "completed" || matchNow.status === "forfeit";
    const iWon = matchNow.winner_id === userId;

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {isMatchDone ? (
            <>
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                iWon ? "bg-success/20" : "bg-accent/20"
              }`}>
                <Trophy
                  size={28}
                  className={iWon ? "text-success" : "text-accent"}
                />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {iWon ? "Victory!" : "Defeated"}
              </h1>
            </>
          ) : (
            <>
              <Clock size={32} className="mx-auto text-yellow-400 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Score Submitted!</h1>
            </>
          )}

          <p className="text-lg mb-6">
            You scored{" "}
            <span className="text-primary font-bold">{correctCount}</span>/
            {questions.length} ({xpEarned} XP)
          </p>

          {!isMatchDone && (
            <p className="text-sm text-white/30 mb-6">
              Waiting for {opponentName} to complete their quiz...
            </p>
          )}

          <Link
            href="/grand-prix"
            className="inline-block px-6 py-3 font-bold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Back to Grand Prix
          </Link>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default MatchClient;
