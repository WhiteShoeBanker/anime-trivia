"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { invalidateConfig } from "@/lib/admin-config";
import { trackEvent } from "@/lib/analytics";

const PRO_PRICE = 4.99;

// ── Overview ────────────────────────────────────────────────

export interface OverviewStats {
  dau: number;
  mau: number;
  stickiness: number;
  newSignupsToday: number;
  quizzesToday: number;
  activeDuelsToday: number;
  estimatedMRR: number;
  dauSeries: { date: string; value: number }[];
  mauSeries: { date: string; value: number }[];
  signupsByAge: { date: string; junior: number; teen: number; full: number }[];
  recentSignups: {
    id: string;
    username: string | null;
    display_name: string | null;
    age_group: string;
    created_at: string;
  }[];
  topPlayers: {
    id: string;
    username: string | null;
    display_name: string | null;
    total_xp: number;
    rank: string;
    subscription_tier: string;
  }[];
  alerts: { type: string; message: string }[];
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const supabase = createServiceClient();
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: proCount },
    { data: recentSignups },
    { data: topPlayers },
    { data: allSessions30d },
    { data: allUsers },
    { count: activeDuels },
    { data: signupsAll30d },
  ] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("subscription_tier", "pro"),
    supabase.from("user_profiles")
      .select("id, username, display_name, age_group, created_at")
      .order("created_at", { ascending: false }).limit(10),
    supabase.from("user_profiles")
      .select("id, username, display_name, total_xp, rank, subscription_tier")
      .order("total_xp", { ascending: false }).limit(10),
    supabase.from("quiz_sessions")
      .select("user_id, completed_at")
      .gte("completed_at", thirtyDaysAgo.toISOString()),
    supabase.from("user_profiles").select("id, created_at, age_group, last_played_at"),
    supabase.from("duel_matches")
      .select("*", { count: "exact", head: true })
      .in("status", ["waiting", "matched", "in_progress"]),
    supabase.from("user_profiles")
      .select("age_group, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  // Compute DAU/MAU series
  const sessionsByDate = new Map<string, Set<string>>();
  for (const s of allSessions30d ?? []) {
    const day = s.completed_at.slice(0, 10);
    if (!sessionsByDate.has(day)) sessionsByDate.set(day, new Set());
    sessionsByDate.get(day)!.add(s.user_id);
  }

  const dauSeries: { date: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dauSeries.push({ date: key, value: sessionsByDate.get(key)?.size ?? 0 });
  }

  // MAU = rolling 30-day unique users at each day
  const mauSeries: { date: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const end = d.toISOString().slice(0, 10);
    const start = new Date(d);
    start.setDate(start.getDate() - 29);
    const startKey = start.toISOString().slice(0, 10);
    const users = new Set<string>();
    for (const [dateKey, userSet] of sessionsByDate) {
      if (dateKey >= startKey && dateKey <= end) {
        for (const uid of userSet) users.add(uid);
      }
    }
    mauSeries.push({ date: end, value: users.size });
  }

  const todayKey = today.toISOString().slice(0, 10);
  const dau = sessionsByDate.get(todayKey)?.size ?? 0;
  const mau = mauSeries[mauSeries.length - 1]?.value ?? 0;
  const stickiness = mau > 0 ? Math.round((dau / mau) * 100) : 0;

  // Quizzes today
  let quizzesToday = 0;
  for (const s of allSessions30d ?? []) {
    if (s.completed_at.slice(0, 10) === todayKey) quizzesToday++;
  }

  // Signups today
  const newSignupsToday = (signupsAll30d ?? []).filter(
    (u) => u.created_at.slice(0, 10) === todayKey
  ).length;

  // Signups by age group (30 days)
  const signupsByDate = new Map<string, { junior: number; teen: number; full: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    signupsByDate.set(d.toISOString().slice(0, 10), { junior: 0, teen: 0, full: 0 });
  }
  for (const u of signupsAll30d ?? []) {
    const day = u.created_at.slice(0, 10);
    const bucket = signupsByDate.get(day);
    if (bucket) {
      const ag = u.age_group as "junior" | "teen" | "full";
      if (ag in bucket) bucket[ag]++;
    }
  }
  const signupsByAge = Array.from(signupsByDate.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));

  // MRR
  const estimatedMRR = (proCount ?? 0) * PRO_PRICE;

  // Alerts
  const alerts: { type: string; message: string }[] = [];
  if (dau === 0 && quizzesToday === 0) {
    alerts.push({ type: "warning", message: "No activity today yet" });
  }
  const yesterdayKey = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  const yesterdayDau = sessionsByDate.get(yesterdayKey)?.size ?? 0;
  if (yesterdayDau > 0 && dau < yesterdayDau * 0.5) {
    alerts.push({ type: "warning", message: `DAU dropped ${Math.round((1 - dau / yesterdayDau) * 100)}% vs yesterday` });
  }

  return {
    dau, mau, stickiness, newSignupsToday, quizzesToday,
    activeDuelsToday: activeDuels ?? 0,
    estimatedMRR,
    dauSeries, mauSeries, signupsByAge,
    recentSignups: (recentSignups ?? []) as OverviewStats["recentSignups"],
    topPlayers: (topPlayers ?? []) as OverviewStats["topPlayers"],
    alerts,
  };
}

