// ═══════════════════════════════════════════════════════════════
// Duel score submission — server-side trust boundary
// (duel-bug-N fix, Session 4I)
//
// Players POST their answer set here. The server identifies the
// caller as challenger or opponent via duel_matches.challenger_id
// / opponent_id, fetches the duel's pre-assigned questions, and
// re-derives isCorrect per answer + score + per-question XP from
// the authoritative answer key (questions.options[].isCorrect).
// duel_matches score / answer / time / winner / xp columns are
// written server-side via the service-role client, which bypasses
// the new migration-027 trigger that locks those columns from
// authenticated/anon roles. user_profiles total_xp / rank are
// also written server-side, bypassing migration-026's trigger.
//
// Trust boundary: NOTHING from the request body other than
// {duelId, answers[{questionId, selectedOption, timeMs}]} is read.
// score, isCorrect, userId, totalTimeMs etc. on the body are
// ignored.
//
// Two-pass UPDATE to handle concurrent both-submit races:
//   Pass 1: claim caller's slot via .is({side}_completed_at, null)
//           conditional UPDATE. Detects duplicate submission and
//           the per-side race-loss case.
//   Pass 2: if the post-claim row shows the other side already
//           completed, transition to 'completed' with
//           .eq("status", "in_progress") guard. Detects the race
//           where two near-simultaneous calls each saw the other
//           side as null at READ time. Loser refetches and
//           returns degraded mode (caller's slot landed but
//           someone else completed the duel).
//
// Two-client pattern (mirrors quiz-bug-N / gp-bug-5):
//   - createServerClient (SSR) — auth.getUser only
//   - createServiceClient    — duel_matches / duel_stats /
//                              user_profiles / league_memberships
//                              writes (bypasses RLS + triggers)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { calculateQuestionXP } from "@/lib/scoring";
import { deriveRankFromXp } from "@/lib/ranks";
import { getCurrentWeekStart } from "@/lib/league-xp";
import { getDuelMaxPerOpponentWeekly } from "@/lib/config-actions";
import type { Difficulty, DuelDifficulty } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceClient = any;

const MAX_PER_ANSWER_MS = 60_000;
const MAX_QUESTIONS = 10;

const TIME_LIMITS: Record<DuelDifficulty, number> = {
  easy: 30,
  medium: 20,
  hard: 15,
  impossible: 5,
  mixed: 20,
};

// XP base values + tier multipliers — preserved verbatim from
// the pre-migration src/lib/duels.ts:calculateDuelXp.
const WIN_XP = 50;
const DRAW_XP = 20;
const LOSS_XP = 10;

const getTierMultiplier = (tierDiff: number): number => {
  if (tierDiff >= 2) return 3.0;
  if (tierDiff === 1) return 2.0;
  if (tierDiff === 0) return 1.0;
  if (tierDiff === -1) return 0.75;
  return 0.5;
};

interface SubmitAnswer {
  questionId: string;
  selectedOption: number;
  timeMs: number;
}

interface SubmitBody {
  duelId: string;
  answers: SubmitAnswer[];
}

const isValidAnswer = (a: unknown): a is SubmitAnswer => {
  if (!a || typeof a !== "object") return false;
  const ans = a as Record<string, unknown>;
  return (
    typeof ans.questionId === "string" &&
    ans.questionId.length > 0 &&
    typeof ans.selectedOption === "number" &&
    Number.isInteger(ans.selectedOption) &&
    typeof ans.timeMs === "number" &&
    Number.isFinite(ans.timeMs)
  );
};

interface QuestionRow {
  id: string;
  options: { isCorrect: boolean }[];
}

interface DerivedAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeMs: number;
}

interface DuelRow {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  match_type: string;
  anime_id: string | null;
  difficulty: DuelDifficulty;
  question_count: number;
  questions: string[];
  challenger_score: number | null;
  challenger_correct: number | null;
  challenger_time_ms: number | null;
  challenger_answers: DerivedAnswer[] | null;
  challenger_completed_at: string | null;
  opponent_score: number | null;
  opponent_correct: number | null;
  opponent_time_ms: number | null;
  opponent_answers: DerivedAnswer[] | null;
  opponent_completed_at: string | null;
  winner_id: string | null;
  status: string;
  challenger_xp_earned: number;
  opponent_xp_earned: number;
  expires_at: string;
  created_at: string;
}

