// ─────────────────────────────────────────────────────────────
// TODO(badge-bug-2): Client-side trust boundary
//
// All badge awarding in this module runs in the browser.
// `checkAndAwardBadges` accepts an arbitrary BadgeCheckContext
// (quizScore, quizTotal, isDuel, etc.) and inserts directly
// into `user_badges` via the Supabase browser client. RLS only
// enforces `auth.uid() = user_id` — it does NOT verify that
// the context reflects a real game outcome. A user can call
// this from devtools and self-award any context-driven badge
// (e.g. perfect-duel, hard-perfect, lightning-hard) without
// playing.
//
// Time-based checkers (hour_before / hour_after) additionally
// trust the device clock; OS-clock manipulation works.
//
// Resolution requires moving badge awards to a server-side
// route or Supabase RPC with trusted inputs. Deferred to
// Session 4G.
// ─────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/client";
import { runBadgeChecks } from "@/lib/badges-engine";
import type { Badge, BadgeCheckContext } from "@/types";

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

// ── Main Entry Point ────────────────────────────────────────
//
// Thin wrapper over the engine that performs the client-side
// insert. Will be removed in commit 2 of Session 4G when callers
// migrate to /api/badges/check.

export const checkAndAwardBadges = async (
  context: BadgeCheckContext
): Promise<Badge[]> => {
  const supabase = createClient();
  const newlyEarned = await runBadgeChecks(context, supabase);

  if (newlyEarned.length > 0) {
    const inserts = newlyEarned.map((b) => ({
      user_id: context.userId,
      badge_id: b.id,
    }));
    await supabase.from("user_badges").insert(inserts);
  }

  return newlyEarned;
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
