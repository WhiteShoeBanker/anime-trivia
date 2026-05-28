"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { getIncompleteProfilesCount } from "@/lib/admin-metrics";

const PRO_PRICE = 4.99;

export interface OverviewStats {
  dau: number;
  mau: number;
  stickiness: number;
  newSignupsToday: number;
  quizzesToday: number;
  activeDuelsToday: number;
  estimatedMRR: number;
  incompleteProfiles24h: number;
  dauSeries: { date: string; value: number }[];
  mauSeries: { date: string; value: number }[];
  signupsByAge: { date: string; junior: number; teen: number; full: number }[];
  recentSignups: {
    id: string;
    username: string | null;
    display_name: string | null;
    age_group: string | null;
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
  alerts: { type: "warning" | "info"; message: string; href?: string }[];
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
    { data: _allUsers },
    { count: activeDuels },
    { data: signupsAll30d },
    incompleteProfiles24h,
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
    getIncompleteProfilesCount(supabase, 24),
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
  const alerts: OverviewStats["alerts"] = [];
  if (dau === 0 && quizzesToday === 0) {
    alerts.push({ type: "warning", message: "No activity today yet" });
  }
  const yesterdayKey = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  const yesterdayDau = sessionsByDate.get(yesterdayKey)?.size ?? 0;
  if (yesterdayDau > 0 && dau < yesterdayDau * 0.5) {
    alerts.push({ type: "warning", message: `DAU dropped ${Math.round((1 - dau / yesterdayDau) * 100)}% vs yesterday` });
  }
  if (incompleteProfiles24h > 0) {
    alerts.push({
      type: "info",
      message: `${incompleteProfiles24h} ${incompleteProfiles24h === 1 ? "user is" : "users are"} stuck in age verification (>24h old)`,
      href: "/admin/users?filter=incomplete",
    });
  }

  return {
    dau, mau, stickiness, newSignupsToday, quizzesToday,
    activeDuelsToday: activeDuels ?? 0,
    estimatedMRR,
    incompleteProfiles24h,
    dauSeries, mauSeries, signupsByAge,
    recentSignups: (recentSignups ?? []) as OverviewStats["recentSignups"],
    topPlayers: (topPlayers ?? []) as OverviewStats["topPlayers"],
    alerts,
  };
}
