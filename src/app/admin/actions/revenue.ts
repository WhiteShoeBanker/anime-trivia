"use server";

import { createServiceClient } from "@/lib/supabase/service";

export interface RevenueData {
  proSubscribers: number;
  totalUsers: number;
  waitlistCount: number;
  limitHits: number;
  proBySource: { paid: number; promo_code: number; admin_grant: number };
  promoCodes: {
    id: string;
    code: string;
    type: string;
    max_uses: number;
    current_uses: number;
    expires_at: string | null;
    created_by: string | null;
    created_at: string;
  }[];
  redemptions: {
    id: string;
    user_id: string;
    username: string | null;
    code: string;
    type: string;
    redeemed_at: string;
  }[];
  limitHitsByDay: { date: string; count: number }[];
  shopViews: number;
}

export async function getRevenueData(): Promise<RevenueData> {
  const supabase = createServiceClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: proCount },
    { count: totalCount },
    { count: waitlistCount },
    { count: rawLimitHits },
    { data: proUsers },
    { data: promoCodes },
    { data: limitEvents },
    { count: rawShopViews },
    { data: rollupLimitRows },
    { data: rollupShopRows },
  ] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("subscription_tier", "pro"),
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase.from("star_league_waitlist").select("*", { count: "exact", head: true }),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "quiz_limit_hit"),
    supabase.from("user_profiles").select("subscription_source").eq("subscription_tier", "pro"),
    supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("analytics_events")
      .select("created_at").eq("event_name", "quiz_limit_hit")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "shop_view"),
    supabase.from("analytics_daily_rollup").select("event_count").eq("event_name", "quiz_limit_hit"),
    supabase.from("analytics_daily_rollup").select("event_count").eq("event_name", "shop_view"),
  ]);

  // Combine raw events + rollup for all-time counts (rollup holds data >90 days old)
  const limitHits = (rawLimitHits ?? 0) +
    (rollupLimitRows ?? []).reduce((s: number, r: { event_count: number }) => s + (r.event_count ?? 0), 0);
  const shopViews = (rawShopViews ?? 0) +
    (rollupShopRows ?? []).reduce((s: number, r: { event_count: number }) => s + (r.event_count ?? 0), 0);

  // Pro by source
  const proBySource = { paid: 0, promo_code: 0, admin_grant: 0 };
  for (const u of proUsers ?? []) {
    const src = u.subscription_source as keyof typeof proBySource;
    if (src in proBySource) proBySource[src]++;
    else proBySource.paid++;
  }

  // Limit hits by day
  const limitByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    limitByDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const e of limitEvents ?? []) {
    const day = e.created_at.slice(0, 10);
    if (limitByDay.has(day)) limitByDay.set(day, (limitByDay.get(day) ?? 0) + 1);
  }
  const limitHitsByDay = Array.from(limitByDay.entries()).map(([date, count]) => ({ date, count }));

  // Get redemptions with usernames
  const { data: redemptionsRaw } = await supabase.from("promo_redemptions")
    .select("id, user_id, promo_code_id, redeemed_at")
    .order("redeemed_at", { ascending: false }).limit(50);

  const redemptions: RevenueData["redemptions"] = [];
  if (redemptionsRaw && redemptionsRaw.length > 0) {
    const userIds = [...new Set(redemptionsRaw.map((r) => r.user_id))];
    const codeIds = [...new Set(redemptionsRaw.map((r) => r.promo_code_id))];
    const [{ data: profiles }, { data: codes }] = await Promise.all([
      supabase.from("user_profiles").select("id, username").in("id", userIds),
      supabase.from("promo_codes").select("id, code, type").in("id", codeIds),
    ]);
    const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));
    const codeMap = new Map((codes ?? []).map((c) => [c.id, { code: c.code, type: c.type }]));

    for (const r of redemptionsRaw) {
      const codeInfo = codeMap.get(r.promo_code_id);
      redemptions.push({
        id: r.id,
        user_id: r.user_id,
        username: nameMap.get(r.user_id) ?? null,
        code: codeInfo?.code ?? "?",
        type: codeInfo?.type ?? "?",
        redeemed_at: r.redeemed_at,
      });
    }
  }

  return {
    proSubscribers: proCount ?? 0,
    totalUsers: totalCount ?? 0,
    waitlistCount: waitlistCount ?? 0,
    limitHits,
    proBySource,
    promoCodes: (promoCodes ?? []) as RevenueData["promoCodes"],
    redemptions,
    limitHitsByDay,
    shopViews,
  };
}

export async function generatePromoCode(
  type: "pro_monthly" | "pro_yearly" | "pro_lifetime",
  maxUses: number,
  expiresAt: string | null,
  adminEmail: string
): Promise<{ code: string }> {
  const supabase = createServiceClient();

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const code = `OTAKU-${part()}-${part()}`;

  const { error } = await supabase.from("promo_codes").insert({
    code,
    type,
    max_uses: maxUses,
    current_uses: 0,
    expires_at: expiresAt,
    created_by: adminEmail,
  });

  if (error) throw error;

  await supabase.from("admin_audit_log").insert({
    admin_email: adminEmail,
    action: "generate_promo_code",
    setting_key: code,
    old_value: null,
    new_value: { type, max_uses: maxUses, expires_at: expiresAt },
  });

  return { code };
}
