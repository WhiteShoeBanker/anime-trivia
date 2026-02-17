import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { trackEvent } from "@/lib/analytics";

// Vercel Cron: runs daily at 3:00 AM UTC
// Configured in vercel.json

const CRON_SECRET = process.env.CRON_SECRET;
const BATCH_SIZE = 5000;
const RETENTION_DAYS = 90;
const STATUS_KEY = "analytics_cleanup_status";
const TIMEOUT_MS = 45_000;
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

interface CronStatus {
  state: "idle" | "in_progress" | "completed" | "failed" | "partial";
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  error?: string;
  stats?: { aggregated: number; deleted: number; elapsed_ms: number };
}

async function updateStatus(
  supabase: ReturnType<typeof createServiceClient>,
  status: CronStatus
) {
  await supabase.from("admin_config").upsert({
    key: STATUS_KEY,
    value: status,
    updated_at: new Date().toISOString(),
  });
}

async function getStatus(
  supabase: ReturnType<typeof createServiceClient>
): Promise<CronStatus | null> {
  const { data } = await supabase
    .from("admin_config")
    .select("value")
    .eq("key", STATUS_KEY)
    .single();
  return (data?.value as CronStatus) ?? null;
}

export async function runAnalyticsCleanup() {
  const supabase = createServiceClient();
  const startTime = Date.now();

  // Double-run guard
  const currentStatus = await getStatus(supabase);
  if (
    currentStatus?.state === "in_progress" &&
    currentStatus.started_at &&
    Date.now() - new Date(currentStatus.started_at).getTime() < STALE_THRESHOLD_MS
  ) {
    return NextResponse.json(
      { error: "Already in progress" },
      { status: 409 }
    );
  }

  await updateStatus(supabase, {
    state: "in_progress",
    started_at: new Date().toISOString(),
    stats: { aggregated: 0, deleted: 0, elapsed_ms: 0 },
  });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffISO = cutoff.toISOString();

  try {
    let totalAggregated = 0;
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      // Timeout check before each batch
      if (Date.now() - startTime > TIMEOUT_MS) {
        await updateStatus(supabase, {
          state: "partial",
          started_at: new Date(startTime).toISOString(),
          stats: {
            aggregated: totalAggregated,
            deleted: totalDeleted,
            elapsed_ms: Date.now() - startTime,
          },
        });

        trackEvent("analytics_cleanup", undefined, {
          total_aggregated: totalAggregated,
          total_deleted: totalDeleted,
          elapsed_ms: Date.now() - startTime,
          state: "partial",
        }).catch(() => {});

        return NextResponse.json({
          message: "Analytics cleanup timed out — partial completion",
          totalAggregated,
          totalDeleted,
        });
      }

      // Fetch a batch of old events
      const { data: oldEvents, error: fetchError } = await supabase
        .from("analytics_events")
        .select("id, event_name, user_id, data, created_at")
        .lt("created_at", cutoffISO)
        .order("created_at", { ascending: true })
        .limit(BATCH_SIZE);

      if (fetchError) throw fetchError;
      if (!oldEvents || oldEvents.length === 0) {
        hasMore = false;
        break;
      }

      // Group events by (date, event_name)
      const groups = new Map<
        string,
        {
          event_date: string;
          event_name: string;
          count: number;
          users: Set<string>;
          data_samples: Record<string, unknown>[];
        }
      >();

      for (const event of oldEvents) {
        const eventDate = event.created_at.slice(0, 10);
        const key = `${eventDate}|${event.event_name}`;

        if (!groups.has(key)) {
          groups.set(key, {
            event_date: eventDate,
            event_name: event.event_name,
            count: 0,
            users: new Set(),
            data_samples: [],
          });
        }

        const group = groups.get(key)!;
        group.count++;
        if (event.user_id) group.users.add(event.user_id);
        if (
          group.data_samples.length < 5 &&
          event.data &&
          Object.keys(event.data as Record<string, unknown>).length > 0
        ) {
          group.data_samples.push(event.data as Record<string, unknown>);
        }
      }

      // Upsert each group into rollup via atomic RPC
      for (const group of groups.values()) {
        const { error: rpcError } = await supabase.rpc("upsert_daily_rollup", {
          p_event_date: group.event_date,
          p_event_name: group.event_name,
          p_event_count: group.count,
          p_unique_users: group.users.size,
          p_data_summary: { samples: group.data_samples },
        });
        if (rpcError) throw rpcError;
      }

      totalAggregated += oldEvents.length;

      // Delete the processed batch
      const eventIds = oldEvents.map((e) => e.id);
      const { error: deleteError } = await supabase
        .from("analytics_events")
        .delete()
        .in("id", eventIds);

      if (deleteError) throw deleteError;
      totalDeleted += eventIds.length;

      if (oldEvents.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    const elapsed = Date.now() - startTime;

    await updateStatus(supabase, {
      state: "completed",
      completed_at: new Date().toISOString(),
      stats: {
        aggregated: totalAggregated,
        deleted: totalDeleted,
        elapsed_ms: elapsed,
      },
    });

    await trackEvent("analytics_cleanup", undefined, {
      total_aggregated: totalAggregated,
      total_deleted: totalDeleted,
      retention_days: RETENTION_DAYS,
      elapsed_ms: elapsed,
      state: "completed",
      ran_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Analytics cleanup completed",
      totalAggregated,
      totalDeleted,
    });
  } catch (error) {
    console.error("Analytics cleanup failed:", error);

    await updateStatus(supabase, {
      state: "failed",
      failed_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      stats: { aggregated: 0, deleted: 0, elapsed_ms: Date.now() - startTime },
    });

    return NextResponse.json(
      { error: "Analytics cleanup failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runAnalyticsCleanup();
}
