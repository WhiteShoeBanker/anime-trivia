import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { trackEvent } from "@/lib/analytics";

// Vercel Cron: runs daily at 2:00 AM UTC
// Configured in vercel.json

const CRON_SECRET = process.env.CRON_SECRET;
const STATUS_KEY = "duel_expiry_status";
const TIMEOUT_MS = 45_000;
const BATCH_SIZE = 100;
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

interface CronStatus {
  state: "idle" | "in_progress" | "completed" | "failed" | "partial";
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  error?: string;
  stats?: { expired_count: number; elapsed_ms: number };
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

export async function expireDuels() {
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
    stats: { expired_count: 0, elapsed_ms: 0 },
  });

  try {
    let totalExpired = 0;
    let hasMore = true;
    const nowISO = new Date().toISOString();

    while (hasMore) {
      // Timeout check before each batch
      if (Date.now() - startTime > TIMEOUT_MS) {
        await updateStatus(supabase, {
          state: "partial",
          started_at: new Date(startTime).toISOString(),
          stats: {
            expired_count: totalExpired,
            elapsed_ms: Date.now() - startTime,
          },
        });

        trackEvent("duel_expiry", undefined, {
          expired_count: totalExpired,
          elapsed_ms: Date.now() - startTime,
          state: "partial",
        }).catch(() => {});

        return NextResponse.json({
          message: "Duel expiry timed out — partial completion",
          expiredCount: totalExpired,
        });
      }

      // Fetch a batch of expired duels
      const { data: expiredDuels, error: fetchError } = await supabase
        .from("duel_matches")
        .select("id")
        .in("status", ["waiting", "matched"])
        .lt("expires_at", nowISO)
        .limit(BATCH_SIZE);

      if (fetchError) throw fetchError;
      if (!expiredDuels || expiredDuels.length === 0) {
        hasMore = false;
        break;
      }

      const duelIds = expiredDuels.map((d) => d.id);

      const { error: updateError } = await supabase
        .from("duel_matches")
        .update({ status: "expired" })
        .in("id", duelIds);

      if (updateError) throw updateError;

      totalExpired += duelIds.length;

      if (expiredDuels.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    const elapsed = Date.now() - startTime;

    await updateStatus(supabase, {
      state: "completed",
      completed_at: new Date().toISOString(),
      stats: {
        expired_count: totalExpired,
        elapsed_ms: elapsed,
      },
    });

    trackEvent("duel_expiry", undefined, {
      expired_count: totalExpired,
      elapsed_ms: elapsed,
      state: "completed",
    }).catch(() => {});

    return NextResponse.json({
      message: "Expired duels processed",
      expiredCount: totalExpired,
    });
  } catch (error) {
    console.error("Duel expiry processing failed:", error);

    await updateStatus(supabase, {
      state: "failed",
      failed_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      stats: { expired_count: 0, elapsed_ms: Date.now() - startTime },
    });

    return NextResponse.json(
      { error: "Duel expiry processing failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return expireDuels();
}
