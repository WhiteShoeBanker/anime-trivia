import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Tests for processLeagueGroups — Session 3 gaps 5, 6, 7.
// All Supabase access is mocked via a per-table responder; no real
// network / DB calls happen here.
// ═══════════════════════════════════════════════════════════════

// ── Mocks ────────────────────────────────────────────────────

const serviceFrom = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
}));

import { processLeagueGroups } from "./route";

// ── Chainable Supabase mock ──────────────────────────────────

type QueryOp = { method: string; args: unknown[] };
type Query = { table: string; ops: QueryOp[] };
type Responder = (q: Query) => { data?: unknown; error?: unknown };

const installSupabase = (responder: Responder) => {
  const queries: Query[] = [];
  serviceFrom.mockImplementation((table: string) => {
    const ops: QueryOp[] = [];
    const query: Query = { table, ops };
    queries.push(query);
    const handler: ProxyHandler<object> = {
      get(_t, prop) {
        if (prop === "then") {
          const result = responder(query);
          return (resolve: (v: { data: unknown; error: unknown }) => void) =>
            resolve({ data: result.data ?? null, error: result.error ?? null });
        }
        return (...args: unknown[]) => {
          ops.push({ method: String(prop), args });
          return new Proxy({}, handler);
        };
      },
    };
    return new Proxy({}, handler);
  });
  return queries;
};

const findCall = (queries: Query[], table: string, method: string) =>
  queries.find(
    (q) => q.table === table && q.ops.some((op) => op.method === method)
  );

const findAllCalls = (queries: Query[], table: string, method: string) =>
  queries.filter(
    (q) => q.table === table && q.ops.some((op) => op.method === method)
  );

// ── Fixtures ─────────────────────────────────────────────────

const makeLeague = (overrides: Partial<{ id: string; tier: number; promotion_slots: number; demotion_slots: number; name: string; group_size: number }> = {}) => ({
  id: "L-silver",
  tier: 2,
  name: "Silver",
  promotion_slots: 10,
  demotion_slots: 10,
  group_size: 30,
  ...overrides,
});

const makeGroup = (league = makeLeague()) => ({
  id: "G-silver-1",
  league_id: league.id,
  week_start: "2026-04-13",
  is_active: true,
  leagues: league,
});

const makeMembers = (count: number, groupId: string, offset = 0) =>
  Array.from({ length: count }, (_, i) => ({
    id: `M-${i + 1 + offset}`,
    user_id: `user-${i + 1 + offset}`,
    group_id: groupId,
    league_id: "L-silver",
    weekly_xp: 1000 - i * 10 + offset * 100,
    unique_anime_count: i < 10 ? 5 : 1, // top 10 meet breadth gate
    joined_at: "2026-04-13T00:00:00Z",
  }));

// Default responder: idle status, one group with 30 members, routine neighbors
const defaultResponder = (opts: {
  members?: ReturnType<typeof makeMembers>;
  league?: ReturnType<typeof makeLeague>;
  statusValue?: unknown;
  activeGroups?: unknown[];
}): Responder => {
  const league = opts.league ?? makeLeague();
  const group = makeGroup(league);
  const members = opts.members ?? makeMembers(30, group.id);
  const activeGroups = opts.activeGroups ?? [group];

  return (q) => {
    const methods = q.ops.map((op) => op.method);
    if (q.table === "admin_config") {
      if (methods.includes("select")) {
        return { data: opts.statusValue === undefined ? null : { value: opts.statusValue } };
      }
      return {}; // upsert
    }
    if (q.table === "league_groups") {
      if (methods.includes("select") && !methods.includes("insert")) {
        // initial activeGroups fetch
        return { data: activeGroups };
      }
      if (methods.includes("insert")) {
        // new-group creation: insert().select().single() → returns { data: newGroup }
        return { data: { id: "G-new-1", league_id: league.id, week_start: "2026-04-20", is_active: true } };
      }
      return {}; // update is_active=false
    }
    if (q.table === "league_memberships") {
      if (methods.includes("select")) {
        return { data: members };
      }
      return {}; // insert memberships
    }
    if (q.table === "leagues") {
      // nextLeague / prevLeague lookups
      const eqCall = q.ops.find((op) => op.method === "eq" && op.args[0] === "tier");
      if (eqCall) {
        const tier = eqCall.args[1] as number;
        if (tier === league.tier + 1) {
          return { data: { id: "L-gold", tier: league.tier + 1, promotion_slots: 10, demotion_slots: 10 } };
        }
        if (tier === league.tier - 1) {
          return { data: { id: "L-bronze", tier: league.tier - 1, promotion_slots: 10, demotion_slots: 0 } };
        }
      }
      return { data: null };
    }
    if (q.table === "league_history") {
      return {}; // insert
    }
    if (q.table === "weekly_anime_plays") {
      return {}; // delete
    }
    return {};
  };
};

