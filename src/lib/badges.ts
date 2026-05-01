import { createClient } from "@/lib/supabase/client";
import type { Badge } from "@/types";

// AbortError is transient noise from Next.js route transitions aborting
// in-flight fetches; the next render will retry. Don't surface it as an
// error or the console fills up on every navigation.
const isAbortError = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const e = err as { name?: string; code?: string; message?: string };
  return (
    e.name === "AbortError" ||
    e.code === "20" ||
    (typeof e.message === "string" && e.message.includes("aborted"))
  );
};

// ── Emblem Management ───────────────────────────────────────

export const setEmblem = async (
  userId: string,
  badgeId: string | null
): Promise<void> => {
  const supabase = createClient();
  await supabase
    .from("user_profiles")
    .update({ emblem_badge_id: badgeId })
    .eq("id", userId);
};

// ── Fetch User Badges ───────────────────────────────────────

export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_badges")
    .select("badge_id, badges (*)")
    .eq("user_id", userId);

  if (error) {
    if (!isAbortError(error)) {
      console.error("[badges] getUserBadges failed:", error);
    }
    return [];
  }
  if (!data) return [];
  return data
    .map((row) => {
      const badges = row.badges;
      if (Array.isArray(badges)) return badges[0] as Badge | undefined;
      return badges as Badge | undefined;
    })
    .filter((b): b is Badge => b !== undefined);
};

export const getAllBadges = async (): Promise<Badge[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("category");
  if (error) {
    if (!isAbortError(error)) {
      console.error("[badges] getAllBadges failed:", error);
    }
    return [];
  }
  return (data as Badge[]) ?? [];
};

export const getUserEmblem = async (
  userId: string
): Promise<Badge | null> => {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("emblem_badge_id")
    .eq("id", userId)
    .single();

  if (!profile?.emblem_badge_id) return null;

  const { data: badge } = await supabase
    .from("badges")
    .select("*")
    .eq("id", profile.emblem_badge_id)
    .single();

  return (badge as Badge) ?? null;
};
