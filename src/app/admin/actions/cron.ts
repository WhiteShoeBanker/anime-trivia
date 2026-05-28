"use server";

import { createServiceClient } from "@/lib/supabase/service";

const CRON_STATUS_KEYS = [
  { name: "League Processing", key: "league_processing_status", retryPath: "/api/process-leagues/retry" },
  { name: "Analytics Cleanup", key: "analytics_cleanup_status", retryPath: "/api/analytics-cleanup/retry" },
  { name: "Grand Prix", key: "grand_prix_status", retryPath: "/api/process-grand-prix/retry" },
  { name: "Duel Expiry", key: "duel_expiry_status", retryPath: "/api/expire-duels/retry" },
] as const;

export interface CronStatusInfo {
  name: string;
  key: string;
  state: "idle" | "in_progress" | "completed" | "failed" | "partial" | "unknown";
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  error?: string;
  stats?: Record<string, unknown>;
}

export async function getCronStatuses(): Promise<CronStatusInfo[]> {
  const supabase = createServiceClient();

  const results = await Promise.all(
    CRON_STATUS_KEYS.map(async ({ name, key }) => {
      const { data } = await supabase
        .from("admin_config")
        .select("value")
        .eq("key", key)
        .single();

      const value = data?.value as Record<string, unknown> | null;

      return {
        name,
        key,
        state: (value?.state as CronStatusInfo["state"]) ?? "unknown",
        started_at: value?.started_at as string | undefined,
        completed_at: value?.completed_at as string | undefined,
        failed_at: value?.failed_at as string | undefined,
        error: value?.error as string | undefined,
        stats: value?.stats as Record<string, unknown> | undefined,
      };
    })
  );

  return results;
}

export async function retryCronJob(
  cronKey: string
): Promise<{ success: boolean; message: string }> {
  const cron = CRON_STATUS_KEYS.find((c) => c.key === cronKey);
  if (!cron) {
    return { success: false, message: "Unknown cron job" };
  }

  const supabase = createServiceClient();

  // Reset status to idle so the retry route (or next scheduled run) can proceed
  await supabase.from("admin_config").upsert({
    key: cronKey,
    value: { state: "idle" },
    updated_at: new Date().toISOString(),
  });

  return { success: true, message: `Reset ${cron.name} status to idle` };
}
