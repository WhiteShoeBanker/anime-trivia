"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { invalidateConfig } from "@/lib/admin-config";

// ── Overview ────────────────────────────────────────────────

export interface OverviewStats {
  totalUsers: number;
  activeToday: number;
  quizzesToday: number;
  proUsers: number;
  recentSignups: { created_at: string }[];
  topPlayers: {
    id: string;
    username: string | null;
    display_name: string | null;
    total_xp: number;
    rank: string;
    subscription_tier: string;
  }[];
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const supabase = createServiceClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    { count: totalUsers },
    { count: quizzesToday },
    { count: proUsers },
    { data: recentSignups },
    { data: topPlayers },
  ] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("quiz_sessions")
      .select("*", { count: "exact", head: true })
      .gte("completed_at", today.toISOString()),
    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_tier", "pro"),
    supabase
      .from("user_profiles")
      .select("created_at")
      .gte("created_at", weekAgo.toISOString())
      .order("created_at"),
    supabase
      .from("user_profiles")
      .select("id, username, display_name, total_xp, rank, subscription_tier")
      .order("total_xp", { ascending: false })
      .limit(10),
  ]);

  // DAU — distinct users with sessions today
  const { data: todaySessions } = await supabase
    .from("quiz_sessions")
    .select("user_id")
    .gte("completed_at", today.toISOString());

  const uniqueActiveUsers = new Set(
    (todaySessions ?? []).map((s) => s.user_id)
  );

  return {
    totalUsers: totalUsers ?? 0,
    activeToday: uniqueActiveUsers.size,
    quizzesToday: quizzesToday ?? 0,
    proUsers: proUsers ?? 0,
    recentSignups: recentSignups ?? [],
    topPlayers: (topPlayers ?? []) as OverviewStats["topPlayers"],
  };
}

// ── Users ───────────────────────────────────────────────────

export interface UsersListResult {
  users: {
    id: string;
    username: string | null;
    display_name: string | null;
    total_xp: number;
    rank: string;
    current_streak: number;
    subscription_tier: string;
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

// ── Engagement ──────────────────────────────────────────────

export interface EngagementData {
  sessions: {
    user_id: string;
    completed_at: string;
    time_taken_seconds: number | null;
    score: number;
    total_questions: number;
  }[];
}

export async function getEngagementData(
  days: number = 30
): Promise<EngagementData> {
  const supabase = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("quiz_sessions")
    .select("user_id, completed_at, time_taken_seconds, score, total_questions")
    .gte("completed_at", since.toISOString())
    .order("completed_at");

  return { sessions: (data ?? []) as EngagementData["sessions"] };
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
      supabase
        .from("anime_series")
        .select("id, title, slug, total_questions, is_active")
        .order("title"),
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
}

export async function getLeagueDistribution(): Promise<LeagueData> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("user_profiles")
    .select("rank, total_xp");

  return { users: (data ?? []) as LeagueData["users"] };
}

// ── Revenue ─────────────────────────────────────────────────

export interface RevenueData {
  proSubscribers: number;
  totalUsers: number;
  waitlistCount: number;
  limitHits: number;
}

export async function getRevenueData(): Promise<RevenueData> {
  const supabase = createServiceClient();

  const [
    { count: proCount },
    { count: totalCount },
    { count: waitlistCount },
    { count: limitHits },
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_tier", "pro"),
    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("star_league_waitlist")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "quiz_limit_hit"),
  ]);

  return {
    proSubscribers: proCount ?? 0,
    totalUsers: totalCount ?? 0,
    waitlistCount: waitlistCount ?? 0,
    limitHits: limitHits ?? 0,
  };
}

// ── Retention ───────────────────────────────────────────────

export interface RetentionData {
  users: {
    id: string;
    created_at: string;
    last_played_at: string | null;
    current_streak: number;
  }[];
  sessions: { user_id: string; completed_at: string }[];
}

export async function getRetentionData(): Promise<RetentionData> {
  const supabase = createServiceClient();

  const [{ data: users }, { data: sessions }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, created_at, last_played_at, current_streak")
      .order("created_at"),
    supabase
      .from("quiz_sessions")
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
    supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
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

  // Get old value for audit log
  const { data: existing } = await supabase
    .from("admin_config")
    .select("value")
    .eq("key", key)
    .single();

  // Upsert config
  const { error } = await supabase.from("admin_config").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: adminEmail,
  });

  if (error) throw error;

  // Write audit log
  await supabase.from("admin_audit_log").insert({
    admin_email: adminEmail,
    action: "update_config",
    setting_key: key,
    old_value: existing?.value ?? null,
    new_value: value as Record<string, unknown>,
  });

  // Invalidate server-side cache
  invalidateConfig(key);

  return { success: true };
}

// ── Analytics Events ────────────────────────────────────────

export async function getRecentEvents(limit: number = 100) {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("analytics_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as {
    id: string;
    event_name: string;
    user_id: string | null;
    data: Record<string, unknown>;
    created_at: string;
  }[];
}
