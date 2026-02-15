import { createServiceClient } from "@/lib/supabase/service";

export const trackEvent = async (
  eventName: string,
  userId?: string,
  data?: Record<string, unknown>
) => {
  try {
    const supabase = createServiceClient();
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      user_id: userId ?? null,
      data: data ?? {},
    });
  } catch {
    // Never throw on analytics failures
  }
};
