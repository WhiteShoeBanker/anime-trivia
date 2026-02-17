"use client";

import { useState, useEffect } from "react";
import { getDuelsData, type DuelsData } from "../actions";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Swords,
  Target,
  Zap,
  Trophy,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#4ade80",
  medium: "#facc15",
  hard: "#ef4444",
  impossible: "#a855f7",
  mixed: "#60a5fa",
};

const PIE_COLORS = ["#fb923c", "#34d399"];

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "0.5rem",
  color: "#f1f5f9",
  fontSize: "0.875rem",
};

const AdminDuelsPage = () => {
  const [data, setData] = useState<DuelsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getDuelsData();
        if (!cancelled) {
          setData(result);
        }
      } catch {
        // Server action failed -- keep previous data
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

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-orange-400" />
      </div>
    );
  }

  const pieData = [
    { name: "Quick Match", value: data.quickMatchCount },
    { name: "Friend Challenge", value: data.friendChallengeCount },
  ];

  const difficultyData = data.duelsByDifficulty.map((d) => ({
    difficulty: d.difficulty.charAt(0).toUpperCase() + d.difficulty.slice(1),
    count: d.count,
    fill: DIFFICULTY_COLORS[d.difficulty] ?? "#94a3b8",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Duels</h1>
        <p className="text-sm text-slate-400 mt-1">
          Duel activity, match types, and top competitors
        </p>
      </div>

      {/* TOP ROW: 4 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Duels Today */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Swords size={18} className="text-orange-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">
              Duels Today
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-100 tabular-nums">
            {data.totalToday.toLocaleString()}
          </p>
        </div>

        {/* Duels This Week */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Zap size={18} className="text-orange-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">
              Duels This Week
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-100 tabular-nums">
            {data.totalWeek.toLocaleString()}
          </p>
        </div>

        {/* Total All Time */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Trophy size={18} className="text-orange-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">
              Total All Time
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-100 tabular-nums">
            {data.totalAllTime.toLocaleString()}
          </p>
        </div>

        {/* Avg Accuracy */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Target size={18} className="text-orange-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">
              Avg Accuracy
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-100 tabular-nums">
            {data.avgAccuracy.toLocaleString()}%
          </p>
        </div>
      </div>

      {/* MIDDLE ROW: Pie chart + Bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Match vs Friend Challenge pie chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Quick Match vs Friend Challenge
          </h2>
          {data.quickMatchCount + data.friendChallengeCount > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ color: "#94a3b8", fontSize: "0.875rem" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
              No duel data available
            </div>
          )}
        </div>

        {/* Most Popular Duel Anime bar chart (horizontal) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Most Popular Duel Anime
          </h2>
          {data.duelsByAnime.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.duelsByAnime}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="anime_title"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  fill="#fb923c"
                  radius={[0, 4, 4, 0]}
                  name="Duels"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
              No anime duel data available
            </div>
          )}
        </div>
      </div>

      {/* NEXT ROW: Difficulty chart + Stats cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Difficulty bar chart (vertical) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Most Popular Difficulty
          </h2>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={difficultyData}>
                <XAxis
                  dataKey="difficulty"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Duels">
                  {difficultyData.map((entry, index) => (
                    <Cell key={`diff-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
              No difficulty data available
            </div>
          )}
        </div>

        {/* Stats cards: Giant Kills + Expired Duels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {/* Giant Kills This Week */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Zap size={18} className="text-orange-400" />
              </div>
              <span className="text-sm font-medium text-slate-400">
                Giant Kills This Week
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-100 tabular-nums">
              {data.giantKillsWeek.toLocaleString()}
            </p>
          </div>

          {/* Expired Duels */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <span className="text-sm font-medium text-slate-400">
                Expired Duels
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-100 tabular-nums">
              {data.expiredCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM: Top Duelists table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Top Duelists
        </h2>
        {data.topDuelists.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    #
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Player
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                    W
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                    L
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                    D
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                    Win Streak
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                    Giant Kills
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topDuelists.slice(0, 20).map((duelist, index) => (
                  <tr
                    key={duelist.user_id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-slate-400 tabular-nums">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-100">
                      {duelist.username ?? "Anonymous"}
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-400 tabular-nums text-right">
                      {duelist.wins.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-400 tabular-nums text-right">
                      {duelist.losses.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 tabular-nums text-right">
                      {duelist.draws.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-orange-400 tabular-nums text-right">
                      {duelist.win_streak.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-purple-400 tabular-nums text-right">
                      {duelist.giant_kills.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
            No duel stats available yet
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDuelsPage;
