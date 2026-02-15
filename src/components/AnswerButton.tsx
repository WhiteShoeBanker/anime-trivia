"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface AnswerButtonProps {
  text: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isRevealed: boolean;
  onClick: () => void;
  disabled: boolean;
}

const LETTERS = ["A", "B", "C", "D"];

const AnswerButton = ({
  text,
  index,
  isSelected,
  isCorrect,
  isRevealed,
  onClick,
  disabled,
}: AnswerButtonProps) => {
  const getStyles = (): string => {
    if (isRevealed) {
      if (isCorrect) {
        return "border-success bg-success/10";
      }
      if (isSelected && !isCorrect) {
        return "border-red-500 bg-red-500/10";
      }
      return "border-white/10 bg-surface opacity-50";
    }
    if (isSelected) {
      return "border-primary bg-primary/10";
    }
    return "bg-surface border-white/10 hover:border-primary/50 hover:bg-white/5";
  };

  const shakeAnimation =
    isRevealed && isSelected && !isCorrect
      ? { x: [0, -8, 8, -4, 4, 0] }
      : {};

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      animate={shakeAnimation}
      transition={{ duration: 0.4 }}
      className={`w-full flex items-center gap-3 px-4 py-3 min-h-[56px] rounded-xl border text-left transition-colors ${getStyles()}`}
    >
      <span
        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
          isRevealed && isCorrect
            ? "bg-success text-white"
            : isRevealed && isSelected && !isCorrect
              ? "bg-red-500 text-white"
              : isSelected
                ? "bg-primary text-white"
                : "bg-white/10 text-white/70"
        }`}
      >
        {isRevealed && isCorrect ? (
          <Check size={16} />
        ) : isRevealed && isSelected && !isCorrect ? (
          <X size={16} />
        ) : (
          LETTERS[index]
        )}
      </span>
      <span className="text-sm md:text-base">{text}</span>
    </motion.button>
  );
};

export default AnswerButton;
