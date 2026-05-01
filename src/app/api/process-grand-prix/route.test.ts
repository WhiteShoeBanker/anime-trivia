import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Tests for processGrandPrix — Session 4C, Gaps 1-5 from audit.
// All Supabase access is mocked via the shared per-table responder
// helper. No real network / DB calls.
//
// Gaps covered:
//   1. Concurrent advance_bracket race / double-run guard
//   2. Champion League qualification (top-16 by XP-sum + bye fill)
//   3. Bye auto-completion + propagation (gp-bug-2 documented)
//   4. Tournament-completion detection (incl. gp-bug-2 × Gap 4
//      permanent stuck state)
//   5. Timeout mid-phase + remaining_ids contract for retry route
// ═══════════════════════════════════════════════════════════════

const serviceFrom = vi.fn();

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
}));

import { processGrandPrix } from "./route";
import {
  installSupabaseResponder,
  findCall,
  findAllCalls,
  type Responder,
  type Query,
} from "@/test/supabase-mock";

// ── Fixtures ─────────────────────────────────────────────────

interface ResponderOpts {
  status?: { state: string; started_at?: string } | null;
  existingTournament?: { id: string } | null;
  championLeague?: { id: string } | null;
  championMembers?: Array<{ user_id: string }>;
  xpData?: Array<{ user_id: string; xp_earned: number }>;
  profiles?: Array<{ id: string; display_name?: string; username?: string }>;
  newTournamentId?: string;
  allAnime?: Array<{ id: string }>;
  questions?: Array<{ id: string }>;
  qualifierBadge?: { id: string } | null;
  winnerBadge?: { id: string } | null;
  tripleCrownBadge?: { id: string } | null;
  activeTournaments?: Array<{ id: string }>;
  expiredMatches?: Array<{
    id: string;
    status: string;
    player1_id?: string | null;
    player2_id?: string | null;
  }>;
  allMatches?: Array<{
    round: number;
    match_number: number;
    status: string;
    winner_id: string | null;
    player1_id: string | null;
    player2_id: string | null;
  }>;
  emblem?: { id: string } | null;
  winCount?: number;
  qualifyingTournaments?: Array<{ id: string; month_start: string }>;
  // Hook fired at the start of every responder invocation; lets a
  // test mutate Date.now() partway through processGrandPrix.
  beforeQuery?: (q: Query) => void;
}

