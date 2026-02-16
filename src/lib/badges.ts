import { createClient } from "@/lib/supabase/client";
import type { Badge, BadgeCheckContext, Difficulty } from "@/types";

// ── Main Entry Point ────────────────────────────────────────

export const checkAndAwardBadges = async (
  context: BadgeCheckContext
): Promise<Badge[]> => {
  const supabase = createClient();

  // Fetch all badges and user's already-earned badge IDs
  const [{ data: allBadges }, { data: earnedRows }] = await Promise.all([
    supabase.from("badges").select("*"),
    supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", context.userId),
  ]);

  if (!allBadges) return [];

  const earnedIds = new Set((earnedRows ?? []).map((r) => r.badge_id));
  const unearnedBadges = (allBadges as Badge[]).filter(
    (b) => !earnedIds.has(b.id)
  );

  if (unearnedBadges.length === 0) return [];

  // Gather user stats (fetched once, shared across checkers)
  const stats = await gatherUserStats(context.userId, supabase);

  // Run all checkers
  const newlyEarned: Badge[] = [];

  for (const badge of unearnedBadges) {
    const earned = await checkBadge(badge, context, stats, supabase);
    if (earned) {
      newlyEarned.push(badge);
    }
  }

  // Award all newly earned badges
  if (newlyEarned.length > 0) {
    const inserts = newlyEarned.map((b) => ({
      user_id: context.userId,
      badge_id: b.id,
    }));
    await supabase.from("user_badges").insert(inserts);
  }

  return newlyEarned;
};

// ── User Stats Gatherer ─────────────────────────────────────

