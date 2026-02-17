import { createClient } from "@/lib/supabase/client";
import { getUserLeagueInfo, getCurrentWeekStart, updateLeagueMembershipXp } from "@/lib/league-xp";
import { calculateQuestionXP } from "@/lib/scoring";
import { checkAndAwardBadges } from "@/lib/badges";
import { getDuelMaxPerOpponentWeekly } from "@/lib/config-actions";
import {
  trackDuelCreated,
  trackFriendRequestSent,
  trackFriendRequestAccepted,
  trackBadgeEarned,
} from "@/lib/track-actions";
import type {
  DuelMatch,
  DuelCreateOptions,
  DuelStats,
  Difficulty,
  FriendshipWithProfile,
} from "@/types";

// ── Question Selection ─────────────────────────────────────────

const selectDuelQuestions = async (
  animeId: string | null,
  difficulty: string,
  questionCount: 5 | 10
): Promise<{ questionIds: string[]; resolvedAnimeId: string }> => {
  const supabase = createClient();

  // If no anime specified, pick a random active one
  let resolvedAnimeId: string = animeId ?? "";
  if (!animeId) {
    const { data: allAnime } = await supabase
      .from("anime_series")
      .select("id")
      .eq("is_active", true);

    if (!allAnime || allAnime.length === 0) {
      throw new Error("No active anime series found");
    }
    resolvedAnimeId = allAnime[Math.floor(Math.random() * allAnime.length)].id;
  }

  let questionIds: string[] = [];

  if (difficulty === "mixed") {
    // Mixed distribution: 3+3+3+1 for 10, 2+1+1+1 for 5
    const counts: Record<string, number> =
      questionCount === 10
        ? { easy: 3, medium: 3, hard: 3, impossible: 1 }
        : { easy: 2, medium: 1, hard: 1, impossible: 1 };

    for (const [diff, count] of Object.entries(counts)) {
      const { data } = await supabase
        .from("questions")
        .select("id")
        .eq("anime_id", resolvedAnimeId)
        .eq("difficulty", diff)
        .limit(count * 3); // Fetch extra for random selection

      if (data && data.length > 0) {
        const shuffled = data.sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, Math.min(count, shuffled.length));
        questionIds.push(...picked.map((q) => q.id));
      }
    }

    // If we didn't get enough, fill remaining with any difficulty
    if (questionIds.length < questionCount) {
      const remaining = questionCount - questionIds.length;
      const { data } = await supabase
        .from("questions")
        .select("id")
        .eq("anime_id", resolvedAnimeId)
        .not("id", "in", `(${questionIds.join(",")})`)
        .limit(remaining * 2);

      if (data) {
        const shuffled = data.sort(() => Math.random() - 0.5);
        questionIds.push(
          ...shuffled.slice(0, remaining).map((q) => q.id)
        );
      }
    }
  } else {
    // Single difficulty
    const { data } = await supabase
      .from("questions")
      .select("id")
      .eq("anime_id", resolvedAnimeId)
      .eq("difficulty", difficulty)
      .limit(questionCount * 3);

    if (data && data.length > 0) {
      const shuffled = data.sort(() => Math.random() - 0.5);
      questionIds = shuffled
        .slice(0, Math.min(questionCount, shuffled.length))
        .map((q) => q.id);
    }
  }

  // Shuffle final order
  questionIds.sort(() => Math.random() - 0.5);

  return { questionIds, resolvedAnimeId };
};

// ── Create Duel ────────────────────────────────────────────────

export const createDuel = async (
  challengerId: string,
  options: DuelCreateOptions
): Promise<DuelMatch | null> => {
  const supabase = createClient();

  const { questionIds, resolvedAnimeId } = await selectDuelQuestions(
    options.anime_id ?? null,
    options.difficulty,
    options.question_count
  );

  if (questionIds.length === 0) return null;

  const status =
    options.match_type === "friend_challenge" && options.opponent_id
      ? "waiting"
      : options.opponent_id
        ? "matched"
        : "waiting";

  const { data, error } = await supabase
    .from("duel_matches")
    .insert({
      challenger_id: challengerId,
      opponent_id: options.opponent_id ?? null,
      match_type: options.match_type,
      anime_id: resolvedAnimeId,
      difficulty: options.difficulty,
      question_count: options.question_count,
      questions: questionIds,
      status,
    })
    .select()
    .single();

  if (error) throw error;

  if (data) {
    trackDuelCreated(challengerId, {
      match_type: options.match_type,
      difficulty: options.difficulty,
      question_count: options.question_count,
      duel_id: (data as DuelMatch).id,
    }).catch(() => {});
  }

  return data as DuelMatch;
};

