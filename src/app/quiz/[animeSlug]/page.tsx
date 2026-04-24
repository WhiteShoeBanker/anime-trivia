import type { Metadata } from "next";
import { getAnimeBySlug } from "@/lib/queries";
import { getConfig } from "@/lib/admin-config";
import { createClient } from "@/lib/supabase/server";
import type { AnimeSeries, AgeGroup } from "@/types";
import { notFound } from "next/navigation";
import QuizClient from "./QuizClient";

interface Props {
  params: Promise<{ animeSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { animeSlug } = await params;
  let anime: AnimeSeries | null = null;

  try {
    anime = await getAnimeBySlug(animeSlug);
  } catch {
    // DB not available
  }

  // Neutral when anime is null — covers both "slug does not exist" and
  // "RLS filtered this anime out of the viewer's session" uniformly.
  // Do NOT return the anime's real title: that would leak M-rated titles
  // into the <title> tag for junior/teen sessions. `absolute` bypasses
  // the root layout's "%s | OtakuQuiz" template so the rendered <title>
  // is just "OtakuQuiz", not "OtakuQuiz | OtakuQuiz".
  if (!anime) {
    return { title: { absolute: "OtakuQuiz" } };
  }

  return {
    title: `${anime.title} Quiz`,
    description: `Test your ${anime.title} knowledge with ${anime.total_questions}+ trivia questions. Choose your difficulty and prove you're a true fan!`,
  };
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
  let ageGroup: AgeGroup = "full";
  let userId: string | undefined;

  try {
    freeQuizLimit = await getConfig<number>("free_quiz_limit");
    adVisible = await getConfig<boolean>("ad_visibility");
  } catch {
    // Config unavailable — use defaults
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("age_group")
        .eq("id", user.id)
        .single();

      if (profile?.age_group) {
        ageGroup = profile.age_group as AgeGroup;
      }
    }
  } catch {
    // Auth not available
  }

  // Content gate: restrict access based on age group
  if (ageGroup === "junior" && anime.content_rating !== "E") {
    notFound();
  }
  if (ageGroup === "teen" && anime.content_rating === "M") {
    notFound();
  }

  return (
    <QuizClient
      anime={anime}
      freeQuizLimit={freeQuizLimit}
      adVisible={adVisible}
      ageGroup={ageGroup}
      userId={userId}
    />
  );
}
