"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Swords,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  X as XIcon,
  Zap,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import BadgeCelebration from "@/components/BadgeCelebration";
import type { DuelMatch, Badge } from "@/types";

interface DuelAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeMs: number;
}

interface DuelResultsProps {
  duel: DuelMatch;
  userId: string;
  opponentName: string;
  animeName: string;
  myAnswers: DuelAnswer[];
  xpEarned: number;
  newBadges?: Badge[];
  onRematch: () => void;
  onNewChallenge: () => void;
  onBack: () => void;
}

const formatTime = (ms: number): string => {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const DuelResults = ({
  duel,
  userId,
  opponentName,
  animeName,
  myAnswers,
  xpEarned,
  newBadges,
  onRematch,
  onNewChallenge,
  onBack,
}: DuelResultsProps) => {
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [showBadges, setShowBadges] = useState(
    (newBadges?.length ?? 0) > 0
  );

  const isChallenger = duel.challenger_id === userId;
  const myScore = isChallenger ? duel.challenger_score : duel.opponent_score;
  const theirScore = isChallenger ? duel.opponent_score : duel.challenger_score;
  const myCorrect = isChallenger ? duel.challenger_correct : duel.opponent_correct;
  const theirCorrect = isChallenger ? duel.opponent_correct : duel.challenger_correct;
  const myTimeMs = isChallenger ? duel.challenger_time_ms : duel.opponent_time_ms;
  const theirTimeMs = isChallenger ? duel.opponent_time_ms : duel.challenger_time_ms;
  const theirAnswers = (
    isChallenger ? duel.opponent_answers : duel.challenger_answers
  ) as DuelAnswer[] | null;

  const iWon = duel.winner_id === userId;
  const isDraw = duel.winner_id === null;
  const iLost = !iWon && !isDraw;

  const resultText = iWon ? "VICTORY!" : isDraw ? "DRAW" : "DEFEAT";
  const resultColor = iWon
    ? "text-success"
    : isDraw
      ? "text-yellow-400"
      : "text-accent";
  const resultBg = iWon
    ? "from-success/20"
    : isDraw
      ? "from-yellow-400/20"
      : "from-accent/20";

  const maxScore = Math.max(myScore ?? 0, theirScore ?? 0, 1);
  const myBarWidth = ((myScore ?? 0) / maxScore) * 100;
  const theirBarWidth = ((theirScore ?? 0) / maxScore) * 100;

  return (
    <>
      {showBadges && newBadges && newBadges.length > 0 && (
        <BadgeCelebration
          badges={newBadges}
          onComplete={() => setShowBadges(false)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Result banner */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`text-center py-8 rounded-2xl bg-gradient-to-b ${resultBg} to-transparent`}
        >
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            {iWon ? (
              <Trophy size={48} className="mx-auto text-success mb-3" />
            ) : isDraw ? (
              <Swords size={48} className="mx-auto text-yellow-400 mb-3" />
            ) : (
              <Swords size={48} className="mx-auto text-accent mb-3" />
            )}
          </motion.div>
          <h1 className={`text-3xl font-extrabold ${resultColor}`}>
            {resultText}
          </h1>
          <p className="text-sm text-white/40 mt-1">{animeName}</p>
        </motion.div>

        {/* VS comparison card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-2xl border border-white/10 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary mb-1">
                You
              </div>
              <p className="text-sm font-semibold">You</p>
              <p className="text-xs text-white/40">
                {myCorrect ?? 0}/{duel.question_count}
              </p>
            </div>
            <div className="text-white/20 font-bold text-lg px-4">VS</div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-lg font-bold text-accent mb-1">
                {opponentName.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-semibold">{opponentName}</p>
              <p className="text-xs text-white/40">
                {theirCorrect ?? 0}/{duel.question_count}
              </p>
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-12 text-right">
                {myScore ?? 0}
              </span>
              <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${myBarWidth}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-12 text-right">
                {theirScore ?? 0}
              </span>
              <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${theirBarWidth}%` }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </div>
            </div>
          </div>

          {/* Time comparison */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock size={12} />
              {myTimeMs ? formatTime(myTimeMs) : "-"}
            </div>
            <span className="text-xs text-white/20">Time</span>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock size={12} />
              {theirTimeMs ? formatTime(theirTimeMs) : "-"}
            </div>
          </div>
        </motion.div>

        {/* XP breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-2xl border border-white/10 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            <span className="text-sm font-semibold">XP Earned</span>
          </div>
          <span className="text-lg font-bold text-primary">+{xpEarned}</span>
        </motion.div>

        {/* Question accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <h3 className="text-sm font-semibold text-white/50 mb-2">
            Question Breakdown
          </h3>
          {myAnswers.map((answer, idx) => {
            const opponentAnswer = theirAnswers?.[idx];
            const isExpanded = expandedQ === idx;

            return (
              <button
                key={idx}
                onClick={() => setExpandedQ(isExpanded ? null : idx)}
                className="w-full text-left bg-surface rounded-xl border border-white/10 p-3 transition-colors hover:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 w-5">
                      Q{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* My result */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          answer.isCorrect
                            ? "bg-success/20"
                            : "bg-accent/20"
                        }`}
                      >
                        {answer.isCorrect ? (
                          <Check size={12} className="text-success" />
                        ) : (
                          <XIcon size={12} className="text-accent" />
                        )}
                      </div>
                      <span className="text-white/20">|</span>
                      {/* Opponent result */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          opponentAnswer?.isCorrect
                            ? "bg-success/20"
                            : "bg-accent/20"
                        }`}
                      >
                        {opponentAnswer?.isCorrect ? (
                          <Check size={12} className="text-success" />
                        ) : (
                          <XIcon size={12} className="text-accent" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">
                      {formatTime(answer.timeMs)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-white/30" />
                    ) : (
                      <ChevronDown size={14} className="text-white/30" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-white/40 mb-1">You</p>
                      <p className={answer.isCorrect ? "text-success" : "text-accent"}>
                        {answer.isCorrect ? "Correct" : "Wrong"} — {formatTime(answer.timeMs)}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 mb-1">{opponentName}</p>
                      <p
                        className={
                          opponentAnswer?.isCorrect ? "text-success" : "text-accent"
                        }
                      >
                        {opponentAnswer
                          ? `${opponentAnswer.isCorrect ? "Correct" : "Wrong"} — ${formatTime(opponentAnswer.timeMs)}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 pt-2"
        >
          <button
            onClick={onRematch}
            className="w-full px-4 py-3 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Rematch
          </button>
          <button
            onClick={onNewChallenge}
            className="w-full px-4 py-3 text-sm font-bold rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
          >
            <Swords size={16} />
            New Challenge
          </button>
          <button
            onClick={onBack}
            className="w-full px-4 py-3 text-sm font-medium rounded-xl text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Duels
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default DuelResults;