// ── Users ───────────────────────────────────────────────────

export interface UsersListResult {
  users: {
    id: string;
    username: string | null;
    display_name: string | null;
    email?: string;
    total_xp: number;
    rank: string;
    current_streak: number;
    subscription_tier: string;
    subscription_source: string;
    age_group: string;
    is_junior: boolean;
    created_at: string;
    last_played_at: string | null;
  }[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getUsersList(
  page: number = 1,
  search: string = "",
  filter: string = "all"
): Promise<UsersListResult> {
  const supabase = createServiceClient();
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("user_profiles")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `username.ilike.%${search}%,display_name.ilike.%${search}%`
    );
  }

  if (filter === "pro") {
    query = query.eq("subscription_tier", "pro");
  } else if (filter === "junior") {
    query = query.eq("is_junior", true);
  } else if (filter === "churned") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.lt("last_played_at", sevenDaysAgo.toISOString());
  } else if (filter === "teen") {
    query = query.eq("age_group", "teen");
  } else if (filter === "admin_grant") {
    query = query.eq("subscription_source", "admin_grant");
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    users: (data ?? []) as UsersListResult["users"],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

// ── User Pro Management ──────────────────────────────────────

export async function upgradeUserToPro(
  userId: string,
  tier: "pro_monthly" | "pro_yearly" | "pro_lifetime",
  adminEmail: string
): Promise<{ success: boolean }> {
  const supabase = createServiceClient();

  const expiresAt = (() => {
    const now = new Date();
    if (tier === "pro_monthly") { now.setMonth(now.getMonth() + 1); return now.toISOString(); }
    if (tier === "pro_yearly") { now.setFullYear(now.getFullYear() + 1); return now.toISOString(); }
    return null;
  })();

  const { error } = await supabase.from("user_profiles").update({
    subscription_tier: "pro",
    subscription_source: "admin_grant",
    pro_expires_at: expiresAt,
  }).eq("id", userId);

  if (error) throw error;

  await supabase.from("admin_audit_log").insert({
    admin_email: adminEmail,
    action: "upgrade_user_to_pro",
    setting_key: userId,
    old_value: { tier: "free" },
    new_value: { tier: "pro", type: tier, expires_at: expiresAt },
  });

  trackEvent("admin_user_upgrade", undefined, {
    admin_email: adminEmail,
    target_user_id: userId,
    tier,
  }).catch(() => {});

  return { success: true };
}

export async function revokeUserPro(
  userId: string,
  adminEmail: string
): Promise<{ success: boolean }> {
  const supabase = createServiceClient();

  const { error } = await supabase.from("user_profiles").update({
    subscription_tier: "free",
    subscription_source: "none",
    pro_expires_at: null,
  }).eq("id", userId);

  if (error) throw error;

  await supabase.from("admin_audit_log").insert({
    admin_email: adminEmail,
    action: "revoke_user_pro",
    setting_key: userId,
    old_value: { tier: "pro" },
    new_value: { tier: "free" },
  });

  return { success: true };
}

// ── User Duel Stats ──────────────────────────────────────────

export async function getUserDuelStats(userId: string): Promise<{
  wins: number; losses: number; draws: number;
} | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("duel_stats")
    .select("wins, losses, draws").eq("user_id", userId).single();
  return data as { wins: number; losses: number; draws: number } | null;
}

