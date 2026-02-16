import { createClient } from "@/lib/supabase/server";
import type { AnimeSeries } from "@/types";
import LandingContent from "./LandingContent";

interface LandingStats {
  questionsCount: number;
  seriesCount: number;
  playersCount: number;
}

export default async function Home() {
  let topAnime: AnimeSeries[] = [];
  let stats: LandingStats = { questionsCount: 0, seriesCount: 0, playersCount: 0 };

  try {
    const supabase = await createClient();

    const [animeResult, questionsResult, seriesResult, playersResult] =
      await Promise.all([
        supabase
          .from("anime_series")
          .select("*")
          .eq("is_active", true)
          .order("total_questions", { ascending: false })
          .limit(4),
        supabase
          .from("questions")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("anime_series")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("user_profiles")
          .select("*", { count: "exact", head: true }),
      ]);

    topAnime = (animeResult.data as AnimeSeries[]) ?? [];
    stats = {
      questionsCount: questionsResult.count ?? 0,
      seriesCount: seriesResult.count ?? 0,
      playersCount: playersResult.count ?? 0,
    };
  } catch {
    // DB unavailable — render with defaults
  }

  return <LandingContent topAnime={topAnime} stats={stats} />;
}
