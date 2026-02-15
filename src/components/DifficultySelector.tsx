"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { Difficulty } from "@/types";

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (d: Difficulty) => void;
  questionCounts?: { easy: number; medium: number; hard: number };
}

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "emerald" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "hard", label: "Hard", color: "red" },
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
};

const DifficultySelector = ({
  selected,
  onSelect,
  questionCounts,
}: DifficultySelectorProps) => {
  const layoutId = useId();

  return (
    <div className="flex gap-3">
      {DIFFICULTIES.map(({ value, label, color }) => {
        const isActive = selected === value;
        const styles = colorMap[color];

        return (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`relative flex-1 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
              isActive ? styles.selected : styles.unselected
            }`}
            style={isActive ? { boxShadow: styles.glow } : undefined}
          >
            {isActive && (
              <motion.div
                layoutId={`${layoutId}-indicator`}
                className="absolute inset-0 rounded-xl border-2 border-white/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{label}</span>
            {questionCounts && (
              <span className="relative z-10 block text-xs opacity-70 mt-0.5">
                {questionCounts[value]} questions
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default DifficultySelector;
