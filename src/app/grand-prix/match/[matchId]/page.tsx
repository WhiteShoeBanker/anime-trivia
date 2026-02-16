import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MatchClient from "./MatchClient";
import type { GrandPrixMatch } from "@/types";

interface Props {
  params: Promise<{ matchId: string }>;
}

export default async function GrandPrixMatchPage({ params }: Props) {
  const { matchId } = await params;

  const supabase = await createClient();

  const { data: match } = await supabase
    .from("grand_prix_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const isPlayer =
    match.player1_id === user.id || match.player2_id === user.id;

  if (!isPlayer) notFound();

  // Get anime info for the match
  let animeName = "Unknown Anime";
  if (match.anime_id) {
    const { data: anime } = await supabase
      .from("anime_series")
      .select("title")
      .eq("id", match.anime_id)
      .single();
    if (anime) animeName = anime.title;
  }

  // Get opponent info
  const opponentId =
    match.player1_id === user.id ? match.player2_id : match.player1_id;
  let opponentName = "Opponent";
  if (opponentId) {
    const { data: opponent } = await supabase
      .from("user_profiles")
      .select("display_name, username")
      .eq("id", opponentId)
      .single();
    if (opponent) {
      opponentName = opponent.display_name ?? opponent.username ?? "Opponent";
    }
  }

  return (
    <MatchClient
      match={match as GrandPrixMatch}
      userId={user.id}
      animeName={animeName}
      opponentName={opponentName}
    />
  );
}
