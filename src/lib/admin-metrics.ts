import type { createServiceClient } from "@/lib/supabase/service";

type SupabaseLike = ReturnType<typeof createServiceClient>;

/**
 * Count of user_profiles stuck at age_group IS NULL for longer than the
 * given cutoff. After migration 016, new signups land with age_group NULL
 * until they complete the age gate — the expectation is that most finish
 * within minutes. Anything past 24h is an admin-visibility signal: could
 * be a broken age-gate flow, a stalled OAuth callback, or drop-off mid-
 * flow. Feed this into the admin Overview as a KPI + alert.
 */
export const getIncompleteProfilesCount = async (
  supabase: SupabaseLike,
  hoursOld = 24
): Promise<number> => {
  const cutoffISO = new Date(
    Date.now() - hoursOld * 60 * 60 * 1000
  ).toISOString();

  const { count } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .is("age_group", null)
    .lt("created_at", cutoffISO);

  return count ?? 0;
};
