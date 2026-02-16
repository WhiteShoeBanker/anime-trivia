import { createClient } from "@/lib/supabase/client";
import type { LeagueTier, LeagueXpResult, PromotionRequirements } from "@/types";

// ── Diminishing Returns ─────────────────────────────────────

export const getLeagueXpMultiplier = (playCount: number): number => {
  if (playCount <= 1) return 1.0;
  if (playCount === 2) return 0.75;
  if (playCount === 3) return 0.5;
  if (playCount === 4) return 0.25;
  return 0.1;
};

// ── Week Start Helper ───────────────────────────────────────

export const getCurrentWeekStart = (): string => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = start of week
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
};

// ── Calculate League XP with Diminishing Returns ────────────

export const calculateLeagueXp = async (
  baseXp: number,
  animeId: string,
  userId: string
): Promise<LeagueXpResult> => {
  const supabase = createClient();
  const weekStart = getCurrentWeekStart();

  // 1. Try to get existing weekly_anime_plays row
  const { data: existing } = await supabase
    .from("weekly_anime_plays")
    .select("id, play_count")
    .eq("user_id", userId)
    .eq("anime_id", animeId)
    .eq("week_start", weekStart)
    .single();

  let playCount: number;

  if (existing) {
    // Increment play_count
    playCount = existing.play_count + 1;
    await supabase
      .from("weekly_anime_plays")
      .update({ play_count: playCount })
      .eq("id", existing.id);
  } else {
    // Create new row
    playCount = 1;
    await supabase.from("weekly_anime_plays").insert({
      user_id: userId,
      anime_id: animeId,
      week_start: weekStart,
      play_count: 1,
    });
  }

  // 2. Calculate multiplied XP
  const multiplier = getLeagueXpMultiplier(playCount);
  const leagueXp = Math.round(baseXp * multiplier);

  return {
    leagueXp,
    multiplier,
    playCount,
    nudge: multiplier <= 0.5,
  };
};

// ── Update League Membership Stats ──────────────────────────

export const updateLeagueMembershipXp = async (
  userId: string,
  leagueXp: number,
  animeId: string
): Promise<{ previousRank: number; newRank: number } | null> => {
  const supabase = createClient();
  const weekStart = getCurrentWeekStart();

  // Find user's active membership
  const { data: membership } = await supabase
    .from("league_memberships")
    .select("id, group_id, weekly_xp, unique_anime_count")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  if (!membership) return null;

  // Get previous rank in group
  const { data: prevMembers } = await supabase
    .from("league_memberships")
    .select("user_id, weekly_xp")
    .eq("group_id", membership.group_id)
    .order("weekly_xp", { ascending: false });

  const previousRank = (prevMembers ?? []).findIndex(
    (m) => m.user_id === userId
  ) + 1;

  // Count unique anime played this week
  const { count: uniqueAnimeCount } = await supabase
    .from("weekly_anime_plays")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("week_start", weekStart);

  // Update membership
  await supabase
    .from("league_memberships")
    .update({
      weekly_xp: membership.weekly_xp + leagueXp,
      unique_anime_count: uniqueAnimeCount ?? 0,
    })
    .eq("id", membership.id);

  // Get new rank
  const { data: newMembers } = await supabase
    .from("league_memberships")
    .select("user_id, weekly_xp")
    .eq("group_id", membership.group_id)
    .order("weekly_xp", { ascending: false });

  const newRank = (newMembers ?? []).findIndex(
    (m) => m.user_id === userId
  ) + 1;

  return { previousRank, newRank };
};

// ── Promotion Requirements (Breadth Gates) ──────────────────

export const getPromotionRequirements = (
  currentLeagueTier: LeagueTier
): PromotionRequirements => {
  switch (currentLeagueTier) {
    case 1:
      return { minAnime: 0, requiresHard: false, requiresImpossible: 0 };
    case 2:
      return { minAnime: 2, requiresHard: false, requiresImpossible: 0 };
    case 3:
      return { minAnime: 3, requiresHard: false, requiresImpossible: 0 };
    case 4:
      return { minAnime: 5, requiresHard: true, requiresImpossible: 0 };
    case 5:
      return { minAnime: 6, requiresHard: false, requiresImpossible: 2 };
    case 6:
      return { minAnime: 0, requiresHard: false, requiresImpossible: 0 };
    default:
      return { minAnime: 0, requiresHard: false, requiresImpossible: 0 };
  }
};

// ── Get User's Current League Info ──────────────────────────

export const getUserLeagueInfo = async (userId: string) => {
  const supabase = createClient();

  // Get active membership with league info
  const { data: membership } = await supabase
    .from("league_memberships")
    .select(`
      *,
      leagues:league_id (
        id, name, tier, color, promotion_slots, demotion_slots, group_size
      )
    `)
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  if (!membership) return null;

  // Get group members ranked
  const { data: members } = await supabase
    .from("league_memberships")
    .select(`
      user_id, weekly_xp, unique_anime_count,
      user_profiles:user_id (
        username, display_name, avatar_url, age_group, emblem_badge_id
      )
    `)
    .eq("group_id", membership.group_id)
    .order("weekly_xp", { ascending: false });

  const userRank = (members ?? []).findIndex(
    (m) => m.user_id === userId
  ) + 1;

  return {
    membership,
    league: membership.leagues,
    members: members ?? [],
    userRank,
  };
};

// ── Get User's Weekly Anime Plays ───────────────────────────

export const getUserWeeklyPlays = async (userId: string) => {
  const supabase = createClient();
  const weekStart = getCurrentWeekStart();

  const { data } = await supabase
    .from("weekly_anime_plays")
    .select(`
      anime_id, play_count,
      anime_series:anime_id (
        id, title, slug, image_url
      )
    `)
    .eq("user_id", userId)
    .eq("week_start", weekStart);

  return data ?? [];
};

// ── Get League History ──────────────────────────────────────

export const getUserLeagueHistory = async (
  userId: string,
  limit: number = 4
) => {
  const supabase = createClient();

  const { data } = await supabase
    .from("league_history")
    .select(`
      *,
      leagues:league_id (name, tier, color)
    `)
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(limit);

  return data ?? [];
};

// ── Get a Random Unplayed Anime ─────────────────────────────

export const getRandomUnplayedAnime = async (userId: string) => {
  const supabase = createClient();
  const weekStart = getCurrentWeekStart();

  // Get anime IDs the user has played this week
  const { data: played } = await supabase
    .from("weekly_anime_plays")
    .select("anime_id")
    .eq("user_id", userId)
    .eq("week_start", weekStart);

  const playedIds = (played ?? []).map((p) => p.anime_id);

  // Get all active anime
  const { data: allAnime } = await supabase
    .from("anime_series")
    .select("id, title, slug")
    .eq("is_active", true);

  if (!allAnime) return null;

  // Filter to unplayed
  const unplayed = allAnime.filter((a) => !playedIds.includes(a.id));

  if (unplayed.length === 0) return null;

  // Pick random
  return unplayed[Math.floor(Math.random() * unplayed.length)];
};
