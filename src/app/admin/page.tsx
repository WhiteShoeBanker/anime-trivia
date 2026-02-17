"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  Zap,
  Crown,
  DollarSign,
  TrendingUp,
  Swords,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getOverviewStats, type OverviewStats } from "./actions";

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

const AGE_GROUP_LABELS: Record<string, string> = {
  junior: "Junior",
  teen: "Teen",
  full: "Full",
};

const formatDateTick = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatCreatedAt = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
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
      label: "DAU",
      value: stats.dau.toLocaleString(),
      icon: Users,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-400",
    },
    {
      label: "MAU",
      value: stats.mau.toLocaleString(),
      icon: Users,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      label: "Stickiness",
      value: stats.stickiness + "%",
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      label: "New Signups Today",
      value: stats.newSignupsToday.toLocaleString(),
      icon: UserCheck,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
    {
      label: "Quizzes Today",
      value: stats.quizzesToday.toLocaleString(),
      icon: Zap,
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
    },
    {
      label: "Active Duels",
      value: stats.activeDuelsToday.toLocaleString(),
      icon: Swords,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
    },
    {
      label: "Est. MRR",
      value: "$" + stats.estimatedMRR.toFixed(2),
      icon: DollarSign,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
  ];

  // Merge dauSeries and mauSeries into a single dataset for the line chart
  const dauMauData = stats.dauSeries.map((entry, i) => ({
    date: entry.date,
    dau: entry.value,
    mau: stats.mauSeries[i]?.value ?? 0,
  }));

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-slate-100">Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                <Icon size={20} className={card.iconColor} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {card.value}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DAU / MAU Line Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            DAU / MAU (30 Days)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dauMauData}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateTick}
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
                  labelFormatter={(label) => {
                    if (typeof label !== "string") return String(label ?? "");
                    return formatDateTick(label);
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#94a3b8", fontSize: "0.875rem" }}
                />
                <Line
                  type="monotone"
                  dataKey="dau"
                  name="DAU"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="mau"
                  name="MAU"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Signups by Age Group Stacked Bar Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Signups by Age Group (30 Days)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.signupsByAge}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateTick}
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
                  labelFormatter={(label) => {
                    if (typeof label !== "string") return String(label ?? "");
                    return formatDateTick(label);
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#94a3b8", fontSize: "0.875rem" }}
                />
                <Bar
                  dataKey="junior"
                  name="Junior"
                  stackId="signups"
                  fill="#3b82f6"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="teen"
                  name="Teen"
                  stackId="signups"
                  fill="#a855f7"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="full"
                  name="Full"
                  stackId="signups"
                  fill="#fb923c"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Signups, Top Players, Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Signups */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Recent Signups
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 pr-4 text-xs font-medium text-slate-400">
                    Username
                  </th>
                  <th className="pb-3 pr-4 text-xs font-medium text-slate-400">
                    Age Group
                  </th>
                  <th className="pb-3 text-xs font-medium text-slate-400 text-right">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSignups.map((signup) => (
                  <tr
                    key={signup.id}
                    className="border-b border-slate-700/50 last:border-0"
                  >
                    <td className="py-2.5 pr-4 text-sm text-slate-100 font-medium">
                      {signup.display_name ?? signup.username ?? "Anonymous"}
                    </td>
                    <td className="py-2.5 pr-4 text-sm text-slate-400">
                      {AGE_GROUP_LABELS[signup.age_group] ?? signup.age_group}
                    </td>
                    <td className="py-2.5 text-sm text-slate-400 text-right whitespace-nowrap">
                      {formatCreatedAt(signup.created_at)}
                    </td>
                  </tr>
                ))}
                {stats.recentSignups.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-sm text-slate-500"
                    >
                      No recent signups.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Players */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Top Players
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 pr-3 text-xs font-medium text-slate-400">
                    Rank
                  </th>
                  <th className="pb-3 pr-3 text-xs font-medium text-slate-400">
                    Player
                  </th>
                  <th className="pb-3 pr-3 text-xs font-medium text-slate-400 text-right">
                    XP
                  </th>
                  <th className="pb-3 text-xs font-medium text-slate-400 text-right">
                    Tier
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topPlayers.map((player) => (
                  <tr
                    key={player.id}
                    className="border-b border-slate-700/50 last:border-0"
                  >
                    <td className="py-2.5 pr-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
                          RANK_COLORS[player.rank] ?? "bg-slate-600"
                        }`}
                      >
                        {player.rank}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-sm text-slate-100 font-medium">
                      {player.display_name ?? player.username ?? "Anonymous"}
                    </td>
                    <td className="py-2.5 pr-3 text-sm text-orange-400 font-mono text-right">
                      {player.total_xp.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-sm text-right">
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
                      colSpan={4}
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

        {/* Alerts */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Alerts</h2>
          {stats.alerts.length > 0 ? (
            <div className="space-y-3">
              {stats.alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
                >
                  <AlertTriangle
                    size={18}
                    className="text-yellow-400 mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-yellow-200">{alert.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
              All clear -- no alerts at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
