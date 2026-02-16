"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Award, Trophy, Zap, Calendar, ChevronRight, Swords, Gift } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBadges, getUserEmblem } from "@/lib/badges";
import { getUserGrandPrixEmblems } from "@/lib/grand-prix";
import { getDuelStats } from "@/lib/duels";
import { getRank } from "@/lib/scoring";
import BadgeIcon from "@/components/BadgeIcon";
import BadgeGrid from "@/components/BadgeGrid";
import MonthlyEmblem from "@/components/MonthlyEmblem";
import EmblemSelector from "@/components/EmblemSelector";
import type { Badge, UserEmblemWithDetails, DuelStats } from "@/types";

const ProfilePage = () => {
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [emblem, setEmblem] = useState<Badge | null>(null);
  const [gpEmblems, setGpEmblems] = useState<UserEmblemWithDetails[]>([]);
  const [duelStats, setDuelStats] = useState<DuelStats | null>(null);
  const [emblemOpen, setEmblemOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [badges, emb, gpEmbs, dStats] = await Promise.all([
          getUserBadges(user.id),
          getUserEmblem(user.id),
          getUserGrandPrixEmblems(user.id),
          getDuelStats(user.id),
        ]);
        setEarnedBadges(badges);
        setEmblem(emb);
        setGpEmblems(gpEmbs);
        setDuelStats(dStats);
      } catch {
        // Failed
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleEmblemChange = async (badgeId: string | null) => {
    if (badgeId) {
      const badge = earnedBadges.find((b) => b.id === badgeId) ?? null;
      setEmblem(badge);
    } else {
      setEmblem(null);
    }
    await refreshProfile();
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <User size={48} className="mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-3">Your Profile</h1>
        <p className="text-white/50 max-w-md mx-auto mb-6">
          Sign in to track your progress, earn badges, and customize your profile.
        </p>
        <Link
          href="/auth"
          className="inline-block px-6 py-3 font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const rankInfo = getRank(profile.total_xp);
  const displayName = profile.display_name ?? profile.username ?? "Player";
  const initial = displayName.charAt(0).toUpperCase();
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* Avatar + emblem */}
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
            {initial}
          </div>
          {emblem && (
            <button
              onClick={() => setEmblemOpen(true)}
              className="absolute -bottom-1 -right-1"
              title="Change emblem"
            >
              <BadgeIcon
                iconName={emblem.icon_name}
                iconColor={emblem.icon_color}
                rarity={emblem.rarity}
                size="sm"
                earned
                shimmer
              />
            </button>
          )}
        </div>

        <h1 className="text-2xl font-bold">{displayName}</h1>
        <p className="text-sm text-white/40">{profile.rank}</p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <div className="bg-surface rounded-2xl border border-white/10 p-4 text-center">
          <Zap size={20} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold">{profile.total_xp.toLocaleString()}</p>
          <p className="text-xs text-white/40">Total XP</p>
        </div>
        <div className="bg-surface rounded-2xl border border-white/10 p-4 text-center">
          <Trophy size={20} className="mx-auto text-yellow-400 mb-1" />
          <p className="text-lg font-bold">{rankInfo.name}</p>
          <p className="text-xs text-white/40">Rank</p>
        </div>
        <div className="bg-surface rounded-2xl border border-white/10 p-4 text-center">
          <Calendar size={20} className="mx-auto text-emerald-400 mb-1" />
          <p className="text-lg font-bold">{profile.current_streak}</p>
          <p className="text-xs text-white/40">Day Streak</p>
        </div>
        <div className="bg-surface rounded-2xl border border-white/10 p-4 text-center">
          <Award size={20} className="mx-auto text-purple-400 mb-1" />
          <p className="text-lg font-bold">{earnedBadges.length}</p>
          <p className="text-xs text-white/40">Badges</p>
        </div>
      </motion.div>

      {/* Rank progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-surface rounded-2xl border border-white/10 p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">{rankInfo.name}</span>
          {rankInfo.nextRankXP && (
            <span className="text-xs text-white/40">
              {profile.total_xp.toLocaleString()} / {rankInfo.nextRankXP.toLocaleString()} XP
            </span>
          )}
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${rankInfo.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Emblem section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-surface rounded-2xl border border-white/10 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {emblem ? (
              <BadgeIcon
                iconName={emblem.icon_name}
                iconColor={emblem.icon_color}
                rarity={emblem.rarity}
                size="md"
                earned
                shimmer
              />
            ) : (
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                <Award size={20} className="text-white/20" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">
                {emblem ? emblem.name : "No Emblem"}
              </p>
              <p className="text-xs text-white/40">
                {emblem ? "Your profile emblem" : "Choose a badge to display"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEmblemOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            {emblem ? "Change" : "Choose"}
          </button>
        </div>
      </motion.div>

      {/* Grand Prix Trophy Case */}
      {gpEmblems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70">
              Grand Prix Trophy Case ({gpEmblems.length})
            </h2>
            <Link
              href="/grand-prix"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Grand Prix
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {gpEmblems.map((ue) => (
              <MonthlyEmblem
                key={ue.id}
                emblem={ue.grand_prix_emblems}
                size="sm"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Duel Record */}
      {duelStats && duelStats.total_duels > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.23 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70">
              Duel Record
            </h2>
            <Link
              href="/duels"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Duels
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="bg-surface rounded-2xl border border-white/10 p-4">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-success">{duelStats.wins}</p>
                <p className="text-xs text-white/40">Wins</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent">{duelStats.losses}</p>
                <p className="text-xs text-white/40">Losses</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">{duelStats.draws}</p>
                <p className="text-xs text-white/40">Draws</p>
              </div>
              <div>
                <Swords size={14} className="mx-auto text-primary mb-0.5" />
                <p className="text-lg font-bold">
                  {duelStats.total_duels > 0
                    ? Math.round((duelStats.wins / duelStats.total_duels) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-white/40">Win Rate</p>
              </div>
            </div>
            {(duelStats.win_streak > 0 || duelStats.best_win_streak > 0 || duelStats.giant_kills > 0) && (
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-white/40">
                {duelStats.win_streak > 0 && (
                  <span>Current streak: {duelStats.win_streak}</span>
                )}
                {duelStats.best_win_streak > 0 && (
                  <span>Best streak: {duelStats.best_win_streak}</span>
                )}
                {duelStats.giant_kills > 0 && (
                  <span>Giant kills: {duelStats.giant_kills}</span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Recent badges */}
      {earnedBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70">
              Badges ({earnedBadges.length})
            </h2>
            <Link
              href="/badges"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View All
              <ChevronRight size={14} />
            </Link>
          </div>
          <BadgeGrid
            badges={earnedBadges.slice(0, 12)}
            earnedBadgeIds={earnedIds}
          />
        </motion.div>
      )}

      {/* Promo code link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <Link
          href="/redeem"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-primary transition-colors"
        >
          <Gift size={16} />
          Have a promo code?
        </Link>
      </motion.div>

      {/* Emblem selector modal */}
      <EmblemSelector
        isOpen={emblemOpen}
        onClose={() => setEmblemOpen(false)}
        earnedBadges={earnedBadges}
        currentEmblemId={profile.emblem_badge_id ?? null}
        userId={user.id}
        onEmblemChange={handleEmblemChange}
      />
    </div>
  );
};

export default ProfilePage;
