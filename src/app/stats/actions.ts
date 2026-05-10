"use server";

import { getUserPerAnimeStats, getUserRecentQuizzes } from "@/lib/queries";
import type { PerAnimeStat, RecentQuiz } from "@/types";

export const fetchPerAnimeStats = async (
  userId: string
): Promise<PerAnimeStat[]> => {
  return getUserPerAnimeStats(userId);
};

export const fetchRecentQuizzes = async (
  userId: string
): Promise<RecentQuiz[]> => {
  return getUserRecentQuizzes(userId);
};
