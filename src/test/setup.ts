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

// jsdom does not implement window.matchMedia. Components that consume
// useReducedMotion (which calls matchMedia at mount time) crash in tests
// without a stub. Phase 6c brings useReducedMotion into the transitive
// import chain of more components via <BadgeFoilCard>; polyfill once here
// so individual test files don't have to mock it.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Unmount React trees between tests so DOM/queries don't bleed across cases.
// Closes deferred concern from Phase 4 Stage 0 foundation.
afterEach(() => {
  cleanup();
});
