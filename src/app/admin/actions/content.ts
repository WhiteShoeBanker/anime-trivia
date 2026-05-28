"use server";

import { createServiceClient } from "@/lib/supabase/service";

export interface ContentStats {
  anime: {
    id: string;
    title: string;
    slug: string;
    total_questions: number;
    is_active: boolean;
  }[];
  questions: { id: string; anime_id: string; difficulty: string }[];
  answers: { question_id: string; is_correct: boolean }[];
}

export async function getContentStats(): Promise<ContentStats> {
  const supabase = createServiceClient();

  const [{ data: anime }, { data: questions }, { data: answers }] =
    await Promise.all([
      supabase.from("anime_series")
        .select("id, title, slug, total_questions, is_active").order("title"),
      supabase.from("questions").select("id, anime_id, difficulty"),
      supabase.from("user_answers").select("question_id, is_correct"),
    ]);

  return {
    anime: (anime ?? []) as ContentStats["anime"],
    questions: (questions ?? []) as ContentStats["questions"],
    answers: (answers ?? []) as ContentStats["answers"],
  };
}
