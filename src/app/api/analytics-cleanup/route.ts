import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { trackEvent } from "@/lib/analytics";

// Vercel Cron: runs daily at 3:00 AM UTC
// Configured in vercel.json

const CRON_SECRET = process.env.CRON_SECRET;
const BATCH_SIZE = 5000;
const RETENTION_DAYS = 90;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffISO = cutoff.toISOString();

  try {
    let totalAggregated = 0;
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
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

    // Log the cleanup event
    await trackEvent("system_cleanup", undefined, {
      total_aggregated: totalAggregated,
      total_deleted: totalDeleted,
      retention_days: RETENTION_DAYS,
      ran_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Analytics cleanup completed",
      totalAggregated,
      totalDeleted,
    });
  } catch (error) {
    console.error("Analytics cleanup failed:", error);
    return NextResponse.json(
      { error: "Analytics cleanup failed" },
      { status: 500 }
    );
  }
}
