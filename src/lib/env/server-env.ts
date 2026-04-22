// Server-only environment variables, validated at module import time.
//
// IMPORTANT: NEVER import this module from code that runs in the browser
// bundle. SUPABASE_SERVICE_ROLE_KEY bypasses RLS and must never be exposed
// to clients. Import only from:
//   - src/middleware.ts (runs on Vercel Functions)
//   - server-only utilities under src/lib/
//   - app/api route handlers, "use server" actions, server components
//
// Importing this module fail-fast crashes at startup if any required
// server var is missing or malformed.

import {
  parseAdminEmails,
  validateSupabaseJwt,
  type AdminEmailsResult,
} from "./validators";

const READ_IN = "src/lib/env/server-env.ts";

export const SUPABASE_SERVICE_ROLE_KEY = validateSupabaseJwt(
  "SUPABASE_SERVICE_ROLE_KEY",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  READ_IN
);

const adminParsed: AdminEmailsResult = parseAdminEmails(process.env.ADMIN_EMAILS);

// Lowercased, trimmed allowlist. Empty array = admin access disabled.
export const ADMIN_EMAILS: readonly string[] = adminParsed.emails;

// One-shot startup logging. Warns when ADMIN_EMAILS is unset (valid state,
// but operators should know admin routes are 404), and surfaces malformed
// entries that were silently dropped. Guarded so HMR / repeated imports do
// not spam the console.
const globalKey = "__otakuquiz_admin_env_logged__";
type GlobalWithFlag = typeof globalThis & { [k: string]: boolean | undefined };
const g = globalThis as GlobalWithFlag;

if (!g[globalKey]) {
  g[globalKey] = true;
  if (adminParsed.emails.length === 0) {
    console.warn("[env] Admin routes disabled: ADMIN_EMAILS is not set.");
  }
  if (adminParsed.malformed.length > 0) {
    console.warn(
      `[env] ADMIN_EMAILS contained malformed entries (ignored): ${adminParsed.malformed.join(", ")}. Each entry must look like name@example.com.`
    );
  }
}
