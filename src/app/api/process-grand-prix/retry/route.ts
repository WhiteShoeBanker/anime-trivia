import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { processGrandPrix } from "../route";

const CRON_SECRET = process.env.CRON_SECRET;
const STATUS_KEY = "grand_prix_status";

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

  const status = data?.value as {
    state: string;
    remaining_ids?: string[];
  } | null;

  if (!status || (status.state !== "partial" && status.state !== "failed")) {
    return NextResponse.json({ message: "Nothing to retry" });
  }

  // remaining_ids contains phase names (e.g. ["advance_bracket", "cleanup_qualifying"])
  // We figure out which phases to skip by inverting
  const allPhases = ["qualify", "advance_bracket", "cleanup_qualifying"];
  const remainingPhases = (status.remaining_ids ?? []).filter((id) =>
    allPhases.includes(id)
  );
  const skipPhases = allPhases.filter((p) => !remainingPhases.includes(p));

  return processGrandPrix(skipPhases.length > 0 ? skipPhases : undefined);
}
