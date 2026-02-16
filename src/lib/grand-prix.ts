import { createClient } from "@/lib/supabase/client";
import type {
  GrandPrixTournament,
  GrandPrixMatch,
  GrandPrixEmblem,
  UserEmblemWithDetails,
} from "@/types";

// ── Fetch Current Tournament ───────────────────────────────────

export const getCurrentTournament = async (): Promise<GrandPrixTournament | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("grand_prix_tournaments")
    .select("*")
    .order("month_start", { ascending: false })
    .limit(1)
    .single();

  return (data as GrandPrixTournament) ?? null;
};

// ── Fetch All Matches for a Tournament ─────────────────────────

export const getTournamentMatches = async (
  tournamentId: string
): Promise<GrandPrixMatch[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("grand_prix_matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("round", { ascending: true })
    .order("match_number", { ascending: true });

  return (data as GrandPrixMatch[]) ?? [];
};

// ── Fetch Single Match ─────────────────────────────────────────

export const getMatchById = async (
  matchId: string
): Promise<GrandPrixMatch | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("grand_prix_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  return (data as GrandPrixMatch) ?? null;
};

// ── Fetch User's Grand Prix Emblems ────────────────────────────

export const getUserGrandPrixEmblems = async (
  userId: string
): Promise<UserEmblemWithDetails[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_emblems")
    .select("*, grand_prix_emblems:emblem_id (*)")
    .eq("user_id", userId);

  return (data as UserEmblemWithDetails[]) ?? [];
};

// ── Fetch Past Winners ─────────────────────────────────────────

export const getPastWinners = async (
  limit: number = 6
): Promise<GrandPrixTournament[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("grand_prix_tournaments")
    .select("*")
    .eq("status", "completed")
    .not("winner_id", "is", null)
    .order("month_start", { ascending: false })
    .limit(limit);

  return (data as GrandPrixTournament[]) ?? [];
};

// ── Fetch Tournament Emblem ────────────────────────────────────

export const getTournamentEmblem = async (
  tournamentId: string
): Promise<GrandPrixEmblem | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("grand_prix_emblems")
    .select("*")
    .eq("tournament_id", tournamentId)
    .single();

  return (data as GrandPrixEmblem) ?? null;
};

// ── Submit Match Score ─────────────────────────────────────────

export const submitMatchScore = async (
  matchId: string,
  userId: string,
  score: number,
  totalTimeMs: number
): Promise<GrandPrixMatch | null> => {
  const supabase = createClient();

  // Fetch current match state
  const { data: match } = await supabase
    .from("grand_prix_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) return null;

  const isPlayer1 = match.player1_id === userId;
  const isPlayer2 = match.player2_id === userId;

  if (!isPlayer1 && !isPlayer2) return null;

  // Build update payload
  const update: Record<string, unknown> = {};

  if (isPlayer1) {
    update.player1_score = score;
    update.player1_time_ms = totalTimeMs;
    if (match.status === "pending") {
      update.status = "player1_done";
    } else if (match.status === "player2_done") {
      update.status = "completed";
      update.played_at = new Date().toISOString();
    }
  } else {
    update.player2_score = score;
    update.player2_time_ms = totalTimeMs;
    if (match.status === "pending") {
      update.status = "player2_done";
    } else if (match.status === "player1_done") {
      update.status = "completed";
      update.played_at = new Date().toISOString();
    }
  }

  // If match just completed, determine winner
  if (update.status === "completed") {
    const p1Score = isPlayer1 ? score : match.player1_score;
    const p2Score = isPlayer2 ? score : match.player2_score;
    const p1Time = isPlayer1 ? totalTimeMs : match.player1_time_ms;
    const p2Time = isPlayer2 ? totalTimeMs : match.player2_time_ms;

    if (p1Score !== null && p2Score !== null) {
      if (p1Score > p2Score) {
        update.winner_id = match.player1_id;
      } else if (p2Score > p1Score) {
        update.winner_id = match.player2_id;
      } else {
        // Tiebreaker: faster time wins
        if (p1Time !== null && p2Time !== null) {
          update.winner_id = p1Time <= p2Time ? match.player1_id : match.player2_id;
        } else {
          // Higher seed (player1) advances on tie
          update.winner_id = match.player1_id;
        }
      }
    }
  }

  const { data: updated } = await supabase
    .from("grand_prix_matches")
    .update(update)
    .eq("id", matchId)
    .select()
    .single();

  return (updated as GrandPrixMatch) ?? null;
};

// ── Get User's Pending Match ───────────────────────────────────

export const getUserPendingMatch = async (
  userId: string,
  tournamentId: string
): Promise<GrandPrixMatch | null> => {
  const supabase = createClient();

  // Find matches where user is a player and hasn't completed their part
  const { data } = await supabase
    .from("grand_prix_matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .in("status", ["pending", "player1_done", "player2_done"])
    .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
    .limit(1)
    .single();

  if (!data) return null;

  const match = data as GrandPrixMatch;

  // Check if this user has already played their part
  const isPlayer1 = match.player1_id === userId;
  if (isPlayer1 && (match.status === "player1_done" || match.status === "completed")) {
    return null;
  }
  if (!isPlayer1 && (match.status === "player2_done" || match.status === "completed")) {
    return null;
  }

  return match;
};