// ── Find Quick Match ───────────────────────────────────────────

export const findQuickMatch = async (
  userId: string,
  options: Omit<DuelCreateOptions, "match_type" | "opponent_id">
): Promise<DuelMatch | null> => {
  const supabase = createClient();

  // Get user's league info for tier-based matching
  const userLeague = await getUserLeagueInfo(userId);
  const userTier = userLeague?.league?.tier ?? 1;

  // Get user's age group for age-appropriate matching
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("age_group")
    .eq("id", userId)
    .single();

  const isJunior = userProfile?.age_group === "junior";

  // Look for existing waiting quick matches within ±1 league tier
  const { data: waitingMatches } = await supabase
    .from("duel_matches")
    .select("*")
    .eq("status", "waiting")
    .eq("match_type", "quick_match")
    .is("opponent_id", null)
    .neq("challenger_id", userId)
    .order("created_at", { ascending: true })
    .limit(20);

  if (waitingMatches && waitingMatches.length > 0) {
    // Filter by tier proximity and age group
    for (const match of waitingMatches) {
      const opponentLeague = await getUserLeagueInfo(match.challenger_id);
      const opponentTier = opponentLeague?.league?.tier ?? 1;

      // ±1 tier range
      if (Math.abs(userTier - opponentTier) > 1) continue;

      // Age group check: juniors only with juniors
      const { data: opponentProfile } = await supabase
        .from("user_profiles")
        .select("age_group")
        .eq("id", match.challenger_id)
        .single();

      const opponentIsJunior = opponentProfile?.age_group === "junior";
      if (isJunior !== opponentIsJunior) continue;

      // Found a match — claim it
      const { data: updated, error } = await supabase
        .from("duel_matches")
        .update({
          opponent_id: userId,
          status: "matched",
        })
        .eq("id", match.id)
        .eq("status", "waiting") // Optimistic concurrency
        .select()
        .single();

      if (!error && updated) {
        return updated as DuelMatch;
      }
      // If update failed (someone else claimed it), continue looking
    }
  }

  // No match found — create a new waiting duel
  return createDuel(userId, {
    ...options,
    match_type: "quick_match",
  });
};

// ── Submit Duel Results ────────────────────────────────────────

interface DuelAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeMs: number;
}

