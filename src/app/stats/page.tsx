"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Target, Zap, Clock, Lock, TrendingUp, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { fetchPerAnimeStats, fetchRecentQuizzes } from "./actions";
import type { PerAnimeStat, RecentQuiz } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

interface UserStats {
  totalQuizzes: number;
  accuracy: number;
  bestStreak: number;
  avgTimePerQuestion: number;
}

const PRO_FEATURES = [
  "Per-anime accuracy breakdown",
  "Performance trends over time",
  "Detailed quiz history with review",
  "Streak analysis and patterns",
  "Difficulty-level insights",
];

// Non-Pro upsell teaser. Shape mirrors PerAnimeStat (the real data structure)
// so the relationship between teaser and actual data is explicit. Mirrors the
// LandingContent.tsx SAMPLE_BADGES precedent — named, greppable, typed.
const SAMPLE_PRO_STATS: ReadonlyArray<
  Pick<PerAnimeStat, "anime_title" | "accuracy_pct">
> = [
  { anime_title: "Naruto", accuracy_pct: 78 },
  { anime_title: "One Piece", accuracy_pct: 78 },
  { anime_title: "Attack on Titan", accuracy_pct: 78 },
  { anime_title: "Demon Slayer", accuracy_pct: 78 },
];

const SAMPLE_BAR_HEIGHTS = [40, 65, 55, 80, 70, 90, 85] as const;

const formatTime = (seconds: number): string => {
  if (seconds === 0) return "—";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
};

