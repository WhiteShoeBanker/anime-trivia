"use server";

import { createServiceClient } from "@/lib/supabase/service";

export interface EngagementData {
  sessions: {
    user_id: string;
    completed_at: string;
    time_taken_seconds: number | null;
    score: number;
    total_questions: number;
  }[];
  dailyChallengeCount: number;
  duelParticipants: number;
}

export async function getEngagementData(
  days: number = 30
): Promise<EngagementData> {
  const supabase = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [{ data: sessions }, { count: rawDcCount }, { data: duels }, { data: rollupDc }] = await Promise.all([
    supabase.from("quiz_sessions")
      .select("user_id, completed_at, time_taken_seconds, score, total_questions")
      .gte("completed_at", since.toISOString()).order("completed_at"),
    supabase.from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "daily_challenge_completed")
      .gte("created_at", since.toISOString()),
    supabase.from("duel_matches")
      .select("challenger_id, opponent_id")
      .eq("status", "completed")
      .gte("created_at", since.toISOString()),
    supabase.from("analytics_daily_rollup")
      .select("event_count")
      .eq("event_name", "daily_challenge_completed")
      .gte("event_date", since.toISOString().slice(0, 10)),
  ]);

  // Combine raw events + rollup for daily challenge count
  const dailyChallengeCount = (rawDcCount ?? 0) +
    (rollupDc ?? []).reduce((s: number, r: { event_count: number }) => s + (r.event_count ?? 0), 0);

  const duelUsers = new Set<string>();
  for (const d of duels ?? []) {
    if (d.challenger_id) duelUsers.add(d.challenger_id);
    if (d.opponent_id) duelUsers.add(d.opponent_id);
  }

  return {
    sessions: (sessions ?? []) as EngagementData["sessions"],
    dailyChallengeCount,
    duelParticipants: duelUsers.size,
  };
}