export const submitDuelResults = async (
  duelId: string,
  userId: string,
  answers: DuelAnswer[],
  totalTimeMs: number
): Promise<DuelMatch | null> => {
  const supabase = createClient();

  // Fetch current duel state
  const { data: duel } = await supabase
    .from("duel_matches")
    .select("*")
    .eq("id", duelId)
    .single();

  if (!duel) return null;

  const isChallenger = duel.challenger_id === userId;
  const isOpponent = duel.opponent_id === userId;
  if (!isChallenger && !isOpponent) return null;

  // Calculate score
  const correctCount = answers.filter((a) => a.isCorrect).length;
  let totalScore = 0;
  let streak = 0;

  for (const answer of answers) {
    if (answer.isCorrect) {
      const questionXp = calculateQuestionXP(
        (duel.difficulty === "mixed" ? "medium" : duel.difficulty) as Difficulty,
        streak,
        answer.timeMs,
        30000
      );
      totalScore += questionXp;
      streak++;
    } else {
      streak = 0;
    }
  }

  // Build update payload
  const update: Record<string, unknown> = {};

  if (isChallenger) {
    update.challenger_score = totalScore;
    update.challenger_correct = correctCount;
    update.challenger_time_ms = totalTimeMs;
    update.challenger_answers = answers;
    update.challenger_completed_at = new Date().toISOString();
  } else {
    update.opponent_score = totalScore;
    update.opponent_correct = correctCount;
    update.opponent_time_ms = totalTimeMs;
    update.opponent_answers = answers;
    update.opponent_completed_at = new Date().toISOString();
  }

  // Check if both players have completed
  const challengerDone = isChallenger || duel.challenger_completed_at !== null;
  const opponentDone = isOpponent || duel.opponent_completed_at !== null;

  if (challengerDone && opponentDone) {
    // Both complete — determine winner
    const cScore = isChallenger ? totalScore : duel.challenger_score;
    const oScore = isOpponent ? totalScore : duel.opponent_score;
    const cTime = isChallenger ? totalTimeMs : duel.challenger_time_ms;
    const oTime = isOpponent ? totalTimeMs : duel.opponent_time_ms;
    const cCorrect = isChallenger ? correctCount : duel.challenger_correct;
    const oCorrect = isOpponent ? correctCount : duel.opponent_correct;

    // Helper: longest consecutive correct streak from answers
    const longestStreak = (ans: DuelAnswer[]): number => {
      let best = 0;
      let cur = 0;
      for (const a of ans) {
        if (a.isCorrect) { cur++; best = Math.max(best, cur); }
        else { cur = 0; }
      }
      return best;
    };

    const challengerAnswers = isChallenger
      ? answers
      : (duel.challenger_answers as DuelAnswer[] | null) ?? [];
    const opponentAnswers = isOpponent
      ? answers
      : (duel.opponent_answers as DuelAnswer[] | null) ?? [];
    const cStreak = longestStreak(challengerAnswers);
    const oStreak = longestStreak(opponentAnswers);

    if (cCorrect !== null && oCorrect !== null) {
      // 1. Highest correct count wins
      if (cCorrect > oCorrect) {
        update.winner_id = duel.challenger_id;
      } else if (oCorrect > cCorrect) {
        update.winner_id = duel.opponent_id;
      } else if (cTime !== null && oTime !== null && cTime !== oTime) {
        // 2. Tiebreaker: faster total time
        if (cTime < oTime) {
          update.winner_id = duel.challenger_id;
        } else {
          update.winner_id = duel.opponent_id;
        }
      } else if (cStreak !== oStreak) {
        // 3. Tiebreaker: longest correct streak
        if (cStreak > oStreak) {
          update.winner_id = duel.challenger_id;
        } else {
          update.winner_id = duel.opponent_id;
        }
      }
      // 4. All equal — draw (winner_id stays null)
    }

    update.status = "completed";

    // Calculate XP for both players
    const { challengerXp, opponentXp } = await calculateDuelXp(
      duel.challenger_id,
      duel.opponent_id,
      update.winner_id as string | null
    );

    update.challenger_xp_earned = challengerXp;
    update.opponent_xp_earned = opponentXp;

    // Update duel stats for both players
    await updateDuelStats(
      duel.challenger_id,
      duel.opponent_id,
      update.winner_id as string | null,
      challengerXp,
      opponentXp
    );

    // Award XP to user profiles
    await awardDuelXp(duel.challenger_id, challengerXp);
    await awardDuelXp(duel.opponent_id, opponentXp);

    // Update league membership XP if applicable
    if (duel.anime_id) {
      await updateLeagueMembershipXp(duel.challenger_id, challengerXp, duel.anime_id);
      await updateLeagueMembershipXp(duel.opponent_id, opponentXp, duel.anime_id);
    }

    // Check giant kill
    await checkGiantKill(
      duel.challenger_id,
      duel.opponent_id,
      update.winner_id as string | null
    );

    // Check badges for both players
    const challengerBadges = await checkAndAwardBadges({
      userId: duel.challenger_id,
      quizScore: cCorrect ?? 0,
      quizTotal: duel.question_count,
      answers: challengerAnswers.map((a) => ({
        isCorrect: a.isCorrect,
        timeMs: a.timeMs,
      })),
      isDuel: true,
      duelOpponentId: duel.opponent_id,
    });
    for (const badge of challengerBadges) {
      trackBadgeEarned(duel.challenger_id, { badge_slug: badge.slug, badge_name: badge.name }).catch(() => {});
    }

    const opponentBadges = await checkAndAwardBadges({
      userId: duel.opponent_id,
      quizScore: oCorrect ?? 0,
      quizTotal: duel.question_count,
      answers: opponentAnswers.map((a) => ({
        isCorrect: a.isCorrect,
        timeMs: a.timeMs,
      })),
      isDuel: true,
      duelOpponentId: duel.challenger_id,
    });
    for (const badge of opponentBadges) {
      trackBadgeEarned(duel.opponent_id, { badge_slug: badge.slug, badge_name: badge.name }).catch(() => {});
    }
  } else {
    update.status = "in_progress";
  }

  const { data: updated } = await supabase
    .from("duel_matches")
    .update(update)
    .eq("id", duelId)
    .select()
    .single();

  return (updated as DuelMatch) ?? null;
};