const StatsPage = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  // null = not yet loaded, [] = loaded but empty, [...] = loaded with data.
  // The distinction matters: an empty array shows the "play your first quiz"
  // CTA, but null still means "fetching" and should show a loading skeleton.
  const [perAnimeStats, setPerAnimeStats] = useState<PerAnimeStat[] | null>(
    null
  );
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[] | null>(null);
  const isPro = profile?.subscription_tier === "pro";

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to default when user is absent
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const supabase = createClient();

        const { data: sessions } = await supabase
          .from("quiz_sessions")
          .select("correct_answers, total_questions, time_taken_seconds")
          .eq("user_id", user.id);

        if (sessions && sessions.length > 0) {
          const totalQuizzes = sessions.length;
          const totalCorrect = sessions.reduce(
            (sum, s) => sum + (s.correct_answers ?? 0),
            0
          );
          const totalQuestions = sessions.reduce(
            (sum, s) => sum + (s.total_questions ?? 0),
            0
          );
          const totalTime = sessions.reduce(
            (sum, s) => sum + (s.time_taken_seconds ?? 0),
            0
          );
          const accuracy =
            totalQuestions > 0
              ? Math.round((totalCorrect / totalQuestions) * 100)
              : 0;
          const avgTimePerQuestion =
            totalQuestions > 0 ? totalTime / totalQuestions : 0;

          setStats({
            totalQuizzes,
            accuracy,
            bestStreak: profile?.longest_streak ?? 0,
            avgTimePerQuestion,
          });
        } else {
          setStats({
            totalQuizzes: 0,
            accuracy: 0,
            bestStreak: profile?.longest_streak ?? 0,
            avgTimePerQuestion: 0,
          });
        }
      } catch {
        // Stats fetch failed
      }
      setLoading(false);
    };

    fetchStats();
  }, [user, profile?.longest_streak]);

  // Per-anime breakdown + recent-quizzes trend — both Pro-gated, fetched in
  // parallel so the chart and list arrive together. Non-Pro paths render the
  // teaser without consulting either state; bare-return on !user || !isPro
  // avoids the react-hooks/set-state-in-effect lint.
  useEffect(() => {
    if (!user || !isPro) return;

    let cancelled = false;
    Promise.all([
      fetchPerAnimeStats(user.id).catch(() => [] as PerAnimeStat[]),
      fetchRecentQuizzes(user.id).catch(() => [] as RecentQuiz[]),
    ]).then(([perAnime, recent]) => {
      if (cancelled) return;
      setPerAnimeStats(perAnime);
      setRecentQuizzes(recent);
    });

    return () => {
      cancelled = true;
    };
  }, [user, isPro]);

  const statCards = [
    {
      label: "Total Quizzes",
      value: stats ? String(stats.totalQuizzes) : "—",
      icon: BarChart3,
    },
    {
      label: "Overall Accuracy",
      value: stats && stats.totalQuizzes > 0 ? `${stats.accuracy}%` : "—",
      icon: Target,
    },
    {
      label: "Best Streak",
      value: stats ? `${stats.bestStreak}d` : "—",
      icon: Zap,
    },
    {
      label: "Avg. Time / Question",
      value: stats ? formatTime(stats.avgTimePerQuestion) : "—",
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={28} className="text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Your Stats</h1>
        </div>
        <p className="text-white/50">
          Track your progress and find your strengths.
        </p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border border-white/10 p-4 text-center">
              <stat.icon size={20} className="mx-auto text-primary mb-2" />
              {loading ? (
                <div className="w-10 h-7 mx-auto bg-white/5 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
              )}
              <p className="text-xs text-white/40">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Sign in prompt (only when not logged in) */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border border-white/10 p-6 text-center">
            <p className="text-white/60 mb-3">
              Sign in to start tracking your quiz performance.
            </p>
            <Button href="/auth">Sign In</Button>
          </Card>
        </motion.div>
      )}

      {/* Pro-gated section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <div className="bg-surface rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            {isPro ? (
              <CheckCircle2 size={18} className="text-success" />
            ) : (
              <Lock size={18} className="text-primary" />
            )}
            <h2 className="text-lg font-semibold">Pro Stats</h2>
            <Pill tone="pro" size="md" className="ml-auto">
              PRO
            </Pill>
          </div>

          {/* Pro user, data still loading */}
          {isPro && perAnimeStats === null && (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-lg p-3 h-11 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Pro user, real per-anime breakdown */}
          {isPro && perAnimeStats !== null && perAnimeStats.length > 0 && (
            <div className="space-y-4">
              {/* Recent-quizzes accuracy trend. recentQuizzes is newest-first
                  from the DB; reverse for display so left = oldest, right =
                  newest (natural time progression). Reuses the bar styling
                  from the non-Pro teaser. */}
              {recentQuizzes !== null && recentQuizzes.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 mb-2">
                    Last {recentQuizzes.length}{" "}
                    {recentQuizzes.length === 1 ? "quiz" : "quizzes"} — accuracy
                    trend
                  </p>
                  <div className="bg-white/5 rounded-xl p-4 h-40 flex items-end gap-1">
                    {[...recentQuizzes].reverse().map((q) => (
                      <div
                        key={q.session_id}
                        className="flex-1 bg-primary/40 rounded-t"
                        style={{ height: `${q.accuracy_pct}%` }}
                        title={`${q.anime_title}: ${q.accuracy_pct}%`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {perAnimeStats.map((stat) => (
                  <div
                    key={stat.anime_id}
                    className="bg-white/5 rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <span className="text-sm truncate">{stat.anime_title}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-white/40">
                        {stat.quiz_count}
                        {" "}
                        {stat.quiz_count === 1 ? "quiz" : "quizzes"}
                      </span>
                      <span className="text-sm text-success font-semibold tabular-nums">
                        {stat.accuracy_pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro user, no data yet */}
          {isPro && perAnimeStats !== null && perAnimeStats.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/60 mb-4">
                Play your first quiz to see your per-anime breakdown here.
              </p>
              <Button href="/browse">Browse anime quizzes</Button>
            </div>
          )}

          {/* Non-Pro upsell teaser */}
          {!isPro && (
            <div className="relative overflow-hidden rounded-xl">
              <div className="blur-sm pointer-events-none select-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 h-40 flex items-end gap-1">
                    {SAMPLE_BAR_HEIGHTS.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/40 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    {SAMPLE_PRO_STATS.map((s) => (
                      <div
                        key={s.anime_title}
                        className="bg-white/5 rounded-lg p-3 flex justify-between"
                      >
                        <span className="text-sm">{s.anime_title}</span>
                        <span className="text-sm text-success">
                          {s.accuracy_pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-white/40 text-center mt-3">
                  Sample preview — your real per-anime stats appear here
                </p>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-surface/60 rounded-xl">
                <div className="text-center">
                  <Lock size={24} className="mx-auto text-primary mb-2" />
                  <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
                  <p className="text-xs text-white/40">
                    Unlock detailed analytics
                  </p>
                </div>
              </div>
            </div>
          )}

          <ul className="mt-4 space-y-2">
            {PRO_FEATURES.map((feature) => (
              <li
                key={feature}
                className={`flex items-center gap-2 text-sm ${
                  isPro ? "text-white/80" : "text-white/50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsPage;
