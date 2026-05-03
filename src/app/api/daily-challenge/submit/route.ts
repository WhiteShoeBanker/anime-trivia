// ═══════════════════════════════════════════════════════════════
// Daily challenge score submission — server-side trust boundary
// (daily-bug-N fix, Session 4J)
//
// Players POST their answer set here. The server re-derives
// score, correctness per answer, time-taken, and total XP from
// the authoritative answer key (questions.options[].isCorrect).
// user_profiles.daily_challenge_date / _score / _streak are
// updated server-side via the service-role client; total_xp /
// rank are also updated server-side, bypassing migrations 026
// and 028 triggers.
//
// Trust boundary: NOTHING from the request body other than
// {animeId, answers[{questionId, selectedOption, timeMs}]} is
// read. score, xpEarned, userId, etc. on the body are ignored.
//
// Two-client pattern (mirrors quiz-bug-N / duel-bug-N):
//   - createServerClient (SSR) — auth.getUser only
//   - createServiceClient    — user_profiles / questions /
//                              league_memberships /
//                              weekly_anime_plays (via RPC)
//                              writes (bypasses RLS + triggers)
//
// Asymmetric body vs /api/quiz/submit: no `difficulty` field.
// Daily challenges mix difficulties, so per-question difficulty
// is read from each question row (and used to pick the right
// TIME_LIMITS entry for XP scoring). Reducing the body shrinks
// the trust-boundary surface.
//
// Daily-once enforcement: 409 if user_profiles.daily_challenge_date
// === today (UTC). No conditional UPDATE / row-lock guard — the
// race window for a single user double-clicking is small and the
// worst case (streak briefly incremented twice) is already
// reachable via two devices.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { calculateQuestionXP } from "@/lib/scoring";
import { deriveRankFromXp } from "@/lib/ranks";
import {
  getDailyChallengeMix,
  getDailyChallengeMixForAge,
  getDiminishingReturns,
} from "@/lib/config-actions";
import {
  getCurrentWeekStart,
  getLeagueXpMultiplier,
} from "@/lib/league-xp";
import type { AgeGroup } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceClient = any;

const MAX_QUESTIONS = 10;
const MAX_PER_ANSWER_MS = 60_000;
const XP_MULTIPLIER = 1.5;

const TIME_LIMITS: Record<string, number> = {
  easy: 30,
  medium: 20,
  hard: 15,
  impossible: 5,
};

interface SubmitAnswer {
  questionId: string;
  selectedOption: number;
  timeMs: number;
}

interface SubmitBody {
  animeId: string;
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
  difficulty: string;
  anime_id: string;
}

interface ProfileRow {
  age_group: AgeGroup | null;
  total_xp: number | null;
  daily_challenge_date: string | null;
  daily_challenge_streak: number | null;
}

