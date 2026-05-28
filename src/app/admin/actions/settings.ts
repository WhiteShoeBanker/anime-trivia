"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { invalidateConfig } from "@/lib/admin-config";
import { trackEvent } from "@/lib/analytics";

export interface AdminSettings {
  configs: {
    key: string;
    value: unknown;
    updated_at: string;
    updated_by: string | null;
  }[];
  auditLog: {
    id: string;
    admin_email: string | null;
    action: string | null;
    setting_key: string | null;
    old_value: unknown;
    new_value: unknown;
    created_at: string;
  }[];
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const supabase = createServiceClient();

  const [{ data: configs }, { data: auditLog }] = await Promise.all([
    supabase.from("admin_config").select("*").order("key"),
    supabase.from("admin_audit_log").select("*")
      .order("created_at", { ascending: false }).limit(50),
  ]);

  return {
    configs: (configs ?? []) as AdminSettings["configs"],
    auditLog: (auditLog ?? []) as AdminSettings["auditLog"],
  };
}

export async function updateAdminSetting(
  key: string,
  value: unknown,
  adminEmail: string
): Promise<{ success: boolean }> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("admin_config").select("value").eq("key", key).single();

  const { error } = await supabase.from("admin_config").upsert({
    key, value,
    updated_at: new Date().toISOString(),
    updated_by: adminEmail,
  });

  if (error) throw error;

  await supabase.from("admin_audit_log").insert({
    admin_email: adminEmail,
    action: "update_config",
    setting_key: key,
    old_value: existing?.value ?? null,
    new_value: value as Record<string, unknown>,
  });

  trackEvent("admin_config_change", undefined, {
    admin_email: adminEmail,
    setting_key: key,
  }).catch(() => {});

  invalidateConfig(key);
  return { success: true };
}
