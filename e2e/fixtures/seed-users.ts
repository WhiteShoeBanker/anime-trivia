/**
 * Seed/reset Playwright E2E users.
 *
 * Three test accounts cover the three age tiers gating most app behavior.
 * Run via: pnpm tsx e2e/fixtures/seed-users.ts
 *
 * Exports:
 *   - seedUsers()  — create the three users (idempotent; updates existing)
 *   - resetUsers() — reset their user_profiles fields to a known baseline
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local. Service role bypasses
 * RLS, which is necessary to write to auth.users and reset profile fields
 * regardless of which user is authenticated.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// ── Load .env.local ──────────────────────────────────────────────────────────

const envPath = join(__dirname, "..", "..", ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "[seed-users] Missing NEXT_PUBLIC_SUPABASE_URL in .env.local. " +
      "Add it before running seed/reset."
  );
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "[seed-users] Missing SUPABASE_SERVICE_ROLE_KEY in .env.local. " +
      "Add it (Supabase dashboard → Project Settings → API → service_role) " +
      "before running seed/reset. Never commit this key."
  );
}

// ── Test users ───────────────────────────────────────────────────────────────

export const E2E_PASSWORD = "E2ETestPass123!";

type AgeGroup = "junior" | "teen" | "full";

interface SeedUser {
  email: string;
  ageGroup: AgeGroup;
  birthYear: number;
  parentEmail: string | null;
}

const CURRENT_YEAR = new Date().getFullYear();

export const E2E_USERS: readonly SeedUser[] = [
  {
    email: "e2e-junior@otakuquiz.test",
    ageGroup: "junior",
    birthYear: CURRENT_YEAR - 10,
    parentEmail: "e2e-parent@otakuquiz.test",
  },
  {
    email: "e2e-teen@otakuquiz.test",
    ageGroup: "teen",
    birthYear: CURRENT_YEAR - 15,
    parentEmail: null,
  },
  {
    email: "e2e-full@otakuquiz.test",
    ageGroup: "full",
    birthYear: CURRENT_YEAR - 25,
    parentEmail: null,
  },
] as const;

const PROFILE_BASELINE = {
  daily_quiz_count: 0,
  subscription_tier: "free",
  current_streak: 0,
} as const;

// ── Admin client ─────────────────────────────────────────────────────────────

function getAdmin(): SupabaseClient {
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function findUserIdByEmail(
  admin: SupabaseClient,
  email: string
): Promise<string | null> {
  // listUsers paginates; 200 should comfortably cover an E2E project.
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw error;
  const match = data.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  return match?.id ?? null;
}

// ── seedUsers ────────────────────────────────────────────────────────────────

export async function seedUsers(): Promise<void> {
  const admin = getAdmin();

  for (const user of E2E_USERS) {
    let userId = await findUserIdByEmail(admin, user.email);

    if (!userId) {
      // handle_new_user trigger reads age fields from user_metadata and
      // populates user_profiles in the same transaction.
      const { data, error } = await admin.auth.admin.createUser({
        email: user.email,
        password: E2E_PASSWORD,
        email_confirm: true,
        user_metadata: {
          age_group: user.ageGroup,
          birth_year: user.birthYear,
          ...(user.parentEmail ? { parent_email: user.parentEmail } : {}),
        },
      });
      if (error) throw new Error(`createUser ${user.email}: ${error.message}`);
      userId = data.user.id;
      console.log(`[seed-users] created ${user.email} (${userId})`);
    } else {
      // Reset password and re-confirm email so existing accounts always
      // match the known credentials and bypass the verification flow.
      const { error } = await admin.auth.admin.updateUserById(userId, {
        password: E2E_PASSWORD,
        email_confirm: true,
      });
      if (error) throw new Error(`updateUser ${user.email}: ${error.message}`);
      console.log(`[seed-users] refreshed ${user.email} (${userId})`);
    }

    // Force the profile back to a known baseline. The trigger already
    // populated age_group/birth_year on first insert; we re-assert them
    // here in case the trigger was bypassed or overwritten by a prior test.
    const { error: profileError } = await admin
      .from("user_profiles")
      .update({
        ...PROFILE_BASELINE,
        age_group: user.ageGroup,
        birth_year: user.birthYear,
        is_junior: user.ageGroup === "junior",
        parent_email: user.parentEmail,
        parent_consent_at: user.parentEmail ? new Date().toISOString() : null,
      })
      .eq("id", userId);
    if (profileError) {
      throw new Error(
        `update profile ${user.email}: ${profileError.message}`
      );
    }
  }

  console.log(`[seed-users] seeded ${E2E_USERS.length} users`);
}

// ── resetUsers ───────────────────────────────────────────────────────────────

export async function resetUsers(): Promise<void> {
  const admin = getAdmin();

  for (const user of E2E_USERS) {
    const userId = await findUserIdByEmail(admin, user.email);
    if (!userId) {
      throw new Error(
        `[seed-users] resetUsers: ${user.email} not found. ` +
          "Run seedUsers() first."
      );
    }

    const { error } = await admin
      .from("user_profiles")
      .update({
        ...PROFILE_BASELINE,
        age_group: user.ageGroup,
        birth_year: user.birthYear,
        is_junior: user.ageGroup === "junior",
        parent_email: user.parentEmail,
        parent_consent_at: user.parentEmail ? new Date().toISOString() : null,
      })
      .eq("id", userId);
    if (error) {
      throw new Error(`reset profile ${user.email}: ${error.message}`);
    }
  }

  console.log(`[seed-users] reset ${E2E_USERS.length} users`);
}

// ── CLI entrypoint ───────────────────────────────────────────────────────────

if (require.main === module) {
  const command = process.argv[2] ?? "seed";
  const action = command === "reset" ? resetUsers : seedUsers;
  action()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    });
}