// ── Engagement ──────────────────────────────────────────────

export interface EngagementData {
  sessions: {
    user_id: string;
    completed_at: string;
    time_taken_seconds: number | null;
    score: number;
    total_questions: number;
  }[];
  dailyChallengeCount: number;
  duelParticipants: number;
}

export async function getEngagementData(
  days: number = 30
): Promise<EngagementData> {
  const supabase = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [{ data: sessions }, { count: rawDcCount }, { data: duels }, { data: rollupDc }] = await Promise.all([
    supabase.from("quiz_sessions")
      .select("user_id, completed_at, time_taken_seconds, score, total_questions")
      .gte("completed_at", since.toISOString()).order("completed_at"),
    supabase.from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "daily_challenge_completed")
      .gte("created_at", since.toISOString()),
    supabase.from("duel_matches")
      .select("challenger_id, opponent_id")
      .eq("status", "completed")
      .gte("created_at", since.toISOString()),
    supabase.from("analytics_daily_rollup")
      .select("event_count")
      .eq("event_name", "daily_challenge_completed")
      .gte("event_date", since.toISOString().slice(0, 10)),
  ]);

  // Combine raw events + rollup for daily challenge count
  const dailyChallengeCount = (rawDcCount ?? 0) +
    (rollupDc ?? []).reduce((s: number, r: { event_count: number }) => s + (r.event_count ?? 0), 0);

  const duelUsers = new Set<string>();
  for (const d of duels ?? []) {
    if (d.challenger_id) duelUsers.add(d.challenger_id);
    if (d.opponent_id) duelUsers.add(d.opponent_id);
  }

  return {
    sessions: (sessions ?? []) as EngagementData["sessions"],
    dailyChallengeCount,
    duelParticipants: duelUsers.size,
  };
}

// ── Content ─────────────────────────────────────────────────

export interface ContentStats {
  anime: {
    id: string;
    title: string;
    slug: string;
    total_questions: number;
    is_active: boolean;
  }[];
  questions: { id: string; anime_id: string; difficulty: string }[];
  answers: { question_id: string; is_correct: boolean }[];
}

export async function getContentStats(): Promise<ContentStats> {
  const supabase = createServiceClient();

  const [{ data: anime }, { data: questions }, { data: answers }] =
    await Promise.all([
      supabase.from("anime_series")
        .select("id, title, slug, total_questions, is_active").order("title"),
      supabase.from("questions").select("id, anime_id, difficulty"),
      supabase.from("user_answers").select("question_id, is_correct"),
    ]);

  return {
    anime: (anime ?? []) as ContentStats["anime"],
    questions: (questions ?? []) as ContentStats["questions"],
    answers: (answers ?? []) as ContentStats["answers"],
  };
}

// ── Leagues ─────────────────────────────────────────────────

export interface LeagueData {
  users: { rank: string; total_xp: number }[];
  history: {
    league_id: string;
    result: string;
    unique_anime_count: number;
    week_start: string;
  }[];
  weeklyPlays: { user_id: string; anime_id: string; play_count: number }[];
  leagues: { id: string; name: string; tier: number }[];
}

export async function getLeagueDistribution(): Promise<LeagueData> {
  const supabase = createServiceClient();

  const [{ data: users }, { data: history }, { data: weeklyPlays }, { data: leagues }] =
    await Promise.all([
      supabase.from("user_profiles").select("rank, total_xp"),
      supabase.from("league_history")
        .select("league_id, result, unique_anime_count, week_start")
        .order("week_start", { ascending: false }).limit(500),
      supabase.from("weekly_anime_plays")
        .select("user_id, anime_id, play_count")
        .gte("play_count", 10).limit(100),
      supabase.from("leagues").select("id, name, tier").order("tier"),
    ]);

  return {
    users: (users ?? []) as LeagueData["users"],
    history: (history ?? []) as LeagueData["history"],
    weeklyPlays: (weeklyPlays ?? []) as LeagueData["weeklyPlays"],
    leagues: (leagues ?? []) as LeagueData["leagues"],
  };
}

