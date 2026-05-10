import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Stub the env vars validated at import time by src/lib/env/{client,server}-env.ts
// so tests that transitively import the supabase clients don't crash on
// fail-fast validation. These values must satisfy the validators (https URL,
// JWT-shaped) but never reach a real network.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "eyJtest.anon.key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "eyJtest.service.key";

// Unmount React trees between tests so DOM/queries don't bleed across cases.
// Closes deferred concern from Phase 4 Stage 0 foundation.
afterEach(() => {
  cleanup();
});