const defaultResponder = (opts: ResponderOpts = {}): Responder => (q) => {
  opts.beforeQuery?.(q);

  const methods = q.ops.map((op) => op.method);
  const isInsert = methods.includes("insert");
  const isUpdate = methods.includes("update");
  const isUpsert = methods.includes("upsert");

  if (q.table === "admin_config") {
    if (methods.includes("select")) {
      return opts.status === undefined
        ? { data: null }
        : opts.status === null
          ? { data: null }
          : { data: { value: opts.status } };
    }
    return {}; // upsert no-op
  }

  if (q.table === "grand_prix_tournaments") {
    // Count query for triple-crown
    const isCountQuery = q.ops.some(
      (op) =>
        op.method === "select" &&
        typeof op.args[1] === "object" &&
        op.args[1] !== null &&
        (op.args[1] as Record<string, unknown>).count === "exact"
    );
    if (isCountQuery) {
      return { data: null, count: opts.winCount ?? 1 };
    }

    if (isInsert) {
      return { data: { id: opts.newTournamentId ?? "T-new" } };
    }

    if (isUpdate) return {};

    const eqStatusInProgress = q.ops.some(
      (op) =>
        op.method === "eq" &&
        op.args[0] === "status" &&
        op.args[1] === "in_progress"
    );
    const eqStatusQualifying = q.ops.some(
      (op) =>
        op.method === "eq" &&
        op.args[0] === "status" &&
        op.args[1] === "qualifying"
    );
    const eqMonthStart = q.ops.some(
      (op) => op.method === "eq" && op.args[0] === "month_start"
    );

    if (eqStatusInProgress) return { data: opts.activeTournaments ?? [] };
    if (eqStatusQualifying) return { data: opts.qualifyingTournaments ?? [] };
    if (eqMonthStart)
      return opts.existingTournament === undefined
        ? { data: null }
        : { data: opts.existingTournament };
    return { data: null };
  }

  if (q.table === "leagues") {
    return opts.championLeague === undefined
      ? { data: { id: "L-champ" } }
      : { data: opts.championLeague };
  }

  if (q.table === "league_memberships") {
    return { data: opts.championMembers ?? [] };
  }

  if (q.table === "quiz_sessions") {
    return { data: opts.xpData ?? [] };
  }

  if (q.table === "user_profiles") {
    return { data: opts.profiles ?? [] };
  }

  if (q.table === "anime_series") {
    return { data: opts.allAnime ?? [{ id: "anime-1" }] };
  }

  if (q.table === "questions") {
    // pickQuestionIds needs >= 10
    return {
      data:
        opts.questions ??
        Array.from({ length: 12 }, (_, i) => ({ id: `q-${i + 1}` })),
    };
  }

  if (q.table === "grand_prix_matches") {
    if (isInsert) return {};
    if (isUpdate) return {};
    // SELECT with .in("status", [...]) → expired matches
    const isExpiredQuery = q.ops.some(
      (op) => op.method === "in" && op.args[0] === "status"
    );
    if (isExpiredQuery) return { data: opts.expiredMatches ?? [] };
    return { data: opts.allMatches ?? [] };
  }

  if (q.table === "grand_prix_emblems") {
    if (isInsert) return {};
    return opts.emblem === undefined
      ? { data: { id: "E-1" } }
      : { data: opts.emblem };
  }

  if (q.table === "badges") {
    const eqSlug = q.ops.find(
      (op) => op.method === "eq" && op.args[0] === "slug"
    );
    if (eqSlug) {
      const slug = eqSlug.args[1] as string;
      if (slug === "gp-qualifier")
        return opts.qualifierBadge === undefined
          ? { data: { id: "B-qualifier" } }
          : { data: opts.qualifierBadge };
      if (slug === "gp-winner")
        return opts.winnerBadge === undefined
          ? { data: { id: "B-winner" } }
          : { data: opts.winnerBadge };
      if (slug === "gp-3-wins")
        return opts.tripleCrownBadge === undefined
          ? { data: { id: "B-triple" } }
          : { data: opts.tripleCrownBadge };
    }
    return { data: null };
  }

  if (q.table === "user_badges" || q.table === "user_emblems") {
    if (isUpsert) return {};
    return { data: null };
  }

  return { data: null };
};

const makeMembers = (count: number, prefix = "u") =>
  Array.from({ length: count }, (_, i) => ({ user_id: `${prefix}-${i + 1}` }));

const makeXpDataFromMembers = (
  members: Array<{ user_id: string }>,
  startXp = 5000,
  step = 100
) =>
  members.map((m, i) => ({
    user_id: m.user_id,
    xp_earned: startXp - i * step,
  }));

const findInsertPayloads = (queries: Query[], table: string) =>
  queries
    .filter(
      (q) => q.table === table && q.ops.some((op) => op.method === "insert")
    )
    .map((q) => {
      const op = q.ops.find((o) => o.method === "insert");
      return op?.args[0] as Record<string, unknown> | undefined;
    })
    .filter((p): p is Record<string, unknown> => p !== undefined);

const findUpsertPayloads = (queries: Query[], table: string) =>
  queries
    .filter(
      (q) => q.table === table && q.ops.some((op) => op.method === "upsert")
    )
    .map((q) => {
      const op = q.ops.find((o) => o.method === "upsert");
      return op?.args[0] as Record<string, unknown> | undefined;
    })
    .filter((p): p is Record<string, unknown> => p !== undefined);

const findUpdatePayloads = (queries: Query[], table: string) =>
  queries
    .filter(
      (q) => q.table === table && q.ops.some((op) => op.method === "update")
    )
    .map((q) => {
      const op = q.ops.find((o) => o.method === "update");
      return op?.args[0] as Record<string, unknown> | undefined;
    })
    .filter((p): p is Record<string, unknown> => p !== undefined);

const findStatusUpserts = (queries: Query[]) =>
  findUpsertPayloads(queries, "admin_config").map(
    (p) => p.value as { state: string; remaining_ids?: string[] }
  );

// ── Tests ────────────────────────────────────────────────────

