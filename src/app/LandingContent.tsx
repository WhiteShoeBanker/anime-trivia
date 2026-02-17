"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Zap,
  Trophy,
  BookOpen,
  Swords,
  Skull,
  Calendar,
  Flame,
  Crown,
  Star,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { checkDailyChallengePlayed } from "@/lib/daily-challenge";
import { getUserBadges } from "@/lib/badges";
import { createClient } from "@/lib/supabase/client";
import AnimeCard from "@/components/AnimeCard";
import BadgeIcon from "@/components/BadgeIcon";
import type { AnimeSeries, Badge } from "@/types";
import useReducedMotion from "@/lib/use-reduced-motion";

// ── Types ──────────────────────────────────────────────────────

interface LandingStats {
  questionsCount: number;
  seriesCount: number;
  playersCount: number;
}

interface LandingContentProps {
  topAnime: AnimeSeries[];
  stats: LandingStats;
}

// ── Privacy Section (preserved from original) ──────────────────

const PRIVACY_POINTS = [
  { icon: Shield, text: "We never sell your data" },
  { icon: Lock, text: "Age-appropriate content for every player" },
  { icon: Eye, text: "No targeted ads — ever" },
];

// ── League Tiers ───────────────────────────────────────────────

const LEAGUE_TIERS = [
  { name: "Bronze", color: "#CD7F32", icon: "🥉" },
  { name: "Silver", color: "#C0C0C0", icon: "🥈" },
  { name: "Gold", color: "#FFD700", icon: "🥇" },
  { name: "Platinum", color: "#E5E4E2", icon: "💠" },
  { name: "Diamond", color: "#B9F2FF", icon: "💎" },
  { name: "Champion", color: "#FF6B35", icon: "👑" },
];

// ── Rank Icons ─────────────────────────────────────────────────

const RANK_ICONS = [
  { name: "Genin", xp: "0" },
  { name: "Chunin", xp: "500" },
  { name: "Jonin", xp: "2K" },
  { name: "ANBU", xp: "5K" },
  { name: "Kage", xp: "10K" },
  { name: "Hokage", xp: "25K" },
];

// ── Sample badges for showcase ──────────────────────────────────

const SAMPLE_BADGES = [
  { icon: "Flame", color: "#FF6B35", rarity: "common" as const },
  { icon: "Target", color: "#00D1B2", rarity: "uncommon" as const },
  { icon: "Zap", color: "#facc15", rarity: "rare" as const },
  { icon: "Crown", color: "#a855f7", rarity: "epic" as const },
  { icon: "Star", color: "#FFD700", rarity: "legendary" as const },
  { icon: "Shield", color: "#3b82f6", rarity: "rare" as const },
];

// ── Animated Counter ───────────────────────────────────────────

