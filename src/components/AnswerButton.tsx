"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import useReducedMotion from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

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

type TileState =
  | "default"
  | "selected"
  | "correct"
  | "incorrect-selected"
  | "disabled";

// State → tile-surface utilities. Lookup object (not template strings) so
// Tailwind v4's build-time extractor can see every class statically. Tile
// composition is ghost (bg-{tone}/10 border-{tone}) per the answer-tile-*
// tokens in DESIGN.md. Hover/focus-visible on the default tile deepens
// neutrally per the canonical 10/20% hover convention — explicitly NOT
// brand-tinted, since the brand tint is reserved for the selected state.
const tileClasses: Record<TileState, string> = {
  default:
    "bg-surface border-white/10 hover:border-white/20 hover:bg-white/5 focus-visible:border-white/20 focus-visible:bg-white/5 focus-visible:outline-none",
  selected: "border-primary bg-primary/10",
  correct: "border-success bg-success/10",
  "incorrect-selected": "border-accent bg-accent/10",
  disabled: "border-white/10 bg-surface opacity-50",
};

// State → letter-chip utilities. Filled treatment paired with the tile
// state. Correct pairs bg-success with text-ink (6.0:1 AA); incorrect
// pairs bg-accent with text-white (6.5:1 AA). The asymmetry is
// contrast-driven, codified in DESIGN.md.
const chipClasses: Record<TileState, string> = {
  default: "bg-white/10 text-white/70",
  selected: "bg-primary text-white",
  correct: "bg-success text-ink",
  "incorrect-selected": "bg-accent text-white",
  disabled: "bg-white/10 text-white/70",
};

const resolveState = (
  isRevealed: boolean,
  isSelected: boolean,
  isCorrect: boolean,
): TileState => {
  if (isRevealed) {
    if (isCorrect) return "correct";
    if (isSelected) return "incorrect-selected";
    return "disabled";
  }
  if (isSelected) return "selected";
  return "default";
};

const AnswerButton = ({
  text,
  index,
  isSelected,
  isCorrect,
  isRevealed,
  onClick,
  disabled,
}: AnswerButtonProps) => {
  const reducedMotion = useReducedMotion();
  const state = resolveState(isRevealed, isSelected, isCorrect);

  const shakeAnimation =
    !reducedMotion && state === "incorrect-selected"
      ? { x: [0, -8, 8, -4, 4, 0] }
      : {};

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      animate={shakeAnimation}
      transition={{ duration: reducedMotion ? 0 : 0.4 }}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Option ${LETTERS[index]}: ${text}`}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 min-h-[56px] rounded-sharp border text-left transition-colors",
        tileClasses[state],
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-pill text-sm font-bold",
          chipClasses[state],
        )}
      >
        {state === "correct" ? (
          <Check size={16} />
        ) : state === "incorrect-selected" ? (
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
