import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PromotionRequirements } from "@/types";

// ── Mocks for calculateLeagueXp ──────────────────────────────

const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

const mockGetDiminishingReturns = vi.fn();
vi.mock("@/lib/config-actions", () => ({
  getDiminishingReturns: () => mockGetDiminishingReturns(),
}));

import {
  getLeagueXpMultiplier,
  getCurrentWeekStart,
  getPromotionRequirements,
  resolveMemberFate,
  calculateLeagueXp,
} from "./league-xp";

// ── getLeagueXpMultiplier (Diminishing Returns) ────────────

describe("getLeagueXpMultiplier", () => {
  it("returns 1.0 (100%) for first play", () => {
    expect(getLeagueXpMultiplier(1)).toBe(1.0);
  });

  it("returns 0.75 (75%) for second play", () => {
    expect(getLeagueXpMultiplier(2)).toBe(0.75);
  });

  it("returns 0.5 (50%) for third play", () => {
    expect(getLeagueXpMultiplier(3)).toBe(0.5);
  });

  it("returns 0.25 (25%) for fourth play", () => {
    expect(getLeagueXpMultiplier(4)).toBe(0.25);
  });

  it("returns 0.1 (10%) for fifth and beyond", () => {
    expect(getLeagueXpMultiplier(5)).toBe(0.1);
    expect(getLeagueXpMultiplier(10)).toBe(0.1);
    expect(getLeagueXpMultiplier(100)).toBe(0.1);
  });

  it("returns 1.0 for playCount <= 1 (including 0)", () => {
    expect(getLeagueXpMultiplier(0)).toBe(1.0);
    expect(getLeagueXpMultiplier(-1)).toBe(1.0);
  });
});

// ── getCurrentWeekStart ─────────────────────────────────────