describe("processGrandPrix — double-run guard (Gap 1)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
  });

  it("returns 409 when status is in_progress within the 5-min stale window", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        status: {
          state: "in_progress",
          started_at: new Date(Date.now() - 60 * 1000).toISOString(),
        },
      })
    );

    const res = await processGrandPrix();
    expect(res.status).toBe(409);
    // Must not have reached Phase 1 / 2 / 3
    expect(findCall(queries, "leagues", "select")).toBeUndefined();
    expect(findCall(queries, "grand_prix_tournaments", "select")).toBeUndefined();
  });

  it("proceeds past the lock when in_progress is older than the 5-min stale threshold", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        status: {
          state: "in_progress",
          started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      })
    );

    const res = await processGrandPrix();
    expect(res.status).toBe(200);
    // Phase 2 ran (status=in_progress query happened)
    expect(findCall(queries, "grand_prix_tournaments", "eq")).toBeDefined();
  });
});

describe("processGrandPrix — Phase 1 happy path (Gap 1, Gap 2)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs Phase 1 end-to-end on UTC date 1 with 16 qualifiers", async () => {
    const members = makeMembers(16);
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: makeXpDataFromMembers(members),
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );

    const res = await processGrandPrix();
    expect(res.status).toBe(200);

    // 1 tournament insert
    const tournamentInserts = findInsertPayloads(queries, "grand_prix_tournaments");
    expect(tournamentInserts).toHaveLength(1);

    // 8 R1 match inserts
    expect(findInsertPayloads(queries, "grand_prix_matches")).toHaveLength(8);

    // 1 emblem insert
    expect(findInsertPayloads(queries, "grand_prix_emblems")).toHaveLength(1);

    // qualifier badge upserted with 16 user IDs
    const badgeUpserts = findUpsertPayloads(queries, "user_badges");
    expect(badgeUpserts).toHaveLength(1);
    expect(Array.isArray(badgeUpserts[0])).toBe(true);
    expect((badgeUpserts[0] as unknown as unknown[])).toHaveLength(16);
  });
});

describe("processGrandPrix — qualification logic (Gap 2)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("seeds top 16 by XP-sum descending; the 4 lowest are dropped", async () => {
    const members = makeMembers(20);
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: makeXpDataFromMembers(members), // u-1 highest, u-20 lowest
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );

    await processGrandPrix();

    const tInsert = findInsertPayloads(queries, "grand_prix_tournaments")[0];
    const seeds = (
      tInsert.bracket_data as { seeds: Array<{ userId: string }> }
    ).seeds;
    expect(seeds.map((s) => s.userId)).toEqual(
      members.slice(0, 16).map((m) => m.user_id)
    );
    // Bottom 4 not present
    for (const dropped of ["u-17", "u-18", "u-19", "u-20"]) {
      expect(seeds.find((s) => s.userId === dropped)).toBeUndefined();
    }
  });

  it("with 9 qualifiers fills 7 byes; R1 has 1 real-vs-real match and 7 auto-completed bye matches", async () => {
    const members = makeMembers(9);
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: makeXpDataFromMembers(members),
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );

    await processGrandPrix();

    const tInsert = findInsertPayloads(queries, "grand_prix_tournaments")[0];
    const seeds = (
      tInsert.bracket_data as { seeds: Array<{ userId: string }> }
    ).seeds;
    expect(seeds.slice(0, 9).map((s) => s.userId)).toEqual(
      members.map((m) => m.user_id)
    );
    expect(seeds.slice(9, 16).every((s) => s.userId === "bye")).toBe(true);

    const matchInserts = findInsertPayloads(queries, "grand_prix_matches");
    expect(matchInserts).toHaveLength(8);
    const completedCount = matchInserts.filter(
      (p) => p.status === "completed"
    ).length;
    const pendingCount = matchInserts.filter(
      (p) => p.status === "pending"
    ).length;
    expect(completedCount).toBe(7);
    expect(pendingCount).toBe(1);
    // The pending match is m=8 (seed 8 vs seed 9)
    const pending = matchInserts.find((p) => p.status === "pending");
    expect(pending?.player1_id).toBe("u-8");
    expect(pending?.player2_id).toBe("u-9");
  });

  it("tied XP-sum tiebreak is non-deterministic — xpData row order controls seeds[15]", async () => {
    // 17 members, lowest 2 tied at 100 xp.
    const members = makeMembers(17);
    const baseXp = makeXpDataFromMembers(members.slice(0, 15)); // u-1..u-15 distinct

    // Variant A: u-16 listed before u-17
    const xpDataA = [
      ...baseXp,
      { user_id: "u-16", xp_earned: 100 },
      { user_id: "u-17", xp_earned: 100 },
    ];
    const queriesA = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: xpDataA,
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );
    await processGrandPrix();
    const seedsA = (
      findInsertPayloads(queriesA, "grand_prix_tournaments")[0].bracket_data as {
        seeds: Array<{ userId: string }>;
      }
    ).seeds;
    expect(seedsA[15].userId).toBe("u-16");

    // Variant B: swap row order — u-17 first now
    serviceFrom.mockReset();
    const xpDataB = [
      ...baseXp,
      { user_id: "u-17", xp_earned: 100 },
      { user_id: "u-16", xp_earned: 100 },
    ];
    const queriesB = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: xpDataB,
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );
    await processGrandPrix();
    const seedsB = (
      findInsertPayloads(queriesB, "grand_prix_tournaments")[0].bracket_data as {
        seeds: Array<{ userId: string }>;
      }
    ).seeds;
    expect(seedsB[15].userId).toBe("u-17");
  });

  it("outer gate — 0 Champion members blocks before xpData query", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: [],
      })
    );

    const res = await processGrandPrix();
    expect(res.status).toBe(200);
    // No xp query, no tournament insert
    expect(findCall(queries, "quiz_sessions", "select")).toBeUndefined();
    expect(findInsertPayloads(queries, "grand_prix_tournaments")).toHaveLength(0);
  });

  it("inner gate — ranked.length < 2 blocks even when championMembers >= 2", async () => {
    // 3 champion members, but only 1 has any quiz_sessions XP data
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: makeMembers(3),
        xpData: [{ user_id: "u-1", xp_earned: 500 }],
      })
    );

    const res = await processGrandPrix();
    expect(res.status).toBe(200);
    // Did query xpData (outer gate passed)
    expect(findCall(queries, "quiz_sessions", "select")).toBeDefined();
    // But no tournament created
    expect(findInsertPayloads(queries, "grand_prix_tournaments")).toHaveLength(0);
  });

  it("idempotent — existing tournament for monthStart is not re-created", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        existingTournament: { id: "T-existing" },
        championMembers: makeMembers(16),
      })
    );

    await processGrandPrix();
    expect(findInsertPayloads(queries, "grand_prix_tournaments")).toHaveLength(0);
    expect(findInsertPayloads(queries, "grand_prix_matches")).toHaveLength(0);
  });
});

