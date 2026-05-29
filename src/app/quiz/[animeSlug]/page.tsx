import type { Metadata } from "next";
import { getAnimeBySlug } from "@/lib/queries";
import { getConfig } from "@/lib/admin-config";
import { createClient } from "@/lib/supabase/server";
import { findAnimeBySlug } from "@/data/anime/registry";
import { APP_VARIANT, variantConfig } from "@/config/variants";
import type { AnimeSeries, AgeGroup } from "@/types";
import { notFound } from "next/navigation";
import QuizClient from "./QuizClient";
import ComingSoonPage from "./ComingSoonPage";

interface Props {
  params: Promise<{ animeSlug: string }>;
}

const NEUTRAL_METADATA: Metadata = { title: { absolute: "OtakuQuiz" } };

const resolveAgeGroup = async (): Promise<AgeGroup | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("age_group")
      .eq("id", user.id)
      .single();
    if (profile?.age_group) return profile.age_group as AgeGroup;
    // Authenticated session with null age_group → most-restrictive bucket
    // (matches migration-016 RLS fallback).
    return "junior";
  } catch {
    return null;
  }
};

const ageGroupAllowsRating = (
  ageGroup: AgeGroup | null,
  rating: "E" | "T" | "M",
): boolean => {
  if (ageGroup === "junior") return rating === "E";
  if (ageGroup === "teen") return rating === "E" || rating === "T";
  return true; // full or unauth
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { animeSlug } = await params;
  const entry = findAnimeBySlug(animeSlug);

  // Neutral when entry is unknown, variant-disabled, or above the variant's
  // ceiling — covers "slug does not exist", "wrong variant", and "rating
  // beyond variant" uniformly so we don't leak the entry's real title.
  if (!entry) return NEUTRAL_METADATA;
  if (!entry.enabledInVariants.includes(APP_VARIANT)) return NEUTRAL_METADATA;
  if (!variantConfig.enabledContentRatings.includes(entry.contentRating))
    return NEUTRAL_METADATA;

  const ageGroup = await resolveAgeGroup();
  if (!ageGroupAllowsRating(ageGroup, entry.contentRating)) {
    return NEUTRAL_METADATA;
  }

  const totalQuestions =
    entry.questionCount.easy +
    entry.questionCount.medium +
    entry.questionCount.hard +
    entry.questionCount.impossible;

  return {
    title: `${entry.displayName} Quiz`,
    description: `Test your ${entry.displayName} knowledge with ${totalQuestions}+ trivia questions. Choose your difficulty and prove you're a true fan!`,
  };
}

export default async function QuizPage({ params }: Props) {
  const { animeSlug } = await params;

  const entry = findAnimeBySlug(animeSlug);
  if (!entry) notFound();
  if (!entry.enabledInVariants.includes(APP_VARIANT)) notFound();
  if (!variantConfig.enabledContentRatings.includes(entry.contentRating))
    notFound();

  if (entry.comingSoon) {
    return <ComingSoonPage anime={entry} />;
  }

  let anime: AnimeSeries | null = null;
  try {
    anime = await getAnimeBySlug(animeSlug);
  } catch {
    // DB not available
  }

  // Belt-and-suspenders: registry says it exists but DB has no row
  // (e.g., unseeded environment). Treat the same as a missing slug.
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
