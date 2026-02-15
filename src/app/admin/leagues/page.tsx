"use client";

import { useEffect, useState } from "react";
import { Trophy, Users, Zap, Crown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getLeagueDistribution } from "../actions";
import type { LeagueData } from "../actions";

const RANKS = [
  { name: "Genin", threshold: 0, color: "#94a3b8" },
  { name: "Chunin", threshold: 500, color: "#4ade80" },
  { name: "Jonin", threshold: 2000, color: "#60a5fa" },
  { name: "ANBU", threshold: 5000, color: "#a78bfa" },
  { name: "Kage", threshold: 10000, color: "#facc15" },
  { name: "Hokage", threshold: 25000, color: "#fb923c" },
] as const;

type RankName = (typeof RANKS)[number]["name"];

interface RankChartData {
  name: string;
  count: number;
  color: string;
}

const computeRankDistribution = (
  users: LeagueData["users"]
): RankChartData[] => {
  const counts: Record<RankName, number> = {
    Genin: 0,
    Chunin: 0,
    Jonin: 0,
    ANBU: 0,
    Kage: 0,
    Hokage: 0,
  };

  for (const user of users) {
    const rankName = user.rank as RankName;
    if (rankName in counts) {
      counts[rankName] += 1;
    }
  }

  return RANKS.map((rank) => ({
    name: rank.name,
    count: counts[rank.name],
    color: rank.color,
  }));
};

const LeaguesPage = () => {
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getLeagueDistribution();
        setData(result);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-slate-400 py-12">
        Failed to load league data.
      </div>
    );
  }

  const users = data.users;
  const totalUsers = users.length;
  const chartData = computeRankDistribution(users);

  const averageXP =
    totalUsers > 0
      ? Math.round(users.reduce((sum, u) => sum + u.total_xp, 0) / totalUsers)
      : 0;

  const eliteCount = chartData
    .filter((d) => d.name === "Kage" || d.name === "Hokage")
    .reduce((sum, d) => sum + d.count, 0);
  const elitePercentage =
    totalUsers > 0 ? ((eliteCount / totalUsers) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">League Distribution</h1>
        <p className="text-slate-400 mt-1">
          User rank distribution across all leagues
        </p>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-700">
            <Users size={20} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Users</p>
            <p className="text-2xl font-bold text-slate-100">
              {totalUsers.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-700">
            <Zap size={20} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Average XP</p>
            <p className="text-2xl font-bold text-slate-100">
              {averageXP.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-700">
            <Crown size={20} className="text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Kage + Hokage</p>
            <p className="text-2xl font-bold text-slate-100">
              {elitePercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-1 flex items-center gap-2">
          <Trophy size={18} className="text-orange-400" />
          Rank Distribution
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Number of users in each rank tier
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                fontSize={13}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Distribution Breakdown
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData.map((rank) => {
            const percentage =
              totalUsers > 0
                ? ((rank.count / totalUsers) * 100).toFixed(1)
                : "0.0";

            return (
              <div
                key={rank.name}
                className="bg-slate-800 rounded-lg p-4 border-l-4"
                style={{ borderLeftColor: rank.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: rank.color }}
                  >
                    {rank.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {RANKS.find((r) => r.name === rank.name)?.threshold.toLocaleString()}+ XP
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-100">
                  {rank.count.toLocaleString()}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {percentage}% of users
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaguesPage;
