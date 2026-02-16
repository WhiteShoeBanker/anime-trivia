"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  Gem,
  Award,
  Swords,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  getUserLeagueInfo,
  getUserLeagueHistory,
  getPromotionRequirements,
  getCurrentWeekStart,
} from "@/lib/league-xp";
import AnimeDiversityTracker from "@/components/AnimeDiversityTracker";
import LeagueBanner from "@/components/LeagueBanners";
import BadgeIcon from "@/components/BadgeIcon";
import type { League, LeagueTier, LeagueResult, Badge } from "@/types";

// ── League Badge Icons ──────────────────────────────────────

const LEAGUE_ICONS: Record<number, typeof Trophy> = {
  1: Shield,
  2: Medal,
  3: Star,
  4: Award,
  5: Gem,
  6: Swords,
};

const LEAGUE_NAMES = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Champion"];

// ── Countdown Helper ────────────────────────────────────────

const getTimeUntilMonday = () => {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(0, 5, 0, 0); // 00:05 UTC Monday

  const diff = nextMonday.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
};

// ── Zone Colors ─────────────────────────────────────────────

const getZoneStyle = (rank: number, promotionSlots: number, demotionSlots: number, totalMembers: number) => {
  if (rank <= promotionSlots) return "border-l-4 border-l-success/60";
  if (rank > totalMembers - demotionSlots) return "border-l-4 border-l-accent/60";
  return "border-l-4 border-l-white/10";
};

// ── Medal Icon for Top 3 ────────────────────────────────────

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown size={18} className="text-yellow-400" />;
  if (rank === 2) return <Medal size={18} className="text-gray-300" />;
  if (rank === 3) return <Medal size={18} className="text-amber-600" />;
  return <span className="text-sm font-bold text-white/50">#{rank}</span>;
};

// ── Types ───────────────────────────────────────────────────

interface LeagueMemberProfile {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  age_group: string;
  emblem_badge_id: string | null;
}

interface LeagueMember {
  user_id: string;
  weekly_xp: number;
  unique_anime_count: number;
  user_profiles: LeagueMemberProfile | LeagueMemberProfile[];
}

interface HistoryEntry {
  week_start: string;
  final_rank: number;
  weekly_xp: number;
  unique_anime_count: number;
  result: LeagueResult;
  leagues: { name: string; tier: number; color: string };
}

const getMemberProfile = (member: LeagueMember): LeagueMemberProfile => {
  const profiles = member.user_profiles;
  if (Array.isArray(profiles)) return profiles[0] ?? { username: null, display_name: null, avatar_url: null, age_group: "full", emblem_badge_id: null };
  return profiles;
};

// ── Main Page Component ─────────────────────────────────────

