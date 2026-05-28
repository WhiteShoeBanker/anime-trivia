"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { trackEvent } from "@/lib/analytics";

// TODO: Supersede with Pro structured pricing config when §20.11
// amendment lands (multi-SKU $4.99/$39.99 + trial + RevenueCat
// entitlements). Single-constant placeholder until then.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- canonical placeholder; actual consumer is overview.ts (estimatedMRR)
const PRO_PRICE = 4.99;

export interface UsersListResult {
  users: {
    id: string;
    username: string | null;
    display_name: string | null;
    email?: string;
    total_xp: number;
    rank: string;
    current_streak: number;
    subscription_tier: string;
    subscription_source: string;
    age_group: string | null;
    is_junior: boolean;
    created_at: string;
    last_played_at: string | null;
  }[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getUsersList(
  page: number = 1,
  search: string = "",
  filter: string = "all"
): Promise<UsersListResult> {
  const supabase = createServiceClient();
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("user_profiles")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `username.ilike.%${search}%,display_name.ilike.%${search}%`
    );
  }

  if (filter === "pro") {
    query = query.eq("subscription_tier", "pro");
  } else if (filter === "junior") {
    query = query.eq("is_junior", true);
  } else if (filter === "churned") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.lt("last_played_at", sevenDaysAgo.toISOString());
  } else if (filter === "teen") {
    query = query.eq("age_group", "teen");
  } else if (filter === "admin_grant") {
    query = query.eq("subscription_source", "admin_grant");
  } else if (filter === "incomplete") {
    query = query.is("age_group", null);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    users: (data ?? []) as UsersListResult["users"],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function upgradeUserToPro(
  userId: string,
  tier: "pro_monthly" | "pro_yearly" | "pro_lifetime",
  adminEmail: string
): Promise<{ success: boolean }> {
  const supabase = createServiceClient();

  const expiresAt = (() => {
    const now = new Date();
    if (tier === "pro_monthly") { now.setMonth(now.getMonth() + 1); return now.toISOString(); }
    if (tier === "pro_yearly") { now.setFullYear(now.getFullYear() + 1); return now.toISOString(); }
    return null;
  })();

  const { error } = await supabase.from("user_profiles").update({
    subscription_tier: "pro",
    subscription_source: "admin_grant",
    pro_expires_at: expiresAt,
  }).eq("id", userId);

  if (error) throw error;

  await supabase.from("admin_audit_log").insert({
    admin_email: adminEmail,
    action: "upgrade_user_to_pro",
    setting_key: userId,
    old_value: { tier: "free" },
    new_value: { tier: "pro", type: tier, expires_at: expiresAt },
  });

  trackEvent("admin_user_upgrade", undefined, {
    admin_email: adminEmail,
    target_user_id: userId,
    tier,
  }).catch(() => {});

  return { success: true };
}

export async function revokeUserPro(
  userId: string,
  adminEmail: string
): Promise<{ success: boolean }> {
  const supabase = createServiceClient();

  const { error } = await supabase.from("user_profiles").update({
    subscription_tier: "free",
    subscription_source: "none",
    pro_expires_at: null,
  }).eq("id", userId);

  if (error) throw error;

  await supabase.from("admin_audit_log").insert({
    admin_email: adminEmail,
    action: "revoke_user_pro",
    setting_key: userId,
    old_value: { tier: "pro" },
    new_value: { tier: "free" },
  });

  return { success: true };
}