// ── XP Calculation with Tier Multiplier ────────────────────────

const calculateDuelXp = async (
  challengerId: string,
  opponentId: string,
  winnerId: string | null
): Promise<{ challengerXp: number; opponentXp: number }> => {
  const supabase = createClient();

  // Base XP by result
  const WIN_XP = 50;
  const DRAW_XP = 20;
  const LOSS_XP = 10;

  // Get league tiers for both players
  const challengerLeague = await getUserLeagueInfo(challengerId);
  const opponentLeague = await getUserLeagueInfo(opponentId);
  const challengerTier = challengerLeague?.league?.tier ?? 1;
  const opponentTier = opponentLeague?.league?.tier ?? 1;

  // Tier-diff multiplier (from winner's perspective vs opponent's tier)
  const getTierMultiplier = (tierDiff: number): number => {
    if (tierDiff >= 2) return 3.0;   // Beat opponent 2+ tiers above
    if (tierDiff === 1) return 2.0;  // Beat opponent 1 tier above
    if (tierDiff === 0) return 1.0;  // Same tier
    if (tierDiff === -1) return 0.75; // Beat opponent 1 tier below
    return 0.5;                       // Beat opponent 2+ tiers below
  };

  // Check diminishing returns (configurable max duels vs same opponent/week at full XP)
  const maxPerOpponentWeekly = await getDuelMaxPerOpponentWeekly();
  const weekStart = getCurrentWeekStart();
  const { count: duelsThisWeek } = await supabase
    .from("duel_matches")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .or(
      `and(challenger_id.eq.${challengerId},opponent_id.eq.${opponentId}),` +
      `and(challenger_id.eq.${opponentId},opponent_id.eq.${challengerId})`
    )
    .gte("created_at", weekStart);

  const diminishingFactor = (duelsThisWeek ?? 0) >= maxPerOpponentWeekly ? 0.25 : 1.0;

  let challengerXp: number;
  let opponentXp: number;

  if (winnerId === challengerId) {
    const tierDiff = opponentTier - challengerTier;
    challengerXp = Math.round(WIN_XP * getTierMultiplier(tierDiff) * diminishingFactor);
    opponentXp = Math.round(LOSS_XP * getTierMultiplier(challengerTier - opponentTier) * diminishingFactor);
  } else if (winnerId === opponentId) {
    const tierDiff = challengerTier - opponentTier;
    opponentXp = Math.round(WIN_XP * getTierMultiplier(tierDiff) * diminishingFactor);
    challengerXp = Math.round(LOSS_XP * getTierMultiplier(opponentTier - challengerTier) * diminishingFactor);
  } else {
    // Draw — both get draw base XP with tier multiplier
    challengerXp = Math.round(DRAW_XP * getTierMultiplier(opponentTier - challengerTier) * diminishingFactor);
    opponentXp = Math.round(DRAW_XP * getTierMultiplier(challengerTier - opponentTier) * diminishingFactor);
  }

  return { challengerXp, opponentXp };
};

// ── Award XP to User Profile ───────────────────────────────────

const awardDuelXp = async (userId: string, xp: number): Promise<void> => {
  if (xp <= 0) return;
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("total_xp")
    .eq("id", userId)
    .single();

  if (!profile) return;

  await supabase
    .from("user_profiles")
    .update({ total_xp: profile.total_xp + xp })
    .eq("id", userId);
};

// ── Update Duel Stats ──────────────────────────────────────────

