"use server";

import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics";
import type { AgeGroup } from "@/types";

interface ProfileData {
  birthYear: number;
  ageGroup: AgeGroup;
  parentEmail?: string;
  username?: string;
}

export async function updateProfileAfterSignup(data: ProfileData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  const updateData: Record<string, unknown> = {
    birth_year: data.birthYear,
    age_group: data.ageGroup,
    is_junior: data.ageGroup === "junior",
  };

  if (data.parentEmail) {
    updateData.parent_email = data.parentEmail;
    updateData.parent_consent_at = new Date().toISOString();
  }

  if (data.username) {
    updateData.username = data.username;
    updateData.display_name = data.username;
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  trackEvent("signup", user.id, {
    age_group: data.ageGroup,
    auth_provider: user.app_metadata?.provider ?? "email",
  }).catch(() => {});

  return { success: true };
}