// ── Duels ────────────────────────────────────────────────────

export interface DuelsData {
  totalToday: number;
  totalWeek: number;
  totalAllTime: number;
  quickMatchCount: number;
  friendChallengeCount: number;
  duelsByAnime: { anime_id: string; anime_title: string; count: number }[];
  duelsByDifficulty: { difficulty: string; count: number }[];
  giantKillsWeek: number;
  topDuelists: {
    user_id: string;
    username: string | null;
    wins: number;
    losses: number;
    draws: number;
    win_streak: number;
    giant_kills: number;
  }[];
  expiredCount: number;
  avgAccuracy: number;
}

export async function getDuelsData(): Promise<DuelsData> {
  const supabase = createServiceClient();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    { count: totalAllTime },
    { count: totalToday },
    { count: totalWeek },
    { data: completedDuels },
    { data: duelStatsRows },
    { count: expiredCount },
    { count: giantKillsWeek },
  ] = await Promise.all([
    supabase.from("duel_matches").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("duel_matches").select("*", { count: "exact", head: true })
      .eq("status", "completed").gte("created_at", todayStart.toISOString()),
    supabase.from("duel_matches").select("*", { count: "exact", head: true })
      .eq("status", "completed").gte("created_at", weekAgo.toISOString()),
    supabase.from("duel_matches")
      .select("match_type, anime_id, difficulty, challenger_correct, opponent_correct, question_count")
      .eq("status", "completed").limit(1000),
    supabase.from("duel_stats")
      .select("user_id, wins, losses, draws, win_streak, giant_kills")
      .order("wins", { ascending: false }).limit(20),
    supabase.from("duel_matches").select("*", { count: "exact", head: true }).eq("status", "expired"),
    supabase.from("analytics_events").select("*", { count: "exact", head: true })
      .eq("event_name", "badge_earned")
      .gte("created_at", weekAgo.toISOString()),
  ]);

  // Match type breakdown
  let quickMatchCount = 0;
  let friendChallengeCount = 0;
  const animeCount = new Map<string, number>();
  const difficultyCount = new Map<string, number>();
  let totalCorrect = 0;
  let totalQuestions = 0;

  for (const d of completedDuels ?? []) {
    if (d.match_type === "quick_match") quickMatchCount++;
    else friendChallengeCount++;

    if (d.anime_id) {
      animeCount.set(d.anime_id, (animeCount.get(d.anime_id) ?? 0) + 1);
    }
    difficultyCount.set(d.difficulty, (difficultyCount.get(d.difficulty) ?? 0) + 1);

    if (d.challenger_correct != null && d.question_count) {
      totalCorrect += d.challenger_correct;
      totalQuestions += d.question_count;
    }
    if (d.opponent_correct != null && d.question_count) {
      totalCorrect += d.opponent_correct;
      totalQuestions += d.question_count;
    }
  }

  // Get anime titles for top duels
  const topAnimeIds = Array.from(animeCount.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id]) => id);

  let duelsByAnime: DuelsData["duelsByAnime"] = [];
  if (topAnimeIds.length > 0) {
    const { data: animeRows } = await supabase.from("anime_series")
      .select("id, title").in("id", topAnimeIds);
    const titleMap = new Map((animeRows ?? []).map((a) => [a.id, a.title]));
    duelsByAnime = topAnimeIds.map((id) => ({
      anime_id: id,
      anime_title: titleMap.get(id) ?? "Unknown",
      count: animeCount.get(id) ?? 0,
    }));
  }

  const duelsByDifficulty = Array.from(difficultyCount.entries())
    .map(([difficulty, count]) => ({ difficulty, count }))
    .sort((a, b) => b.count - a.count);

  // Get usernames for top duelists
  const topDuelists: DuelsData["topDuelists"] = [];
  if (duelStatsRows && duelStatsRows.length > 0) {
    const userIds = duelStatsRows.map((r) => r.user_id);
    const { data: profiles } = await supabase.from("user_profiles")
      .select("id, username").in("id", userIds);
    const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));
    for (const row of duelStatsRows) {
      topDuelists.push({
        ...row,
        username: nameMap.get(row.user_id) ?? null,
      });
    }
  }

  return {
    totalToday: totalToday ?? 0,
    totalWeek: totalWeek ?? 0,
    totalAllTime: totalAllTime ?? 0,
    quickMatchCount, friendChallengeCount,
    duelsByAnime, duelsByDifficulty,
    giantKillsWeek: giantKillsWeek ?? 0,
    topDuelists,
    expiredCount: expiredCount ?? 0,
    avgAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
  };
}

