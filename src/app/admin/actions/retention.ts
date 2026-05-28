"use server";

import { createServiceClient } from "@/lib/supabase/service";

export interface RetentionData {
  users: {
    id: string;
    created_at: string;
    last_played_at: string | null;
    current_streak: number;
    total_xp: number;
    username: string | null;
  }[];
  sessions: { user_id: string; completed_at: string }[];
}

export async function getRetentionData(): Promise<RetentionData> {
  const supabase = createServiceClient();

  const [{ data: users }, { data: sessions }] = await Promise.all([
    supabase.from("user_profiles")
      .select("id, created_at, last_played_at, current_streak, total_xp, username")
      .order("created_at"),
    supabase.from("quiz_sessions")
      .select("user_id, completed_at")
      .order("completed_at"),
  ]);

  return {
    users: (users ?? []) as RetentionData["users"],
    sessions: (sessions ?? []) as RetentionData["sessions"],
  };
}
