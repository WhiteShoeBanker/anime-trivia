"use server";

import { getConfig } from "@/lib/admin-config";

export const getFreeQuizLimit = async (): Promise<number> => {
  return getConfig<number>("free_quiz_limit");
};

export const getDiminishingReturns = async (): Promise<number[]> => {
  return getConfig<number[]>("diminishing_returns");
};

export const getDailyChallengeMix = async (): Promise<Record<string, number>> => {
  return getConfig<Record<string, number>>("daily_challenge_mix");
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
