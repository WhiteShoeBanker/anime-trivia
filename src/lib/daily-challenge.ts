import { createClient } from "@/lib/supabase/client";
import {
  getDailyChallengeMix,
  getDailyChallengeMixForAge,
} from "@/lib/config-actions";
import { getPlayableAnime } from "@/data/anime/registry";
import type { Question, AgeGroup } from "@/types";

/**
 * Fetches 10 mixed-difficulty questions spread across multiple anime series
 * for the daily challenge.
 */
export const fetchDailyChallengeQuestions = async (
  ageGroup: AgeGroup = "full"
): Promise<Question[]> => {
  const supabase = createClient();

  // Registry is the variant-level authority — only variant-enabled,
  // non-coming-soon anime are eligible for the daily mix.
  const playableSlugs = getPlayableAnime().map((a) => a.slug);
  if (playableSlugs.length === 0) return [];

  // DB query stays the runtime authority (is_active + per-user age filter).
  let animeQuery = supabase
    .from("anime_series")
    .select("id")
    .eq("is_active", true)
    .in("slug", playableSlugs);

  if (ageGroup === "junior") {
    animeQuery = animeQuery.eq("content_rating", "E");
  } else if (ageGroup === "teen") {
    animeQuery = animeQuery.in("content_rating", ["E", "T"]);
  }

  const { data: animeList } = await animeQuery;
  if (!animeList || animeList.length === 0) return [];

  const allowedAnimeIds = (animeList as Array<{ id: string }>).map((a) => a.id);

  // Age-aware mix lookup (closes daily-bug-4). Juniors use the
  // junior-specific override when one is configured; otherwise fall
  // back to the base mix used by teen / full.
  const mixConfig =
    (await getDailyChallengeMixForAge(ageGroup)) ??
    (await getDailyChallengeMix());
  const difficultyMix: Array<{ difficulty: string; count: number }> = Object.entries(
    mixConfig
  ).map(([difficulty, count]) => ({ difficulty, count }));

  const allQuestions: Question[] = [];

  for (const { difficulty, count } of difficultyMix) {
    let questionsQuery = supabase
      .from("questions")
      .select("*")
      .eq("difficulty", difficulty)
      .in("anime_id", allowedAnimeIds);

    if (ageGroup === "junior") {
      questionsQuery = questionsQuery.eq("kid_safe", true);
    }

    const { data: questions } = await questionsQuery;
    if (!questions) continue;

    // Shuffle and take `count` questions, preferring spread across anime
    const shuffled = [...(questions as Question[])];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Try to pick from different anime series
    const usedAnime = new Set<string>();
    const picked: Question[] = [];

    for (const q of shuffled) {
      if (picked.length >= count) break;
      if (!usedAnime.has(q.anime_id)) {
        picked.push(q);
        usedAnime.add(q.anime_id);
      }
    }

    // If we didn't get enough unique anime, fill from remaining
    if (picked.length < count) {
      for (const q of shuffled) {
        if (picked.length >= count) break;
        if (!picked.includes(q)) {
          picked.push(q);
        }
      }
    }

    allQuestions.push(...picked);
  }

  // Final shuffle to mix difficulties
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  return allQuestions.slice(0, 10);
};

/**
 * Returns true if the user has already played the daily challenge today.
 */
export const checkDailyChallengePlayed = async (
  userId: string
): Promise<{ played: boolean; score: number | null }> => {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("daily_challenge_date, daily_challenge_score")
    .eq("id", userId)
    .single();

  if (!profile) return { played: false, score: null };

  const played = profile.daily_challenge_date === today;
  return {
    played,
    score: played ? profile.daily_challenge_score : null,
  };
};
