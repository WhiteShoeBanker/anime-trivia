import type { Difficulty } from "@/types";

const BASE_XP: Record<Difficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  impossible: 100,
};

const RANK_THRESHOLDS = [
  { name: "Hokage", minXP: 25000 },
  { name: "Kage", minXP: 10000 },
  { name: "ANBU", minXP: 5000 },
  { name: "Jonin", minXP: 2000 },
  { name: "Chunin", minXP: 500 },
  { name: "Genin", minXP: 0 },
];

export const calculateQuestionXP = (
  difficulty: Difficulty,
  streak: number,
  timeMs: number,
  _timeLimit: number
): number => {
  const baseXP = BASE_XP[difficulty];
  const streakMultiplier = Math.min(1 + streak * 0.1, 2.0);
  const timeBonusThreshold = difficulty === "impossible" ? 3000 : 5000;
  const timeBonus = timeMs < timeBonusThreshold ? 1.5 : 1.0;
  return Math.round(baseXP * streakMultiplier * timeBonus);
};

export const getRank = (
  totalXP: number
): {
  name: string;
  minXP: number;
  nextRankXP: number | null;
  progress: number;
} => {
  for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
    const current = RANK_THRESHOLDS[i];
    if (totalXP >= current.minXP) {
      const nextRank = i > 0 ? RANK_THRESHOLDS[i - 1] : null;
      const nextRankXP = nextRank ? nextRank.minXP : null;
      const progress = nextRankXP
        ? ((totalXP - current.minXP) / (nextRankXP - current.minXP)) * 100
        : 100;
      return {
        name: current.name,
        minXP: current.minXP,
        nextRankXP,
        progress: Math.min(progress, 100),
      };
    }
  }
  return {
    name: "Genin",
    minXP: 0,
    nextRankXP: 500,
    progress: (totalXP / 500) * 100,
  };
};

export const calculateMaxScore = (
  difficulty: Difficulty,
  numQuestions: number
): number => {
  let max = 0;
  for (let i = 0; i < numQuestions; i++) {
    max += calculateQuestionXP(difficulty, i, 1000, 30000);
  }
  return max;
};