describe("processGrandPrix — UTC date gate (Gap 2)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("on UTC date != 1 the qualification phase is skipped; advance_bracket still runs", async () => {
    const queries = installSupabaseResponder(serviceFrom, defaultResponder());

    const res = await processGrandPrix();
    expect(res.status).toBe(200);
    // No leagues lookup (Phase 1 skipped)
    expect(findCall(queries, "leagues", "select")).toBeUndefined();
    // But Phase 2 ran (active-tournaments query)
    const eqStatusInProgress = findAllCalls(
      queries,
      "grand_prix_tournaments",
      "eq"
    ).some((q) =>
      q.ops.some(
        (op) =>
          op.method === "eq" &&
          op.args[0] === "status" &&
          op.args[1] === "in_progress"
      )
    );
    expect(eqStatusInProgress).toBe(true);
  });
});

describe("processGrandPrix — bye propagation (Gap 3, gp-bug-2)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("2 qualifiers produces a 2-player bracket: 1 R1 final, zero bye padding (gp-bug-2 fix)", async () => {
    const members = makeMembers(2);
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: makeXpDataFromMembers(members),
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );

    await processGrandPrix();

    const matchInserts = findInsertPayloads(queries, "grand_prix_matches");
    expect(matchInserts).toHaveLength(1);

    const finalMatch = matchInserts[0];
    expect(finalMatch.round).toBe(1);
    expect(finalMatch.status).toBe("pending");
    expect(finalMatch.player1_id).toBe("u-1");
    expect(finalMatch.player2_id).toBe("u-2");
    expect(finalMatch.winner_id).toBe(null);

    // bracket_data records this as a 1-round bracket with label "Final"
    const tInsert = findInsertPayloads(queries, "grand_prix_tournaments")[0];
    const bracketData = tInsert.bracket_data as {
      rounds: Array<{ round: number; label: string }>;
    };
    expect(bracketData.rounds).toHaveLength(1);
    expect(bracketData.rounds[0].label).toBe("Final");
  });

  it("R2 insert with one feeder winner=null produces a pending match with player2_id=null", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        activeTournaments: [{ id: "T-1" }],
        allMatches: [
          {
            round: 1,
            match_number: 1,
            status: "completed",
            winner_id: "u-A",
            player1_id: "u-A",
            player2_id: null,
          },
          {
            round: 1,
            match_number: 2,
            status: "completed",
            winner_id: null,
            player1_id: null,
            player2_id: null,
          },
        ],
      })
    );

    await processGrandPrix(["qualify"]);

    const r2Inserts = findInsertPayloads(queries, "grand_prix_matches").filter(
      (p) => p.round === 2
    );
    expect(r2Inserts).toHaveLength(1);
    expect(r2Inserts[0].player1_id).toBe("u-A");
    expect(r2Inserts[0].player2_id).toBe(null);
    expect(r2Inserts[0].status).toBe("pending");
  });
});

