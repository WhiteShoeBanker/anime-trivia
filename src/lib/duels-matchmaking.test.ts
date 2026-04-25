import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Coverage for findQuickMatch — Session 4B HIGH-risk gaps:
//   1. tier ±1 filter
//   2. junior ↔ junior age-group isolation (COPPA-adjacent)
//   4. optimistic-claim race handling on PGRST116
// ═══════════════════════════════════════════════════════════════

const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/league-xp", () => ({
  getUserLeagueInfo: vi.fn(),
  getCurrentWeekStart: vi.fn().mockReturnValue("2026-04-20"),
  updateLeagueMembershipXp: vi.fn(),
}));

vi.mock("@/lib/scoring", () => ({
  calculateQuestionXP: vi.fn().mockReturnValue(25),
}));

vi.mock("@/lib/badges", () => ({
  checkAndAwardBadges: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/track-actions", () => ({
  trackDuelCreated: vi.fn().mockResolvedValue(undefined),
  trackFriendRequestSent: vi.fn().mockResolvedValue(undefined),
  trackFriendRequestAccepted: vi.fn().mockResolvedValue(undefined),
  trackBadgeEarned: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/config-actions", () => ({
  getDuelMaxPerOpponentWeekly: vi.fn().mockResolvedValue(3),
}));

import { findQuickMatch } from "./duels";
import { getUserLeagueInfo } from "@/lib/league-xp";

// ── Per-table response queues ─────────────────────────────────
//
// Each `from(table)` call pops the next element from `queues[table]`.
// If the queue is exhausted, the proxy keeps replaying the last value.
// `.update(payload)` and `.insert(payload)` are intercepted so tests
// can assert on captured args.

type QResult = { data?: unknown; error?: unknown };

interface MockHandle {
  getCapturedUpdate: () => Record<string, unknown> | undefined;
  getCapturedInsert: () => Record<string, unknown> | undefined;
  getUpdateCallCount: () => number;
}

const setupQueues = (queues: Record<string, QResult[]>): MockHandle => {
  let capturedUpdate: Record<string, unknown> | undefined;
  let capturedInsert: Record<string, unknown> | undefined;
  let updateCallCount = 0;

  mockFrom.mockImplementation((table: string) => {
    const handler: ProxyHandler<object> = {
      get(_t, prop) {
        if (prop === "then") {
          const queue = queues[table];
          const r = queue && queue.length > 0
            ? (queue.shift() as QResult)
            : { data: null };
          return (resolve: (v: unknown) => void) =>
            resolve({ data: r.data ?? null, error: r.error ?? null });
        }
        return (...args: unknown[]) => {
          if (prop === "update") {
            capturedUpdate = args[0] as Record<string, unknown>;
            updateCallCount++;
          }
          if (prop === "insert") {
            capturedInsert = args[0] as Record<string, unknown>;
          }
          return new Proxy({}, handler);
        };
      },
    };
    return new Proxy({}, handler);
  });

  return {
    getCapturedUpdate: () => capturedUpdate,
    getCapturedInsert: () => capturedInsert,
    getUpdateCallCount: () => updateCallCount,
  };
};

// ── Test fixtures ─────────────────────────────────────────────

const tierOf = (map: Record<string, number>) => {
  vi.mocked(getUserLeagueInfo).mockImplementation(async (id: string) => {
    const tier = map[id];
    if (tier === undefined) return null;
    return {
      membership: {} as never,
      league: { tier } as never,
      members: [],
      userRank: 1,
    };
  });
};

const newDuelInsertResult = {
  id: "duel-new",
  challenger_id: "user-self",
  opponent_id: null,
  status: "waiting",
  match_type: "quick_match",
  questions: ["q1", "q2", "q3", "q4", "q5"],
};

const fiveQuestions = [
  { id: "q1" }, { id: "q2" }, { id: "q3" }, { id: "q4" }, { id: "q5" },
  { id: "q6" }, { id: "q7" }, { id: "q8" },
];

// ═══════════════════════════════════════════════════════════════
// Gap 1 — Tier ±1 matchmaking filter
// ═══════════════════════════════════════════════════════════════

