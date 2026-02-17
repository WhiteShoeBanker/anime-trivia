import { createClient } from "@/lib/supabase/client";
import { getFreeQuizLimit } from "@/lib/config-actions";
import type { UserProfile } from "@/types";

interface QuizLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
}

export const checkQuizLimit = async (
  userId: string
): Promise<QuizLimitResult> => {
  const supabase = createClient();
  const limit = await getFreeQuizLimit();

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("subscription_tier, daily_quiz_count, daily_quiz_reset")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return { allowed: false, count: 0, limit };
  }

  const p = profile as Pick<
    UserProfile,
    "subscription_tier" | "daily_quiz_count" | "daily_quiz_reset"
  >;

  // Pro users have unlimited quizzes
  if (p.subscription_tier === "pro") {
    return { allowed: true, count: p.daily_quiz_count, limit: Infinity };
  }

  const today = new Date().toISOString().split("T")[0];
  const resetDate = p.daily_quiz_reset;

  // If the reset date is not today, the count has already been effectively reset
  const currentCount = resetDate === today ? p.daily_quiz_count : 0;

  return {
    allowed: currentCount < limit,
    count: currentCount,
    limit,
  };
};

export const incrementQuizCount = async (userId: string): Promise<void> => {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  // First check if we need to reset the counter
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("daily_quiz_count, daily_quiz_reset")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const p = profile as Pick<UserProfile, "daily_quiz_count" | "daily_quiz_reset">;
  const isNewDay = p.daily_quiz_reset !== today;

  await supabase
    .from("user_profiles")
    .update({
      daily_quiz_count: isNewDay ? 1 : p.daily_quiz_count + 1,
      daily_quiz_reset: today,
    })
    .eq("id", userId);
};
