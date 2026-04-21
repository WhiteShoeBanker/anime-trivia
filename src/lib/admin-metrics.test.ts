import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getIncompleteProfilesCount } from "./admin-metrics";

// Captures the column/value args the helper passes into .is()/.lt() so we
// can assert on the actual query shape, not just the returned count.
interface QueryCapture {
  isArgs?: [string, null];
  ltArgs?: [string, string];
  selectArgs?: [string, { count?: string; head?: boolean }];
}

const buildSupabaseMock = (count: number | null): { supabase: unknown; capture: QueryCapture } => {
  const capture: QueryCapture = {};
  const chain = {
    select: vi.fn((cols: string, opts: { count?: string; head?: boolean }) => {
      capture.selectArgs = [cols, opts];
      return chain;
    }),
    is: vi.fn((col: string, val: null) => {
      capture.isArgs = [col, val];
      return chain;
    }),
    lt: vi.fn(async (col: string, val: string) => {
      capture.ltArgs = [col, val];
      return { count, error: null };
    }),
  };
  const supabase = {
    from: vi.fn((_table: string) => chain),
  };
  return { supabase, capture };
};

// Pin time so `Date.now() - 24h` is deterministic.
const FIXED_NOW = new Date("2026-04-20T12:00:00.000Z").getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getIncompleteProfilesCount", () => {
  it("queries user_profiles where age_group IS NULL and created_at < (now - 24h)", async () => {
    const { supabase, capture } = buildSupabaseMock(3);

    const count = await getIncompleteProfilesCount(
      supabase as Parameters<typeof getIncompleteProfilesCount>[0]
    );

    expect(count).toBe(3);
    expect(capture.isArgs).toEqual(["age_group", null]);
    expect(capture.selectArgs?.[1]).toMatchObject({
      count: "exact",
      head: true,
    });
    const expectedCutoff = new Date(
      FIXED_NOW - 24 * 60 * 60 * 1000
    ).toISOString();
    expect(capture.ltArgs).toEqual(["created_at", expectedCutoff]);
  });

  it("returns 0 when the row set is empty", async () => {
    const { supabase } = buildSupabaseMock(0);
    const count = await getIncompleteProfilesCount(
      supabase as Parameters<typeof getIncompleteProfilesCount>[0]
    );
    expect(count).toBe(0);
  });

  it("treats null count (Supabase 'no result') as 0", async () => {
    const { supabase } = buildSupabaseMock(null);
    const count = await getIncompleteProfilesCount(
      supabase as Parameters<typeof getIncompleteProfilesCount>[0]
    );
    expect(count).toBe(0);
  });

  it("honors a custom hoursOld cutoff (smoke test: 1h)", async () => {
    const { supabase, capture } = buildSupabaseMock(7);
    await getIncompleteProfilesCount(
      supabase as Parameters<typeof getIncompleteProfilesCount>[0],
      1
    );
    const expectedCutoff = new Date(FIXED_NOW - 60 * 60 * 1000).toISOString();
    expect(capture.ltArgs).toEqual(["created_at", expectedCutoff]);
  });

  it("does not match profiles created within the last 24h", async () => {
    // Simulation: DB layer would only return rows where created_at < cutoff.
    // We assert the cutoff is expressed correctly — if it's wrong, the DB
    // would over-count (include fresh signups) or under-count (miss the
    // stuck ones). This test pins the boundary precisely.
    const { capture, supabase } = buildSupabaseMock(0);
    await getIncompleteProfilesCount(
      supabase as Parameters<typeof getIncompleteProfilesCount>[0]
    );
    const cutoffMs = new Date(capture.ltArgs![1]).getTime();
    expect(FIXED_NOW - cutoffMs).toBe(24 * 60 * 60 * 1000);
  });
});