describe("findQuickMatch — tier ±1 filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("M1: rejects opponent more than 1 tier above (self=2, opp=4) → falls back to createDuel", async () => {
    tierOf({ "user-self": 2, "user-opp": 4 });

    const handle = setupQueues({
      user_profiles: [
        { data: { age_group: "full" } },     // self
        // (no opp profile fetched — tier check fails first)
      ],
      duel_matches: [
        { data: [{ id: "duel-w1", challenger_id: "user-opp" }] },
        { data: newDuelInsertResult },        // createDuel insert
      ],
      questions: [{ data: fiveQuestions }],
    });

    const result = await findQuickMatch("user-self", {
      anime_id: "anime-1",
      difficulty: "medium",
      question_count: 5,
    });

    expect(result?.status).toBe("waiting");
    expect(result?.opponent_id).toBeNull();
    expect(handle.getCapturedInsert()?.challenger_id).toBe("user-self");
    expect(handle.getUpdateCallCount()).toBe(0); // no claim attempted
  });

  it("M2: rejects opponent more than 1 tier below (self=4, opp=2) → falls back", async () => {
    tierOf({ "user-self": 4, "user-opp": 2 });

    const handle = setupQueues({
      user_profiles: [{ data: { age_group: "full" } }],
      duel_matches: [
        { data: [{ id: "duel-w1", challenger_id: "user-opp" }] },
        { data: newDuelInsertResult },
      ],
      questions: [{ data: fiveQuestions }],
    });

    const result = await findQuickMatch("user-self", {
      anime_id: "anime-1",
      difficulty: "medium",
      question_count: 5,
    });

    expect(result?.opponent_id).toBeNull();
    expect(handle.getUpdateCallCount()).toBe(0);
  });

  it("M3: accepts opponent within ±1 tier (self=3, opp=2) → claims match", async () => {
    tierOf({ "user-self": 3, "user-opp": 2 });

    const claimedDuel = {
      id: "duel-w1",
      challenger_id: "user-opp",
      opponent_id: "user-self",
      status: "matched",
    };

    const handle = setupQueues({
      user_profiles: [
        { data: { age_group: "full" } },        // self
        { data: { age_group: "full" } },        // opp
      ],
      duel_matches: [
        { data: [{ id: "duel-w1", challenger_id: "user-opp" }] },
        { data: claimedDuel },                   // claim succeeds
      ],
    });

    const result = await findQuickMatch("user-self", {
      anime_id: "anime-1",
      difficulty: "medium",
      question_count: 5,
    });

    expect(result?.id).toBe("duel-w1");
    expect(result?.status).toBe("matched");
    expect(handle.getCapturedUpdate()).toEqual({
      opponent_id: "user-self",
      status: "matched",
    });
  });

  it("M4: accepts same-tier opponent (self=3, opp=3) → claims match", async () => {
    tierOf({ "user-self": 3, "user-opp": 3 });

    setupQueues({
      user_profiles: [
        { data: { age_group: "full" } },
        { data: { age_group: "full" } },
      ],
      duel_matches: [
        { data: [{ id: "duel-w1", challenger_id: "user-opp" }] },
        {
          data: {
            id: "duel-w1",
            opponent_id: "user-self",
            status: "matched",
          },
        },
      ],
    });

    const result = await findQuickMatch("user-self", {
      anime_id: "anime-1",
      difficulty: "medium",
      question_count: 5,
    });

    expect(result?.status).toBe("matched");
  });
});

// ═══════════════════════════════════════════════════════════════
// Gap 2 — Junior ↔ junior age-group isolation (COPPA-adjacent)
//
// Server-side enforcement at duels.ts:208. Defense-in-depth for the
// page-level isJunior tab filter. Without this, a junior bypassing
// the client could be matched with a non-junior in quick_match.
// ═══════════════════════════════════════════════════════════════