const LeaguesPage = () => {
  const { user, profile, isJunior } = useAuth();
  const [leagueInfo, setLeagueInfo] = useState<{
    membership: { group_id: string; weekly_xp: number; unique_anime_count: number };
    league: League;
    members: LeagueMember[];
    userRank: number;
  } | null>(null);
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastResult, setLastResult] = useState<{
    result: LeagueResult;
    leagueName: string;
    previousLeagueName?: string;
  } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilMonday());
  const [memberEmblems, setMemberEmblems] = useState<Record<string, Badge>>({});
  const [loading, setLoading] = useState(true);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMonday());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [info, hist] = await Promise.all([
        getUserLeagueInfo(user.id),
        getUserLeagueHistory(user.id),
      ]);

      if (info) {
        setLeagueInfo(info as unknown as typeof leagueInfo);
      }
      setHistory(hist as unknown as HistoryEntry[]);

      // Check if most recent history entry is from last week (show banner)
      if (hist.length > 0) {
        const latest = hist[0] as HistoryEntry;
        const weekStart = getCurrentWeekStart();
        if (latest.week_start !== weekStart) {
          setLastResult({
            result: latest.result,
            leagueName: latest.leagues.name,
            previousLeagueName:
              hist.length > 1
                ? (hist[1] as HistoryEntry).leagues.name
                : undefined,
          });
        }
      }

      // Fetch all leagues for overview
      const supabase = createClient();
      const { data: leagues } = await supabase
        .from("leagues")
        .select("*")
        .order("tier");
      setAllLeagues((leagues as League[]) ?? []);

      // Fetch member emblems
      if (info) {
        const typedInfo = info as unknown as typeof leagueInfo;
        const emblemIds = (typedInfo?.members ?? [])
          .map((m) => getMemberProfile(m as unknown as LeagueMember).emblem_badge_id)
          .filter((id): id is string => id !== null);

        if (emblemIds.length > 0) {
          const { data: badges } = await supabase
            .from("badges")
            .select("*")
            .in("id", emblemIds);

          const emblemMap: Record<string, Badge> = {};
          for (const badge of (badges as Badge[]) ?? []) {
            emblemMap[badge.id] = badge;
          }
          setMemberEmblems(emblemMap);
        }
      }
    } catch {
      // Data fetch failed
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription for leaderboard updates
  useEffect(() => {
    if (!leagueInfo?.membership.group_id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`league-group-${leagueInfo.membership.group_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "league_memberships",
          filter: `group_id=eq.${leagueInfo.membership.group_id}`,
        },
        () => {
          // Refetch leaderboard on any update
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leagueInfo?.membership.group_id, fetchData]);

  // ── Not Logged In ───────────────────────────────────────

  if (!loading && !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Trophy size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Weekly Leagues
          </h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto mb-8">
            Compete with 30 players each week. Earn XP across different anime
            to climb the ranks from Bronze to Champion!
          </p>

          {/* League preview */}
          <div className="flex gap-3 overflow-x-auto pb-4 px-2 mb-8 justify-center">
            {LEAGUE_NAMES.map((name, i) => {
              const Icon = LEAGUE_ICONS[i + 1] ?? Shield;
              const colors = [
                "#CD7F32", "#C0C0C0", "#FFD700",
                "#E5E4E2", "#B9F2FF", "#FF6B35",
              ];
              return (
                <div
                  key={name}
                  className="flex-shrink-0 w-20 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10"
                    style={{ backgroundColor: `${colors[i]}20` }}
                  >
                    <Icon size={24} style={{ color: colors[i] }} />
                  </div>
                  <span className="text-xs font-semibold text-white/60">
                    {name}
                  </span>
                </div>
              );
            })}
          </div>

          <Link
            href="/auth"
            className="inline-block px-6 py-3 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Sign Up to Compete
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ── No League Membership Yet ────────────────────────────

  if (!leagueInfo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Trophy size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold mb-3">Weekly Leagues</h1>
          <p className="text-white/50 max-w-md mx-auto mb-6">
            Complete your first quiz to join a league! You'll be placed in a
            Bronze group with 30 other players.
          </p>
          <Link
            href="/browse"
            className="inline-block px-6 py-3 font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Start a Quiz
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Main League View ────────────────────────────────────

  const league = leagueInfo.league;
  const tier = league.tier as LeagueTier;
  const LeagueIcon = LEAGUE_ICONS[tier] ?? Shield;
  const promotionReqs = getPromotionRequirements(tier);
  const members = leagueInfo.members;
  const userRank = leagueInfo.userRank;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Last week result banner */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {isJunior && lastResult.result === "demoted" ? (
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center">
                <p className="text-lg font-bold text-primary mb-1">
                  Try Again Next Week!
                </p>
                <p className="text-sm text-white/60">
                  Every week is a new adventure. You've got this!
                </p>
              </div>
            ) : (
              <LeagueBanner
                result={lastResult.result}
                leagueName={lastResult.leagueName}
                previousLeagueName={lastResult.previousLeagueName}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header: League badge + name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div
          className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-3 border-2"
          style={{
            backgroundColor: `${league.color}20`,
            borderColor: `${league.color}60`,
          }}
        >
          <LeagueIcon size={36} style={{ color: league.color }} />
        </div>
        <h1 className="text-2xl font-bold">{league.name} League</h1>
        <p className="text-white/40 text-sm">Tier {tier} of 6</p>
      </motion.div>

      {/* Countdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center gap-2 text-white/50"
      >
        <Clock size={14} />
        <span className="text-sm">
          Week ends in{" "}
          <span className="font-semibold text-white/70">
            {countdown.days}d {countdown.hours}h {countdown.minutes}m
          </span>
        </span>
      </motion.div>

      {/* Promotion requirements card */}
      {tier < 6 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface rounded-2xl border border-white/10 p-4"
        >
          <h3 className="text-sm font-semibold text-white/70 mb-3">
            Promotion Requirements
          </h3>
          <div className="space-y-2">
            {/* Rank requirement */}
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  userRank <= league.promotion_slots
                    ? "bg-success/20 text-success"
                    : "bg-white/10 text-white/30"
                }`}
              >
                {userRank <= league.promotion_slots ? "✓" : "○"}
              </div>
              <span className="text-sm text-white/60">
                Finish in top {league.promotion_slots} (currently #{userRank})
              </span>
            </div>

            {/* Breadth requirement */}
            {promotionReqs.minAnime > 0 && (
              <div className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    leagueInfo.membership.unique_anime_count >= promotionReqs.minAnime
                      ? "bg-success/20 text-success"
                      : "bg-white/10 text-white/30"
                  }`}
                >
                  {leagueInfo.membership.unique_anime_count >= promotionReqs.minAnime
                    ? "✓"
                    : "○"}
                </div>
                <span className="text-sm text-white/60">
                  Anime played:{" "}
                  <span className="font-semibold text-white/80">
                    {leagueInfo.membership.unique_anime_count}/{promotionReqs.minAnime}
                  </span>
                </span>
              </div>
            )}

            {/* Hard mode requirement */}
            {promotionReqs.requiresHard && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-white/10 text-white/30">
                  ○
                </div>
                <span className="text-sm text-white/60">
                  Complete at least 1 Hard difficulty quiz
                </span>
              </div>
            )}

            {/* Impossible requirement */}
            {promotionReqs.requiresImpossible > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-white/10 text-white/30">
                  ○
                </div>
                <span className="text-sm text-white/60">
                  Complete {promotionReqs.requiresImpossible} quizzes on the
                  hardest difficulty
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Anime Diversity Tracker */}
      <AnimeDiversityTracker />

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold">Group Leaderboard</h3>
          <p className="text-xs text-white/40 mt-0.5">
            Top {league.promotion_slots} promote, bottom{" "}
            {league.demotion_slots} demote
          </p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[3rem_1fr_5rem_4rem] px-4 py-2 text-xs text-white/40 border-b border-white/5">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-right">XP</span>
          <span className="text-right">Anime</span>
        </div>

        {/* Members */}
        <div className="divide-y divide-white/5">
          {members.map((member, i) => {
            const rank = i + 1;
            const isCurrentUser = member.user_id === user?.id;
            const memberProfile = getMemberProfile(member);
            const displayName =
              memberProfile?.display_name ??
              memberProfile?.username ??
              "Anonymous";
            const initial = displayName.charAt(0).toUpperCase();

            return (
              <div
                key={member.user_id}
                className={`grid grid-cols-[3rem_1fr_5rem_4rem] items-center px-4 py-3 transition-colors ${
                  getZoneStyle(rank, league.promotion_slots, league.demotion_slots, members.length)
                } ${isCurrentUser ? "bg-primary/10" : "hover:bg-white/5"}`}
              >
                <div className="flex items-center justify-center">
                  <RankBadge rank={rank} />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {initial}
                  </div>
                  {memberProfile.emblem_badge_id &&
                    memberEmblems[memberProfile.emblem_badge_id] && (
                      <BadgeIcon
                        iconName={memberEmblems[memberProfile.emblem_badge_id].icon_name}
                        iconColor={memberEmblems[memberProfile.emblem_badge_id].icon_color}
                        rarity={memberEmblems[memberProfile.emblem_badge_id].rarity}
                        size="sm"
                        earned
                      />
                    )}
                  <span
                    className={`text-sm truncate ${
                      isCurrentUser
                        ? "font-bold text-primary"
                        : "text-white/80"
                    }`}
                  >
                    {displayName}
                    {isCurrentUser && " (You)"}
                  </span>
                </div>
                <span
                  className={`text-sm text-right font-semibold ${
                    isCurrentUser ? "text-primary" : "text-white/60"
                  }`}
                >
                  {member.weekly_xp.toLocaleString()}
                </span>
                <span className="text-sm text-right text-white/40">
                  {member.unique_anime_count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Your position if not in view */}
        {userRank > members.length && (
          <div className="px-4 py-3 border-t border-white/10 bg-primary/5 text-center text-sm text-white/50">
            Your position: #{userRank}
          </div>
        )}
      </motion.div>

      {/* Previous Weeks (collapsible) */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-2xl border border-white/10 overflow-hidden"
        >
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <span className="font-semibold">Previous Weeks</span>
            {historyOpen ? (
              <ChevronUp size={18} className="text-white/40" />
            ) : (
              <ChevronDown size={18} className="text-white/40" />
            )}
          </button>

          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-white/5 px-4 pb-4">
                  {history.map((entry) => (
                    <div
                      key={entry.week_start}
                      className="py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white/80">
                          {entry.leagues.name} League
                        </p>
                        <p className="text-xs text-white/40">
                          Week of{" "}
                          {new Date(entry.week_start).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white/60">
                          #{entry.final_rank} — {entry.weekly_xp} XP
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            entry.result === "promoted"
                              ? "bg-success/20 text-success"
                              : entry.result === "demoted"
                                ? "bg-primary/20 text-primary"
                                : entry.result === "missed_promotion"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-white/10 text-white/50"
                          }`}
                        >
                          {entry.result === "promoted"
                            ? "Promoted"
                            : entry.result === "demoted"
                              ? isJunior
                                ? "Try again!"
                                : "Demoted"
                              : entry.result === "missed_promotion"
                                ? "Missed promo"
                                : "Stayed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* All Leagues Overview */}
      {allLeagues.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="text-sm font-semibold text-white/50 mb-3">
            All Leagues
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {allLeagues.map((l) => {
              const Icon = LEAGUE_ICONS[l.tier] ?? Shield;
              const isCurrent = l.id === league.id;
              return (
                <div
                  key={l.id}
                  className={`flex-shrink-0 w-20 flex flex-col items-center gap-1 ${
                    isCurrent ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                      isCurrent ? "border-2" : "border-white/10"
                    }`}
                    style={{
                      backgroundColor: `${l.color}20`,
                      borderColor: isCurrent ? l.color : undefined,
                    }}
                  >
                    <Icon size={24} style={{ color: l.color }} />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? "text-white" : "text-white/60"
                    }`}
                  >
                    {l.name}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LeaguesPage;