export async function POST(request: Request) {
  const ssr = await createServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (
    !body ||
    typeof body.duelId !== "string" ||
    body.duelId.length === 0 ||
    !Array.isArray(body.answers) ||
    body.answers.length === 0 ||
    body.answers.length > MAX_QUESTIONS ||
    !body.answers.every(isValidAnswer)
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: duelData } = await service
    .from("duel_matches")
    .select("*")
    .eq("id", body.duelId)
    .single();
  const duel = duelData as DuelRow | null;
  if (!duel) {
    return NextResponse.json({ error: "Duel not found" }, { status: 404 });
  }

  const isChallenger = duel.challenger_id === user.id;
  const isOpponent = duel.opponent_id === user.id;
  if (!isChallenger && !isOpponent) {
    return NextResponse.json({ error: "Not a player" }, { status: 403 });
  }

  if (
    duel.status === "completed" ||
    duel.status === "expired" ||
    duel.status === "declined"
  ) {
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  }

  const sidePrefix: "challenger" | "opponent" = isChallenger
    ? "challenger"
    : "opponent";
  const otherPrefix: "challenger" | "opponent" = isChallenger
    ? "opponent"
    : "challenger";

  const callerCompletedAt = duel[`${sidePrefix}_completed_at`];
  if (callerCompletedAt !== null) {
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  }

  // Question set validation. duel.questions is a JSONB string[]
  // pre-assigned at duel creation; the submission must answer
  // exactly that set. Reject extras, missing, or wrong count.
  const assignedIds = duel.questions ?? [];
  if (
    body.answers.length !== duel.question_count ||
    assignedIds.length !== duel.question_count
  ) {
    return NextResponse.json(
      { error: "Question set mismatch" },
      { status: 400 }
    );
  }
  const submittedIdSet = new Set(body.answers.map((a) => a.questionId));
  if (
    submittedIdSet.size !== duel.question_count ||
    assignedIds.some((id) => !submittedIdSet.has(id))
  ) {
    return NextResponse.json(
      { error: "Question set mismatch" },
      { status: 400 }
    );
  }

  const { data: questionsData } = await service
    .from("questions")
    .select("id, options")
    .in("id", assignedIds);
  const questions = (questionsData ?? []) as QuestionRow[];
  if (questions.length !== duel.question_count) {
    return NextResponse.json({ error: "Unknown question" }, { status: 400 });
  }

  const correctIndexById = new Map<string, number>();
  for (const q of questions) {
    correctIndexById.set(
      q.id,
      q.options.findIndex((o) => o.isCorrect)
    );
  }

  // Difficulty for XP: mixed → medium fallback (matches existing
  // client behavior). calculateQuestionXP requires a strict
  // Difficulty.
  const diffForXp: Difficulty =
    duel.difficulty === "mixed" ? "medium" : duel.difficulty;
  const timeLimitMs =
    (TIME_LIMITS[duel.difficulty] ?? 20) * 1000;

  let derivedScore = 0;
  let derivedXp = 0;
  let totalTimeMs = 0;
  let streak = 0;
  const derivedAnswers: DerivedAnswer[] = body.answers.map((a) => {
    const clampedTimeMs = Math.max(
      0,
      Math.min(a.timeMs, MAX_PER_ANSWER_MS)
    );
    totalTimeMs += clampedTimeMs;
    const correctIndex = correctIndexById.get(a.questionId);
    const isCorrect =
      typeof correctIndex === "number" &&
      correctIndex >= 0 &&
      a.selectedOption === correctIndex;
    if (isCorrect) {
      derivedXp += calculateQuestionXP(
        diffForXp,
        streak,
        clampedTimeMs,
        timeLimitMs
      );
      streak += 1;
      derivedScore += 1;
    } else {
      streak = 0;
    }
    return {
      questionId: a.questionId,
      selectedOption: a.selectedOption,
      isCorrect,
      timeMs: clampedTimeMs,
    };
  });

  const nowIso = new Date().toISOString();

  // Pass 1: claim the caller's slot. Conditional .is({side}_completed_at,
  // null) detects duplicate submission and per-side race-loss.
  const slotUpdate: Record<string, unknown> = {
    [`${sidePrefix}_score`]: derivedXp,
    [`${sidePrefix}_correct`]: derivedScore,
    [`${sidePrefix}_time_ms`]: totalTimeMs,
    [`${sidePrefix}_answers`]: derivedAnswers,
    [`${sidePrefix}_completed_at`]: nowIso,
    status: "in_progress",
  };
  const { data: afterClaimData } = await service
    .from("duel_matches")
    .update(slotUpdate)
    .eq("id", duel.id)
    .is(`${sidePrefix}_completed_at`, null)
    .select()
    .single();
  const afterClaim = afterClaimData as DuelRow | null;
  if (!afterClaim) {
    return NextResponse.json(
      { error: "Concurrent submission" },
      { status: 409 }
    );
  }

  const otherCompletedAt = afterClaim[`${otherPrefix}_completed_at`];
  const otherCorrect = afterClaim[`${otherPrefix}_correct`];
  const otherTimeMs = afterClaim[`${otherPrefix}_time_ms`];
  const otherAnswers = afterClaim[`${otherPrefix}_answers`];

  // First submitter — leave duel in 'in_progress'. The other
  // player's later submission will run pass 2.
  if (otherCompletedAt === null) {
    return NextResponse.json({
      duel: afterClaim,
      score: derivedScore,
      correctAnswers: derivedScore,
      xpEarned: 0, // XP credited only at duel completion
      totalQuestions: duel.question_count,
      winnerId: null,
    });
  }

  // Pass 2: both sides have submitted. Compute winner_id and XP,
  // transition to 'completed'. Race guard ensures only one of two
  // concurrent both-submit calls writes the completion row.
  const callerCorrect = derivedScore;
  const callerTimeMs = totalTimeMs;
  const callerAnswers = derivedAnswers;

  const cCorrect = isChallenger ? callerCorrect : (otherCorrect ?? 0);
  const oCorrect = isChallenger ? (otherCorrect ?? 0) : callerCorrect;
  const cTimeMs = isChallenger ? callerTimeMs : (otherTimeMs ?? 0);
  const oTimeMs = isChallenger ? (otherTimeMs ?? 0) : callerTimeMs;
  const cAnswers = isChallenger ? callerAnswers : (otherAnswers ?? []);
  const oAnswers = isChallenger ? (otherAnswers ?? []) : callerAnswers;

  const cStreak = longestStreak(cAnswers);
  const oStreak = longestStreak(oAnswers);

  let winnerId: string | null = null;
  if (cCorrect > oCorrect) {
    winnerId = duel.challenger_id;
  } else if (oCorrect > cCorrect) {
    winnerId = duel.opponent_id;
  } else if (cTimeMs !== oTimeMs) {
    winnerId =
      cTimeMs < oTimeMs ? duel.challenger_id : duel.opponent_id;
  } else if (cStreak !== oStreak) {
    winnerId =
      cStreak > oStreak ? duel.challenger_id : duel.opponent_id;
  }

  const { challengerXp, opponentXp } = await calculateDuelXp(
    service,
    duel.challenger_id,
    duel.opponent_id,
    winnerId
  );

  const completionUpdate = {
    status: "completed",
    winner_id: winnerId,
    challenger_xp_earned: challengerXp,
    opponent_xp_earned: opponentXp,
  };
  const { data: completedData } = await service
    .from("duel_matches")
    .update(completionUpdate)
    .eq("id", duel.id)
    .eq("status", "in_progress")
    .select()
    .single();
  const completed = completedData as DuelRow | null;

  if (!completed) {
    // The other concurrent caller beat us to the completion row.
    // Caller's slot was still successfully claimed in pass 1; the
    // other completer ran the side-effects already. Refetch the
    // current state and return it without re-running side-effects.
    const { data: latestData } = await service
      .from("duel_matches")
      .select("*")
      .eq("id", duel.id)
      .single();
    const latest = latestData as DuelRow | null;
    return NextResponse.json({
      duel: latest ?? afterClaim,
      score: derivedScore,
      correctAnswers: derivedScore,
      xpEarned: isChallenger
        ? (latest?.challenger_xp_earned ?? 0)
        : (latest?.opponent_xp_earned ?? 0),
      totalQuestions: duel.question_count,
      winnerId: latest?.winner_id ?? null,
    });
  }

  // Side-effects (only the pass-2 winner runs them).
  await updateDuelStats(
    service,
    duel.challenger_id,
    duel.opponent_id,
    winnerId,
    challengerXp,
    opponentXp
  );

  await awardUserProfileXp(service, duel.challenger_id, challengerXp);
  if (duel.opponent_id) {
    await awardUserProfileXp(service, duel.opponent_id, opponentXp);
  }

  if (duel.anime_id) {
    await updateLeagueMembershipXp(service, duel.challenger_id, challengerXp);
    if (duel.opponent_id) {
      await updateLeagueMembershipXp(service, duel.opponent_id, opponentXp);
    }
  }

  await checkGiantKill(
    service,
    duel.challenger_id,
    duel.opponent_id,
    winnerId
  );

  return NextResponse.json({
    duel: completed,
    score: derivedScore,
    correctAnswers: derivedScore,
    xpEarned: isChallenger ? challengerXp : opponentXp,
    totalQuestions: duel.question_count,
    winnerId,
  });
}

