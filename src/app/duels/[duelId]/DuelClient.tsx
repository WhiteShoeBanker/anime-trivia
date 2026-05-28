"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Swords, User, Clock, Shield,
  Medal, Star, Award, Gem,
} from "lucide-react";
import { useDuelStore } from "@/stores/duelStore";
import { createDuel } from "@/lib/duels";
import { getUserLeagueInfo } from "@/lib/league-xp";
import { createClient } from "@/lib/supabase/client";
import { trackBadgeEarned } from "@/lib/track-actions";
import ProgressBar from "@/components/ProgressBar";
import QuizCard from "@/components/QuizCard";
import DuelResults from "@/components/DuelResults";
import ChallengeModal from "@/components/ChallengeModal";
import type { DuelMatch, DuelDifficulty, Badge } from "@/types";
import { tierColors, difficultyLabels, type DifficultyTone } from "@/themes";
import { Pill, type PillTone } from "@/components/ui/Pill";

const LEAGUE_ICONS: Record<number, typeof Shield> = {
  1: Shield, 2: Medal, 3: Star, 4: Award, 5: Gem, 6: Swords,
};
const LEAGUE_COLORS: Record<number, string> = Object.fromEntries(
  tierColors.map((t) => [t.tier, t.color])
);

interface DuelClientProps {
  duel: DuelMatch;
  userId: string;
  animeName: string;
  opponentName: string;
}

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
  const [opponentTier, setOpponentTier] = useState<number | null>(null);
  // eslint-disable-next-line react-hooks/purity -- useRef initializer runs once at mount; capturing mount-time wall clock for question-start timestamp is intentional
  const questionStartRef = useRef(Date.now());

  // Determine if user already played
  const isChallenger = initialDuel.challenger_id === userId;
  const alreadyPlayed = isChallenger
    ? initialDuel.challenger_completed_at !== null
    : initialDuel.opponent_completed_at !== null;

  // Fetch opponent's league tier for badge display
  useEffect(() => {
    const oppId = isChallenger ? initialDuel.opponent_id : initialDuel.challenger_id;
    if (!oppId) return;
    getUserLeagueInfo(oppId)
      .then((info) => setOpponentTier(info?.league?.tier ?? null))
      .catch(() => {});
  }, [isChallenger, initialDuel.opponent_id, initialDuel.challenger_id]);

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
      // Check for new badges when duel completes — see badge-bug-2.
      if (data.status === "completed" && newBadges.length === 0) {
        try {
          const res = await fetch("/api/badges/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "duel_match", id: initialDuel.id }),
          });
          if (res.ok) {
            const { newBadges: awarded } = (await res.json()) as { newBadges: Badge[] };
            if (awarded.length > 0) {
              setNewBadges(awarded);
              // Analytics fire — preserves the per-badge tracking that
              // src/lib/duels.ts:submitDuelResults handled pre-Session-4I.
              for (const badge of awarded) {
                trackBadgeEarned(userId, {
                  badge_slug: badge.slug,
                  badge_name: badge.name,
                }).catch(() => {});
              }
            }
          }
        } catch {
          // Badge check failed silently
        }
      }
    }
  }, [initialDuel.id, newBadges.length, userId]);

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

  const difficultyKey = (initialDuel.difficulty as DifficultyTone) in difficultyLabels
    ? (initialDuel.difficulty as DifficultyTone)
    : ("medium" as DifficultyTone);
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
            defaults={{
              anime_id: initialDuel.anime_id ?? undefined,
              difficulty: initialDuel.difficulty,
              question_count: initialDuel.question_count as 5 | 10,
            }}
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
              <Pill
                tone={`difficulty-${difficultyKey}` as PillTone}
                size="md"
              >
                {difficultyLabels[difficultyKey]}
              </Pill>
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
        <div className="mb-2 flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
            <Swords size={12} />
            <span>DUEL vs</span>
            <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-[10px] font-bold">
              {opponentName.charAt(0).toUpperCase()}
            </div>
            <span>{opponentName}</span>
            {opponentTier && (() => {
              const LeagueIcon = LEAGUE_ICONS[opponentTier] ?? Shield;
              return (
                <LeagueIcon
                  size={12}
                  style={{ color: LEAGUE_COLORS[opponentTier] ?? tierColors[0].color }}
                />
              );
            })()}
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
            defaults={{
              anime_id: initialDuel.anime_id ?? undefined,
              difficulty: initialDuel.difficulty,
              question_count: initialDuel.question_count as 5 | 10,
            }}
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
