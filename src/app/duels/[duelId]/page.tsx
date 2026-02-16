import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DuelClient from "./DuelClient";
import type { DuelMatch } from "@/types";

interface Props {
  params: Promise<{ duelId: string }>;
}

export default async function DuelPage({ params }: Props) {
  const { duelId } = await params;

  const supabase = await createClient();

  const { data: duel } = await supabase
    .from("duel_matches")
    .select("*")
    .eq("id", duelId)
    .single();

  if (!duel) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // Validate user is a participant
  const isParticipant =
    duel.challenger_id === user.id || duel.opponent_id === user.id;

  if (!isParticipant) notFound();

  // Get anime name
  let animeName = "Random Anime";
  if (duel.anime_id) {
    const { data: anime } = await supabase
      .from("anime_series")
      .select("title")
      .eq("id", duel.anime_id)
      .single();
    if (anime) animeName = anime.title;
  }

  // Get opponent info
  const opponentId =
    duel.challenger_id === user.id ? duel.opponent_id : duel.challenger_id;
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
    <DuelClient
      duel={duel as DuelMatch}
      userId={user.id}
      animeName={animeName}
      opponentName={opponentName}
    />
  );
}