describe("getCurrentWeekStart", () => {
  it("returns a date string in YYYY-MM-DD format", () => {
    const weekStart = getCurrentWeekStart();
    expect(weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a Monday", () => {
    const weekStart = getCurrentWeekStart();
    const date = new Date(weekStart + "T00:00:00Z");
    // getUTCDay() → 1 = Monday
    expect(date.getUTCDay()).toBe(1);
  });
});

// ── getPromotionRequirements (Breadth Gates) ─────────────────

describe("getPromotionRequirements", () => {
  it("tier 1 → no requirements (entry tier)", () => {
    const req = getPromotionRequirements(1);
    expect(req.minAnime).toBe(0);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(0);
  });

  it("tier 2 → requires 2+ anime", () => {
    const req = getPromotionRequirements(2);
    expect(req.minAnime).toBe(2);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(0);
  });

  it("tier 3 → requires 3+ anime", () => {
    const req = getPromotionRequirements(3);
    expect(req.minAnime).toBe(3);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(0);
  });

  it("tier 4 → requires 5+ anime + hard difficulty", () => {
    const req = getPromotionRequirements(4);
    expect(req.minAnime).toBe(5);
    expect(req.requiresHard).toBe(true);
    expect(req.requiresImpossible).toBe(0);
  });

  it("tier 5 → requires 6+ anime + 2 impossible", () => {
    const req = getPromotionRequirements(5);
    expect(req.minAnime).toBe(6);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(2);
  });

  it("tier 6 → no additional requirements (top tier)", () => {
    const req = getPromotionRequirements(6);
    expect(req.minAnime).toBe(0);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(0);
  });
});

// ── resolveMemberFate (extracted decision logic) ─────────────

const BRONZE = { id: "L-bronze", tier: 1, promotion_slots: 10, demotion_slots: 0 };
const SILVER = { id: "L-silver", tier: 2, promotion_slots: 10, demotion_slots: 10 };
const GOLD = { id: "L-gold", tier: 3, promotion_slots: 10, demotion_slots: 10 };
const CHAMPION = { id: "L-champion", tier: 6, promotion_slots: 0, demotion_slots: 5 };

const NO_GATE: PromotionRequirements = {
  minAnime: 0,
  requiresHard: false,
  requiresImpossible: 0,
};
const SILVER_GATE: PromotionRequirements = {
  minAnime: 2,
  requiresHard: false,
  requiresImpossible: 0,
};

// Gap 1 — Top-N promoted to next tier
describe("resolveMemberFate — promotion (Gap 1)", () => {
  it("promotes user at rank 1 when within promotion_slots and breadth gate passes", () => {
    const fate = resolveMemberFate({
      rank: 1,
      totalMembers: 30,
      uniqueAnimeCount: 5,
      league: BRONZE,
      nextLeague: SILVER,
      prevLeague: null,
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("promoted");
    expect(fate.newLeagueId).toBe(SILVER.id);
    expect(fate.newTier).toBe(2);
  });

  it("promotes user at rank = promotion_slots (boundary, inclusive)", () => {
    const fate = resolveMemberFate({
      rank: 10,
      totalMembers: 30,
      uniqueAnimeCount: 5,
      league: BRONZE,
      nextLeague: SILVER,
      prevLeague: null,
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("promoted");
    expect(fate.newTier).toBe(2);
  });

  it("does NOT promote user at rank = promotion_slots + 1", () => {
    const fate = resolveMemberFate({
      rank: 11,
      totalMembers: 30,
      uniqueAnimeCount: 5,
      league: BRONZE,
      nextLeague: SILVER,
      prevLeague: null,
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("stayed");
    expect(fate.newLeagueId).toBe(BRONZE.id);
    expect(fate.newTier).toBe(1);
  });

  it("does NOT promote top-ranked user when no nextLeague (Champion ceiling)", () => {
    const fate = resolveMemberFate({
      rank: 1,
      totalMembers: 30,
      uniqueAnimeCount: 10,
      league: CHAMPION,
      nextLeague: null,
      prevLeague: { id: "L-diamond", tier: 5 },
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("stayed");
    expect(fate.newLeagueId).toBe(CHAMPION.id);
    expect(fate.newTier).toBe(6);
  });
});

// Gap 2 — Bottom-N demoted to prior tier
describe("resolveMemberFate — demotion (Gap 2)", () => {
  it("demotes user at rank = totalMembers (last place)", () => {
    const fate = resolveMemberFate({
      rank: 30,
      totalMembers: 30,
      uniqueAnimeCount: 0,
      league: GOLD,
      nextLeague: null,
      prevLeague: SILVER,
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("demoted");
    expect(fate.newLeagueId).toBe(SILVER.id);
    expect(fate.newTier).toBe(2);
  });

  it("demotes user at rank = totalMembers - demotion_slots + 1 (boundary)", () => {
    // totalMembers=30, demotion_slots=10 → demotion band = ranks 21..30
    const fate = resolveMemberFate({
      rank: 21,
      totalMembers: 30,
      uniqueAnimeCount: 0,
      league: GOLD,
      nextLeague: null,
      prevLeague: SILVER,
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("demoted");
    expect(fate.newTier).toBe(2);
  });

  it("does NOT demote user at rank = totalMembers - demotion_slots (just above the band)", () => {
    const fate = resolveMemberFate({
      rank: 20,
      totalMembers: 30,
      uniqueAnimeCount: 0,
      league: GOLD,
      nextLeague: null,
      prevLeague: SILVER,
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("stayed");
    expect(fate.newLeagueId).toBe(GOLD.id);
  });

  it("does NOT demote when league.demotion_slots = 0", () => {
    // Bronze has demotion_slots=0 in seed
    const fate = resolveMemberFate({
      rank: 30,
      totalMembers: 30,
      uniqueAnimeCount: 0,
      league: BRONZE,
      nextLeague: SILVER,
      prevLeague: null,
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("stayed");
    expect(fate.newLeagueId).toBe(BRONZE.id);
  });
});

// Gap 3 — Bronze (tier 1) demotion floor (no tier 0)
describe("resolveMemberFate — Bronze floor (Gap 3)", () => {
  it("Bronze (tier 1) never demotes even when configured demotion band would include the member", () => {
    // Hypothetical: if seed ever set demotion_slots>0 on Bronze, the
    // tier===1 guard must still prevent demotion below tier 1.
    const bronzeWithDemotion = { ...BRONZE, demotion_slots: 5 };
    const fate = resolveMemberFate({
      rank: 30,
      totalMembers: 30,
      uniqueAnimeCount: 0,
      league: bronzeWithDemotion,
      nextLeague: SILVER,
      prevLeague: { id: "L-tier0", tier: 0 }, // fabricated prev to force the branch
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("stayed");
    expect(fate.newLeagueId).toBe(bronzeWithDemotion.id);
    expect(fate.newTier).toBe(1);
  });
});

// Gap 4 — Breadth gate produces missed_promotion result
describe("resolveMemberFate — breadth gate (Gap 4)", () => {
  it("returns missed_promotion when rank is in promotion band but uniqueAnimeCount < minAnime", () => {
    const fate = resolveMemberFate({
      rank: 1,
      totalMembers: 30,
      uniqueAnimeCount: 1, // < 2
      league: SILVER,
      nextLeague: GOLD,
      prevLeague: BRONZE,
      promotionReqs: SILVER_GATE,
    });
    expect(fate.result).toBe("missed_promotion");
    expect(fate.newLeagueId).toBe(SILVER.id); // unchanged
    expect(fate.newTier).toBe(2); // unchanged
  });

  it("returns promoted when uniqueAnimeCount >= minAnime", () => {
    const fate = resolveMemberFate({
      rank: 1,
      totalMembers: 30,
      uniqueAnimeCount: 2, // == minAnime (inclusive)
      league: SILVER,
      nextLeague: GOLD,
      prevLeague: BRONZE,
      promotionReqs: SILVER_GATE,
    });
    expect(fate.result).toBe("promoted");
    expect(fate.newLeagueId).toBe(GOLD.id);
    expect(fate.newTier).toBe(3);
  });

  it("skips breadth gate entirely when minAnime = 0 (Bronze)", () => {
    const fate = resolveMemberFate({
      rank: 1,
      totalMembers: 30,
      uniqueAnimeCount: 0, // would fail a non-zero gate
      league: BRONZE,
      nextLeague: SILVER,
      prevLeague: null,
      promotionReqs: NO_GATE,
    });
    expect(fate.result).toBe("promoted");
  });
});

// ── calculateLeagueXp (Gaps 8 + 9) ───────────────────────────

// Supabase chainable mock for calculateLeagueXp. The function calls:
//   1. from("weekly_anime_plays").select("id, play_count").eq(...).eq(...).eq(...).single()
//   2. either .update({ play_count }).eq("id", ...) OR .insert({...})
//
// Per test, we configure responses for (select→single) and (insert/update).

type QueryOp = { method: string; args: unknown[] };
type QueryResult = { data?: unknown; error?: unknown };

const setupWeeklyAnimePlaysMock = (options: {
  existing: { id: string; play_count: number } | null;
}) => {
  const operations: { table: string; ops: QueryOp[] }[] = [];
  mockFrom.mockImplementation((table: string) => {
    const ops: QueryOp[] = [];
    operations.push({ table, ops });
    const handler: ProxyHandler<object> = {
      get(_t, prop) {
        if (prop === "then") {
          let result: QueryResult = { data: null, error: null };
          const opNames = ops.map((o) => o.method);
          if (opNames.includes("single")) {
            result = { data: options.existing, error: null };
          }
          return (resolve: (v: QueryResult) => void) => resolve(result);
        }
        return (...args: unknown[]) => {
          ops.push({ method: String(prop), args });
          return new Proxy({}, handler);
        };
      },
    };
    return new Proxy({}, handler);
  });
  return operations;
};

describe("calculateLeagueXp — diminishing returns applied (Gap 8)", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetDiminishingReturns.mockReset();
    mockGetDiminishingReturns.mockResolvedValue([1.0, 0.75, 0.5, 0.25, 0.1]);
  });

  it("applies 1.0 multiplier to baseXp on first play (no existing row)", async () => {
    setupWeeklyAnimePlaysMock({ existing: null });
    const result = await calculateLeagueXp(100, "anime-1", "user-1");
    expect(result.playCount).toBe(1);
    expect(result.multiplier).toBe(1.0);
    expect(result.leagueXp).toBe(100);
    expect(result.nudge).toBe(false);
  });

  it("applies 0.75 multiplier on second play", async () => {
    setupWeeklyAnimePlaysMock({ existing: { id: "wap-1", play_count: 1 } });
    const result = await calculateLeagueXp(100, "anime-1", "user-1");
    expect(result.playCount).toBe(2);
    expect(result.multiplier).toBe(0.75);
    expect(result.leagueXp).toBe(75);
  });

  it("applies 0.1 multiplier on fifth play and beyond", async () => {
    setupWeeklyAnimePlaysMock({ existing: { id: "wap-1", play_count: 4 } });
    const result = await calculateLeagueXp(100, "anime-1", "user-1");
    expect(result.playCount).toBe(5);
    expect(result.multiplier).toBe(0.1);
    expect(result.leagueXp).toBe(10);
  });

  it("sets nudge=true when multiplier <= 0.5 (third play)", async () => {
    setupWeeklyAnimePlaysMock({ existing: { id: "wap-1", play_count: 2 } });
    const result = await calculateLeagueXp(100, "anime-1", "user-1");
    expect(result.multiplier).toBe(0.5);
    expect(result.nudge).toBe(true);
  });

  it("respects admin-config multipliers (custom schedule)", async () => {
    mockGetDiminishingReturns.mockResolvedValue([1.0, 0.5, 0.1]);
    setupWeeklyAnimePlaysMock({ existing: { id: "wap-1", play_count: 1 } });
    const result = await calculateLeagueXp(100, "anime-1", "user-1");
    expect(result.playCount).toBe(2);
    expect(result.multiplier).toBe(0.5);
    expect(result.leagueXp).toBe(50);
  });
});

describe("calculateLeagueXp — play-count tracking (Gap 9)", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetDiminishingReturns.mockReset();
    mockGetDiminishingReturns.mockResolvedValue([1.0, 0.75, 0.5, 0.25, 0.1]);
  });

  it("inserts a weekly_anime_plays row with play_count=1 on first play", async () => {
    const ops = setupWeeklyAnimePlaysMock({ existing: null });
    await calculateLeagueXp(50, "anime-42", "user-42");

    // Find the insert call
    const insertOp = ops
      .flatMap((o) => o.ops.map((op) => ({ table: o.table, ...op })))
      .find((op) => op.table === "weekly_anime_plays" && op.method === "insert");
    expect(insertOp).toBeDefined();
    const payload = insertOp!.args[0] as {
      user_id: string;
      anime_id: string;
      week_start: string;
      play_count: number;
    };
    expect(payload.user_id).toBe("user-42");
    expect(payload.anime_id).toBe("anime-42");
    expect(payload.play_count).toBe(1);
    expect(payload.week_start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("updates existing weekly_anime_plays row with play_count = N+1", async () => {
    const ops = setupWeeklyAnimePlaysMock({
      existing: { id: "wap-existing", play_count: 2 },
    });
    await calculateLeagueXp(50, "anime-42", "user-42");

    const updateOp = ops
      .flatMap((o) => o.ops.map((op) => ({ table: o.table, ...op })))
      .find((op) => op.table === "weekly_anime_plays" && op.method === "update");
    expect(updateOp).toBeDefined();
    const payload = updateOp!.args[0] as { play_count: number };
    expect(payload.play_count).toBe(3);
  });

  it("scopes lookup to (user_id, anime_id, week_start)", async () => {
    const ops = setupWeeklyAnimePlaysMock({ existing: null });
    await calculateLeagueXp(50, "anime-42", "user-42");

    const selectQuery = ops.find(
      (o) =>
        o.table === "weekly_anime_plays" &&
        o.ops.some((op) => op.method === "select")
    );
    expect(selectQuery).toBeDefined();
    const eqCalls = selectQuery!.ops.filter((op) => op.method === "eq");
    const eqKeys = eqCalls.map((op) => op.args[0]);
    expect(eqKeys).toEqual(
      expect.arrayContaining(["user_id", "anime_id", "week_start"])
    );
  });
});
