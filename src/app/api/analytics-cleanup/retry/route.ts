import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { runAnalyticsCleanup } from "../route";

const CRON_SECRET = process.env.CRON_SECRET;
const STATUS_KEY = "analytics_cleanup_status";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("admin_config")
    .select("value")
    .eq("key", STATUS_KEY)
    .single();

  const status = data?.value as { state: string } | null;

  if (!status || (status.state !== "partial" && status.state !== "failed")) {
    return NextResponse.json({ message: "Nothing to retry" });
  }

  // Analytics cleanup is idempotent — just re-run; it picks up where it left off
  return runAnalyticsCleanup();
}