const AnimatedCounter = ({ target, label }: { target: number; label: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();

          const animate = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, reducedMotion]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-extrabold text-primary">
        {count.toLocaleString()}+
      </p>
      <p className="text-sm text-white/50 mt-1">{label}</p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────

const LandingContent = ({ topAnime, stats }: LandingContentProps) => {
  const { user, profile, isLoading } = useAuth();
  const [dailyPlayed, setDailyPlayed] = useState(false);
  const [dailyScore, setDailyScore] = useState<number | null>(null);
  const [recentBadge, setRecentBadge] = useState<Badge | null>(null);
  const [pendingDuelCount, setPendingDuelCount] = useState(0);
  const reducedMotion = useReducedMotion();

  // Logged-in user data fetches
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      // Daily challenge status
      const dailyResult = await checkDailyChallengePlayed(user.id);
      setDailyPlayed(dailyResult.played);
      setDailyScore(dailyResult.score);

      // Recent badges
      const badges = await getUserBadges(user.id);
      if (badges.length > 0) {
        setRecentBadge(badges[badges.length - 1]);
      }

      // Pending duels
      const supabase = createClient();
      const { count } = await supabase
        .from("duel_matches")
        .select("*", { count: "exact", head: true })
        .eq("opponent_id", user.id)
        .eq("status", "waiting")
        .eq("match_type", "friend_challenge");
      setPendingDuelCount(count ?? 0);
    };

    fetchUserData();
  }, [user]);

  const getCountdown = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getLeagueName = () => {
    const xp = profile?.total_xp ?? 0;
    if (xp >= 10000) return "Diamond";
    if (xp >= 5000) return "Platinum";
    if (xp >= 2000) return "Gold";
    if (xp >= 500) return "Silver";
    return "Bronze";
  };

  const getProMessage = () => {
    if (!profile) return null;
    if (profile.subscription_tier !== "pro") return null;
    switch (profile.subscription_source) {
      case "paid":
        return "OtakuQuiz Pro — Unlimited quizzes, no ads";
      case "promo_code":
        return "OtakuQuiz Pro (Promo) — Unlimited access";
      case "admin_grant":
        return "OtakuQuiz Pro (Granted) — VIP access";
      default:
        return null;
    }
  };

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-28 text-center overflow-hidden">
        {/* Background floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-64 h-64 rounded-full bg-primary/5 -top-20 -left-20"
            style={{ animation: "float 6s ease-in-out infinite" }}
          />
          <div
            className="absolute w-48 h-48 rounded-full bg-accent/5 top-1/3 -right-10"
            style={{ animation: "float 8s ease-in-out infinite 2s" }}
          />
          <div
            className="absolute w-32 h-32 rounded-full bg-success/5 bottom-10 left-1/4"
            style={{ animation: "float 7s ease-in-out infinite 1s" }}
          />
        </div>

        {user && profile && !isLoading ? (
          /* ── Logged-in Hero ──────────────────────────────── */
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-2xl"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
              Welcome back,{" "}
              <span className="text-primary">
                {profile.display_name ?? profile.username ?? "Otaku"}
              </span>
              !
            </h1>

            {/* Quick stats row */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 mb-6">
              <div className="flex items-center gap-1.5 bg-surface rounded-lg px-3 py-2 border border-white/10">
                <Crown size={14} className="text-yellow-400" />
                <span className="text-sm font-medium">{getLeagueName()}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface rounded-lg px-3 py-2 border border-white/10">
                <Flame size={14} className="text-orange-400" />
                <span className="text-sm font-medium">
                  {profile.current_streak} day streak
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface rounded-lg px-3 py-2 border border-white/10">
                <Star size={14} className="text-primary" />
                <span className="text-sm font-medium">
                  {profile.total_xp.toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* Daily Challenge shortcut */}
            <div className="bg-surface rounded-xl border border-white/10 p-4 mb-4 max-w-sm mx-auto">
              {dailyPlayed ? (
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-success flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium">
                      Daily Challenge: <span className="text-primary">{dailyScore}/10</span>
                    </p>
                    <p className="text-xs text-white/40 flex items-center gap-1">
                      <Clock size={10} /> Next in {getCountdown()}
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  href="/daily"
                  className="flex items-center gap-3 group"
                >
                  <Calendar size={20} className="text-primary flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      Play Today&apos;s Challenge
                    </p>
                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                      <Zap size={10} /> 1.5x XP Bonus
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-white/30 group-hover:text-primary transition-colors" />
                </Link>
              )}
            </div>

            {/* Recent badge */}
            {recentBadge && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-white/50">
                <BadgeIcon
                  iconName={recentBadge.icon_name}
                  iconColor={recentBadge.icon_color}
                  rarity={recentBadge.rarity}
                  size="sm"
                  earned
                />
                <span>Recent: {recentBadge.name}</span>
              </div>
            )}

            {/* Pending duels */}
            {pendingDuelCount > 0 && (
              <Link
                href="/duels"
                className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors mb-4"
              >
                <Swords size={14} />
                {pendingDuelCount} pending duel{pendingDuelCount > 1 ? "s" : ""}
              </Link>
            )}

            {/* Pro status */}
            {getProMessage() && (
              <p className="text-xs text-primary/70 mb-4">{getProMessage()}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/browse"
                className="px-8 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Start Playing
              </Link>
              <Link
                href="/profile"
                className="px-8 py-4 text-lg font-bold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                View Profile
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ── Visitor Hero ────────────────────────────────── */
          <div className="relative z-10">
            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4"
            >
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OtakuQuiz
              </span>
            </motion.h1>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.1 }}
              className="text-lg sm:text-xl text-white/60 max-w-lg mx-auto mb-3"
            >
              Test your anime knowledge with trivia questions across 50+ titles.
              Compete, rank up, and prove you&apos;re the ultimate otaku.
            </motion.p>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.2 }}
              className="text-sm text-white/40 mb-8"
            >
              From Genin to Hokage — climb the ranks!
            </motion.p>

            {/* Rank progression preview */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {RANK_ICONS.map((rank) => (
                <div
                  key={rank.name}
                  className="flex flex-col items-center bg-surface/50 rounded-lg px-3 py-2 border border-white/5"
                >
                  <span className="text-xs font-bold text-primary">{rank.name}</span>
                  <span className="text-[10px] text-white/30">{rank.xp} XP</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link
                href="/browse"
                className="px-8 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Start Playing
              </Link>
              <Link
                href="/shop"
                className="px-8 py-4 text-lg font-bold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Swag Shop
              </Link>
            </motion.div>

            <div className="mt-8 h-1 w-24 mx-auto rounded-full bg-accent" />
          </div>
        )}
      </section>

      {/* ── POPULAR QUIZZES ────────────────────────────────── */}
      {topAnime.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Popular Quizzes
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
            {topAnime.map((anime, i) => (
              <div key={anime.id} className="min-w-[280px] snap-start md:min-w-0">
                <AnimeCard anime={anime} index={i} />
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/browse"
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              See all anime quizzes →
            </Link>
          </div>
        </section>
      )}

      {/* ── IMPOSSIBLE MODE ──────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 rounded-2xl border border-purple-500/20 p-6 md:p-8 text-center">
          <Skull size={40} className="mx-auto text-purple-400 mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-purple-300">
            Impossible Mode
          </h2>
          <p className="text-sm text-white/50 max-w-md mx-auto mb-4">
            Think you know everything? Impossible questions are designed to stump
            even the most hardcore otaku. 5-second timer. No mercy.
          </p>
          <Link
            href="/browse"
            className="inline-block px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors text-sm"
          >
            Try Impossible Mode
          </Link>
        </div>
      </section>

      {/* ── 1v1 DUELS ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-2xl border border-white/10 p-6 md:p-8 text-center">
          <Swords size={40} className="mx-auto text-accent mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2">1v1 Duels</h2>
          <p className="text-sm text-white/50 max-w-md mx-auto mb-4">
            Challenge friends or find a random opponent for head-to-head anime
            trivia battles. Track your wins, streaks, and giant kills.
          </p>
          <Link
            href="/duels"
            className="inline-block px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-colors text-sm"
          >
            Enter the Arena
          </Link>
        </div>
      </section>

      {/* ── LEAGUE PREVIEW ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          Weekly Leagues
        </h2>
        <p className="text-center text-white/40 mb-8 max-w-md mx-auto text-sm">
          Compete weekly, climb tiers, and earn promotion badges.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {LEAGUE_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="bg-surface rounded-xl border border-white/10 p-4 text-center"
            >
              <span className="text-2xl mb-2 block">{tier.icon}</span>
              <p className="text-xs font-bold" style={{ color: tier.color }}>
                {tier.name}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/leagues"
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View leagues →
          </Link>
        </div>
      </section>

      {/* ── BADGE SHOWCASE ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          Collect 28+ Badges!
        </h2>
        <p className="text-center text-white/40 mb-8 max-w-md mx-auto text-sm">
          Streak, speed, accuracy, difficulty, breadth — unlock them all.
        </p>
        <div className="flex justify-center gap-4 flex-wrap mb-6">
          {SAMPLE_BADGES.map((badge, i) => (
            <BadgeIcon
              key={i}
              iconName={badge.icon}
              iconColor={badge.color}
              rarity={badge.rarity}
              size="lg"
              earned
            />
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/badges"
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View all badges →
          </Link>
        </div>
      </section>

      {/* ── GRAND PRIX ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-2xl border border-white/10 p-6 md:p-8 text-center">
          <Trophy size={40} className="mx-auto text-yellow-400 mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2">Grand Prix</h2>
          <p className="text-sm text-white/50 max-w-md mx-auto mb-4">
            Monthly single-elimination tournaments. Qualify, compete through
            bracket rounds, and earn exclusive emblems as the champion.
          </p>
          <Link
            href="/grand-prix"
            className="inline-block px-6 py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors text-sm"
          >
            View Grand Prix
          </Link>
        </div>
      </section>

      {/* ── STATS COUNTERS ───────────────────────────────── */}
      {(stats.questionsCount > 0 || stats.seriesCount > 0 || stats.playersCount > 0) && (
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid grid-cols-3 gap-6">
            <AnimatedCounter
              target={stats.questionsCount}
              label="Questions"
            />
            <AnimatedCounter target={stats.seriesCount} label="Anime Series" />
            <AnimatedCounter target={stats.playersCount} label="Players" />
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              title: "Pick an Anime",
              description:
                "Choose from 50+ anime series and select your difficulty level.",
            },
            {
              icon: Zap,
              title: "Answer Questions",
              description:
                "10 questions per round with a timer. Streaks multiply your XP.",
            },
            {
              icon: Trophy,
              title: "Rank Up",
              description:
                "Earn XP, climb from Genin to Hokage, and unlock badges along the way.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-surface rounded-2xl border border-white/10 p-6 text-center"
            >
              <step.icon size={32} className="mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-white/50">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROMO CODE LINK ──────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-6 text-center">
        <Link
          href="/redeem"
          className="text-sm text-white/40 hover:text-primary transition-colors"
        >
          Have a promo code? Redeem it here →
        </Link>
      </section>

      {/* ── SAFE & PRIVATE (preserved) ───────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          Safe & Private
        </h2>
        <p className="text-center text-white/40 mb-10 max-w-md mx-auto">
          Built for all ages. Your privacy is not negotiable.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRIVACY_POINTS.map((point) => (
            <div
              key={point.text}
              className="bg-surface rounded-2xl border border-white/10 p-6 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <point.icon size={24} className="text-primary" />
              </div>
              <p className="font-medium text-white/80">{point.text}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-6">
          <Link
            href="/privacy"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Read our full privacy summary →
          </Link>
        </p>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to prove your anime knowledge?
        </h2>
        <p className="text-white/50 mb-8">
          Free to play. 10 quizzes per day. Upgrade to Pro for unlimited.
        </p>
        <Link
          href="/browse"
          className="inline-block px-8 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Browse Anime & Start
        </Link>
      </section>
    </div>
  );
};

export default LandingContent;
