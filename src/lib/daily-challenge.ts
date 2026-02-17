import { createClient } from "@/lib/supabase/client";
import { getDailyChallengeMix } from "@/lib/config-actions";
import type { Question, AgeGroup } from "@/types";

/**
 * Fetches 10 mixed-difficulty questions spread across multiple anime series
 * for the daily challenge.
 */
export const fetchDailyChallengeQuestions = async (
  ageGroup: AgeGroup = "full"
): Promise<Question[]> => {
  const supabase = createClient();

  // Get all active anime
  let animeQuery = supabase
    .from("anime_series")
    .select("id")
    .eq("is_active", true);

  if (ageGroup === "junior") {
    animeQuery = animeQuery.eq("content_rating", "E");
  } else if (ageGroup === "teen") {
    animeQuery = animeQuery.in("content_rating", ["E", "T"]);
  }

  const { data: animeList } = await animeQuery;
  if (!animeList || animeList.length === 0) return [];

  // Shuffle anime to spread questions across series
  const shuffledAnime = [...animeList];
  for (let i = shuffledAnime.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledAnime[i], shuffledAnime[j]] = [shuffledAnime[j], shuffledAnime[i]];
  }

  // Mix of difficulties from admin config
  const mixConfig = await getDailyChallengeMix();
  const difficultyMix: Array<{ difficulty: string; count: number }> = Object.entries(
    mixConfig
  ).map(([difficulty, count]) => ({ difficulty, count }));

  const allQuestions: Question[] = [];

  for (const { difficulty, count } of difficultyMix) {
    let questionsQuery = supabase
      .from("questions")
      .select("*")
      .eq("difficulty", difficulty);

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

/**
 * Saves the daily challenge result to the user's profile.
 */
export const saveDailyChallengeResult = async (
  userId: string,
  score: number,
  xpEarned: number
): Promise<void> => {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  // Update daily challenge result
  await supabase
    .from("user_profiles")
    .update({
      daily_challenge_date: today,
      daily_challenge_score: score,
    })
    .eq("id", userId);

  // Update total XP and rank
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("total_xp")
    .eq("id", userId)
    .single();

  if (profile) {
    const newXP = (profile as { total_xp: number }).total_xp + xpEarned;

    const rankThresholds: [number, string][] = [
      [25000, "Hokage"],
      [10000, "Kage"],
      [5000, "ANBU"],
      [2000, "Jonin"],
      [500, "Chunin"],
      [0, "Genin"],
    ];

    let rank = "Genin";
    for (const [threshold, rankName] of rankThresholds) {
      if (newXP >= threshold) {
        rank = rankName;
        break;
      }
    }

    await supabase
      .from("user_profiles")
      .update({
        total_xp: newXP,
        rank,
        last_played_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }
};
