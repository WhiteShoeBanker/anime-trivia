"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  xpEarned: number;
  newRank?: string;
}

const RING_RADIUS = 70;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ScoreDisplay = ({
  score,
  maxScore,
  correct,
  total,
  xpEarned,
  newRank,
}: ScoreDisplayProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out curve
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * score));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const offset = RING_CIRCUMFERENCE * (1 - percentage / 100);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const ringColor =
    percentage >= 80
      ? "var(--color-success)"
      : percentage >= 50
        ? "#facc15"
        : "var(--color-accent)";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Score ring */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={RING_RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold" style={{ color: ringColor }}>
            {displayScore}
          </span>
          <span className="text-xs text-white/50">/ {maxScore}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm text-center">
        <div className="bg-surface rounded-xl p-3 border border-white/10">
          <p className="text-lg font-bold text-white">
            {correct}/{total}
          </p>
          <p className="text-xs text-white/50">Correct</p>
        </div>
        <div className="bg-surface rounded-xl p-3 border border-white/10">
          <p className="text-lg font-bold text-white">{accuracy}%</p>
          <p className="text-xs text-white/50">Accuracy</p>
        </div>
        <div className="bg-surface rounded-xl p-3 border border-white/10">
          <p className="text-lg font-bold text-primary">+{xpEarned}</p>
          <p className="text-xs text-white/50">XP Earned</p>
        </div>
      </div>

      {/* Rank celebration */}
      {newRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.5, type: "spring" }}
          className="text-center mt-2"
        >
          <p className="text-sm text-white/50 mb-1">Rank Up!</p>
          <p className="text-2xl font-bold text-primary">{newRank}</p>
        </motion.div>
      )}
    </div>
  );
};

export default ScoreDisplay;
