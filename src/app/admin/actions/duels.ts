"use server";

import { createServiceClient } from "@/lib/supabase/service";

export interface DuelsData {
  totalToday: number;
  totalWeek: number;
  totalAllTime: number;
  quickMatchCount: number;
  friendChallengeCount: number;
  duelsByAnime: { anime_id: string; anime_title: string; count: number }[];
  duelsByDifficulty: { difficulty: string; count: number }[];
  giantKillsWeek: number;
  topDuelists: {
    user_id: string;
    username: string | null;
    wins: number;
    losses: number;
    draws: number;
    win_streak: number;
    giant_kills: number;
  }[];
  expiredCount: number;
  avgAccuracy: number;
}

export async function getDuelsData(): Promise<DuelsData> {
  const supabase = createServiceClient();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    { count: totalAllTime },
    { count: totalToday },
    { count: totalWeek },
    { data: completedDuels },
    { data: duelStatsRows },
    { count: expiredCount },
    { count: giantKillsWeek },
  ] = await Promise.all([
    supabase.from("duel_matches").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("duel_matches").select("*", { count: "exact", head: true })
      .eq("status", "completed").gte("created_at", todayStart.toISOString()),
    supabase.from("duel_matches").select("*", { count: "exact", head: true })
      .eq("status", "completed").gte("created_at", weekAgo.toISOString()),
    supabase.from("duel_matches")
      .select("match_type, anime_id, difficulty, challenger_correct, opponent_correct, question_count")
      .eq("status", "completed").limit(1000),
    supabase.from("duel_stats")
      .select("user_id, wins, losses, draws, win_streak, giant_kills")
      .order("wins", { ascending: false }).limit(20),
    supabase.from("duel_matches").select("*", { count: "exact", head: true }).eq("status", "expired"),
    supabase.from("analytics_events").select("*", { count: "exact", head: true })
      .eq("event_name", "badge_earned")
      .gte("created_at", weekAgo.toISOString()),
  ]);

  // Match type breakdown
  let quickMatchCount = 0;
  let friendChallengeCount = 0;
  const animeCount = new Map<string, number>();
  const difficultyCount = new Map<string, number>();
  let totalCorrect = 0;
  let totalQuestions = 0;

  for (const d of completedDuels ?? []) {
    if (d.match_type === "quick_match") quickMatchCount++;
    else friendChallengeCount++;

    if (d.anime_id) {
      animeCount.set(d.anime_id, (animeCount.get(d.anime_id) ?? 0) + 1);
    }
    difficultyCount.set(d.difficulty, (difficultyCount.get(d.difficulty) ?? 0) + 1);

    if (d.challenger_correct != null && d.question_count) {
      totalCorrect += d.challenger_correct;
      totalQuestions += d.question_count;
    }
    if (d.opponent_correct != null && d.question_count) {
      totalCorrect += d.opponent_correct;
      totalQuestions += d.question_count;
    }
  }

  // Get anime titles for top duels
  const topAnimeIds = Array.from(animeCount.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id]) => id);

  let duelsByAnime: DuelsData["duelsByAnime"] = [];
  if (topAnimeIds.length > 0) {
    const { data: animeRows } = await supabase.from("anime_series")
      .select("id, title").in("id", topAnimeIds);
    const titleMap = new Map((animeRows ?? []).map((a) => [a.id, a.title]));
    duelsByAnime = topAnimeIds.map((id) => ({
      anime_id: id,
      anime_title: titleMap.get(id) ?? "Unknown",
      count: animeCount.get(id) ?? 0,
    }));
  }

  const duelsByDifficulty = Array.from(difficultyCount.entries())
    .map(([difficulty, count]) => ({ difficulty, count }))
    .sort((a, b) => b.count - a.count);

  // Get usernames for top duelists
  const topDuelists: DuelsData["topDuelists"] = [];
  if (duelStatsRows && duelStatsRows.length > 0) {
    const userIds = duelStatsRows.map((r) => r.user_id);
    const { data: profiles } = await supabase.from("user_profiles")
      .select("id, username").in("id", userIds);
    const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));
    for (const row of duelStatsRows) {
      topDuelists.push({
        ...row,
        username: nameMap.get(row.user_id) ?? null,
      });
    }
  }

  return {
    totalToday: totalToday ?? 0,
    totalWeek: totalWeek ?? 0,
    totalAllTime: totalAllTime ?? 0,
    quickMatchCount, friendChallengeCount,
    duelsByAnime, duelsByDifficulty,
    giantKillsWeek: giantKillsWeek ?? 0,
    topDuelists,
    expiredCount: expiredCount ?? 0,
    avgAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
  };
}

export async function getUserDuelStats(userId: string): Promise<{
  wins: number; losses: number; draws: number;
} | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("duel_stats")
    .select("wins, losses, draws").eq("user_id", userId).single();
  return data as { wins: number; losses: number; draws: number } | null;
}
