import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Coverage for calculateDuelXp + checkGiantKill — Session 4B HIGH-risk gaps:
//   3. weekly diminishing-returns query bidirectionality + threshold
//   6. XP multiplier direction across tier diffs
//   7. giant-kill detection at boundary tier diffs
//
// All exercised through submitDuelResults which is the only public
// entry point; the XP/giant-kill helpers are private to duels.ts.
// ═══════════════════════════════════════════════════════════════

const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/league-xp", () => ({
  getUserLeagueInfo: vi.fn(),
  getCurrentWeekStart: vi.fn().mockReturnValue("2026-04-20"),
  updateLeagueMembershipXp: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/scoring", () => ({
  // not exercised — both players are pre-completed in fixtures
  calculateQuestionXP: vi.fn().mockReturnValue(0),
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

import { submitDuelResults } from "./duels";
import { getUserLeagueInfo } from "@/lib/league-xp";
import { getDuelMaxPerOpponentWeekly } from "@/lib/config-actions";
import {
  installSupabaseResponder,
  findCall,
  findAllCalls,
  type Query,
} from "@/test/supabase-mock";

// ── Fixtures ─────────────────────────────────────────────────

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

const baseDuel = {
  id: "duel-1",
  challenger_id: "player-a",
  opponent_id: "player-b",
  match_type: "quick_match",
  anime_id: null, // skip updateLeagueMembershipXp branch
  difficulty: "medium",
  question_count: 5,
  questions: ["q1", "q2", "q3", "q4", "q5"],
  challenger_score: 0,
  challenger_correct: 4,
  challenger_time_ms: 20000,
  challenger_answers: [
    { questionId: "q1", selectedOption: 0, isCorrect: true, timeMs: 4000 },
    { questionId: "q2", selectedOption: 1, isCorrect: true, timeMs: 4000 },
    { questionId: "q3", selectedOption: 0, isCorrect: true, timeMs: 4000 },
    { questionId: "q4", selectedOption: 0, isCorrect: true, timeMs: 4000 },
    { questionId: "q5", selectedOption: 1, isCorrect: false, timeMs: 4000 },
  ],
  challenger_completed_at: "2026-04-21T12:00:00Z",
  opponent_score: null,
  opponent_correct: null,
  opponent_time_ms: null,
  opponent_answers: null,
  opponent_completed_at: null,
  winner_id: null,
  status: "in_progress",
  challenger_xp_earned: 0,
  opponent_xp_earned: 0,
  expires_at: "2026-04-22T00:00:00Z",
  created_at: "2026-04-20T00:00:00Z",
};

// Opponent submits with 3/5 correct so challenger wins (4 > 3).
const opponentLossAnswers = [
  { questionId: "q1", selectedOption: 0, isCorrect: true, timeMs: 5000 },
  { questionId: "q2", selectedOption: 1, isCorrect: true, timeMs: 5000 },
  { questionId: "q3", selectedOption: 0, isCorrect: true, timeMs: 5000 },
  { questionId: "q4", selectedOption: 1, isCorrect: false, timeMs: 5000 },
  { questionId: "q5", selectedOption: 1, isCorrect: false, timeMs: 5000 },
];

// Opponent submits identical to challenger → forces a draw.
const drawAnswers = baseDuel.challenger_answers;

interface QueueResult {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}

// Default queue scaffolding for a complete-on-second-submit flow:
//   duel_matches:  [fetch, count_query, final_update]
//   duel_stats:    [chal_select, chal_update, opp_select, opp_update,
//                   (gk_select, gk_update if giant kill)]
//   user_profiles: [chal_select, chal_update, opp_select, opp_update]
const baseQueues = (
  duel: typeof baseDuel,
  countResult: number,
  duelStatsExtra: QueueResult[] = []
): Record<string, QueueResult[]> => ({
  duel_matches: [
    { data: duel },
    { count: countResult },
    { data: { ...duel, status: "completed" } },
  ],
  duel_stats: [
    { data: { total_duels: 0, wins: 0, losses: 0, draws: 0, win_streak: 0, best_win_streak: 0, duel_xp_total: 0, giant_kills: 0 } },
    { data: null },
    { data: { total_duels: 0, wins: 0, losses: 0, draws: 0, win_streak: 0, best_win_streak: 0, duel_xp_total: 0, giant_kills: 0 } },
    { data: null },
    ...duelStatsExtra,
  ],
  user_profiles: [
    { data: { total_xp: 1000 } },
    { data: null },
    { data: { total_xp: 1000 } },
    { data: null },
  ],
});

const installQueues = (queues: Record<string, QueueResult[]>): Query[] => {
  return installSupabaseResponder(mockFrom, (q) => {
    const queue = queues[q.table];
    if (!queue || queue.length === 0) return { data: null };
    return queue.shift() ?? { data: null };
  });
};

