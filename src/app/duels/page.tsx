"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Swords,
  Search,
  Users,
  Clock,
  Flame,
  UserPlus,
  Check,
  X as XIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  Zap,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getDuelStats,
  getActiveDuels,
  getDuelHistory,
  getFriends,
  getPendingFriendRequests,
  findQuickMatch,
  acceptFriendRequest,
  sendFriendRequest,
  declineDuel,
  createDuel,
  getHeadToHeadMap,
} from "@/lib/duels";
import { createClient } from "@/lib/supabase/client";
import ChallengeModal from "@/components/ChallengeModal";
import type {
  DuelStats,
  DuelMatch,
  DuelDifficulty,
  FriendshipWithProfile,
  UserProfile,
} from "@/types";

type Tab = "quick" | "friends" | "history";

const TAB_ITEMS: { key: Tab; label: string; icon: typeof Swords }[] = [
  { key: "quick", label: "Quick Match", icon: Swords },
  { key: "friends", label: "Friends", icon: Users },
  { key: "history", label: "History", icon: Clock },
];

const formatTime = (ms: number): string => {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const DuelsPage = () => {
  const router = useRouter();
  const { user, ageGroup } = useAuth();
  const isJunior = ageGroup === "junior";

  const [tab, setTab] = useState<Tab>("quick");
  const [stats, setStats] = useState<DuelStats | null>(null);
  const [activeDuels, setActiveDuels] = useState<DuelMatch[]>([]);
  const [history, setHistory] = useState<DuelMatch[]>([]);
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendshipWithProfile[]>([]);
  const [profileCache, setProfileCache] = useState<Record<string, UserProfile>>({});
  const [h2hMap, setH2hMap] = useState<Record<string, { wins: number; losses: number; draws: number }>>({});
  const [loading, setLoading] = useState(true);

  // Quick match state
  const [searching, setSearching] = useState(false);
  const [searchPollId, setSearchPollId] = useState<string | null>(null);

  // Friends tab state
  const [friendSearch, setFriendSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friendSearching, setFriendSearching] = useState(false);

  // History state
  const [expandedDuel, setExpandedDuel] = useState<string | null>(null);

  // Challenge modal state
  const [challengeTarget, setChallengeTarget] = useState<{
    id: string;
    username: string | null;
    display_name: string | null;
  } | null>(null);

  // ── Data Loading ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [duelStats, active, duelHistory, friendList, pending] =
        await Promise.all([
          getDuelStats(user.id),
          getActiveDuels(user.id),
          getDuelHistory(user.id),
          isJunior ? Promise.resolve([]) : getFriends(user.id),
          isJunior ? Promise.resolve([]) : getPendingFriendRequests(user.id),
        ]);

      setStats(duelStats);
      setActiveDuels(active);
      setHistory(duelHistory);
      setFriends(friendList);
      setPendingRequests(pending);

      // Fetch head-to-head records for friends
      if (friendList.length > 0) {
        const friendIds = friendList.map((f) => f.user_profiles.id);
        const h2h = await getHeadToHeadMap(user.id, friendIds);
        setH2hMap(h2h);
      }

      // Batch-fetch profiles for history opponents
      const opponentIds = new Set<string>();
      duelHistory.forEach((d) => {
        const oppId =
          d.challenger_id === user.id ? d.opponent_id : d.challenger_id;
        if (oppId) opponentIds.add(oppId);
      });
      active.forEach((d) => {
        const oppId =
          d.challenger_id === user.id ? d.opponent_id : d.challenger_id;
        if (oppId) opponentIds.add(oppId);
      });

      if (opponentIds.size > 0) {
        const supabase = createClient();
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("*")
          .in("id", Array.from(opponentIds));

        if (profiles) {
          const cache: Record<string, UserProfile> = {};
          (profiles as UserProfile[]).forEach((p) => {
            cache[p.id] = p;
          });
          setProfileCache(cache);
        }
      }
    } catch {
      // Load failed
    }
    setLoading(false);
  }, [user, isJunior]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Quick Match ───────────────────────────────────────────────
  const handleQuickMatch = async () => {
    if (!user) return;
    setSearching(true);

    try {
      const match = await findQuickMatch(user.id, {
        difficulty: "mixed",
        question_count: 10,
      });

      if (match && match.status === "matched") {
        router.push(`/duels/${match.id}`);
        return;
      }

      if (match) {
        // Queued — start polling
        setSearchPollId(match.id);
      }
    } catch {
      setSearching(false);
    }
  };

  // Poll for match when queued
  useEffect(() => {
    if (!searchPollId) return;

    const poll = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("duel_matches")
        .select("*")
        .eq("id", searchPollId)
        .single();

      if (data && data.status === "matched") {
        setSearching(false);
        setSearchPollId(null);
        router.push(`/duels/${data.id}`);
      }
    };

    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [searchPollId, router]);

  const cancelSearch = () => {
    setSearching(false);
    setSearchPollId(null);
  };

  // ── Friend Search ─────────────────────────────────────────────
  const handleFriendSearch = async () => {
    if (!friendSearch.trim() || !user) return;
    setFriendSearching(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .ilike("username", `%${friendSearch.trim()}%`)
        .neq("id", user.id)
        .limit(10);

      setSearchResults((data as UserProfile[]) ?? []);
    } catch {
      setSearchResults([]);
    }
    setFriendSearching(false);
  };

  const handleAddFriend = async (targetId: string) => {
    if (!user) return;
    await sendFriendRequest(user.id, targetId);
    setSearchResults((prev) => prev.filter((p) => p.id !== targetId));
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    if (!user) return;
    await acceptFriendRequest(friendshipId, user.id);
    await loadData();
  };

  // ── Pending Challenge Handling ────────────────────────────────
  const pendingChallenges = activeDuels.filter(
    (d) =>
      d.match_type === "friend_challenge" &&
      d.opponent_id === user?.id &&
      d.status === "waiting"
  );

  const handleAcceptChallenge = (duelId: string) => {
    router.push(`/duels/${duelId}`);
  };

  const handleDeclineChallenge = async (duelId: string) => {
    if (!user) return;
    await declineDuel(duelId, user.id);
    setActiveDuels((prev) => prev.filter((d) => d.id !== duelId));
  };

  // ── Challenge Friend ─────────────────────────────────────────
  const handleSendChallenge = async (options: {
    anime_id: string | null;
    difficulty: DuelDifficulty;
    question_count: 5 | 10;
  }) => {
    if (!user || !challengeTarget) return;
    try {
      const newDuel = await createDuel(user.id, {
        match_type: "friend_challenge",
        anime_id: options.anime_id ?? undefined,
        difficulty: options.difficulty,
        question_count: options.question_count,
        opponent_id: challengeTarget.id,
      });
      setChallengeTarget(null);
      if (newDuel) {
        router.push(`/duels/${newDuel.id}`);
      }
    } catch {
      setChallengeTarget(null);
    }
  };

  const handleRematch = async (duel: DuelMatch) => {
    if (!user) return;
    try {
      const opponentId =
        duel.challenger_id === user.id ? duel.opponent_id : duel.challenger_id;
      const newDuel = await createDuel(user.id, {
        match_type: duel.match_type,
        anime_id: duel.anime_id ?? undefined,
        difficulty: duel.difficulty,
        question_count: duel.question_count as 5 | 10,
        opponent_id: opponentId ?? undefined,
      });
      if (newDuel) router.push(`/duels/${newDuel.id}`);
    } catch {
      // Rematch creation failed
    }
  };

  const getOpponentName = (duel: DuelMatch): string => {
    const oppId =
      duel.challenger_id === user?.id ? duel.opponent_id : duel.challenger_id;
    if (!oppId) return "Opponent";
    const p = profileCache[oppId];
    return p?.display_name ?? p?.username ?? "Opponent";
  };

  const getDuelResult = (
    duel: DuelMatch
  ): { label: string; color: string } => {
    if (duel.winner_id === user?.id)
      return { label: "WIN", color: "bg-success/20 text-success" };
    if (duel.winner_id === null)
      return { label: "DRAW", color: "bg-yellow-400/20 text-yellow-400" };
    return { label: "LOSS", color: "bg-accent/20 text-accent" };
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Swords size={36} className="mx-auto text-primary mb-2" />
        <h1 className="text-2xl font-bold">1v1 Duels</h1>
        <p className="text-sm text-white/40">
          Challenge others and prove your knowledge
        </p>
      </motion.div>

      {/* Pending challenges banner */}
      {pendingChallenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {pendingChallenges.map((duel) => (
            <div
              key={duel.id}
              className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Swords size={18} className="text-accent" />
                <div>
                  <p className="text-sm font-semibold">
                    {getOpponentName(duel)} challenged you!
                  </p>
                  <p className="text-xs text-white/40">
                    {duel.question_count} questions · {duel.difficulty}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAcceptChallenge(duel.id)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineChallenge(duel.id)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-xl border border-white/10 p-1">
        {TAB_ITEMS.filter((t) => !(isJunior && t.key === "friends")).map(
          (item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === item.key
                  ? "bg-primary/20 text-primary"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          )
        )}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ── Quick Match Tab ──────────────────────────────────── */}
        {tab === "quick" && (
          <motion.div
            key="quick"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Stats card */}
            {stats && (
              <div className="bg-surface rounded-2xl border border-white/10 p-4">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-success">
                      {stats.wins}
                    </p>
                    <p className="text-xs text-white/40">Wins</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-accent">
                      {stats.losses}
                    </p>
                    <p className="text-xs text-white/40">Losses</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-400">
                      {stats.draws}
                    </p>
                    <p className="text-xs text-white/40">Draws</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary">
                      <Flame
                        size={14}
                        className="inline mr-0.5 text-primary"
                      />
                      {stats.win_streak}
                    </p>
                    <p className="text-xs text-white/40">Streak</p>
                  </div>
                </div>
                {stats.best_win_streak > 0 && (
                  <p className="text-xs text-white/30 text-center mt-2">
                    Best streak: {stats.best_win_streak}
                  </p>
                )}
              </div>
            )}

            {/* Quick match button */}
            {!searching ? (
              <button
                onClick={handleQuickMatch}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
              >
                <Search size={22} />
                Find Opponent
              </button>
            ) : (
              <div className="text-center py-8 space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Swords size={40} className="mx-auto text-primary" />
                </motion.div>
                <p className="text-sm text-white/50">
                  Searching for an opponent...
                </p>
                <button
                  onClick={cancelSearch}
                  className="px-6 py-2 text-sm font-medium rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Active duels (in progress) */}
            {activeDuels.filter(
              (d) => d.status === "in_progress" || d.status === "matched"
            ).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/50 mb-2">
                  Active Duels
                </h3>
                <div className="space-y-2">
                  {activeDuels
                    .filter(
                      (d) =>
                        d.status === "in_progress" || d.status === "matched"
                    )
                    .map((duel) => (
                      <button
                        key={duel.id}
                        onClick={() => router.push(`/duels/${duel.id}`)}
                        className="w-full text-left bg-surface rounded-xl border border-white/10 p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Swords size={16} className="text-primary" />
                            <div>
                              <p className="text-sm font-semibold">
                                vs {getOpponentName(duel)}
                              </p>
                              <p className="text-xs text-white/40">
                                {duel.difficulty} · {duel.question_count}q
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-yellow-400">
                            {duel.status === "matched" ? "Ready" : "In Progress"}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Friends Tab ──────────────────────────────────────── */}
        {tab === "friends" && !isJunior && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Username search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by username..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFriendSearch()}
                className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleFriendSearch}
                disabled={friendSearching}
                className="px-4 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {friendSearching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-white/40">Search Results</p>
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-surface rounded-xl border border-white/10 p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {(
                          profile.display_name ??
                          profile.username ??
                          "?"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {profile.display_name ?? profile.username}
                        </p>
                        <p className="text-xs text-white/40">
                          @{profile.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend(profile.id)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center gap-1"
                    >
                      <UserPlus size={12} />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending requests */}
            {pendingRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-white/40">
                  Friend Requests ({pendingRequests.length})
                </p>
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-surface rounded-xl border border-white/10 p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                        {(
                          req.user_profiles.display_name ??
                          req.user_profiles.username ??
                          "?"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <p className="text-sm font-semibold">
                        {req.user_profiles.display_name ??
                          req.user_profiles.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button className="p-2 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 transition-colors">
                        <XIcon size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Friends list */}
            <div className="space-y-2">
              <p className="text-xs text-white/40">
                Friends ({friends.length})
              </p>
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={32} className="mx-auto text-white/20 mb-2" />
                  <p className="text-sm text-white/30">
                    No friends yet. Search for players above!
                  </p>
                </div>
              ) : (
                friends.map((friend) => {
                  const fp = friend.user_profiles;
                  const isOnline =
                    fp.last_played_at &&
                    Date.now() - new Date(fp.last_played_at).getTime() <
                      15 * 60 * 1000;
                  const h2h = h2hMap[fp.id];

                  return (
                    <div
                      key={friend.id}
                      className="bg-surface rounded-xl border border-white/10 p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {(fp.display_name ?? fp.username ?? "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${
                              isOnline ? "bg-success" : "bg-white/20"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {fp.display_name ?? fp.username}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <span>{fp.total_xp.toLocaleString()} XP</span>
                            {h2h && (
                              <span>
                                {h2h.wins}W-{h2h.losses}L-{h2h.draws}D
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setChallengeTarget({
                            id: fp.id,
                            username: fp.username,
                            display_name: fp.display_name,
                          })
                        }
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors flex items-center gap-1"
                      >
                        <Swords size={12} />
                        Challenge
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ── History Tab ──────────────────────────────────────── */}
        {tab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-2"
          >
            {history.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={32} className="mx-auto text-white/20 mb-2" />
                <p className="text-sm text-white/30">
                  No duel history yet. Play your first duel!
                </p>
              </div>
            ) : (
              history.map((duel) => {
                const result = getDuelResult(duel);
                const oppName = getOpponentName(duel);
                const isChallenger = duel.challenger_id === user?.id;
                const myScore = isChallenger
                  ? duel.challenger_score
                  : duel.opponent_score;
                const theirScore = isChallenger
                  ? duel.opponent_score
                  : duel.challenger_score;
                const isExpanded = expandedDuel === duel.id;
                const myAnswers = (
                  isChallenger
                    ? duel.challenger_answers
                    : duel.opponent_answers
                ) as { questionId: string; selectedOption: number; isCorrect: boolean; timeMs: number }[] | null;
                const theirAnswers = (
                  isChallenger
                    ? duel.opponent_answers
                    : duel.challenger_answers
                ) as { questionId: string; selectedOption: number; isCorrect: boolean; timeMs: number }[] | null;

                return (
                  <div
                    key={duel.id}
                    className="bg-surface rounded-xl border border-white/10 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedDuel(isExpanded ? null : duel.id)
                      }
                      className="w-full text-left p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded-full flex items-center justify-center text-[10px] font-bold ${result.color}`}
                          >
                            {result.label}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">
                              vs {oppName}
                            </p>
                            <p className="text-xs text-white/40">
                              {duel.difficulty} · {duel.question_count}q ·{" "}
                              {new Date(duel.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold">
                              <span className="text-primary">
                                {myScore ?? 0}
                              </span>
                              <span className="text-white/20"> - </span>
                              <span className="text-white/50">
                                {theirScore ?? 0}
                              </span>
                            </p>
                            <p className="text-[10px] text-primary/70 flex items-center justify-end gap-0.5">
                              <Zap size={8} />+
                              {isChallenger
                                ? duel.challenger_xp_earned
                                : duel.opponent_xp_earned}
                              XP
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-white/30" />
                          ) : (
                            <ChevronDown size={14} className="text-white/30" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-2">
                            {/* Question-by-question */}
                            {myAnswers?.map((answer, idx) => {
                              const oppAnswer = theirAnswers?.[idx];
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="text-white/30 w-8">
                                    Q{idx + 1}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={
                                        answer.isCorrect
                                          ? "text-success"
                                          : "text-accent"
                                      }
                                    >
                                      {answer.isCorrect ? "✓" : "✗"}
                                    </span>
                                    <span className="text-white/20">
                                      {formatTime(answer.timeMs)}
                                    </span>
                                  </div>
                                  <span className="text-white/10">|</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/20">
                                      {oppAnswer
                                        ? formatTime(oppAnswer.timeMs)
                                        : "-"}
                                    </span>
                                    <span
                                      className={
                                        oppAnswer?.isCorrect
                                          ? "text-success"
                                          : "text-accent"
                                      }
                                    >
                                      {oppAnswer?.isCorrect ? "✓" : "✗"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Rematch button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRematch(duel);
                              }}
                              className="w-full mt-2 px-3 py-2 text-xs font-bold rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <RotateCcw size={12} />
                              Rematch
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
      {challengeTarget && (
        <ChallengeModal
          isOpen={!!challengeTarget}
          onClose={() => setChallengeTarget(null)}
          opponent={challengeTarget}
          onSend={handleSendChallenge}
          isJunior={isJunior}
        />
      )}
    </div>
  );
};

export default DuelsPage;
