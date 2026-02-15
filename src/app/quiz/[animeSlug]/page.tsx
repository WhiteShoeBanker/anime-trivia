import { getAnimeBySlug } from "@/lib/queries";
import type { AnimeSeries } from "@/types";
import { notFound } from "next/navigation";
import QuizClient from "./QuizClient";

interface Props {
  params: Promise<{ animeSlug: string }>;
}

export default async function QuizPage({ params }: Props) {
  const { animeSlug } = await params;

  let anime: AnimeSeries | null = null;

  try {
    anime = await getAnimeBySlug(animeSlug);
  } catch {
    // DB not available
  }

  if (!anime) notFound();

  return <QuizClient anime={anime} />;
}