const finalUpdatePayload = (queries: Query[]): Record<string, unknown> => {
  const updates = findAllCalls(queries, "duel_matches", "update");
  const last = updates[updates.length - 1];
  return last.ops.find((op) => op.method === "update")?.args[0] as Record<
    string,
    unknown
  >;
};

// ═══════════════════════════════════════════════════════════════
// Gap 3 — Diminishing-returns query shape + threshold
// ═══════════════════════════════════════════════════════════════

describe("calculateDuelXp — diminishing-returns query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDuelMaxPerOpponentWeekly).mockResolvedValue(3);
  });

  it("X1: filter is bidirectional — covers both (A,B) and (B,A) orderings", async () => {
    tierOf({ "player-a": 1, "player-b": 1 });
    const queries = installQueues(baseQueues(baseDuel, 0));

    await submitDuelResults("duel-1", "player-b", opponentLossAnswers, 25000);

    const orQuery = queries.find(
      (q) =>
        q.table === "duel_matches" &&
        q.ops.some((op) => op.method === "or")
    );
    expect(orQuery).toBeDefined();
    const orArg = orQuery!.ops.find((op) => op.method === "or")!.args[0] as string;
    expect(orArg).toContain("and(challenger_id.eq.player-a,opponent_id.eq.player-b)");
    expect(orArg).toContain("and(challenger_id.eq.player-b,opponent_id.eq.player-a)");
  });

  it("X2: applies the week-window filter on created_at >= getCurrentWeekStart()", async () => {
    tierOf({ "player-a": 1, "player-b": 1 });
    const queries = installQueues(baseQueues(baseDuel, 0));

    await submitDuelResults("duel-1", "player-b", opponentLossAnswers, 25000);

    const countQuery = findCall(queries, "duel_matches", "or");
    const gteOp = countQuery!.ops.find((op) => op.method === "gte");
    expect(gteOp).toBeDefined();
    expect(gteOp!.args[0]).toBe("created_at");
    expect(gteOp!.args[1]).toBe("2026-04-20"); // mocked getCurrentWeekStart
  });

  it("X3: below threshold (count=2, max=3) → full XP factor (challenger wins same-tier)", async () => {
    tierOf({ "player-a": 1, "player-b": 1 });
    vi.mocked(getDuelMaxPerOpponentWeekly).mockResolvedValue(3);
    const queries = installQueues(baseQueues(baseDuel, 2));

    await submitDuelResults("duel-1", "player-b", opponentLossAnswers, 25000);

    const payload = finalUpdatePayload(queries);
    // same-tier win: 50 * 1.0 * 1.0 = 50
    expect(payload.challenger_xp_earned).toBe(50);
    // same-tier loss: 10 * 1.0 * 1.0 = 10
    expect(payload.opponent_xp_earned).toBe(10);
  });

  it("X4: at threshold (count=3, max=3) → 25% XP factor", async () => {
    tierOf({ "player-a": 1, "player-b": 1 });
    vi.mocked(getDuelMaxPerOpponentWeekly).mockResolvedValue(3);
    const queries = installQueues(baseQueues(baseDuel, 3));

    await submitDuelResults("duel-1", "player-b", opponentLossAnswers, 25000);

    const payload = finalUpdatePayload(queries);
    // same-tier win: 50 * 1.0 * 0.25 = 12.5 → rounded to 13
    expect(payload.challenger_xp_earned).toBe(13);
    // same-tier loss: 10 * 1.0 * 0.25 = 2.5 → rounded to 3 (Math.round half-up)
    expect(payload.opponent_xp_earned).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════
// Gap 6 — XP multiplier direction
//
// Each player computes `tierDiff` from their own perspective vs the
// other's tier. Positive = beat someone above (bonus); negative =
// beat someone below (penalty). For draws, both sides apply the
// per-player multiplier to the DRAW base of 20.
// ═══════════════════════════════════════════════════════════════

describe("calculateDuelXp — multiplier direction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDuelMaxPerOpponentWeekly).mockResolvedValue(3);
  });

  it("X5: up-tier win — winner gets 3.0x bonus, loser gets 0.5x penalty", async () => {
    // challenger (winner) tier 1, opponent (loser) tier 3
    tierOf({ "player-a": 1, "player-b": 3 });
    const queries = installQueues({
      ...baseQueues(baseDuel, 0),
      // checkGiantKill triggers (loserTier 3 - winnerTier 1 = 2) — add gk fetch+update
      duel_stats: [
        ...baseQueues(baseDuel, 0).duel_stats,
        { data: { giant_kills: 0 } },
        { data: null },
      ],
    });

    await submitDuelResults("duel-1", "player-b", opponentLossAnswers, 25000);

    const payload = finalUpdatePayload(queries);
    // winner: 50 * 3.0 * 1.0 = 150
    expect(payload.challenger_xp_earned).toBe(150);
    // loser: 10 * 0.5 * 1.0 = 5
    expect(payload.opponent_xp_earned).toBe(5);
  });

  it("X6: down-tier win — winner gets 0.5x, loser (higher tier) gets 3.0x", async () => {
    // challenger (winner) tier 3, opponent (loser) tier 1
    tierOf({ "player-a": 3, "player-b": 1 });
    const queries = installQueues(baseQueues(baseDuel, 0));

    await submitDuelResults("duel-1", "player-b", opponentLossAnswers, 25000);

    const payload = finalUpdatePayload(queries);
    // winner (down-tier): 50 * 0.5 * 1.0 = 25
    expect(payload.challenger_xp_earned).toBe(25);
    // loser (up-tier): 10 * 3.0 * 1.0 = 30
    expect(payload.opponent_xp_earned).toBe(30);
  });

  it("X7: same-tier win — both sides 1.0x", async () => {
    tierOf({ "player-a": 2, "player-b": 2 });
    const queries = installQueues(baseQueues(baseDuel, 0));

    await submitDuelResults("duel-1", "player-b", opponentLossAnswers, 25000);

    const payload = finalUpdatePayload(queries);
    expect(payload.challenger_xp_earned).toBe(50);
    expect(payload.opponent_xp_earned).toBe(10);
  });

  it("X8: draw — each side applies its own perspective multiplier on DRAW base 20", async () => {
    tierOf({ "player-a": 1, "player-b": 3 });
    const queries = installQueues(baseQueues(baseDuel, 0));

    await submitDuelResults("duel-1", "player-b", drawAnswers, 20000);

    const payload = finalUpdatePayload(queries);
    expect(payload.winner_id).toBeUndefined(); // draw
    // challenger (tier 1, opp tier 3 → diff +2): 20 * 3.0 = 60
    expect(payload.challenger_xp_earned).toBe(60);
    // opponent (tier 3, opp tier 1 → diff -2): 20 * 0.5 = 10
    expect(payload.opponent_xp_earned).toBe(10);
  });
});

