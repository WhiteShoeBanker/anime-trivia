import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Vercel Cron: runs daily at 2:00 AM UTC
// Configured in vercel.json

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    // Expire stale duels that have passed their expiry time
    const { data: expired, error } = await supabase
      .from("duel_matches")
      .update({ status: "expired" })
      .in("status", ["waiting", "matched"])
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error) throw error;

    return NextResponse.json({
      message: "Expired duels processed",
      expiredCount: expired?.length ?? 0,
    });
  } catch (error) {
    console.error("Duel expiry processing failed:", error);
    return NextResponse.json(
      { error: "Duel expiry processing failed" },
      { status: 500 }
    );
  }
}
