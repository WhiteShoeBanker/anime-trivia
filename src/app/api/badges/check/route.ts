// ═══════════════════════════════════════════════════════════════
// Badge awarding — server-side trust boundary (badge-bug-2 fix)
//
// Replaces the browser-side checkAndAwardBadges path. Callers POST
// the kind of game outcome (quiz_session, duel_match,
// daily_challenge) and an id where applicable; the route loads the
// authoritative DB row, builds BadgeCheckContext from server-trusted
// fields, runs the checker engine via the service-role client, and
// idempotently inserts new user_badges rows.
//
// Trust boundary: NOTHING from the request body other than {kind, id}
// is trusted. All context fields (quizScore, quizTotal, difficulty,
// animeId, answers, isDuel, duelOpponentId) are derived from the
// authoritative DB row identified by the auth user + id pair.
//
// Time-of-day checkers (hour_before / hour_after) still trust the
// host clock; here that means the server clock instead of the
// device clock — a smaller surface than before, but not eliminated.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { runBadgeChecks } from "@/lib/badges-engine";
import type { BadgeCheckContext, Difficulty } from "@/types";

const QUIZ_SESSION = "quiz_session";
const DUEL_MATCH = "duel_match";
const DAILY_CHALLENGE = "daily_challenge";

// Matches the daily_challenge_mix admin config:
// 3 easy + 3 medium + 3 hard + 1 impossible = 10.
const DAILY_CHALLENGE_QUESTION_COUNT = 10;

type RequestBody =
  | { kind: typeof QUIZ_SESSION; id: string }
  | { kind: typeof DUEL_MATCH; id: string }
  | { kind: typeof DAILY_CHALLENGE };

const ALLOWED_DIFFICULTIES: ReadonlySet<Difficulty> = new Set([
  "easy",
  "medium",
  "hard",
  "impossible",
]);

