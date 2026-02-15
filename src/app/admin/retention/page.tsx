"use client";

import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Loader2,
  Flame,
  CalendarCheck,
  CalendarClock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { getRetentionData, type RetentionData } from "../actions";
import { getUsersList, type UsersListResult } from "../actions";

// ── Types ──────────────────────────────────────────────────

interface StreakBucket {
  label: string;
  count: number;
}

interface ChurnUser {
  id: string;
  username: string;
  lastActive: Date | null;
  daysSinceActive: number;
  streak: number;
  xp: number;
}

// ── Helpers ────────────────────────────────────────────────

const bucketLabel = (streak: number): string => {
  if (streak === 0) return "0";
  if (streak <= 2) return "1-2";
  if (streak <= 5) return "3-5";
  if (streak <= 10) return "6-10";
  if (streak <= 20) return "11-20";
  return "21+";
};

const BUCKET_ORDER = ["0", "1-2", "3-5", "6-10", "11-20", "21+"];

const buildStreakBuckets = (
  users: RetentionData["users"]
): StreakBucket[] => {
  const counts: Record<string, number> = {};
  for (const label of BUCKET_ORDER) {
    counts[label] = 0;
  }
  for (const user of users) {
    const label = bucketLabel(user.current_streak);
    counts[label] = (counts[label] ?? 0) + 1;
  }
  return BUCKET_ORDER.map((label) => ({ label, count: counts[label] }));
};

const daysBetween = (a: Date, b: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / msPerDay);
};

const formatDate = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// ── Component ──────────────────────────────────────────────

