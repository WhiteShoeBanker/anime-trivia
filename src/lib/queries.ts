import { createClient } from "@/lib/supabase/server";
import type {
  AnimeSeries,
  Question,
  QuizSession,
  UserProfile,
  Difficulty,
  UserAnswer,
} from "@/types";

// ── Anime Series ─────────────────────────────────────────────

export const getAnimeList = async (): Promise<AnimeSeries[]> => {
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anime_series")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as AnimeSeries) ?? null;
};

// ── Questions ────────────────────────────────────────────────

export const getQuestions = async (
  animeId: string,
  difficulty: Difficulty,
  limit: number = 10
): Promise<Question[]> => {
  const supabase = await createClient();

  // Supabase doesn't have ORDER BY random() natively,
  // so we fetch a larger pool and shuffle client-side.
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("anime_id", animeId)
    .eq("difficulty", difficulty);

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

export const saveQuizSession = async (
  data: Omit<QuizSession, "id" | "completed_at">
): Promise<QuizSession> => {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("quiz_sessions")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return session as QuizSession;
};

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

// ── User Answers ─────────────────────────────────────────────

export const saveUserAnswers = async (
  answers: Omit<UserAnswer, "id">[]
): Promise<void> => {
  const supabase = await createClient();
  const { error } = await supabase.from("user_answers").insert(answers);

  if (error) throw error;
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

  // Determine rank based on XP thresholds
  const rank = getRankForXP(newXp);

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

// ── Helpers ──────────────────────────────────────────────────

const RANK_THRESHOLDS: [number, string][] = [
  [25000, "Hokage"],
  [10000, "Kage"],
  [5000, "ANBU"],
  [2000, "Jonin"],
  [500, "Chunin"],
  [0, "Genin"],
];

const getRankForXP = (xp: number): string => {
  for (const [threshold, rank] of RANK_THRESHOLDS) {
    if (xp >= threshold) return rank;
  }
  return "Genin";
};