const updateDuelStats = async (
  challengerId: string,
  opponentId: string,
  winnerId: string | null,
  challengerXpEarned: number,
  opponentXpEarned: number
): Promise<void> => {
  const supabase = createClient();

  const updatePlayerStats = async (
    playerId: string,
    won: boolean,
    isDraw: boolean,
    xpEarned: number
  ) => {
    // Fetch current stats
    const { data: existing } = await supabase
      .from("duel_stats")
      .select("*")
      .eq("user_id", playerId)
      .single();

    if (existing) {
      const newWinStreak = won ? existing.win_streak + 1 : 0;
      const newBestStreak = Math.max(existing.best_win_streak, newWinStreak);

      await supabase
        .from("duel_stats")
        .update({
          total_duels: existing.total_duels + 1,
          wins: existing.wins + (won ? 1 : 0),
          losses: existing.losses + (!won && !isDraw ? 1 : 0),
          draws: existing.draws + (isDraw ? 1 : 0),
          win_streak: newWinStreak,
          best_win_streak: newBestStreak,
          duel_xp_total: existing.duel_xp_total + xpEarned,
        })
        .eq("user_id", playerId);
    } else {
      await supabase.from("duel_stats").insert({
        user_id: playerId,
        total_duels: 1,
        wins: won ? 1 : 0,
        losses: !won && !isDraw ? 1 : 0,
        draws: isDraw ? 1 : 0,
        win_streak: won ? 1 : 0,
        best_win_streak: won ? 1 : 0,
        duel_xp_total: xpEarned,
      });
    }
  };

  const isDraw = winnerId === null;
  await updatePlayerStats(challengerId, winnerId === challengerId, isDraw, challengerXpEarned);
  await updatePlayerStats(opponentId, winnerId === opponentId, isDraw, opponentXpEarned);
};

// ── Giant Kill Check ───────────────────────────────────────────

const checkGiantKill = async (
  challengerId: string,
  opponentId: string,
  winnerId: string | null
): Promise<void> => {
  if (!winnerId) return;

  const supabase = createClient();
  const loserId = winnerId === challengerId ? opponentId : challengerId;

  // Get both players' league tiers
  const winnerLeague = await getUserLeagueInfo(winnerId);
  const loserLeague = await getUserLeagueInfo(loserId);
  const winnerTier = winnerLeague?.league?.tier ?? 1;
  const loserTier = loserLeague?.league?.tier ?? 1;

  // Giant kill: winner was 2+ tiers below the loser
  if (loserTier - winnerTier >= 2) {
    const { data: stats } = await supabase
      .from("duel_stats")
      .select("giant_kills")
      .eq("user_id", winnerId)
      .single();

    if (stats) {
      await supabase
        .from("duel_stats")
        .update({ giant_kills: stats.giant_kills + 1 })
        .eq("user_id", winnerId);
    }
  }
};

// ── Get Duel History ───────────────────────────────────────────

export const getDuelHistory = async (
  userId: string,
  opponentId?: string,
  limit: number = 20
): Promise<DuelMatch[]> => {
  const supabase = createClient();

  let query = supabase
    .from("duel_matches")
    .select("*")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opponentId) {
    // Head-to-head filter
    query = query.or(
      `and(challenger_id.eq.${userId},opponent_id.eq.${opponentId}),` +
      `and(challenger_id.eq.${opponentId},opponent_id.eq.${userId})`
    );
  } else {
    query = query.or(
      `challenger_id.eq.${userId},opponent_id.eq.${userId}`
    );
  }

  const { data } = await query;
  return (data as DuelMatch[]) ?? [];
};

// ── Get Duel Stats ─────────────────────────────────────────────

export const getDuelStats = async (
  userId: string
): Promise<DuelStats | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("duel_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  return (data as DuelStats) ?? null;
};

// ── Get Active/Pending Duels ───────────────────────────────────

export const getActiveDuels = async (
  userId: string
): Promise<DuelMatch[]> => {
  const supabase = createClient();

  const { data } = await supabase
    .from("duel_matches")
    .select("*")
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .in("status", ["waiting", "matched", "in_progress"])
    .order("created_at", { ascending: false });

  return (data as DuelMatch[]) ?? [];
};