// ── Revenue ─────────────────────────────────────────────────

export interface RevenueData {
  proSubscribers: number;
  totalUsers: number;
  waitlistCount: number;
  limitHits: number;
  proBySource: { paid: number; promo_code: number; admin_grant: number };
  promoCodes: {
    id: string;
    code: string;
    type: string;
    max_uses: number;
    current_uses: number;
    expires_at: string | null;
    created_by: string | null;
    created_at: string;
  }[];
  redemptions: {
    id: string;
    user_id: string;
    username: string | null;
    code: string;
    type: string;
    redeemed_at: string;
  }[];
  limitHitsByDay: { date: string; count: number }[];
  shopViews: number;
}

export async function getRevenueData(): Promise<RevenueData> {
  const supabase = createServiceClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: proCount },
    { count: totalCount },
    { count: waitlistCount },
    { count: rawLimitHits },
    { data: proUsers },
    { data: promoCodes },
    { data: limitEvents },
    { count: rawShopViews },
    { data: rollupLimitRows },
    { data: rollupShopRows },
  ] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("subscription_tier", "pro"),
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase.from("star_league_waitlist").select("*", { count: "exact", head: true }),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "quiz_limit_hit"),
    supabase.from("user_profiles").select("subscription_source").eq("subscription_tier", "pro"),
    supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("analytics_events")
      .select("created_at").eq("event_name", "quiz_limit_hit")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "shop_view"),
    supabase.from("analytics_daily_rollup").select("event_count").eq("event_name", "quiz_limit_hit"),
    supabase.from("analytics_daily_rollup").select("event_count").eq("event_name", "shop_view"),
  ]);

  // Combine raw events + rollup for all-time counts (rollup holds data >90 days old)
  const limitHits = (rawLimitHits ?? 0) +
    (rollupLimitRows ?? []).reduce((s: number, r: { event_count: number }) => s + (r.event_count ?? 0), 0);
  const shopViews = (rawShopViews ?? 0) +
    (rollupShopRows ?? []).reduce((s: number, r: { event_count: number }) => s + (r.event_count ?? 0), 0);

  // Pro by source
  const proBySource = { paid: 0, promo_code: 0, admin_grant: 0 };
  for (const u of proUsers ?? []) {
    const src = u.subscription_source as keyof typeof proBySource;
    if (src in proBySource) proBySource[src]++;
    else proBySource.paid++;
  }

  // Limit hits by day
  const limitByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    limitByDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const e of limitEvents ?? []) {
    const day = e.created_at.slice(0, 10);
    if (limitByDay.has(day)) limitByDay.set(day, (limitByDay.get(day) ?? 0) + 1);
  }
  const limitHitsByDay = Array.from(limitByDay.entries()).map(([date, count]) => ({ date, count }));

  // Get redemptions with usernames
  const { data: redemptionsRaw } = await supabase.from("promo_redemptions")
    .select("id, user_id, promo_code_id, redeemed_at")
    .order("redeemed_at", { ascending: false }).limit(50);

  const redemptions: RevenueData["redemptions"] = [];
  if (redemptionsRaw && redemptionsRaw.length > 0) {
    const userIds = [...new Set(redemptionsRaw.map((r) => r.user_id))];
    const codeIds = [...new Set(redemptionsRaw.map((r) => r.promo_code_id))];
    const [{ data: profiles }, { data: codes }] = await Promise.all([
      supabase.from("user_profiles").select("id, username").in("id", userIds),
      supabase.from("promo_codes").select("id, code, type").in("id", codeIds),
    ]);
    const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));
    const codeMap = new Map((codes ?? []).map((c) => [c.id, { code: c.code, type: c.type }]));

    for (const r of redemptionsRaw) {
      const codeInfo = codeMap.get(r.promo_code_id);
      redemptions.push({
        id: r.id,
        user_id: r.user_id,
        username: nameMap.get(r.user_id) ?? null,
        code: codeInfo?.code ?? "?",
        type: codeInfo?.type ?? "?",
        redeemed_at: r.redeemed_at,
      });
    }
  }

  return {
    proSubscribers: proCount ?? 0,
    totalUsers: totalCount ?? 0,
    waitlistCount: waitlistCount ?? 0,
    limitHits,
    proBySource,
    promoCodes: (promoCodes ?? []) as RevenueData["promoCodes"],
    redemptions,
    limitHitsByDay,
    shopViews,
  };
}

