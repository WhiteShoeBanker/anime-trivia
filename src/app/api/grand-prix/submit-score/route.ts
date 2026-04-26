// ═══════════════════════════════════════════════════════════════
// Grand Prix match score submission
//
// Players POST their answer set here. The server re-derives score
// against a trusted answer key (questions.options[].isCorrect) and
// clamps total time to a sane range so totalTimeMs:1 cannot
// short-circuit the tiebreaker.
//
// TODO(gp-bug-6): read-then-write race between near-simultaneous
// submissions. Two POSTs that both read status="pending" before
// either writes will each compute a "_done" transition; the loser
// overwrites the winner's transition and the match can stall in
// player1_done or player2_done until the 48h forfeit cron resolves
// it. Real fix is a conditional UPDATE with status in the WHERE
// clause (or a Postgres function). Deferred to a later session.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const MIN_TIME_PER_QUESTION_MS = 500;
const QUESTIONS_PER_MATCH = 10;
const MIN_TOTAL_TIME_MS = MIN_TIME_PER_QUESTION_MS * QUESTIONS_PER_MATCH;
const MAX_PER_ANSWER_MS = 60_000;

interface SubmitAnswer {
  questionId: string;
  selectedOption: number;
  timeMs: number;
}

interface SubmitBody {
  matchId: string;
  answers: SubmitAnswer[];
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

  if (!body?.matchId || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: match } = await service
    .from("grand_prix_matches")
    .select("*")
    .eq("id", body.matchId)
    .single();

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const isPlayer1 = match.player1_id === user.id;
  const isPlayer2 = match.player2_id === user.id;
  if (!isPlayer1 && !isPlayer2) {
    return NextResponse.json({ error: "Not a player" }, { status: 403 });
  }

  if (
    match.status === "completed" ||
    match.status === "forfeit" ||
    (isPlayer1 && match.status === "player1_done") ||
    (isPlayer2 && match.status === "player2_done")
  ) {
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  }

  const assignedIds: string[] = match.question_ids ?? [];
  if (assignedIds.length !== QUESTIONS_PER_MATCH) {
    return NextResponse.json(
      { error: "Match has no assigned questions" },
      { status: 500 }
    );
  }

  const submittedIds = new Set(body.answers.map((a) => a.questionId));
  if (
    body.answers.length !== QUESTIONS_PER_MATCH ||
    submittedIds.size !== QUESTIONS_PER_MATCH ||
    assignedIds.some((id) => !submittedIds.has(id))
  ) {
    return NextResponse.json(
      { error: "Question set mismatch" },
      { status: 400 }
    );
  }

  const { data: questions } = await service
    .from("questions")
    .select("id, options")
    .in("id", assignedIds);

  const correctIndexById = new Map<string, number>();
  for (const q of questions ?? []) {
    const opts = q.options as { isCorrect: boolean }[];
    correctIndexById.set(q.id, opts.findIndex((o) => o.isCorrect));
  }

  let score = 0;
  for (const a of body.answers) {
    if (correctIndexById.get(a.questionId) === a.selectedOption) score++;
  }

  const clientTotal = body.answers.reduce(
    (sum, a) => sum + Math.max(0, Math.min(a.timeMs ?? 0, MAX_PER_ANSWER_MS)),
    0
  );
  const serverElapsed =
    Date.now() - new Date(match.created_at).getTime();
  const upperBound = Math.max(MIN_TOTAL_TIME_MS, serverElapsed);
  const totalTimeMs = Math.min(
    Math.max(clientTotal, MIN_TOTAL_TIME_MS),
    upperBound
  );

  const update: Record<string, unknown> = {};
  if (isPlayer1) {
    update.player1_score = score;
    update.player1_time_ms = totalTimeMs;
    update.status =
      match.status === "player2_done" ? "completed" : "player1_done";
  } else {
    update.player2_score = score;
    update.player2_time_ms = totalTimeMs;
    update.status =
      match.status === "player1_done" ? "completed" : "player2_done";
  }

  if (update.status === "completed") {
    update.played_at = new Date().toISOString();
    const p1Score = isPlayer1 ? score : match.player1_score;
    const p2Score = isPlayer2 ? score : match.player2_score;
    const p1Time = isPlayer1 ? totalTimeMs : match.player1_time_ms;
    const p2Time = isPlayer2 ? totalTimeMs : match.player2_time_ms;

    if (p1Score !== null && p2Score !== null) {
      if (p1Score > p2Score) {
        update.winner_id = match.player1_id;
      } else if (p2Score > p1Score) {
        update.winner_id = match.player2_id;
      } else if (p1Time !== null && p2Time !== null) {
        update.winner_id =
          p1Time <= p2Time ? match.player1_id : match.player2_id;
      } else {
        update.winner_id = match.player1_id;
      }
    }
  }

  const { data: updated } = await service
    .from("grand_prix_matches")
    .update(update)
    .eq("id", body.matchId)
    .select()
    .single();

  return NextResponse.json({ match: updated });
}