const isDifficulty = (d: string | null | undefined): d is Difficulty => {
  return typeof d === "string" && ALLOWED_DIFFICULTIES.has(d as Difficulty);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceClient = any;

type ContextResult =
  | { context: BadgeCheckContext }
  | { error: string; status: number };

export async function POST(request: Request) {
  const ssr = await createServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (
    !body ||
    (body.kind !== QUIZ_SESSION &&
      body.kind !== DUEL_MATCH &&
      body.kind !== DAILY_CHALLENGE)
  ) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const service = createServiceClient();

  let result: ContextResult;
  if (body.kind === QUIZ_SESSION) {
    if (typeof body.id !== "string" || !body.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    result = await loadQuizSessionContext(service, user.id, body.id);
  } else if (body.kind === DUEL_MATCH) {
    if (typeof body.id !== "string" || !body.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    result = await loadDuelMatchContext(service, user.id, body.id);
  } else {
    result = await loadDailyChallengeContext(service, user.id);
  }

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const newBadges = await runBadgeChecks(result.context, service);

  if (newBadges.length > 0) {
    const inserts = newBadges.map((b) => ({
      user_id: user.id,
      badge_id: b.id,
    }));
    await service.from("user_badges").upsert(inserts, {
      onConflict: "user_id,badge_id",
      ignoreDuplicates: true,
    });
  }

  return NextResponse.json({ newBadges });
}

// ── Per-kind context loaders ────────────────────────────────────

interface QuizSessionRow {
  id: string;
  user_id: string;
  anime_id: string | null;
  difficulty: string | null;
  score: number | null;
  total_questions: number | null;
  xp_earned: number | null;
}

interface UserAnswerRow {
  is_correct: boolean | null;
  time_taken_ms: number | null;
}

const loadQuizSessionContext = async (
  service: ServiceClient,
  userId: string,
  sessionId: string
): Promise<ContextResult> => {
  const { data: sessionData } = await service
    .from("quiz_sessions")
    .select(
      "id, user_id, anime_id, difficulty, score, total_questions, xp_earned"
    )
    .eq("id", sessionId)
    .single();
  const session = sessionData as QuizSessionRow | null;

  if (!session) {
    return { error: "Session not found", status: 404 };
  }
  if (session.user_id !== userId) {
    return { error: "Forbidden", status: 403 };
  }

  const { data: answerRows } = await service
    .from("user_answers")
    .select("is_correct, time_taken_ms")
    .eq("session_id", sessionId);

  const answers = ((answerRows ?? []) as UserAnswerRow[]).map((row) => ({
    isCorrect: row.is_correct === true,
    timeMs: row.time_taken_ms ?? 0,
  }));

  const context: BadgeCheckContext = {
    userId,
    quizScore: session.score ?? 0,
    quizTotal: session.total_questions ?? 0,
    difficulty: isDifficulty(session.difficulty)
      ? session.difficulty
      : undefined,
    animeId: session.anime_id ?? undefined,
    answers,
    xpEarned: session.xp_earned ?? 0,
  };

  return { context };
};

interface DuelAnswerJson {
  isCorrect?: unknown;
  timeMs?: unknown;
}

interface DuelMatchRow {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  status: string;
  question_count: number;
  challenger_correct: number | null;
  opponent_correct: number | null;
  challenger_answers: DuelAnswerJson[] | null;
  opponent_answers: DuelAnswerJson[] | null;
}

const loadDuelMatchContext = async (
  service: ServiceClient,
  userId: string,
  duelId: string
): Promise<ContextResult> => {
  const { data: duelData } = await service
    .from("duel_matches")
    .select(
      "id, challenger_id, opponent_id, status, question_count, challenger_correct, opponent_correct, challenger_answers, opponent_answers"
    )
    .eq("id", duelId)
    .single();
  const duel = duelData as DuelMatchRow | null;

  if (!duel) {
    return { error: "Duel not found", status: 404 };
  }

  const isChallenger = duel.challenger_id === userId;
  const isOpponent = duel.opponent_id === userId;
  if (!isChallenger && !isOpponent) {
    return { error: "Forbidden", status: 403 };
  }

  if (duel.status !== "completed") {
    return { error: "Duel not completed", status: 400 };
  }

  const myCorrect = isChallenger
    ? duel.challenger_correct
    : duel.opponent_correct;
  const myAnswersRaw =
    (isChallenger ? duel.challenger_answers : duel.opponent_answers) ?? [];
  const opponentId = isChallenger ? duel.opponent_id : duel.challenger_id;

  const answers = myAnswersRaw.map((a) => ({
    isCorrect: a.isCorrect === true,
    timeMs: typeof a.timeMs === "number" ? a.timeMs : 0,
  }));

  const context: BadgeCheckContext = {
    userId,
    quizScore: myCorrect ?? 0,
    quizTotal: duel.question_count,
    answers,
    isDuel: true,
    duelOpponentId: opponentId ?? undefined,
  };

  return { context };
};

interface DailyProfileRow {
  daily_challenge_date: string | null;
  daily_challenge_score: number | null;
}

// The daily challenge result lives on user_profiles (no dedicated
// results table). We trust daily_challenge_score only when
// daily_challenge_date matches today (UTC). Per-answer data is not
// persisted, so answer-dependent badges (consecutive_correct,
// all_under_time, hard_score_percent, etc.) will not fire from a
// daily challenge — that's the trade for cutting the trust line at
// the server, since the previous client-side path could not be
// believed either.
const loadDailyChallengeContext = async (
  service: ServiceClient,
  userId: string
): Promise<ContextResult> => {
  const { data: profileData } = await service
    .from("user_profiles")
    .select("daily_challenge_date, daily_challenge_score")
    .eq("id", userId)
    .single();
  const profile = profileData as DailyProfileRow | null;

  if (!profile) {
    return { error: "Profile not found", status: 404 };
  }

  const today = new Date().toISOString().split("T")[0];
  if (profile.daily_challenge_date !== today) {
    return { error: "No daily challenge result for today", status: 400 };
  }

  const context: BadgeCheckContext = {
    userId,
    quizScore: profile.daily_challenge_score ?? 0,
    quizTotal: DAILY_CHALLENGE_QUESTION_COUNT,
    answers: [],
  };

  return { context };
};
