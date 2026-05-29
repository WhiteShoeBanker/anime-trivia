import { createClient } from "@/lib/supabase/server";
import { getEnabledAnime, type AnimeRegistryEntry } from "@/data/anime/registry";
import type { AgeGroup } from "@/types";
import BrowseContent from "./BrowseContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Anime - OtakuQuiz",
  description: "Choose an anime series and test your knowledge!",
};

const filterByAge = (
  anime: readonly AnimeRegistryEntry[],
  ageGroup: AgeGroup | null,
): readonly AnimeRegistryEntry[] => {
  if (ageGroup === "junior") return anime.filter((a) => a.contentRating === "E");
  if (ageGroup === "teen")
    return anime.filter((a) => a.contentRating === "E" || a.contentRating === "T");
  return anime;
};

export default async function BrowsePage() {
  let userId: string | null = null;
  let profileAgeGroup: AgeGroup | null = null;

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
      if (profile?.age_group) profileAgeGroup = profile.age_group as AgeGroup;
    }
  } catch {
    // Auth not available — treat as unauthenticated.
  }

  // Authenticated session with a null age_group is treated as junior — matches
  // the migration-016 RLS fallback that defaults unknown age to the most
  // restrictive bucket. Unauth (userId === null) keeps null and sees everything.
  const effectiveAge: AgeGroup | null =
    userId && !profileAgeGroup ? "junior" : profileAgeGroup;

  const animeList = filterByAge(getEnabledAnime(), effectiveAge);

  return <BrowseContent animeList={animeList} />;
}