// ── Generate Promo Code ──────────────────────────────────────

export async function generatePromoCode(
  type: "pro_monthly" | "pro_yearly" | "pro_lifetime",
  maxUses: number,
  expiresAt: string | null,
  adminEmail: string
): Promise<{ code: string }> {
  const supabase = createServiceClient();

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const code = `OTAKU-${part()}-${part()}`;

  const { error } = await supabase.from("promo_codes").insert({
    code,
    type,
    max_uses: maxUses,
    current_uses: 0,
    expires_at: expiresAt,
    created_by: adminEmail,
  });

  if (error) throw error;

  await supabase.from("admin_audit_log").insert({
    admin_email: adminEmail,
    action: "generate_promo_code",
    setting_key: code,
    old_value: null,
    new_value: { type, max_uses: maxUses, expires_at: expiresAt },
  });

  return { code };
}

// ── Retention ───────────────────────────────────────────────

export interface RetentionData {
  users: {
    id: string;
    created_at: string;
    last_played_at: string | null;
    current_streak: number;
    total_xp: number;
    username: string | null;
  }[];
  sessions: { user_id: string; completed_at: string }[];
}

export async function getRetentionData(): Promise<RetentionData> {
  const supabase = createServiceClient();

  const [{ data: users }, { data: sessions }] = await Promise.all([
    supabase.from("user_profiles")
      .select("id, created_at, last_played_at, current_streak, total_xp, username")
      .order("created_at"),
    supabase.from("quiz_sessions")
      .select("user_id, completed_at")
      .order("completed_at"),
  ]);

  return {
    users: (users ?? []) as RetentionData["users"],
    sessions: (sessions ?? []) as RetentionData["sessions"],
  };
}

// ── Settings ────────────────────────────────────────────────

export interface AdminSettings {
  configs: {
    key: string;
    value: unknown;
    updated_at: string;
    updated_by: string | null;
  }[];
  auditLog: {
    id: string;
    admin_email: string | null;
    action: string | null;
    setting_key: string | null;
    old_value: unknown;
    new_value: unknown;
    created_at: string;
  }[];
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const supabase = createServiceClient();

  const [{ data: configs }, { data: auditLog }] = await Promise.all([
    supabase.from("admin_config").select("*").order("key"),
    supabase.from("admin_audit_log").select("*")
      .order("created_at", { ascending: false }).limit(50),
  ]);

  return {
    configs: (configs ?? []) as AdminSettings["configs"],
    auditLog: (auditLog ?? []) as AdminSettings["auditLog"],
  };
}

export async function updateAdminSetting(
  key: string,
  value: unknown,
  adminEmail: string
): Promise<{ success: boolean }> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("admin_config").select("value").eq("key", key).single();

  const { error } = await supabase.from("admin_config").upsert({
    key, value,
    updated_at: new Date().toISOString(),
    updated_by: adminEmail,
  });

  if (error) throw error;

  await supabase.from("admin_audit_log").insert({
    admin_email: adminEmail,
    action: "update_config",
    setting_key: key,
    old_value: existing?.value ?? null,
    new_value: value as Record<string, unknown>,
  });

  trackEvent("admin_config_change", undefined, {
    admin_email: adminEmail,
    setting_key: key,
  }).catch(() => {});

  invalidateConfig(key);
  return { success: true };
}

// ── Analytics Events ────────────────────────────────────────

export async function getRecentEvents(limit: number = 100) {
  const supabase = createServiceClient();
  const { data } = await supabase.from("analytics_events")
    .select("*").order("created_at", { ascending: false }).limit(limit);

  return (data ?? []) as {
    id: string;
    event_name: string;
    user_id: string | null;
    data: Record<string, unknown>;
    created_at: string;
  }[];
}