describe("processGrandPrix — tournament completion (Gap 4)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("R4 with real winner transitions tournament to completed, upserts emblem and gp-winner badge", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        activeTournaments: [{ id: "T-1" }],
        allMatches: [
          {
            round: 4,
            match_number: 1,
            status: "completed",
            winner_id: "u-X",
            player1_id: "u-X",
            player2_id: "u-Y",
          },
        ],
        winCount: 1,
      })
    );

    await processGrandPrix(["qualify"]);

    const tournamentUpdates = findUpdatePayloads(
      queries,
      "grand_prix_tournaments"
    );
    expect(
      tournamentUpdates.some(
        (p) => p.status === "completed" && p.winner_id === "u-X"
      )
    ).toBe(true);

    const emblemUpserts = findUpsertPayloads(queries, "user_emblems");
    expect(
      emblemUpserts.some(
        (p) => (p as Record<string, unknown>).user_id === "u-X"
      )
    ).toBe(true);

    const badgeUpserts = findUpsertPayloads(queries, "user_badges");
    expect(
      badgeUpserts.some(
        (p) =>
          (p as Record<string, unknown>).user_id === "u-X" &&
          (p as Record<string, unknown>).badge_id === "B-winner"
      )
    ).toBe(true);
  });

  it("gp-bug-2 invariant: with 2 qualifiers, no R1 match is inserted with both player IDs null (variable bracket size eliminates the bye-vs-bye precondition for the stuck-state)", async () => {
    // Override outer beforeEach (date 15) to enter Phase 1 (qualification).
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    const members = makeMembers(2);
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: makeXpDataFromMembers(members),
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );

    await processGrandPrix();

    const matchInserts = findInsertPayloads(queries, "grand_prix_matches");
    const byeVsBye = matchInserts.filter(
      (p) => p.player1_id === null && p.player2_id === null
    );
    expect(byeVsBye).toHaveLength(0);
  });

  it("triple-crown — winCount >= 3 also upserts gp-3-wins badge", async () => {
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        activeTournaments: [{ id: "T-1" }],
        allMatches: [
          {
            round: 4,
            match_number: 1,
            status: "completed",
            winner_id: "u-X",
            player1_id: "u-X",
            player2_id: "u-Y",
          },
        ],
        winCount: 3,
      })
    );

    await processGrandPrix(["qualify"]);

    const badgeUpserts = findUpsertPayloads(queries, "user_badges");
    expect(
      badgeUpserts.some(
        (p) => (p as Record<string, unknown>).badge_id === "B-winner"
      )
    ).toBe(true);
    expect(
      badgeUpserts.some(
        (p) => (p as Record<string, unknown>).badge_id === "B-triple"
      )
    ).toBe(true);
  });
});

describe("processGrandPrix — UNIQUE-violation mitigation (Gap 1, gp-bug-1)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("R2 insert errors don't crash the cron — tournamentsProcessed still increments", async () => {
    // Custom responder: grand_prix_matches insert returns an error
    const opts: ResponderOpts = {
      activeTournaments: [{ id: "T-1" }],
      allMatches: [
        {
          round: 1,
          match_number: 1,
          status: "completed",
          winner_id: "u-A",
          player1_id: "u-A",
          player2_id: "u-B",
        },
        {
          round: 1,
          match_number: 2,
          status: "completed",
          winner_id: "u-C",
          player1_id: "u-C",
          player2_id: "u-D",
        },
      ],
    };
    const baseResponder = defaultResponder(opts);
    const errorResponder: Responder = (q) => {
      if (
        q.table === "grand_prix_matches" &&
        q.ops.some((op) => op.method === "insert")
      ) {
        return { error: { code: "23505", message: "duplicate key" } };
      }
      return baseResponder(q);
    };
    installSupabaseResponder(serviceFrom, errorResponder);

    const res = await processGrandPrix(["qualify"]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tournamentsProcessed).toBe(1);
  });
});