// ═══════════════════════════════════════════════════════════════
// Gap 7 — Giant-kill detection at boundary tier diffs
// ═══════════════════════════════════════════════════════════════

describe("checkGiantKill — boundary detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDuelMaxPerOpponentWeekly).mockResolvedValue(3);
  });

  it("X9: tier diff = 2 (winner=1, loser=3) → increments giant_kills", async () => {
    tierOf({ "player-a": 1, "player-b": 3 });

    const queues = baseQueues(baseDuel, 0);
    queues.duel_stats.push(
      { data: { giant_kills: 5 } }, // gk lookup
      { data: null }                 // gk update
    );
    const queries = installQueues(queues);

    await submitDuelResults("duel-1", "player-b", opponentLossAnswers, 25000);

    // Find the duel_stats update that mutates giant_kills (last duel_stats update).
    const allDuelStatsUpdates = findAllCalls(queries, "duel_stats", "update");
    const gkUpdate = allDuelStatsUpdates[allDuelStatsUpdates.length - 1];
    const gkPayload = gkUpdate.ops.find((op) => op.method === "update")!
      .args[0] as Record<string, unknown>;
    expect(gkPayload.giant_kills).toBe(6); // 5 + 1
  });

  it("X10: tier diff = 1 (winner=2, loser=3) → no giant_kills update", async () => {
    tierOf({ "player-a": 2, "player-b": 3 });

    const queries = installQueues(baseQueues(baseDuel, 0));

    await submitDuelResults("duel-1", "player-b", opponentLossAnswers, 25000);

    // Only the two updateDuelStats updates should have run on duel_stats.
    const allDuelStatsUpdates = findAllCalls(queries, "duel_stats", "update");
    expect(allDuelStatsUpdates).toHaveLength(2);
    // Neither carries a giant_kills field — both come from updateDuelStats.
    for (const u of allDuelStatsUpdates) {
      const payload = u.ops.find((op) => op.method === "update")!
        .args[0] as Record<string, unknown>;
      expect(payload).not.toHaveProperty("giant_kills");
    }
  });

  it("X11: draw (winner_id=null) → checkGiantKill early-returns, no gk update", async () => {
    // Even with a 2-tier diff, a draw must not trigger giant_kills.
    tierOf({ "player-a": 1, "player-b": 3 });

    const queries = installQueues(baseQueues(baseDuel, 0));

    await submitDuelResults("duel-1", "player-b", drawAnswers, 20000);

    const payload = finalUpdatePayload(queries);
    expect(payload.winner_id).toBeUndefined();

    const allDuelStatsUpdates = findAllCalls(queries, "duel_stats", "update");
    expect(allDuelStatsUpdates).toHaveLength(2); // only updateDuelStats, no gk
    for (const u of allDuelStatsUpdates) {
      const p = u.ops.find((op) => op.method === "update")!.args[0] as Record<
        string,
        unknown
      >;
      expect(p).not.toHaveProperty("giant_kills");
    }
  });
});
