"use server";

import { getUserPerAnimeStats } from "@/lib/queries";
import type { PerAnimeStat } from "@/types";

export const fetchPerAnimeStats = async (
  userId: string
): Promise<PerAnimeStat[]> => {
  return getUserPerAnimeStats(userId);
};