describe("processGrandPrix — timeout / partial state (Gap 5)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Phase 1 elapsed > 45s returns partial; cleanup_qualifying is not queried", async () => {
    const members = makeMembers(16);
    let advanced = false;

    const baseResponder = defaultResponder({
      championMembers: members,
      xpData: makeXpDataFromMembers(members),
      profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
    });

    const responder: Responder = (q) => {
      // After Phase 1's last write (qualifier badge upsert), jump 50s forward
      if (
        !advanced &&
        q.table === "user_badges" &&
        q.ops.some((op) => op.method === "upsert")
      ) {
        advanced = true;
        const result = baseResponder(q);
        vi.setSystemTime(Date.now() + 50_000);
        return result;
      }
      return baseResponder(q);
    };

    const queries = installSupabaseResponder(serviceFrom, responder);

    const res = await processGrandPrix();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/timed out after qualification phase/i);

    // status partial written
    const statusUpserts = findStatusUpserts(queries);
    const partial = statusUpserts.find((s) => s.state === "partial");
    expect(partial).toBeDefined();
    expect(partial?.remaining_ids).toEqual([
      "advance_bracket",
      "cleanup_qualifying",
    ]);

    // cleanup phase didn't run — no select on grand_prix_tournaments with status=qualifying
    const qualifyingQuery = findAllCalls(
      queries,
      "grand_prix_tournaments",
      "eq"
    ).some((q) =>
      q.ops.some(
        (op) =>
          op.method === "eq" &&
          op.args[0] === "status" &&
          op.args[1] === "qualifying"
      )
    );
    expect(qualifyingQuery).toBe(false);
  });

  it("Phase 2 mid-loop timeout writes state=partial with phase names in remaining_ids", async () => {
    let advanced = false;
    const opts: ResponderOpts = {
      activeTournaments: [{ id: "T-1" }, { id: "T-2" }],
      allMatches: [
        // Final completed → triggers tournament-completion path for T-1
        {
          round: 4,
          match_number: 1,
          status: "completed",
          winner_id: "u-X",
          player1_id: "u-X",
          player2_id: "u-Y",
        },
      ],
      winCount: 1,
    };
    const baseResponder = defaultResponder(opts);
    const responder: Responder = (q) => {
      // After T-1 finishes (winner badge upserted), jump 50s forward so
      // T-2's per-tournament timeout check fires.
      if (
        !advanced &&
        q.table === "user_badges" &&
        q.ops.some((op) => op.method === "upsert")
      ) {
        advanced = true;
        const result = baseResponder(q);
        vi.setSystemTime(Date.now() + 50_000);
        return result;
      }
      return baseResponder(q);
    };
    const queries = installSupabaseResponder(serviceFrom, responder);

    const res = await processGrandPrix(["qualify"]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/timed out during bracket advancement/i);

    const statusUpserts = findStatusUpserts(queries);
    const partial = statusUpserts.find((s) => s.state === "partial");
    expect(partial).toBeDefined();
    // Phase names must lead the array (the retry route filters tournament IDs out)
    expect(partial?.remaining_ids?.[0]).toBe("advance_bracket");
    expect(partial?.remaining_ids).toContain("cleanup_qualifying");
  });
});

// ═══════════════════════════════════════════════════════════════
// Variable bracket size (gp-bug-2 fix). The bracket size is now
// next-power-of-2 of the qualifier count, capped at 16. So 8
// qualifiers produce an 8-player bracket (NOT a 16-player bracket
// padded with 8 byes), which eliminates the bye-vs-bye R1 cascade
// that would otherwise stall the tournament in_progress forever.
// ═══════════════════════════════════════════════════════════════

