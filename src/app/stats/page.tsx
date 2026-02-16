"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3, Target, Zap, Clock, Lock, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

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

const formatTime = (seconds: number): string => {
  if (seconds === 0) return "—";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
};

const StatsPage = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
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
            className="bg-surface rounded-2xl border border-white/10 p-4 text-center"
          >
            <stat.icon size={20} className="mx-auto text-primary mb-2" />
            {loading ? (
              <div className="w-10 h-7 mx-auto bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
            )}
            <p className="text-xs text-white/40">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Sign in prompt (only when not logged in) */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-2xl border border-white/10 p-6 text-center mb-8"
        >
          <p className="text-white/60 mb-3">
            Sign in to start tracking your quiz performance.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </motion.div>
      )}

      {/* Pro-gated preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <div className="bg-surface rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-primary" />
            <h2 className="text-lg font-semibold">Pro Stats</h2>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              PRO
            </span>
          </div>

          {/* Blurred preview */}
          <div className="relative overflow-hidden rounded-xl">
            <div className="blur-sm pointer-events-none select-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fake chart placeholder */}
                <div className="bg-white/5 rounded-xl p-4 h-40 flex items-end gap-1">
                  {[40, 65, 55, 80, 70, 90, 85].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/40 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                {/* Fake per-anime list */}
                <div className="space-y-2">
                  {["Naruto", "One Piece", "Attack on Titan", "Demon Slayer"].map((name) => (
                    <div
                      key={name}
                      className="bg-white/5 rounded-lg p-3 flex justify-between"
                    >
                      <span className="text-sm">{name}</span>
                      <span className="text-sm text-success">78%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay */}
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

          {/* Feature list */}
          <ul className="mt-4 space-y-2">
            {PRO_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-white/50"
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