const todayUtc = (): string => new Date().toISOString().split("T")[0];
const yesterdayUtc = (): string =>
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

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
    typeof body.animeId !== "string" ||
    body.animeId.length === 0 ||
    !Array.isArray(body.answers) ||
    body.answers.length === 0 ||
    body.answers.length > MAX_QUESTIONS ||
    !body.answers.every(isValidAnswer)
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const service = createServiceClient();

  // Single user_profiles SELECT serves four needs: age_group (mix
  // resolution), total_xp (XP credit base), daily_challenge_date
  // (409 check), daily_challenge_streak (streak math).
  const { data: profileData } = await service
    .from("user_profiles")
    .select(
      "age_group, total_xp, daily_challenge_date, daily_challenge_streak"
    )
    .eq("id", user.id)
    .single();
  const profile = profileData as ProfileRow | null;
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const today = todayUtc();
  if (profile.daily_challenge_date === today) {
    return NextResponse.json(
      { error: "Already played today" },
      { status: 409 }
    );
  }

  // Mix resolution mirrors fetchDailyChallengeQuestions: junior
  // gets the override when configured, teen/full falls back to base.
  const ageGroup: AgeGroup = profile.age_group ?? "full";
  const mix =
    (await getDailyChallengeMixForAge(ageGroup)) ??
    (await getDailyChallengeMix());
  const expectedCount = Object.values(mix).reduce(
    (sum, n) => sum + (typeof n === "number" ? n : 0),
    0
  );

  if (
    expectedCount === 0 ||
    body.answers.length !== expectedCount
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const submittedIds = body.answers.map((a) => a.questionId);
  const { data: questionsData } = await service
    .from("questions")
    .select("id, options, difficulty, anime_id")
    .in("id", submittedIds);
  const questions = (questionsData ?? []) as QuestionRow[];

  if (questions.length !== submittedIds.length) {
    return NextResponse.json({ error: "Unknown question" }, { status: 400 });
  }

  const questionsById = new Map<string, QuestionRow>();
  for (const q of questions) {
    questionsById.set(q.id, q);
  }

  // Per-answer derivation. Per-question time limit lookup because
  // daily challenges mix difficulties — unlike /api/quiz/submit
  // which has a single difficulty for the whole submission.
  let score = 0;
  let xpEarned = 0;
  let totalTimeMs = 0;
  let streak = 0;
  for (const a of body.answers) {
    const q = questionsById.get(a.questionId);
    if (!q) {
      return NextResponse.json(
        { error: "Unknown question" },
        { status: 400 }
      );
    }
    const clampedTimeMs = Math.max(
      0,
      Math.min(a.timeMs, MAX_PER_ANSWER_MS)
    );
    totalTimeMs += clampedTimeMs;
    const correctIndex = q.options.findIndex((o) => o.isCorrect);
    const isCorrect =
      correctIndex >= 0 && a.selectedOption === correctIndex;
    if (isCorrect) {
      const timeLimitMs = (TIME_LIMITS[q.difficulty] ?? 20) * 1000;
      const baseXp = calculateQuestionXP(
        q.difficulty as "easy" | "medium" | "hard" | "impossible",
        streak,
        clampedTimeMs,
        timeLimitMs
      );
      xpEarned += Math.round(baseXp * XP_MULTIPLIER);
      streak += 1;
      score += 1;
    } else {
      streak = 0;
    }
  }

  // Streak rule (priorDate === today is unreachable here, since
  // we 409'd above; keep prior streak as a defensive fallback).
  const priorDate = profile.daily_challenge_date;
  const priorStreak = profile.daily_challenge_streak ?? 0;
  let newStreak: number;
  if (priorDate === today) {
    newStreak = priorStreak || 1;
  } else if (priorDate === yesterdayUtc()) {
    newStreak = priorStreak + 1;
  } else {
    newStreak = 1;
  }

  const previousXp = profile.total_xp ?? 0;
  const newTotalXp = previousXp + xpEarned;
  const rank = deriveRankFromXp(newTotalXp);

  // Single UPDATE writes all five managed columns plus
  // last_played_at. Service-role bypasses the migration-028
  // (and 026) trigger.
  await service
    .from("user_profiles")
    .update({
      daily_challenge_date: today,
      daily_challenge_score: score,
      daily_challenge_streak: newStreak,
      total_xp: newTotalXp,
      rank,
      last_played_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  // League XP — best-effort (matches existing store's
  // "League XP failed — non-critical" behavior). Inlined
  // here so writes go through service-role and stay under
  // the trust boundary; weekly_anime_plays + league_memberships
  // are the same tables the prior client path wrote to.
  try {
    await awardLeagueXp(service, user.id, body.animeId, xpEarned);
  } catch {
    // intentionally swallowed
  }

  return NextResponse.json({
    score,
    correctAnswers: score,
    totalQuestions: body.answers.length,
    xpEarned,
    timeTakenSeconds: Math.round(totalTimeMs / 1000),
    streak: newStreak,
  });
}

// ── Helpers ─────────────────────────────────────────────────────

const awardLeagueXp = async (
  service: ServiceClient,
  userId: string,
  animeId: string,
  baseXp: number
): Promise<void> => {
  if (baseXp <= 0) return;

  const weekStart = getCurrentWeekStart();

  // Atomic upsert+increment via RPC (migration 022). Mirrors
  // src/lib/league-xp.ts:calculateLeagueXp behavior. Service-role
  // call still flows through the SECURITY DEFINER RPC so the
  // weekly_anime_plays UNIQUE constraint serializes concurrent
  // callers.
  const { data: incrementedCount, error } = await service.rpc(
    "increment_weekly_anime_play",
    {
      p_user_id: userId,
      p_anime_id: animeId,
      p_week_start: weekStart,
    }
  );

  const playCount =
    !error && typeof incrementedCount === "number" ? incrementedCount : 1;

  const multipliers = await getDiminishingReturns();
  const multiplier = getLeagueXpMultiplier(playCount, multipliers);
  const leagueXp = Math.round(baseXp * multiplier);
  if (leagueXp <= 0) return;

  const { data: membership } = await service
    .from("league_memberships")
    .select("id, weekly_xp")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  if (!membership) return;

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
