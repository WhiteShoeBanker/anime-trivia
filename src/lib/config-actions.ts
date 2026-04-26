"use server";

import { getConfig } from "@/lib/admin-config";
import type { AgeGroup } from "@/types";

export const getFreeQuizLimit = async (): Promise<number> => {
  return getConfig<number>("free_quiz_limit");
};

export const getDiminishingReturns = async (): Promise<number[]> => {
  return getConfig<number[]>("diminishing_returns");
};

export const getDailyChallengeMix = async (): Promise<Record<string, number>> => {
  return getConfig<Record<string, number>>("daily_challenge_mix");
};

export const getDailyChallengeMixForAge = async (
  ageGroup: AgeGroup
): Promise<Record<string, number> | null> => {
  // Today only "junior" has an override; teen/full use the base mix.
  // Returns null when no override is configured so callers fall back
  // to getDailyChallengeMix() (closes daily-bug-4).
  if (ageGroup !== "junior") return null;
  return getConfig<Record<string, number> | null>(
    "daily_challenge_mix_junior"
  );
};

export const getDuelMaxPerOpponentWeekly = async (): Promise<number> => {
  return getConfig<number>("duel_max_per_opponent_weekly");
};

export const getFeatureFlags = async (): Promise<Record<string, boolean>> => {
  return getConfig<Record<string, boolean>>("feature_flags");
};

export const getAdVisibility = async (): Promise<boolean> => {
  return getConfig<boolean>("ad_visibility");
};
