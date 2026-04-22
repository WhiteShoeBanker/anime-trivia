// NEXT_PUBLIC_* environment variables, validated at module import time.
// Safe to import from BOTH client and server code (Next.js inlines
// NEXT_PUBLIC_* at build time, so this module evaluates correctly in both
// bundles). Importing this module from anywhere causes a fail-fast crash if
// any required public var is missing or malformed.

import { validateHttpsUrl, validateSupabaseJwt } from "./validators";

const READ_IN = "src/lib/env/client-env.ts";

export const NEXT_PUBLIC_SUPABASE_URL = validateHttpsUrl(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  READ_IN
);

export const NEXT_PUBLIC_SUPABASE_ANON_KEY = validateSupabaseJwt(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  READ_IN
);
