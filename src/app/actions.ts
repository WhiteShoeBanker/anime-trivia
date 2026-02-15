"use server";

import { trackEvent } from "@/lib/analytics";

export async function trackClientEvent(
  eventName: string,
  userId?: string,
  data?: Record<string, unknown>
) {
  await trackEvent(eventName, userId, data);
}
