"use client";

import type { Difficulty } from "@/types";
import { DifficultyChip } from "@/components/ui/DifficultyChip";
import { difficultyLabels } from "@/themes";

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (d: Difficulty) => void;
  questionCounts?: { easy: number; medium: number; hard: number; impossible: number };
  isJunior?: boolean;
}

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "impossible"];

const DifficultySelector = ({
  selected,
  onSelect,
  questionCounts,
  isJunior,
}: DifficultySelectorProps) => {
  const selectedIsLocked =
    isJunior && (selected === "hard" || selected === "impossible");
  const showCount =
    !!questionCounts && !selectedIsLocked && questionCounts[selected] > 0;

  return (
    <div>
      <div className="flex gap-3">
        {DIFFICULTIES.map((value) => {
          const isLocked =
            isJunior && (value === "hard" || value === "impossible");
          return (
            <DifficultyChip
              key={value}
              tone={value}
              active={selected === value}
              locked={isLocked}
              onClick={() => onSelect(value)}
              className="flex-1"
            >
              {difficultyLabels[value]}
            </DifficultyChip>
          );
        })}
      </div>
      {showCount && (
        <p className="text-xs text-text-muted mt-2 text-center">
          {questionCounts[selected]} questions
        </p>
      )}
      {isJunior && (
        <p className="text-xs text-text-muted mt-2 text-center">
          Hard and Impossible unlock at 13
        </p>
      )}
    </div>
  );
};

export default DifficultySelector;
