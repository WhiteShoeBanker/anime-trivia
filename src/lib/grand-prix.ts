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
//
// Thin wrapper that POSTs to /api/grand-prix/submit-score. The server
// re-derives the score from the trusted answer key and clamps the
// total time, so direct client writes to grand_prix_matches are no
// longer accepted (RLS update policy was dropped in migration 024).

export interface SubmitMatchAnswer {
  questionId: string;
  selectedOption: number;
  timeMs: number;
}

export const submitMatchScore = async (
  matchId: string,
  answers: SubmitMatchAnswer[]
): Promise<GrandPrixMatch | null> => {
  const res = await fetch("/api/grand-prix/submit-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId, answers }),
  });
  if (!res.ok) return null;
  const { match } = (await res.json()) as { match: GrandPrixMatch | null };
  return match ?? null;
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
