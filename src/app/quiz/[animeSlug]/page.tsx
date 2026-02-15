import { getAnimeBySlug } from "@/lib/queries";
import { getConfig } from "@/lib/admin-config";
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

  let freeQuizLimit = 10;
  let adVisible = true;

  try {
    freeQuizLimit = await getConfig<number>("free_quiz_limit");
    adVisible = await getConfig<boolean>("ad_visibility");
  } catch {
    // Config unavailable — use defaults
  }

  return (
    <QuizClient
      anime={anime}
      freeQuizLimit={freeQuizLimit}
      adVisible={adVisible}
    />
  );
}
