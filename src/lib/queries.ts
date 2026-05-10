import { createClient } from "@/lib/supabase/server";
import { deriveRankFromXp } from "@/lib/ranks";
import type {
  AnimeSeries,
  Question,
  QuizSession,
  UserProfile,
  Difficulty,
  Cosmetic,
  AgeGroup,
  PerAnimeStat,
  RecentQuiz,
} from "@/types";

// ── Anime Series ─────────────────────────────────────────────

export const getAnimeList = async (): Promise<AnimeSeries[]> => {
  // Cookie-aware server client → RLS (migration 016) scopes anime_series
  // to the viewer's age_group. Filtering is intentionally NOT done in
  // userland: callers used to hardcode "full" and leak mature content.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anime_series")
    .select("*")
    .eq("is_active", true)
    .order("title");

  if (error) throw error;
  return data as AnimeSeries[];
};

export const getAnimeBySlug = async (
  slug: string
): Promise<AnimeSeries | null> => {
  // Cookie-aware server client → RLS filters out anime the viewer is not
  // permitted to see. Callers MUST treat null as "do not render anything
  // that reveals the anime" — it covers both "not found" and "forbidden".
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anime_series")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data as AnimeSeries) ?? null;
};

// ── Questions ────────────────────────────────────────────────

export const getQuestions = async (
  animeId: string,
  difficulty: Difficulty,
  limit: number = 10,
  ageGroup?: AgeGroup
): Promise<Question[]> => {
  const supabase = await createClient();

  // Supabase doesn't have ORDER BY random() natively,
  // so we fetch a larger pool and shuffle client-side.
  let query = supabase
    .from("questions")
    .select("*")
    .eq("anime_id", animeId)
    .eq("difficulty", difficulty);

  if (ageGroup === "junior") {
    query = query.eq("kid_safe", true);
  }

  const { data, error } = await query;

  if (error) throw error;

  const questions = data as Question[];

  // Fisher-Yates shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions.slice(0, limit);
};

// ── Quiz Sessions ────────────────────────────────────────────

export const getUserQuizHistory = async (
  userId: string
): Promise<QuizSession[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data as QuizSession[];
};

// Top 8 anime the user has played, grouped by anime_id with accuracy_pct
// computed in JS. RLS on quiz_sessions (migration 001, policy
// quiz_sessions_select: auth.uid() = user_id) scopes the read to the caller's
// own sessions; the userId argument and the cookie-borne auth.uid() must
// agree or RLS yields zero rows. Sessions with NULL anime_id (e.g. mixed-
// anime daily challenges) are filtered out — those don't belong on a
// per-anime breakdown.
export const getUserPerAnimeStats = async (
  userId: string
): Promise<PerAnimeStat[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_sessions")
    .select(
      "anime_id, correct_answers, total_questions, anime_series!inner(slug, title)"
    )
    .eq("user_id", userId)
    .not("anime_id", "is", null);

  if (error) throw error;

  type Row = {
    anime_id: string;
    correct_answers: number | null;
    total_questions: number | null;
    anime_series: { slug: string; title: string };
  };

  const groups = new Map<string, PerAnimeStat>();
  for (const row of (data ?? []) as unknown as Row[]) {
    if (!row.anime_id || !row.anime_series) continue;
    const correct = row.correct_answers ?? 0;
    const total = row.total_questions ?? 0;
    const existing = groups.get(row.anime_id);
    if (existing) {
      existing.quiz_count += 1;
      existing.correct_answers += correct;
      existing.total_questions += total;
    } else {
      groups.set(row.anime_id, {
        anime_id: row.anime_id,
        anime_slug: row.anime_series.slug,
        anime_title: row.anime_series.title,
        quiz_count: 1,
        correct_answers: correct,
        total_questions: total,
        accuracy_pct: 0,
      });
    }
  }

  const stats = Array.from(groups.values()).map((s) => ({
    ...s,
    accuracy_pct:
      s.total_questions > 0
        ? Math.round((s.correct_answers / s.total_questions) * 100)
        : 0,
  }));

  stats.sort((a, b) => {
    if (b.quiz_count !== a.quiz_count) return b.quiz_count - a.quiz_count;
    return b.accuracy_pct - a.accuracy_pct;
  });

  return stats.slice(0, 8);
};

// Last 7 quiz sessions for the user, newest first, with accuracy_pct
// computed in JS. Powers the Pro Stats trend chart. Same RLS scoping and
// null-anime_id filter as getUserPerAnimeStats — mixed-anime daily
// challenges aren't part of the per-anime trend.
export const getUserRecentQuizzes = async (
  userId: string
): Promise<RecentQuiz[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_sessions")
    .select(
      "id, completed_at, correct_answers, total_questions, anime_id, anime_series!inner(slug, title)"
    )
    .eq("user_id", userId)
    .not("anime_id", "is", null)
    .order("completed_at", { ascending: false })
    .limit(7);

  if (error) throw error;

  type Row = {
    id: string;
    completed_at: string;
    correct_answers: number | null;
    total_questions: number | null;
    anime_id: string | null;
    anime_series: { slug: string; title: string } | null;
  };

  const rows = (data ?? []) as unknown as Row[];
  const result: RecentQuiz[] = [];
  for (const row of rows) {
    if (!row.anime_series) continue;
    const correct = row.correct_answers ?? 0;
    const total = row.total_questions ?? 0;
    result.push({
      session_id: row.id,
      anime_title: row.anime_series.title,
      anime_slug: row.anime_series.slug,
      completed_at: row.completed_at,
      accuracy_pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    });
  }
  return result;
};

// ── User Profiles & Leaderboard ──────────────────────────────

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as UserProfile) ?? null;
};

export const getLeaderboard = async (
  limit: number = 25
): Promise<UserProfile[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("total_xp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as UserProfile[];
};

export const updateUserXP = async (
  userId: string,
  xpEarned: number
): Promise<void> => {
  const supabase = await createClient();

  // Fetch current XP to calculate new total
  const { data: profile, error: fetchError } = await supabase
    .from("user_profiles")
    .select("total_xp")
    .eq("id", userId)
    .single();

  if (fetchError) throw fetchError;

  const currentXp = (profile as { total_xp: number }).total_xp;
  const newXp = currentXp + xpEarned;

  const rank = deriveRankFromXp(newXp);

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      total_xp: newXp,
      rank,
      last_played_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) throw updateError;
};

// ── Daily Quiz Limiter ───────────────────────────────────────

export const getDailyQuizCount = async (
  userId: string
): Promise<number> => {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("quiz_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("completed_at", today.toISOString());

  if (error) throw error;
  return count ?? 0;
};

// ── Star League ──────────────────────────────────────────────

export const getDiamondPlayerCount = async (): Promise<number> => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("total_xp", 10000);

  if (error) throw error;
  return count ?? 0;
};

// ── Cosmetics ────────────────────────────────────────────────

export const getCosmetics = async (): Promise<Cosmetic[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cosmetics")
    .select("*")
    .eq("is_active", true)
    .order("price_coins");

  if (error) throw error;
  return data as Cosmetic[];
};

