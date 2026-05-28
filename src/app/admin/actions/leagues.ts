"use server";

import { createServiceClient } from "@/lib/supabase/service";

export interface LeagueData {
  users: { rank: string; total_xp: number }[];
  history: {
    league_id: string;
    result: string;
    unique_anime_count: number;
    week_start: string;
  }[];
  weeklyPlays: { user_id: string; anime_id: string; play_count: number }[];
  leagues: { id: string; name: string; tier: number }[];
}

export async function getLeagueDistribution(): Promise<LeagueData> {
  const supabase = createServiceClient();

  const [{ data: users }, { data: history }, { data: weeklyPlays }, { data: leagues }] =
    await Promise.all([
      supabase.from("user_profiles").select("rank, total_xp"),
      supabase.from("league_history")
        .select("league_id, result, unique_anime_count, week_start")
        .order("week_start", { ascending: false }).limit(500),
      supabase.from("weekly_anime_plays")
        .select("user_id, anime_id, play_count")
        .gte("play_count", 10).limit(100),
      supabase.from("leagues").select("id, name, tier").order("tier"),
    ]);

  return {
    users: (users ?? []) as LeagueData["users"],
    history: (history ?? []) as LeagueData["history"],
    weeklyPlays: (weeklyPlays ?? []) as LeagueData["weeklyPlays"],
    leagues: (leagues ?? []) as LeagueData["leagues"],
  };
}
