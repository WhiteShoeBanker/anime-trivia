// ═══════════════════════════════════════════════════════════════
// Quiz score submission — server-side trust boundary
// (quiz-bug-N fix, Session 4H)
//
// Players POST their answer set here. The server re-derives
// score, correctness per answer, time-taken, and total XP from
// the authoritative answer key (questions.options[].isCorrect).
// quiz_sessions and user_answers rows are inserted server-side
// via the service-role client; user_profiles total_xp / rank are
// updated server-side from the derived XP. RLS for quiz_sessions
// and user_answers no longer permits client INSERT (migration
// 026), and user_profiles.total_xp / rank are protected by the
// extended trigger from migration 019.
//
// Trust boundary: NOTHING from the request body other than
// {animeId, difficulty, answers[{questionId, selectedOption,
// timeMs}]} is read. score, total_questions, correct_answers,
// xp_earned, time_taken_seconds, isDuel, userId, etc. on the
// body are ignored.
//
// Two-client pattern (mirrors gp-bug-5 / submit-score):
//   - createServerClient (SSR/cookie) — auth.getUser AND
//     rpc("submit_quiz") which reads auth.uid() and returns
//     not_authenticated for anonymous callers
//   - createServiceClient — table writes that bypass the new
//     tightened RLS / column trigger
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { calculateQuestionXP } from "@/lib/scoring";
import { deriveRankFromXp } from "@/lib/ranks";
import type { Difficulty } from "@/types";

const MAX_QUESTIONS = 10;
const MAX_PER_ANSWER_MS = 60_000;

const TIME_LIMITS: Record<Difficulty, number> = {
  easy: 30,
  medium: 20,
  hard: 15,
  impossible: 5,
};

const ALLOWED_DIFFICULTIES: ReadonlySet<Difficulty> = new Set([
  "easy",
  "medium",
  "hard",
  "impossible",
]);

interface SubmitAnswer {
  questionId: string;
  selectedOption: number;
  timeMs: number;
}

interface SubmitBody {
  animeId: string;
  difficulty: Difficulty;
  answers: SubmitAnswer[];
}

const isDifficulty = (d: unknown): d is Difficulty =>
  typeof d === "string" && ALLOWED_DIFFICULTIES.has(d as Difficulty);

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
    !isDifficulty(body.difficulty) ||
    !Array.isArray(body.answers) ||
    body.answers.length === 0 ||
    body.answers.length > MAX_QUESTIONS ||
    !body.answers.every(isValidAnswer)
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Daily-cap backstop. submit_quiz() rejects when the gating
  // counter is in an impossible state (count > free limit), the
  // signature of a client that bypassed start_quiz. SECURITY
  // DEFINER + auth.uid() means this MUST be called via the SSR
  // client — service-role has no JWT and would receive
  // not_authenticated.
  const { data: gateData, error: gateError } = await ssr.rpc("submit_quiz");
  if (gateError || !gateData) {
    return NextResponse.json(
      { error: "Rate limit check failed" },
      { status: 502 }
    );
  }
  const gate = gateData as { success: boolean; error_code?: string };
  if (!gate.success) {
    return NextResponse.json(
      {
        error: "Daily limit reached",
        error_code: gate.error_code ?? "rate_limited",
      },
      { status: 429 }
    );
  }

  const service = createServiceClient();

  const submittedIds = body.answers.map((a) => a.questionId);
  const { data: questionsData } = await service
    .from("questions")
    .select("id, options, difficulty, anime_id")
    .in("id", submittedIds);
  const questions = (questionsData ?? []) as QuestionRow[];

  // Every submitted questionId must resolve to a row that
  // matches the claimed anime + difficulty. This rejects
  // cross-anime / cross-difficulty answer salting and missing
  // ids.
  if (questions.length !== submittedIds.length) {
    return NextResponse.json({ error: "Unknown question" }, { status: 400 });
  }
  const correctIndexById = new Map<string, number>();
  for (const q of questions) {
    if (q.anime_id !== body.animeId || q.difficulty !== body.difficulty) {
      return NextResponse.json(
        { error: "Question / anime / difficulty mismatch" },
        { status: 400 }
      );
    }
    correctIndexById.set(
      q.id,
      q.options.findIndex((o) => o.isCorrect)
    );
  }

  // Derive everything that lives on the inserted rows.
  const timeLimitMs = TIME_LIMITS[body.difficulty] * 1000;
  let score = 0;
  let xpEarned = 0;
  let totalTimeMs = 0;
  let streak = 0;
  const derivedAnswers = body.answers.map((a) => {
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
      xpEarned += calculateQuestionXP(
        body.difficulty,
        streak,
        clampedTimeMs,
        timeLimitMs
      );
      streak += 1;
      score += 1;
    } else {
      streak = 0;
    }
    return {
      question_id: a.questionId,
      selected_option: a.selectedOption === -1 ? null : a.selectedOption,
      is_correct: isCorrect,
      time_taken_ms: clampedTimeMs,
    };
  });

  const totalQuestions = body.answers.length;
  const timeTakenSeconds = Math.round(totalTimeMs / 1000);

  const { data: sessionData, error: sessionError } = await service
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      anime_id: body.animeId,
      difficulty: body.difficulty,
      score,
      total_questions: totalQuestions,
      correct_answers: score,
      time_taken_seconds: timeTakenSeconds,
      xp_earned: xpEarned,
    })
    .select()
    .single();
  if (sessionError || !sessionData) {
    return NextResponse.json(
      { error: "Failed to record session" },
      { status: 500 }
    );
  }
  const sessionId = (sessionData as { id: string }).id;

  await service.from("user_answers").insert(
    derivedAnswers.map((a) => ({
      session_id: sessionId,
      ...a,
    }))
  );

  // total_xp / rank are server-managed (migration 026 trigger).
  // last_played_at is not protected — set it here so the
  // existing client-readable timestamp stays accurate.
  const { data: profileData } = await service
    .from("user_profiles")
    .select("total_xp")
    .eq("id", user.id)
    .single();
  const previousXp = (profileData as { total_xp: number } | null)?.total_xp ?? 0;
  const newTotalXp = previousXp + xpEarned;
  const rank = deriveRankFromXp(newTotalXp);
  await service
    .from("user_profiles")
    .update({
      total_xp: newTotalXp,
      rank,
      last_played_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return NextResponse.json({
    sessionId,
    score,
    correctAnswers: score,
    totalQuestions,
    xpEarned,
    timeTakenSeconds,
  });
}