// ── Decline Duel ───────────────────────────────────────────────

export const declineDuel = async (
  duelId: string,
  userId: string
): Promise<boolean> => {
  const supabase = createClient();

  const { error } = await supabase
    .from("duel_matches")
    .update({ status: "declined" })
    .eq("id", duelId)
    .eq("opponent_id", userId)
    .eq("status", "waiting");

  return !error;
};

// ═══════════════════════════════════════════════════════════════
// Friendship Functions
// ═══════════════════════════════════════════════════════════════

export const getFriends = async (
  userId: string
): Promise<FriendshipWithProfile[]> => {
  const supabase = createClient();

  // Get accepted friendships where user is requester
  const { data: asRequester } = await supabase
    .from("friendships")
    .select(`
      *,
      user_profiles:recipient_id (
        id, username, display_name, avatar_url, age_group, total_xp, last_played_at
      )
    `)
    .eq("requester_id", userId)
    .eq("status", "accepted");

  // Get accepted friendships where user is recipient
  const { data: asRecipient } = await supabase
    .from("friendships")
    .select(`
      *,
      user_profiles:requester_id (
        id, username, display_name, avatar_url, age_group, total_xp, last_played_at
      )
    `)
    .eq("recipient_id", userId)
    .eq("status", "accepted");

  return [
    ...((asRequester as FriendshipWithProfile[]) ?? []),
    ...((asRecipient as FriendshipWithProfile[]) ?? []),
  ];
};

export const getPendingFriendRequests = async (
  userId: string
): Promise<FriendshipWithProfile[]> => {
  const supabase = createClient();

  const { data } = await supabase
    .from("friendships")
    .select(`
      *,
      user_profiles:requester_id (
        id, username, display_name, avatar_url, age_group, total_xp, last_played_at
      )
    `)
    .eq("recipient_id", userId)
    .eq("status", "pending");

  return (data as FriendshipWithProfile[]) ?? [];
};

export const sendFriendRequest = async (
  fromId: string,
  toId: string
): Promise<boolean> => {
  const supabase = createClient();

  // Check if friendship already exists in either direction
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${fromId},recipient_id.eq.${toId}),` +
      `and(requester_id.eq.${toId},recipient_id.eq.${fromId})`
    )
    .limit(1)
    .single();

  if (existing) return false; // Already exists

  const { error } = await supabase.from("friendships").insert({
    requester_id: fromId,
    recipient_id: toId,
    status: "pending",
  });

  if (!error) {
    trackFriendRequestSent(fromId, { recipient_id: toId }).catch(() => {});
  }

  return !error;
};

export const acceptFriendRequest = async (
  friendshipId: string,
  userId: string
): Promise<boolean> => {
  const supabase = createClient();

  // Only the recipient can accept
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("recipient_id", userId)
    .eq("status", "pending");

  if (!error) {
    trackFriendRequestAccepted(userId, { friendship_id: friendshipId }).catch(() => {});
  }

  return !error;
};

export const removeFriend = async (
  friendshipId: string,
  userId: string
): Promise<boolean> => {
  const supabase = createClient();

  // Either participant can remove
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

  return !error;
};

// ── Head-to-Head Map ──────────────────────────────────────────

export const getHeadToHeadMap = async (
  userId: string,
  opponentIds: string[]
): Promise<Record<string, { wins: number; losses: number; draws: number }>> => {
  if (opponentIds.length === 0) return {};
  const supabase = createClient();

  const { data } = await supabase
    .from("duel_matches")
    .select("challenger_id, opponent_id, winner_id")
    .eq("status", "completed")
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`);

  const map: Record<string, { wins: number; losses: number; draws: number }> = {};
  const oppSet = new Set(opponentIds);

  for (const d of data ?? []) {
    const oppId = d.challenger_id === userId ? d.opponent_id : d.challenger_id;
    if (!oppId || !oppSet.has(oppId)) continue;
    if (!map[oppId]) map[oppId] = { wins: 0, losses: 0, draws: 0 };
    if (d.winner_id === userId) map[oppId].wins++;
    else if (d.winner_id === null) map[oppId].draws++;
    else map[oppId].losses++;
  }

  return map;
};