interface UserStats {
  totalQuizzes: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  uniqueAnimeCount: number;
  totalAnimeCount: number;
  hardQuizCount: number;
  bestHardPercent: number;
  joinedAt: string;
  promotionCount: number;
  leagueTier: number;
  recentQuizDifficulties: string[];
  recentQuizScores: { score: number; total: number; difficulty: string }[];
  gpQualificationCount: number;
  gpWinCount: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gatherUserStats = async (userId: string, supabase: any): Promise<UserStats> => {
  const [
    { data: profile },
    { count: totalQuizzes },
    { data: uniqueAnime },
    { count: totalAnimeCount },
    { data: hardQuizzes },
    { count: promotionCount },
    { data: membership },
    { data: recentSessions },
    { count: gpQualificationCount },
    { count: gpWinCount },
  ] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", userId).single(),
    supabase
      .from("quiz_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("quiz_sessions")
      .select("anime_id")
      .eq("user_id", userId)
      .then((res: { data: { anime_id: string }[] | null }) => ({
        data: [...new Set((res.data ?? []).map((r) => r.anime_id))],
      })),
    supabase
      .from("anime_series")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("quiz_sessions")
      .select("score, total_questions, difficulty")
      .eq("user_id", userId)
      .eq("difficulty", "hard"),
    supabase
      .from("league_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("result", "promoted"),
    supabase
      .from("league_memberships")
      .select("league_id, leagues:league_id (tier)")
      .eq("user_id", userId)
      .order("joined_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("quiz_sessions")
      .select("score, total_questions, difficulty")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(10),
    supabase
      .from("grand_prix_matches")
      .select("*", { count: "exact", head: true })
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`),
    supabase
      .from("grand_prix_tournaments")
      .select("*", { count: "exact", head: true })
      .eq("winner_id", userId)
      .eq("status", "completed"),
  ]);

  const hardScores = (hardQuizzes ?? []) as {
    score: number;
    total_questions: number;
  }[];
  const bestHardPercent =
    hardScores.length > 0
      ? Math.max(
          ...hardScores.map(
            (q) =>
              (q.score / Math.max(q.total_questions, 1)) * 100
          )
        )
      : 0;

  // Extract league tier from membership join
  let leagueTier = 0;
  if (membership?.leagues) {
    const leagues = membership.leagues;
    if (Array.isArray(leagues) && leagues.length > 0) {
      leagueTier = leagues[0].tier ?? 0;
    } else if (typeof leagues === "object" && "tier" in leagues) {
      leagueTier = (leagues as { tier: number }).tier;
    }
  }

  return {
    totalQuizzes: totalQuizzes ?? 0,
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    totalXp: profile?.total_xp ?? 0,
    uniqueAnimeCount: Array.isArray(uniqueAnime) ? uniqueAnime.length : 0,
    totalAnimeCount: totalAnimeCount ?? 0,
    hardQuizCount: hardScores.length,
    bestHardPercent,
    joinedAt: profile?.created_at ?? new Date().toISOString(),
    promotionCount: promotionCount ?? 0,
    leagueTier,
    recentQuizDifficulties: (recentSessions ?? []).map(
      (s: { difficulty: string }) => s.difficulty
    ),
    recentQuizScores: (recentSessions ?? []).map(
      (s: { score: number; total_questions: number; difficulty: string }) => ({
        score: s.score,
        total: s.total_questions,
        difficulty: s.difficulty,
      })
    ),
    gpQualificationCount: gpQualificationCount ?? 0,
    gpWinCount: gpWinCount ?? 0,
  };
};

// ── Badge Checker Dispatcher ────────────────────────────────

const checkBadge = async (
  badge: Badge,
  context: BadgeCheckContext,
  stats: UserStats,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _supabase: any
): Promise<boolean> => {
  const val = badge.requirement_value;

  switch (badge.requirement_type) {
    case "streak_days":
      return checkStreakBadge(stats.currentStreak, val.days as number);

    case "weekend_both_days":
      return checkWeekendBadge();

    case "hour_before":
      return checkTimeBeforeBadge(val.hour as number);

    case "hour_after":
      return checkTimeAfterBadge(val.hour as number);

    case "hard_quiz_count":
      return stats.hardQuizCount >= (val.count as number);

    case "hard_score_percent":
      return checkHardScoreBadge(context, val.percent as number);

    case "total_quizzes":
      return stats.totalQuizzes >= (val.count as number);

    case "unique_anime":
      return checkBreadthBadge(stats, val);

    case "consecutive_correct":
      return checkConsecutiveCorrect(context, val.count as number);

    case "accuracy_percent":
      return checkAccuracyBadge(stats, val.percent as number, val.quizzes as number);

    case "all_under_time":
      return checkSpeedBadge(context, val.ms as number);

    case "all_under_time_difficulty":
      return checkSpeedDifficultyBadge(
        context,
        val.ms as number,
        val.difficulty as Difficulty
      );

    case "daily_challenge_streak":
      return false; // Daily challenges not yet implemented

    case "league_tier":
      return stats.leagueTier >= (val.tier as number);

    case "promotion_count":
      return stats.promotionCount >= (val.count as number);

    case "joined_before":
      return new Date(stats.joinedAt) < new Date(val.date as string);

    case "total_xp":
      return stats.totalXp >= (val.xp as number);

    case "gp_qualifier_count":
      return stats.gpQualificationCount >= (val.count as number);

    case "gp_win_count":
      return stats.gpWinCount >= (val.count as number);

    default:
      return false;
  }
};

// ── Category-Specific Checkers ──────────────────────────────

const checkStreakBadge = (currentStreak: number, requiredDays: number): boolean => {
  return currentStreak >= requiredDays;
};

const checkWeekendBadge = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  // Award if it's Sunday and they played yesterday (Saturday)
  // or if it's Saturday — we check after quiz completion
  return day === 0 || day === 6;
};

const checkTimeBeforeBadge = (hour: number): boolean => {
  const localHour = new Date().getHours();
  return localHour < hour;
};

const checkTimeAfterBadge = (hour: number): boolean => {
  const localHour = new Date().getHours();
  return localHour >= hour;
};

const checkHardScoreBadge = (
  context: BadgeCheckContext,
  requiredPercent: number
): boolean => {
  if (context.difficulty !== "hard") return false;
  if (!context.quizScore || !context.quizTotal) return false;
  const percent = (context.quizScore / context.quizTotal) * 100;
  return percent >= requiredPercent;
};

const checkBreadthBadge = (
  stats: UserStats,
  val: Record<string, unknown>
): boolean => {
  if (val.all === true) {
    return (
      stats.totalAnimeCount > 0 &&
      stats.uniqueAnimeCount >= stats.totalAnimeCount
    );
  }
  return stats.uniqueAnimeCount >= (val.count as number);
};

const checkConsecutiveCorrect = (
  context: BadgeCheckContext,
  requiredCount: number
): boolean => {
  if (!context.answers) return false;
  let streak = 0;
  let maxStreak = 0;
  for (const answer of context.answers) {
    if (answer.isCorrect) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }
  return maxStreak >= requiredCount;
};

const checkAccuracyBadge = (
  stats: UserStats,
  requiredPercent: number,
  requiredQuizzes: number
): boolean => {
  if (stats.recentQuizScores.length < requiredQuizzes) return false;
  const relevant = stats.recentQuizScores.slice(0, requiredQuizzes);
  const totalCorrect = relevant.reduce((s, q) => s + q.score, 0);
  const totalQuestions = relevant.reduce((s, q) => s + q.total, 0);
  if (totalQuestions === 0) return false;
  return (totalCorrect / totalQuestions) * 100 >= requiredPercent;
};

const checkSpeedBadge = (
  context: BadgeCheckContext,
  maxMs: number
): boolean => {
  if (!context.answers || context.answers.length === 0) return false;
  return context.answers.every(
    (a) => a.isCorrect && a.timeMs < maxMs
  );
};

const checkSpeedDifficultyBadge = (
  context: BadgeCheckContext,
  maxMs: number,
  difficulty: Difficulty
): boolean => {
  if (context.difficulty !== difficulty) return false;
  return checkSpeedBadge(context, maxMs);
};

// ── Emblem Management ───────────────────────────────────────

export const setEmblem = async (
  userId: string,
  badgeId: string | null
): Promise<void> => {
  const supabase = createClient();
  await supabase
    .from("user_profiles")
    .update({ emblem_badge_id: badgeId })
    .eq("id", userId);
};

// ── Fetch User Badges ───────────────────────────────────────

export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_badges")
    .select("badge_id, badges (*)")
    .eq("user_id", userId);

  if (!data) return [];
  return data
    .map((row) => {
      const badges = row.badges;
      if (Array.isArray(badges)) return badges[0] as Badge | undefined;
      return badges as Badge | undefined;
    })
    .filter((b): b is Badge => b !== undefined);
};

export const getAllBadges = async (): Promise<Badge[]> => {
  const supabase = createClient();
  const { data } = await supabase.from("badges").select("*").order("category");
  return (data as Badge[]) ?? [];
};

export const getUserEmblem = async (
  userId: string
): Promise<Badge | null> => {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("emblem_badge_id")
    .eq("id", userId)
    .single();

  if (!profile?.emblem_badge_id) return null;

  const { data: badge } = await supabase
    .from("badges")
    .select("*")
    .eq("id", profile.emblem_badge_id)
    .single();

  return (badge as Badge) ?? null;
};
