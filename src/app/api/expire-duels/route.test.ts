import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Coverage for expireDuels — Session 4B HIGH-risk gap 5:
//   - 5-min stale guard (409 vs proceed)
//   - batch query filters (status IN [waiting, matched], expires_at < now)
//   - batch loop terminates when batch size < BATCH_SIZE
//   - state transitions: in_progress → completed → stats
//   - failure path: state=failed on supabase error → 500 response
//
// Out of scope (deferred): 45s mid-batch timeout, retry endpoint.
// ═══════════════════════════════════════════════════════════════

const serviceFrom = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
}));

import { expireDuels } from "./route";
import {
  installSupabaseResponder,
  findCall,
  findAllCalls,
  type Query,
  type Responder,
} from "@/test/supabase-mock";

// ── Responder factory ─────────────────────────────────────────
//
// Builds a stateful responder for admin_config + duel_matches.
// `expiredBatches` is consumed in order on successive duel_matches
// SELECT calls, modeling the route's batch-fetch loop.

interface ResponderOpts {
  statusValue?: unknown;          // undefined → no prior status row
  expiredBatches?: string[][];    // ids per fetched batch
  fetchThrows?: boolean;          // makes duel_matches select error
}

const cronResponder = (opts: ResponderOpts): Responder => {
  let selectCallIndex = 0;
  return (q: Query) => {
    const methods = q.ops.map((op) => op.method);
    if (q.table === "admin_config") {
      if (methods.includes("upsert")) return {};
      if (methods.includes("select")) {
        return opts.statusValue === undefined
          ? { data: null }
          : { data: { value: opts.statusValue } };
      }
    }
    if (q.table === "duel_matches") {
      if (methods.includes("update")) return {};
      if (methods.includes("select")) {
        if (opts.fetchThrows) {
          // Real Error instance so the route's `instanceof Error` check
          // preserves the message in the failed-state status payload.
          return { error: new Error("Supabase fetch failed") };
        }
        const batches = opts.expiredBatches ?? [];
        const batch = batches[selectCallIndex] ?? [];
        selectCallIndex++;
        return { data: batch.map((id) => ({ id })) };
      }
    }
    return { data: null };
  };
};

// ═══════════════════════════════════════════════════════════════
// Gap 5 — Stale guard
// ═══════════════════════════════════════════════════════════════

describe("expireDuels — stale guard", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
  });

  it("C1: returns 409 when status=in_progress and started_at < 5min ago", async () => {
    const freshInProgress = {
      state: "in_progress",
      started_at: new Date().toISOString(),
    };
    const queries = installSupabaseResponder(
      serviceFrom,
      cronResponder({ statusValue: freshInProgress })
    );

    const response = await expireDuels();
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toMatch(/in progress/i);

    // Must not have touched duel_matches at all
    expect(findCall(queries, "duel_matches", "select")).toBeUndefined();
    expect(findCall(queries, "duel_matches", "update")).toBeUndefined();
  });

  it("C2: proceeds when status=in_progress but started_at > 5min ago (stale)", async () => {
    const staleInProgress = {
      state: "in_progress",
      started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    };
    const queries = installSupabaseResponder(
      serviceFrom,
      cronResponder({ statusValue: staleInProgress, expiredBatches: [] })
    );

    const response = await expireDuels();
    expect(response.status).toBe(200);

    // Should have queried duel_matches (proceeded past the lock)
    expect(findCall(queries, "duel_matches", "select")).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// Gap 5 — Query shape and batching
// ═══════════════════════════════════════════════════════════════

describe("expireDuels — query shape and batching", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
  });

  it("C3: filters duel_matches by status IN [waiting, matched] AND expires_at < now", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      cronResponder({ expiredBatches: [] })
    );

    const response = await expireDuels();
    expect(response.status).toBe(200);

    const fetchCall = findCall(queries, "duel_matches", "select");
    expect(fetchCall).toBeDefined();

    const inOp = fetchCall!.ops.find((op) => op.method === "in");
    expect(inOp?.args[0]).toBe("status");
    expect(inOp?.args[1]).toEqual(["waiting", "matched"]);

    const ltOp = fetchCall!.ops.find((op) => op.method === "lt");
    expect(ltOp?.args[0]).toBe("expires_at");
    // Second arg is now ISO — just confirm it's a string with date shape.
    expect(typeof ltOp?.args[1]).toBe("string");
    expect(ltOp!.args[1] as string).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("C4: single batch of 25 expired duels → updates them to status=expired", async () => {
    const ids = Array.from({ length: 25 }, (_, i) => `duel-${i}`);
    const queries = installSupabaseResponder(
      serviceFrom,
      cronResponder({ expiredBatches: [ids] })
    );

    const response = await expireDuels();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.expiredCount).toBe(25);

    const updateCall = findCall(queries, "duel_matches", "update");
    expect(updateCall).toBeDefined();

    const updatePayload = updateCall!.ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(updatePayload.status).toBe("expired");

    const inOp = updateCall!.ops.find((op) => op.method === "in");
    expect(inOp?.args[0]).toBe("id");
    expect(inOp?.args[1]).toEqual(ids);
  });

  it("C5: 250 expired duels arriving in 100/100/50 chunks → 3 update batches, total=250", async () => {
    const batch1 = Array.from({ length: 100 }, (_, i) => `b1-${i}`);
    const batch2 = Array.from({ length: 100 }, (_, i) => `b2-${i}`);
    const batch3 = Array.from({ length: 50 }, (_, i) => `b3-${i}`);

    const queries = installSupabaseResponder(
      serviceFrom,
      cronResponder({ expiredBatches: [batch1, batch2, batch3] })
    );

    const response = await expireDuels();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.expiredCount).toBe(250);

    const updates = findAllCalls(queries, "duel_matches", "update");
    expect(updates).toHaveLength(3);

    const sizes = updates.map(
      (q) => (q.ops.find((op) => op.method === "in")?.args[1] as string[]).length
    );
    expect(sizes).toEqual([100, 100, 50]);
  });
});

// ═══════════════════════════════════════════════════════════════
// Gap 5 — Status transitions and failure path
// ═══════════════════════════════════════════════════════════════

describe("expireDuels — status transitions", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
  });

  it("C6: writes state=in_progress at start, then state=completed with stats at end", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      cronResponder({ expiredBatches: [["d1", "d2", "d3"]] })
    );

    await expireDuels();

    const upserts = findAllCalls(queries, "admin_config", "upsert");
    expect(upserts.length).toBeGreaterThanOrEqual(2);

    const payloads = upserts.map(
      (q) => q.ops.find((op) => op.method === "upsert")!.args[0] as {
        value: { state: string; stats?: { expired_count: number; elapsed_ms: number } };
      }
    );

    const states = payloads.map((p) => p.value.state);
    expect(states).toContain("in_progress");
    expect(states).toContain("completed");

    const completed = payloads.find((p) => p.value.state === "completed")!;
    expect(completed.value.stats?.expired_count).toBe(3);
    expect(typeof completed.value.stats?.elapsed_ms).toBe("number");
  });

  it("C7: supabase fetch error → state=failed with error message, response 500", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      cronResponder({ fetchThrows: true })
    );

    const response = await expireDuels();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toMatch(/failed/i);

    const upserts = findAllCalls(queries, "admin_config", "upsert");
    const failedPayload = upserts
      .map((q) => q.ops.find((op) => op.method === "upsert")!.args[0] as {
        value: { state: string; error?: string };
      })
      .find((p) => p.value.state === "failed");

    expect(failedPayload).toBeDefined();
    expect(failedPayload!.value.error).toBe("Supabase fetch failed");
  });
});
