"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Loader2, Users, Clock, Target, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getEngagementData, type EngagementData } from "../actions";

type RangeOption = 7 | 14 | 30;

interface DailyDauPoint {
  date: string;
  dau: number;
}

interface DailyQuizPoint {
  date: string;
  quizzes: number;
}

const RANGE_OPTIONS: { label: string; value: RangeOption }[] = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
];

const formatDateTick = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDateLabel = (label: ReactNode): ReactNode => {
  if (typeof label !== "string") return String(label ?? "");
  return formatDateTick(label);
};

const computeDauData = (
  sessions: EngagementData["sessions"]
): DailyDauPoint[] => {
  const dayMap = new Map<string, Set<string>>();

  for (const session of sessions) {
    const day = session.completed_at.slice(0, 10);
    if (!dayMap.has(day)) {
      dayMap.set(day, new Set());
    }
    dayMap.get(day)!.add(session.user_id);
  }

  const sorted = Array.from(dayMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return sorted.map(([date, users]) => ({
    date,
    dau: users.size,
  }));
};

const computeQuizzesPerDay = (
  sessions: EngagementData["sessions"]
): DailyQuizPoint[] => {
  const dayMap = new Map<string, number>();

  for (const session of sessions) {
    const day = session.completed_at.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }

  const sorted = Array.from(dayMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return sorted.map(([date, count]) => ({
    date,
    quizzes: count,
  }));
};

const computeAvgDuration = (
  sessions: EngagementData["sessions"]
): number | null => {
  const validSessions = sessions.filter(
    (s) => s.time_taken_seconds !== null && s.time_taken_seconds > 0
  );
  if (validSessions.length === 0) return null;

  const total = validSessions.reduce(
    (sum, s) => sum + (s.time_taken_seconds ?? 0),
    0
  );
  return total / validSessions.length;
};

const computeAvgScore = (
  sessions: EngagementData["sessions"]
): number | null => {
  const validSessions = sessions.filter((s) => s.total_questions > 0);
  if (validSessions.length === 0) return null;

  const total = validSessions.reduce(
    (sum, s) => sum + (s.score / s.total_questions) * 100,
    0
  );
  return total / validSessions.length;
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
};

const AdminEngagementPage = () => {
  const [range, setRange] = useState<RangeOption>(30);
  const [data, setData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getEngagementData(range);
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
  }, [range]);

  const dauData = useMemo(
    () => (data ? computeDauData(data.sessions) : []),
    [data]
  );

  const quizzesData = useMemo(
    () => (data ? computeQuizzesPerDay(data.sessions) : []),
    [data]
  );

  const avgDuration = useMemo(
    () => (data ? computeAvgDuration(data.sessions) : null),
    [data]
  );

  const avgScore = useMemo(
    () => (data ? computeAvgScore(data.sessions) : null),
    [data]
  );

  const totalSessions = data?.sessions.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Engagement</h1>
          <p className="text-sm text-slate-400 mt-1">
            {data
              ? `${totalSessions} sessions in the last ${range} days`
              : "Loading..."}
          </p>
        </div>

        {/* Range selector */}
        <div className="flex gap-2">
          {RANGE_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                range === value
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-400" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sessions */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp size={18} className="text-orange-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  Total Sessions
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-100 tabular-nums">
                {totalSessions.toLocaleString()}
              </p>
            </div>

            {/* Peak DAU */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Users size={18} className="text-orange-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  Peak DAU
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-100 tabular-nums">
                {dauData.length > 0
                  ? Math.max(...dauData.map((d) => d.dau)).toLocaleString()
                  : "--"}
              </p>
            </div>

            {/* Avg Session Duration */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock size={18} className="text-orange-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  Avg Duration
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-100 tabular-nums">
                {avgDuration !== null ? formatDuration(avgDuration) : "--"}
              </p>
            </div>

            {/* Avg Score */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Target size={18} className="text-orange-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  Avg Score
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-100 tabular-nums">
                {avgScore !== null ? `${avgScore.toFixed(1)}%` : "--"}
              </p>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DAU Area Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Daily Active Users
              </h2>
              {dauData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dauData}>
                    <defs>
                      <linearGradient
                        id="dauGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#fb923c"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#fb923c"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateTick}
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "0.5rem",
                        color: "#f1f5f9",
                        fontSize: "0.875rem",
                      }}
                      labelFormatter={formatDateLabel}
                    />
                    <Area
                      type="monotone"
                      dataKey="dau"
                      stroke="#fb923c"
                      strokeWidth={2}
                      fill="url(#dauGradient)"
                      name="Active Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
                  No data for selected range
                </div>
              )}
            </div>

            {/* Quizzes per Day Bar Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Quizzes per Day
              </h2>
              {quizzesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={quizzesData}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateTick}
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "0.5rem",
                        color: "#f1f5f9",
                        fontSize: "0.875rem",
                      }}
                      labelFormatter={formatDateLabel}
                    />
                    <Bar
                      dataKey="quizzes"
                      fill="#fb923c"
                      radius={[4, 4, 0, 0]}
                      name="Quizzes"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
                  No data for selected range
                </div>
              )}
            </div>
          </div>

          {/* Loading overlay for range changes */}
          {loading && data && (
            <div className="flex items-center justify-center py-4">
              <Loader2
                size={20}
                className="animate-spin text-orange-400 mr-2"
              />
              <span className="text-sm text-slate-400">
                Updating engagement data...
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminEngagementPage;
