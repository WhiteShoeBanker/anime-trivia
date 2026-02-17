"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Lock, Skull } from "lucide-react";
import type { Difficulty } from "@/types";
import useReducedMotion from "@/lib/use-reduced-motion";

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (d: Difficulty) => void;
  questionCounts?: { easy: number; medium: number; hard: number; impossible: number };
  isJunior?: boolean;
}

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "emerald" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "hard", label: "Hard", color: "red" },
  { value: "impossible", label: "Impossible", color: "purple" },
];

const colorMap: Record<string, { selected: string; unselected: string; glow: string }> = {
  emerald: {
    selected: "bg-emerald-500 text-white",
    unselected: "border-emerald-500 text-emerald-400",
    glow: "0 0 20px rgba(16,185,129,0.4)",
  },
  yellow: {
    selected: "bg-yellow-500 text-black",
    unselected: "border-yellow-500 text-yellow-400",
    glow: "0 0 20px rgba(234,179,8,0.4)",
  },
  red: {
    selected: "bg-red-500 text-white",
    unselected: "border-red-500 text-red-400",
    glow: "0 0 20px rgba(239,68,68,0.4)",
  },
  purple: {
    selected: "bg-purple-500 text-white",
    unselected: "border-purple-500 text-purple-400",
    glow: "0 0 20px rgba(168,85,247,0.4)",
  },
};

const DifficultySelector = ({
  selected,
  onSelect,
  questionCounts,
  isJunior,
}: DifficultySelectorProps) => {
  const layoutId = useId();
  const reducedMotion = useReducedMotion();

  return (
    <div>
      <div className="flex gap-3">
        {DIFFICULTIES.map(({ value, label, color }) => {
          const isActive = selected === value;
          const styles = colorMap[color];
          const isLocked = isJunior && (value === "hard" || value === "impossible");

          return (
            <button
              key={value}
              onClick={() => !isLocked && onSelect(value)}
              disabled={isLocked}
              className={`relative flex-1 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                isLocked
                  ? "opacity-50 cursor-not-allowed border-white/10 text-white/30"
                  : isActive
                    ? styles.selected
                    : styles.unselected
              }`}
              style={isActive && !isLocked ? { boxShadow: styles.glow } : undefined}
            >
              {isActive && !isLocked && (
                <motion.div
                  layoutId={`${layoutId}-indicator`}
                  className="absolute inset-0 rounded-xl border-2 border-white/30"
                  transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1">
                {isLocked && <Lock size={14} />}
                {!isLocked && value === "impossible" && <Skull size={14} />}
                {label}
              </span>
              {questionCounts && !isLocked && (
                <span className="relative z-10 block text-xs opacity-70 mt-0.5">
                  {questionCounts[value]} questions
                </span>
              )}
              {isLocked && (
                <span className="relative z-10 block text-[10px] text-white/30 mt-0.5">
                  Unlock when you turn 13!
                </span>
              )}
            </button>
          );
        })}
      </div>
      {isJunior && (
        <p className="text-xs text-white/40 mt-2 text-center">
          More difficulties unlock at age 13
        </p>
      )}
    </div>
  );
};

export default DifficultySelector;