// ── Helpers (private to this route) ─────────────────────────────

const longestStreak = (answers: DerivedAnswer[]): number => {
  let best = 0;
  let cur = 0;
  for (const a of answers) {
    if (a.isCorrect) {
      cur += 1;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
};

// Server-side variant of getUserLeagueInfo — only needs .league.tier
// for the multiplier. Defaults to tier 1 when no membership found
// (matches pre-migration fallback behavior).
const getTier = async (
  service: ServiceClient,
  userId: string
): Promise<number> => {
  const { data } = await service
    .from("league_memberships")
    .select("leagues:league_id (tier)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return 1;
  const leagues = (data as { leagues: unknown }).leagues;
  if (!leagues) return 1;
  if (Array.isArray(leagues)) {
    const first = leagues[0] as { tier?: number } | undefined;
    return first?.tier ?? 1;
  }
  return (leagues as { tier?: number }).tier ?? 1;
};

const calculateDuelXp = async (
  service: ServiceClient,
  challengerId: string,
  opponentId: string | null,
  winnerId: string | null
): Promise<{ challengerXp: number; opponentXp: number }> => {
  if (!opponentId) {
    return { challengerXp: 0, opponentXp: 0 };
  }

  const [challengerTier, opponentTier] = await Promise.all([
    getTier(service, challengerId),
    getTier(service, opponentId),
  ]);

  const maxPerOpponentWeekly = await getDuelMaxPerOpponentWeekly();
  const weekStart = getCurrentWeekStart();
  const { count: duelsThisWeek } = await service
    .from("duel_matches")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .or(
      `and(challenger_id.eq.${challengerId},opponent_id.eq.${opponentId}),` +
      `and(challenger_id.eq.${opponentId},opponent_id.eq.${challengerId})`
    )
    .gte("created_at", weekStart);

  const diminishingFactor =
    (duelsThisWeek ?? 0) >= maxPerOpponentWeekly ? 0.25 : 1.0;

  let challengerXp: number;
  let opponentXp: number;

  if (winnerId === challengerId) {
    const tierDiff = opponentTier - challengerTier;
    challengerXp = Math.round(
      WIN_XP * getTierMultiplier(tierDiff) * diminishingFactor
    );
    opponentXp = Math.round(
      LOSS_XP * getTierMultiplier(-tierDiff) * diminishingFactor
    );
  } else if (winnerId === opponentId) {
    const tierDiff = challengerTier - opponentTier;
    opponentXp = Math.round(
      WIN_XP * getTierMultiplier(tierDiff) * diminishingFactor
    );
    challengerXp = Math.round(
      LOSS_XP * getTierMultiplier(-tierDiff) * diminishingFactor
    );
  } else {
    // Draw: each side applies its own perspective multiplier on
    // the DRAW base.
    challengerXp = Math.round(
      DRAW_XP *
        getTierMultiplier(opponentTier - challengerTier) *
        diminishingFactor
    );
    opponentXp = Math.round(
      DRAW_XP *
        getTierMultiplier(challengerTier - opponentTier) *
        diminishingFactor
    );
  }

  return { challengerXp, opponentXp };
};

const updateDuelStats = async (
  service: ServiceClient,
  challengerId: string,
  opponentId: string | null,
  winnerId: string | null,
  challengerXpEarned: number,
  opponentXpEarned: number
): Promise<void> => {
  const isDraw = winnerId === null;

  const updateOne = async (
    playerId: string,
    won: boolean,
    xpEarned: number
  ) => {
    const { data: existing } = await service
      .from("duel_stats")
      .select("*")
      .eq("user_id", playerId)
      .single();

    if (existing) {
      const newWinStreak = won ? existing.win_streak + 1 : 0;
      const newBestStreak = Math.max(
        existing.best_win_streak,
        newWinStreak
      );

      await service
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
      await service.from("duel_stats").insert({
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

  await updateOne(
    challengerId,
    winnerId === challengerId,
    challengerXpEarned
  );
  if (opponentId) {
    await updateOne(
      opponentId,
      winnerId === opponentId,
      opponentXpEarned
    );
  }
};

const awardUserProfileXp = async (
  service: ServiceClient,
  userId: string,
  xp: number
): Promise<void> => {
  if (xp <= 0) return;

  const { data: profile } = await service
    .from("user_profiles")
    .select("total_xp")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const previousXp = (profile as { total_xp: number }).total_xp ?? 0;
  const newTotalXp = previousXp + xp;
  const rank = deriveRankFromXp(newTotalXp);

  await service
    .from("user_profiles")
    .update({
      total_xp: newTotalXp,
      rank,
      last_played_at: new Date().toISOString(),
    })
    .eq("id", userId);
};

// Server-side variant of league-xp's updateLeagueMembershipXp.
// Skips the rank-tracking response (browser callers needed it for
// UI feedback; the route doesn't surface rank changes for duels).
const updateLeagueMembershipXp = async (
  service: ServiceClient,
  userId: string,
  leagueXp: number
): Promise<void> => {
  if (leagueXp <= 0) return;

  const { data: membership } = await service
    .from("league_memberships")
    .select("id, weekly_xp")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  if (!membership) return;

  const weekStart = getCurrentWeekStart();
  const { count: uniqueAnimeCount } = await service
    .from("weekly_anime_plays")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("week_start", weekStart);

  await service
    .from("league_memberships")
    .update({
      weekly_xp:
        (membership as { weekly_xp: number }).weekly_xp + leagueXp,
      unique_anime_count: uniqueAnimeCount ?? 0,
    })
    .eq("id", (membership as { id: string }).id);
};

const checkGiantKill = async (
  service: ServiceClient,
  challengerId: string,
  opponentId: string | null,
  winnerId: string | null
): Promise<void> => {
  if (!winnerId || !opponentId) return;

  const loserId = winnerId === challengerId ? opponentId : challengerId;

  const [winnerTier, loserTier] = await Promise.all([
    getTier(service, winnerId),
    getTier(service, loserId),
  ]);

  if (loserTier - winnerTier < 2) return;

  const { data: stats } = await service
    .from("duel_stats")
    .select("giant_kills")
    .eq("user_id", winnerId)
    .single();

  if (!stats) return;

  await service
    .from("duel_stats")
    .update({
      giant_kills: (stats as { giant_kills: number }).giant_kills + 1,
    })
    .eq("user_id", winnerId);
};