// ═══════════════════════════════════════════════════════════════
// Gap 7 — Cron idempotency / double-run guard
// ═══════════════════════════════════════════════════════════════

describe("processLeagueGroups — idempotency / double-run guard (Gap 7)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
  });

  it("returns 409 when status is in_progress and started within the 5-min stale window", async () => {
    const freshInProgress = {
      state: "in_progress",
      started_at: new Date().toISOString(),
    };
    const queries = installSupabase(defaultResponder({ statusValue: freshInProgress }));

    const response = await processLeagueGroups();
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toMatch(/in progress/i);

    // Must NOT have touched league_groups, memberships, or history
    expect(findCall(queries, "league_groups", "select")).toBeUndefined();
    expect(findCall(queries, "league_history", "insert")).toBeUndefined();
  });

  it("proceeds past the lock when in_progress status is older than the 5-min stale threshold", async () => {
    const staleInProgress = {
      state: "in_progress",
      started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    };
    const queries = installSupabase(defaultResponder({ statusValue: staleInProgress, members: [] }));

    const response = await processLeagueGroups();
    expect(response.status).toBe(200);

    // Must have queried league_groups (proceeded)
    expect(findCall(queries, "league_groups", "select")).toBeDefined();
  });

  it("proceeds when no prior status exists (null)", async () => {
    const queries = installSupabase(defaultResponder({ statusValue: undefined, members: [] }));

    const response = await processLeagueGroups();
    expect(response.status).toBe(200);
    expect(findCall(queries, "league_groups", "select")).toBeDefined();
  });

  it("writes status=in_progress at start and status=completed at end", async () => {
    const queries = installSupabase(defaultResponder({ members: [] }));
    await processLeagueGroups();

    const upserts = findAllCalls(queries, "admin_config", "upsert");
    expect(upserts.length).toBeGreaterThanOrEqual(2);

    const upsertPayloads = upserts.map((q) => {
      const up = q.ops.find((op) => op.method === "upsert");
      return up!.args[0] as { key: string; value: { state: string } };
    });

    // First upsert should set in_progress; last should set completed
    expect(upsertPayloads[0].value.state).toBe("in_progress");
    expect(upsertPayloads[upsertPayloads.length - 1].value.state).toBe("completed");
  });

  it("filters the initial league_groups query by is_active=true", async () => {
    const queries = installSupabase(defaultResponder({ members: [] }));
    await processLeagueGroups();

    const selectQuery = findCall(queries, "league_groups", "select");
    expect(selectQuery).toBeDefined();
    const eqCall = selectQuery!.ops.find(
      (op) => op.method === "eq" && op.args[0] === "is_active"
    );
    expect(eqCall).toBeDefined();
    expect(eqCall!.args[1]).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Gap 6 — league_history archival
// ═══════════════════════════════════════════════════════════════

describe("processLeagueGroups — league_history archival (Gap 6)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
  });

  const getHistoryInsertPayloads = (queries: Query[]) =>
    findAllCalls(queries, "league_history", "insert").map((q) => {
      const ins = q.ops.find((op) => op.method === "insert");
      return ins!.args[0] as {
        user_id: string;
        final_rank: number;
        result: string;
        weekly_xp: number;
        unique_anime_count: number;
      };
    });

  it("writes a league_history row with result='promoted' for a top-ranked user meeting the gate", async () => {
    const league = makeLeague(); // Silver, tier 2 → minAnime=2
    const group = makeGroup(league);
    const members = makeMembers(30, group.id);
    const queries = installSupabase(defaultResponder({ league, members, activeGroups: [group] }));

    await processLeagueGroups();

    const payloads = getHistoryInsertPayloads(queries);
    const rank1 = payloads.find((p) => p.final_rank === 1);
    expect(rank1).toBeDefined();
    expect(rank1!.result).toBe("promoted");
    expect(rank1!.user_id).toBe("user-1");
  });

  it("writes a league_history row with result='demoted' for a last-ranked user (Silver+)", async () => {
    const league = makeLeague(); // Silver has demotion_slots=10
    const group = makeGroup(league);
    const members = makeMembers(30, group.id);
    const queries = installSupabase(defaultResponder({ league, members, activeGroups: [group] }));

    await processLeagueGroups();

    const payloads = getHistoryInsertPayloads(queries);
    const last = payloads.find((p) => p.final_rank === 30);
    expect(last).toBeDefined();
    expect(last!.result).toBe("demoted");
  });

  it("writes a league_history row with result='stayed' for a mid-ranked user", async () => {
    const league = makeLeague();
    const group = makeGroup(league);
    const members = makeMembers(30, group.id);
    const queries = installSupabase(defaultResponder({ league, members, activeGroups: [group] }));

    await processLeagueGroups();

    const payloads = getHistoryInsertPayloads(queries);
    const mid = payloads.find((p) => p.final_rank === 15);
    expect(mid).toBeDefined();
    expect(mid!.result).toBe("stayed");
  });

  it("writes a league_history row with result='missed_promotion' when top-N fails the breadth gate", async () => {
    // Silver tier 2 → requires minAnime=2. Put rank-1 user at unique_anime_count=1.
    const league = makeLeague();
    const group = makeGroup(league);
    const members = makeMembers(30, group.id).map((m, i) =>
      i === 0 ? { ...m, unique_anime_count: 1 } : m
    );
    const queries = installSupabase(defaultResponder({ league, members, activeGroups: [group] }));

    await processLeagueGroups();

    const payloads = getHistoryInsertPayloads(queries);
    const rank1 = payloads.find((p) => p.final_rank === 1);
    expect(rank1).toBeDefined();
    expect(rank1!.result).toBe("missed_promotion");
    expect(rank1!.unique_anime_count).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// Gap 5 — weekly_xp + unique_anime_count reset on new group assignment
// ═══════════════════════════════════════════════════════════════

describe("processLeagueGroups — new-week reset (Gap 5)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
  });

  it("creates new league_memberships with weekly_xp=0 and unique_anime_count=0", async () => {
    const league = makeLeague();
    const group = makeGroup(league);
    const members = makeMembers(5, group.id);
    const queries = installSupabase(defaultResponder({ league, members, activeGroups: [group] }));

    await processLeagueGroups();

    const inserts = findAllCalls(queries, "league_memberships", "insert");
    expect(inserts.length).toBeGreaterThan(0);

    const allPayloads = inserts.flatMap((q) => {
      const ins = q.ops.find((op) => op.method === "insert");
      return ins!.args[0] as Array<{
        user_id: string;
        group_id: string;
        league_id: string;
        weekly_xp: number;
        unique_anime_count: number;
      }>;
    });

    expect(allPayloads.length).toBe(5); // one per member
    for (const row of allPayloads) {
      expect(row.weekly_xp).toBe(0);
      expect(row.unique_anime_count).toBe(0);
    }
  });

  it("marks all processed league_groups as is_active=false in a single bulk update", async () => {
    const league = makeLeague();
    const group = makeGroup(league);
    const members = makeMembers(3, group.id);
    const queries = installSupabase(defaultResponder({ league, members, activeGroups: [group] }));

    await processLeagueGroups();

    const updateQuery = findCall(queries, "league_groups", "update");
    expect(updateQuery).toBeDefined();
    const updateOp = updateQuery!.ops.find((op) => op.method === "update");
    expect(updateOp!.args[0]).toEqual({ is_active: false });

    // Scoped to a list of processed group ids (bulk deactivate, league-bug-2)
    const inOp = updateQuery!.ops.find(
      (op) => op.method === "in" && op.args[0] === "id"
    );
    expect(inOp).toBeDefined();
    expect(inOp!.args[1]).toEqual(expect.arrayContaining([group.id]));
  });

  it("defers old-group deactivation until after new memberships are inserted (league-bug-2)", async () => {
    const league = makeLeague();
    const group = makeGroup(league);
    const members = makeMembers(3, group.id);
    const queries = installSupabase(defaultResponder({ league, members, activeGroups: [group] }));

    await processLeagueGroups();

    // Assumes installSupabase captures queries in temporal from() call
    // order — if that ever changes, this test could pass for the wrong
    // reason. Update the helper's contract or this assertion together.
    const firstMembershipsInsertIdx = queries.findIndex(
      (q) =>
        q.table === "league_memberships" &&
        q.ops.some((op) => op.method === "insert")
    );
    const deactivateIdx = queries.findIndex(
      (q) =>
        q.table === "league_groups" &&
        q.ops.some((op) => op.method === "update")
    );

    expect(firstMembershipsInsertIdx).toBeGreaterThan(-1);
    expect(deactivateIdx).toBeGreaterThan(-1);
    expect(deactivateIdx).toBeGreaterThan(firstMembershipsInsertIdx);
  });
});
