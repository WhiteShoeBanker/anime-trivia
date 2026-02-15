"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, UserCheck, Zap, Crown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getOverviewStats, type OverviewStats } from "./actions";

interface SignupChartEntry {
  date: string;
  count: number;
}

const RANK_COLORS: Record<string, string> = {
  Genin: "bg-gray-500",
  Chunin: "bg-blue-500",
  Jonin: "bg-purple-500",
  ANBU: "bg-red-500",
  Kage: "bg-orange-500",
  Hokage: "bg-yellow-500",
};

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
};

const processSignups = (
  recentSignups: OverviewStats["recentSignups"]
): SignupChartEntry[] => {
  const counts: Record<string, number> = {};

  // Initialize the last 7 days with zero counts
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    counts[key] = 0;
  }

  // Tally signups by date
  for (const signup of recentSignups) {
    const key = signup.created_at.split("T")[0];
    if (key in counts) {
      counts[key] += 1;
    }
  }

  return Object.entries(counts).map(([date, count]) => ({
    date: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count,
  }));
};

const AdminOverview = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getOverviewStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const interval = setInterval(() => {
      fetchStats();
    }, 60_000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-lg">Failed to load overview data.</p>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-orange-400",
    },
    {
      label: "Active Today",
      value: stats.activeToday,
      icon: UserCheck,
      color: "text-emerald-400",
    },
    {
      label: "Quizzes Today",
      value: stats.quizzesToday,
      icon: Zap,
      color: "text-orange-400",
    },
    {
      label: "Pro Subscribers",
      value: stats.proUsers,
      icon: Crown,
      color: "text-emerald-400",
    },
  ];

  const chartData = processSignups(stats.recentSignups);

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-slate-100">Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-start justify-between"
            >
              <div>
                <p className="text-3xl font-bold text-slate-100">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-sm text-slate-400 mt-1">{card.label}</p>
              </div>
              <div
                className={`p-3 rounded-lg bg-slate-700/50 ${card.color}`}
              >
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Signups Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Recent Signups (Last 7 Days)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "0.5rem",
                  color: "#f1f5f9",
                }}
                labelStyle={{ color: "#94a3b8" }}
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
              />
              <Bar
                dataKey="count"
                name="Signups"
                fill="#fb923c"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Players Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Top Players
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400">
                  #
                </th>
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400">
                  Rank
                </th>
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400">
                  Player
                </th>
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400 text-right">
                  XP
                </th>
                <th className="pb-3 text-sm font-medium text-slate-400 text-right">
                  Tier
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.topPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className="border-b border-slate-700/50 last:border-0"
                >
                  <td className="py-3 pr-4 text-sm text-slate-400">
                    {index + 1}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
                        RANK_COLORS[player.rank] ?? "bg-slate-600"
                      }`}
                    >
                      {player.rank}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-100 font-medium">
                    {player.display_name ?? player.username ?? "Anonymous"}
                  </td>
                  <td className="py-3 pr-4 text-sm text-orange-400 font-mono text-right">
                    {player.total_xp.toLocaleString()}
                  </td>
                  <td className="py-3 text-sm text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        player.subscription_tier === "pro"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-slate-600/50 text-slate-400"
                      }`}
                    >
                      {TIER_LABELS[player.subscription_tier] ??
                        player.subscription_tier}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.topPlayers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    No players yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
