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
  CheckCircle,
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
import { tierColors } from "@/themes";

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

const TIER_ICONS = ["🥉", "🥈", "🥇", "💠", "💎", "👑"];

const LEAGUE_TIERS = tierColors.map((t, i) => ({
  name: t.name,
  color: t.color,
  icon: TIER_ICONS[i],
}));

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

  // Derive league tier from total XP. Approximates the membership-based
  // league system for the hero stat card; the authoritative tier on the
  // /leagues page comes from a DB membership join.
  const xp = profile?.total_xp ?? 0;
  const tierInfo =
    xp >= 25000
      ? tierColors[5]
      : xp >= 10000
        ? tierColors[4]
        : xp >= 5000
          ? tierColors[3]
          : xp >= 2000
            ? tierColors[2]
            : xp >= 500
              ? tierColors[1]
              : tierColors[0];

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative px-4 md:px-6 pt-10 pb-12 md:pt-14 md:pb-20 overflow-hidden">
        {user && profile && !isLoading ? (
          /* ── Logged-in Hero — kinetic Heat Check ─────────── */
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-6xl mx-auto"
          >
            {/* Halftone decoration top-right */}
            <div
              aria-hidden="true"
              className="absolute -top-4 right-0 w-72 h-72 texture-halftone text-primary opacity-40 pointer-events-none"
            />

            {/* PRO pill */}
            {profile.subscription_tier === "pro" && (
              <div className="inline-block bg-electric text-black border-2 border-black font-display uppercase text-xs tracking-tight px-3 py-1 mb-6 shadow-[2px_2px_0_0_#000]">
                PRO · VIP ACCESS
              </div>
            )}

            {/* 2-column hero */}
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-10 items-end">
              {/* Left: title + CTA */}
              <div>
                <h1
                  className="text-5xl sm:text-6xl md:text-7xl text-text"
                  style={{ letterSpacing: "-0.04em", lineHeight: 0.88 }}
                >
                  Welcome back,
                  <br />
                  <span className="text-primary">
                    {profile.display_name ?? profile.username ?? "Otaku"}.
                  </span>
                </h1>
                <p className="mt-4 text-base text-text-muted max-w-md">
                  Pick up where you left off.
                </p>
                <Link
                  href="/daily"
                  className="inline-block mt-6 bg-primary text-white border-[2.5px] border-black px-8 py-4 font-display uppercase text-2xl tracking-tight shadow-hard hover:shadow-electric hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200"
                >
                  Play Daily
                </Link>
              </div>

              {/* Right: stat cards */}
              <div className="flex flex-col gap-3">
                {/* Tier card */}
                <div
                  className="border-[2.5px] border-black p-4 shadow-hard"
                  style={{ backgroundColor: tierInfo.color }}
                >
                  <p
                    className="font-display uppercase text-3xl text-black leading-none"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {tierInfo.name}
                  </p>
                  <p className="font-mono text-[11px] text-black/70 mt-1">
                    TIER {tierInfo.tier}
                  </p>
                </div>

                {/* Streak card */}
                <div className="bg-surface border-[2.5px] border-black p-4 shadow-hard relative overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-electric"
                  />
                  <div className="pl-3">
                    <p className="font-mono text-4xl font-bold text-text leading-none">
                      {profile.current_streak}
                    </p>
                    <p className="font-display uppercase text-[10px] tracking-tight text-text-muted mt-2">
                      Day Streak
                    </p>
                  </div>
                </div>

                {/* XP card */}
                <div className="bg-surface border-[2.5px] border-black p-4 shadow-hard relative overflow-hidden">
                  <p className="font-mono text-4xl font-bold text-text leading-none">
                    {profile.total_xp.toLocaleString()}
                  </p>
                  <p className="font-display uppercase text-[10px] tracking-tight text-text-muted mt-2">
                    XP Earned
                  </p>
                  <div
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-[3px] bg-primary"
                  />
                </div>
              </div>
            </div>

            {/* Daily Challenge — paper-flip prestige */}
            <div className="relative mt-10 bg-paper border-[2.5px] border-black p-6 md:p-8 overflow-hidden shadow-hard-lg">
              <div
                aria-hidden="true"
                className="absolute -top-6 -right-6 w-48 h-48 texture-halftone text-black opacity-30 pointer-events-none"
              />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="md:max-w-md">
                  <h2
                    className="text-3xl md:text-5xl text-black"
                    style={{ letterSpacing: "-0.03em", lineHeight: 0.88 }}
                  >
                    Today&apos;s Challenge
                  </h2>
                  <p className="mt-2 text-sm text-black/70">
                    10 questions · mixed difficulty · 1.5x XP
                    {!dailyPlayed && (
                      <span className="block mt-0.5 font-mono text-xs text-black/50">
                        Resets in {getCountdown()}
                      </span>
                    )}
                  </p>
                </div>
                {dailyPlayed ? (
                  <div className="inline-flex items-center gap-2 bg-black text-electric border-2 border-black font-display uppercase text-lg tracking-tight px-5 py-3 self-start md:self-auto">
                    <CheckCircle size={18} aria-hidden="true" />
                    <span>{dailyScore}/10</span>
                  </div>
                ) : (
                  <Link
                    href="/daily"
                    className="inline-flex items-center gap-2 bg-black text-electric border-2 border-black font-display uppercase text-lg tracking-tight px-6 py-3 shadow-hot hover:bg-primary hover:text-white hover:shadow-hard transition-[background-color,color,box-shadow] duration-200 self-start md:self-auto"
                  >
                    Enter
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>

            {/* Side-info row: pending duels + recent badge */}
            {(pendingDuelCount > 0 || recentBadge) && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {pendingDuelCount > 0 && (
                  <Link
                    href="/duels"
                    className="inline-flex items-center gap-2 bg-electric text-black border-[2.5px] border-black font-display uppercase text-sm tracking-tight px-4 py-2 shadow-[2px_2px_0_0_#000] hover:shadow-hot transition-shadow duration-200"
                  >
                    <Swords size={14} aria-hidden="true" />
                    {pendingDuelCount} Pending Duel{pendingDuelCount > 1 ? "s" : ""}
                  </Link>
                )}
                {recentBadge && (
                  <div className="inline-flex items-center gap-2 text-sm font-mono text-text-muted">
                    <BadgeIcon
                      iconName={recentBadge.icon_name}
                      iconColor={recentBadge.icon_color}
                      rarity={recentBadge.rarity}
                      size="sm"
                      earned
                    />
                    <span>
                      RECENT:{" "}
                      <span className="text-text uppercase">{recentBadge.name}</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* POPULAR QUIZZES carousel.
             * Data source: topAnime (popular feed, not per-user history).
             * TODO: when getRecentAnime(userId) lands, swap heading back to
             * "Recently Played" and replace the data binding. */}
            {topAnime.length > 0 && (
              <div className="mt-12">
                <div className="flex items-baseline justify-between border-b border-rule pb-2 mb-4">
                  <h3 className="font-display uppercase tracking-tight text-text-muted text-sm">
                    Popular Quizzes
                  </h3>
                  <Link
                    href="/browse"
                    className="font-display uppercase text-xs tracking-tight text-primary hover:text-electric transition-colors"
                  >
                    All Anime →
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
                  {topAnime.map((anime, i) => (
                    <div
                      key={anime.id}
                      className="min-w-[280px] snap-start md:min-w-0"
                    >
                      <AnimeCard anime={anime} index={i} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* ── Visitor Hero ────────────────────────────────── */
          <div className="relative z-10 text-center max-w-3xl mx-auto py-6 md:py-12">
            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-6xl md:text-7xl mb-4"
              style={{ letterSpacing: "-0.04em", lineHeight: 0.88 }}
            >
              <span className="text-primary">OtakuQuiz</span>
              <span className="text-electric">.</span>
            </motion.h1>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.1 }}
              className="text-lg sm:text-xl text-text-muted max-w-lg mx-auto mb-3"
            >
              Test your anime knowledge with trivia questions across 50+ titles.
              Compete, rank up, and prove you&apos;re the ultimate otaku.
            </motion.p>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.2 }}
              className="text-sm text-text-muted/70 mb-8"
            >
              From Genin to Hokage — climb the ranks.
            </motion.p>

            {/* Rank progression preview */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              {RANK_ICONS.map((rank) => (
                <div
                  key={rank.name}
                  className="flex flex-col items-center bg-surface border-2 border-black px-3 py-2 shadow-[2px_2px_0_0_#000]"
                >
                  <span className="font-display uppercase text-sm text-primary tracking-tight">
                    {rank.name}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {rank.xp} XP
                  </span>
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
                className="bg-primary text-white border-[2.5px] border-black px-8 py-4 font-display uppercase text-2xl tracking-tight shadow-hard hover:shadow-electric transition-shadow duration-200"
              >
                Start Playing
              </Link>
              <Link
                href="/shop"
                className="bg-surface text-text border-[2.5px] border-black px-8 py-4 font-display uppercase text-2xl tracking-tight shadow-hard hover:bg-electric hover:text-black transition-colors duration-200"
              >
                Swag Shop
              </Link>
            </motion.div>
          </div>
        )}
      </section>

      {/* ── POPULAR QUIZZES (visitor-only — logged-in users see Recently Played in the hero) ── */}
      {topAnime.length > 0 && !user && (
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