describe("processGrandPrix — variable bracket size (gp-bug-2 fix)", () => {
  beforeEach(() => {
    serviceFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("8 qualifiers produces an 8-player bracket (NOT a 16-player bracket with 8 byes)", async () => {
    const members = makeMembers(8);
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: makeXpDataFromMembers(members),
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );

    await processGrandPrix();

    const matchInserts = findInsertPayloads(queries, "grand_prix_matches");
    expect(matchInserts).toHaveLength(4);
    for (const match of matchInserts) {
      expect(match.player1_id).not.toBe(null);
      expect(match.player2_id).not.toBe(null);
      expect(match.status).toBe("pending");
    }

    const tInsert = findInsertPayloads(queries, "grand_prix_tournaments")[0];
    const bracketData = tInsert.bracket_data as {
      rounds: Array<{ round: number; label: string }>;
    };
    expect(bracketData.rounds.map((r) => r.label)).toEqual([
      "Quarterfinals",
      "Semifinals",
      "Final",
    ]);
  });

  it("4 qualifiers produces a 4-player bracket: 2 R1 matches, both real-vs-real", async () => {
    const members = makeMembers(4);
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: makeXpDataFromMembers(members),
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );

    await processGrandPrix();

    const matchInserts = findInsertPayloads(queries, "grand_prix_matches");
    expect(matchInserts).toHaveLength(2);
    for (const match of matchInserts) {
      expect(match.player1_id).not.toBe(null);
      expect(match.player2_id).not.toBe(null);
      expect(match.status).toBe("pending");
    }

    const tInsert = findInsertPayloads(queries, "grand_prix_tournaments")[0];
    const bracketData = tInsert.bracket_data as {
      rounds: Array<{ round: number; label: string }>;
    };
    expect(bracketData.rounds.map((r) => r.label)).toEqual([
      "Semifinals",
      "Final",
    ]);
  });

  it("5 qualifiers produces an 8-player bracket with 3 byes: 4 R1 inserts (3 bye-completed + 1 real-vs-real, no bye-vs-bye)", async () => {
    const members = makeMembers(5);
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: makeXpDataFromMembers(members),
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );

    await processGrandPrix();

    const matchInserts = findInsertPayloads(queries, "grand_prix_matches");
    expect(matchInserts).toHaveLength(4);

    const completedBye = matchInserts.filter((p) => p.status === "completed");
    expect(completedBye).toHaveLength(3);
    for (const m of completedBye) {
      expect(m.player1_id === null || m.player2_id === null).toBe(true);
      expect(m.winner_id).not.toBe(null);
    }

    const realVsReal = matchInserts.filter((p) => p.status === "pending");
    expect(realVsReal).toHaveLength(1);
    expect(realVsReal[0].player1_id).not.toBe(null);
    expect(realVsReal[0].player2_id).not.toBe(null);

    // No bye-vs-bye (the gp-bug-2 precondition)
    const byeVsBye = matchInserts.filter(
      (p) => p.player1_id === null && p.player2_id === null
    );
    expect(byeVsBye).toHaveLength(0);
  });

  it("3 qualifiers produces a 4-player bracket with 1 bye: 2 R1 inserts (1 bye-completed + 1 real-vs-real)", async () => {
    const members = makeMembers(3);
    const queries = installSupabaseResponder(
      serviceFrom,
      defaultResponder({
        championMembers: members,
        xpData: makeXpDataFromMembers(members),
        profiles: members.map((m) => ({ id: m.user_id, display_name: m.user_id })),
      })
    );

    await processGrandPrix();

    const matchInserts = findInsertPayloads(queries, "grand_prix_matches");
    expect(matchInserts).toHaveLength(2);

    const completedBye = matchInserts.filter((p) => p.status === "completed");
    expect(completedBye).toHaveLength(1);
    expect(
      completedBye[0].player1_id === null || completedBye[0].player2_id === null
    ).toBe(true);
    expect(completedBye[0].winner_id).not.toBe(null);

    const realVsReal = matchInserts.filter((p) => p.status === "pending");
    expect(realVsReal).toHaveLength(1);

    const tInsert = findInsertPayloads(queries, "grand_prix_tournaments")[0];
    const bracketData = tInsert.bracket_data as {
      rounds: Array<{ round: number; label: string }>;
    };
    expect(bracketData.rounds.map((r) => r.label)).toEqual([
      "Semifinals",
      "Final",
    ]);
  });
});