const AdminRetentionPage = () => {
  const [retentionData, setRetentionData] = useState<RetentionData | null>(
    null
  );
  const [usersData, setUsersData] = useState<UsersListResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [retention, users] = await Promise.all([
          getRetentionData(),
          getUsersList(1, "", "all"),
        ]);
        if (!cancelled) {
          setRetentionData(retention);
          setUsersData(users);
        }
      } catch {
        // Server action failed
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Computed KPIs ────────────────────────────────────────

  const kpis = useMemo(() => {
    if (!retentionData)
      return { d1: 0, d7: 0, activeRate: 0, avgStreak: 0 };

    const { users, sessions } = retentionData;
    const now = new Date();

    if (users.length === 0)
      return { d1: 0, d7: 0, activeRate: 0, avgStreak: 0 };

    // Build a map of user_id -> earliest session date
    const sessionsByUser = new Map<string, Date[]>();
    for (const s of sessions) {
      const existing = sessionsByUser.get(s.user_id) ?? [];
      existing.push(new Date(s.completed_at));
      sessionsByUser.set(s.user_id, existing);
    }

    // D1 Retention: % of users who played within 1 day of signup
    let d1Count = 0;
    let d7Count = 0;

    for (const user of users) {
      const createdAt = new Date(user.created_at);
      const userSessions = sessionsByUser.get(user.id);
      if (!userSessions) continue;

      const hasD1Session = userSessions.some((sessionDate) => {
        const diff = daysBetween(createdAt, sessionDate);
        return diff <= 1 && sessionDate.getTime() > createdAt.getTime();
      });

      const hasD7Session = userSessions.some((sessionDate) => {
        const diff = daysBetween(createdAt, sessionDate);
        return diff <= 7 && sessionDate.getTime() > createdAt.getTime();
      });

      if (hasD1Session) d1Count++;
      if (hasD7Session) d7Count++;
    }

    const d1 = Math.round((d1Count / users.length) * 100);
    const d7 = Math.round((d7Count / users.length) * 100);

    // Active Rate: % of users with last_played_at in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeCount = users.filter((u) => {
      if (!u.last_played_at) return false;
      return new Date(u.last_played_at) >= sevenDaysAgo;
    }).length;

    const activeRate = Math.round((activeCount / users.length) * 100);

    // Average Streak
    const totalStreak = users.reduce((sum, u) => sum + u.current_streak, 0);
    const avgStreak = parseFloat((totalStreak / users.length).toFixed(1));

    return { d1, d7, activeRate, avgStreak };
  }, [retentionData]);

  // ── Streak Chart Data ────────────────────────────────────

  const streakBuckets = useMemo(() => {
    if (!retentionData) return [];
    return buildStreakBuckets(retentionData.users);
  }, [retentionData]);

  // ── Churn Risk Users ─────────────────────────────────────

  const churnUsers = useMemo((): ChurnUser[] => {
    if (!retentionData || !usersData) return [];

    const now = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Build a lookup of full user data
    const userLookup = new Map<
      string,
      { username: string | null; total_xp: number }
    >();
    for (const u of usersData.users) {
      userLookup.set(u.id, { username: u.username, total_xp: u.total_xp });
    }

    const churnCandidates: ChurnUser[] = [];

    for (const user of retentionData.users) {
      if (!user.last_played_at) continue;
      const lastPlayed = new Date(user.last_played_at);
      if (lastPlayed >= fourteenDaysAgo) continue;

      const fullUser = userLookup.get(user.id);

      churnCandidates.push({
        id: user.id,
        username: fullUser?.username ?? "Unknown",
        lastActive: lastPlayed,
        daysSinceActive: daysBetween(lastPlayed, now),
        streak: user.current_streak,
        xp: fullUser?.total_xp ?? 0,
      });
    }

    // Sort by last_played_at ascending (oldest first)
    churnCandidates.sort((a, b) => {
      if (!a.lastActive && !b.lastActive) return 0;
      if (!a.lastActive) return -1;
      if (!b.lastActive) return 1;
      return a.lastActive.getTime() - b.lastActive.getTime();
    });

    return churnCandidates.slice(0, 20);
  }, [retentionData, usersData]);

  // ── Render ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Retention</h1>
        <p className="text-sm text-slate-400 mt-1">
          User retention metrics and churn analysis
        </p>
      </div>

      {/* Streak Distribution Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-1 flex items-center gap-2">
          <Flame size={20} className="text-orange-400" />
          Streak Distribution
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Users grouped by their current streak length
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={streakBuckets}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 13 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 13 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "0.5rem",
                  color: "#e2e8f0",
                  fontSize: 13,
                }}
                cursor={{ fill: "rgba(148,163,184,0.1)" }}
                formatter={(value: number | undefined) => [value ?? 0, "Users"]}
                labelFormatter={(label: ReactNode) => `Streak: ${String(label)} days`}
              />
              <Bar
                dataKey="count"
                fill="#34d399"
                radius={[6, 6, 0, 0]}
                maxBarSize={64}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Retention KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard
          icon={<CalendarCheck size={20} className="text-emerald-400" />}
          label="D1 Retention"
          value={`${kpis.d1}%`}
          description="Played again within 1 day of signup"
        />
        <KPICard
          icon={<CalendarClock size={20} className="text-blue-400" />}
          label="D7 Retention"
          value={`${kpis.d7}%`}
          description="Played within 7 days of signup"
        />
        <KPICard
          icon={<TrendingUp size={20} className="text-orange-400" />}
          label="Active Rate"
          value={`${kpis.activeRate}%`}
          description="Users active in the last 7 days"
        />
        <KPICard
          icon={<Flame size={20} className="text-yellow-400" />}
          label="Avg Streak"
          value={`${kpis.avgStreak}`}
          description="Average current streak across all users"
        />
      </div>

      {/* Churn Risk Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-400" />
            Churn Risk
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Users who haven&apos;t played in 14+ days, sorted by last active
            date
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700">
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  Username
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  Days Since Active
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  Streak
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-300">
                  XP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {churnUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No users at risk of churning.
                  </td>
                </tr>
              ) : (
                churnUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-750 transition-colors"
                  >
                    <td className="px-6 py-3 text-slate-200 font-medium whitespace-nowrap">
                      {user.username}
                    </td>
                    <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                      {user.lastActive ? formatDate(user.lastActive) : "\u2014"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-red-400 font-semibold">
                        {user.daysSinceActive} days
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-300 tabular-nums whitespace-nowrap">
                      {user.streak}
                    </td>
                    <td className="px-6 py-3 text-slate-300 tabular-nums whitespace-nowrap">
                      {user.xp.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── KPI Card Sub-component ─────────────────────────────────

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

const KPICard = ({ icon, label, value, description }: KPICardProps) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-sm font-medium text-slate-400">{label}</span>
    </div>
    <p className="text-3xl font-bold text-slate-100">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{description}</p>
  </div>
);

export default AdminRetentionPage;