describe("findQuickMatch — junior age-group isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("M5: junior caller skips a non-junior candidate → falls back to createDuel", async () => {
    tierOf({ "user-self": 1, "user-opp": 1 });

    const handle = setupQueues({
      user_profiles: [
        { data: { age_group: "junior" } },      // self
        { data: { age_group: "full" } },        // opp
      ],
      duel_matches: [
        { data: [{ id: "duel-w1", challenger_id: "user-opp" }] },
        { data: newDuelInsertResult },          // createDuel insert
      ],
      questions: [{ data: fiveQuestions }],
    });

    const result = await findQuickMatch("user-self", {
      anime_id: "anime-1",
      difficulty: "medium",
      question_count: 5,
    });

    expect(result?.opponent_id).toBeNull();
    expect(handle.getUpdateCallCount()).toBe(0); // never claimed
    expect(handle.getCapturedInsert()).toBeDefined();
  });

  it("M6: junior caller matches another junior → claims match", async () => {
    tierOf({ "user-self": 1, "user-opp": 1 });

    setupQueues({
      user_profiles: [
        { data: { age_group: "junior" } },
        { data: { age_group: "junior" } },
      ],
      duel_matches: [
        { data: [{ id: "duel-w1", challenger_id: "user-opp" }] },
        {
          data: {
            id: "duel-w1",
            opponent_id: "user-self",
            status: "matched",
          },
        },
      ],
    });

    const result = await findQuickMatch("user-self", {
      anime_id: "anime-1",
      difficulty: "medium",
      question_count: 5,
    });

    expect(result?.status).toBe("matched");
  });

  it("M7: two non-juniors (teen + full) match each other", async () => {
    tierOf({ "user-self": 2, "user-opp": 2 });

    setupQueues({
      user_profiles: [
        { data: { age_group: "teen" } },
        { data: { age_group: "full" } },
      ],
      duel_matches: [
        { data: [{ id: "duel-w1", challenger_id: "user-opp" }] },
        {
          data: {
            id: "duel-w1",
            opponent_id: "user-self",
            status: "matched",
          },
        },
      ],
    });

    const result = await findQuickMatch("user-self", {
      anime_id: "anime-1",
      difficulty: "medium",
      question_count: 5,
    });

    expect(result?.status).toBe("matched");
  });
});

// ═══════════════════════════════════════════════════════════════
// Gap 4 — Optimistic-claim race
//
// When two users try to claim the same waiting duel simultaneously,
// the .eq("status","waiting") guard on the update prevents a double
// match. The losing claim returns PGRST116 from .single() because
// no row matches the update predicate; the loop must continue to
// the next candidate.
// ═══════════════════════════════════════════════════════════════

describe("findQuickMatch — optimistic-claim race", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("M8: PGRST116 on first claim → continues to second candidate and claims it", async () => {
    tierOf({ "user-self": 2, "user-opp1": 2, "user-opp2": 2 });

    const handle = setupQueues({
      user_profiles: [
        { data: { age_group: "full" } },        // self
        { data: { age_group: "full" } },        // opp1
        { data: { age_group: "full" } },        // opp2
      ],
      duel_matches: [
        {
          data: [
            { id: "duel-w1", challenger_id: "user-opp1" },
            { id: "duel-w2", challenger_id: "user-opp2" },
          ],
        },
        // first claim — already taken by another player
        { data: null, error: { code: "PGRST116", message: "no rows" } },
        // second claim — succeeds
        {
          data: {
            id: "duel-w2",
            opponent_id: "user-self",
            status: "matched",
          },
        },
      ],
    });

    const result = await findQuickMatch("user-self", {
      anime_id: "anime-1",
      difficulty: "medium",
      question_count: 5,
    });

    expect(result?.id).toBe("duel-w2");
    expect(result?.status).toBe("matched");
    expect(handle.getUpdateCallCount()).toBe(2); // both claims attempted
  });
});

// ═══════════════════════════════════════════════════════════════
// Fallback path coverage — empty waiting list creates a new duel
// ═══════════════════════════════════════════════════════════════

describe("findQuickMatch — empty waiting list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("M9: no candidates → createDuel inserts a new waiting duel", async () => {
    tierOf({ "user-self": 2 });

    const handle = setupQueues({
      user_profiles: [{ data: { age_group: "full" } }],
      duel_matches: [
        { data: [] },                            // empty waiting list
        { data: newDuelInsertResult },           // createDuel insert
      ],
      questions: [{ data: fiveQuestions }],
    });

    const result = await findQuickMatch("user-self", {
      anime_id: "anime-1",
      difficulty: "medium",
      question_count: 5,
    });

    expect(result?.status).toBe("waiting");
    expect(result?.opponent_id).toBeNull();
    expect(handle.getCapturedInsert()?.challenger_id).toBe("user-self");
    expect(handle.getCapturedInsert()?.match_type).toBe("quick_match");
    expect(handle.getUpdateCallCount()).toBe(0);
  });
});
