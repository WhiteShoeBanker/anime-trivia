import { describe, it, expect, vi, beforeEach } from "vitest";

// Engine doesn't import the supabase client — the test passes
// `mockSupabase` explicitly to every runBadgeChecks call.
const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

import { runBadgeChecks } from "./badges-engine";

// Helper to build a chainable query mock
const chain = (resolvedData: unknown, count?: number | null) => {
  const builder: Record<string, unknown> = {};
  const proxy: unknown = new Proxy(builder, {
    get(_t, prop: string) {
      if (prop === "then") {
        return (resolve: (v: unknown) => void) =>
          resolve({ data: resolvedData, error: null, count: count ?? null });
      }
      if (!builder[prop]) {
        builder[prop] = vi.fn().mockReturnValue(proxy);
      }
      return builder[prop];
    },
  });
  return proxy;
};

describe("runBadgeChecks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Streak Badges ──────────────────────────────────────────

  describe("streak badges", () => {
    it("awards streak badge when current_streak meets requirement", async () => {
      const badgeId = "streak-3";

      // Mock the calls: allBadges, earnedRows, then gatherUserStats calls
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: badgeId,
              slug: "streak-3",
              name: "On Fire",
              description: "3-day streak",
              category: "streak",
              icon_name: "flame",
              icon_color: "#FF6B35",
              requirement_type: "streak_days",
              requirement_value: { days: 3 },
              rarity: "common",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) {
          return chain([]); // No earned badges
        }
        if (table === "user_profiles") {
          return chain({
            current_streak: 5,
            longest_streak: 5,
            total_xp: 1000,
            created_at: "2024-01-01",
          });
        }
        if (table === "quiz_sessions") {
          return chain([], 10);
        }
        if (table === "anime_series") {
          return chain(null, 20);
        }
        if (table === "league_history") {
          return chain(null, 0);
        }
        if (table === "league_memberships") {
          return chain({ leagues: { tier: 1 } });
        }
        if (table === "grand_prix_matches") {
          return chain(null, 0);
        }
        if (table === "grand_prix_tournaments") {
          return chain(null, 0);
        }
        if (table === "duel_stats") {
          return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        }
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(badgeId);
    });
  });

  // ── Time-Based Badges ──────────────────────────────────────

  describe("time-based badges", () => {
    it("awards 'early bird' badge if current hour < required hour", async () => {
      const currentHour = new Date().getHours();
      // Set hour threshold above current hour so it always passes
      const hourThreshold = currentHour + 1;

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "early-bird",
              slug: "early-bird",
              name: "Early Bird",
              description: "Play before a certain hour",
              category: "time",
              icon_name: "sunrise",
              icon_color: "#FFD93D",
              requirement_type: "hour_before",
              requirement_value: { hour: hourThreshold },
              rarity: "common",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 1, longest_streak: 1, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 1);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("early-bird");
    });
  });

  // ── Difficulty Badges ──────────────────────────────────────

  describe("difficulty badges", () => {
    it("awards hard score badge when quiz score meets percent threshold", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "hard-ace",
              slug: "hard-ace",
              name: "Hard Ace",
              description: "Score 80%+ on hard",
              category: "difficulty",
              icon_name: "star",
              icon_color: "#E94560",
              requirement_type: "hard_score_percent",
              requirement_value: { percent: 80 },
              rarity: "rare",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 1, longest_streak: 1, total_xp: 500, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 5);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        quizScore: 9,
        quizTotal: 10,
        difficulty: "hard",
      }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("hard-ace");
    });

    it("does not award hard score badge on non-hard difficulty", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "hard-ace",
              slug: "hard-ace",
              name: "Hard Ace",
              description: "Score 80%+ on hard",
              category: "difficulty",
              icon_name: "star",
              icon_color: "#E94560",
              requirement_type: "hard_score_percent",
              requirement_value: { percent: 80 },
              rarity: "rare",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 1, longest_streak: 1, total_xp: 500, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 5);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        quizScore: 10,
        quizTotal: 10,
        difficulty: "easy", // not hard
      }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  // ── Duel Badges ─────────────────────────────────────────────

  describe("duel badges", () => {
    it("awards First Blood (duel_wins >= 1)", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "first-blood",
              slug: "first-blood",
              name: "First Blood",
              description: "Win your first duel",
              category: "duel",
              icon_name: "sword",
              icon_color: "#E94560",
              requirement_type: "duel_wins",
              requirement_value: { count: 1 },
              rarity: "common",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 1, longest_streak: 1, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 3, giant_kills: 0, win_streak: 1, best_win_streak: 2 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1", isDuel: true }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("first-blood");
    });

    it("awards Giant Slayer (duel_giant_kills >= 1)", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "giant-slayer",
              slug: "giant-slayer",
              name: "Giant Slayer",
              description: "Win against a player 2+ tiers above",
              category: "duel",
              icon_name: "shield",
              icon_color: "#00D1B2",
              requirement_type: "duel_giant_kills",
              requirement_value: { count: 1 },
              rarity: "rare",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 5, giant_kills: 2, win_streak: 0, best_win_streak: 3 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1", isDuel: true }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("giant-slayer");
    });

    it("awards Duel Master (duel_win_streak >= 5)", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "duel-master",
              slug: "duel-master",
              name: "Duel Master",
              description: "Win 5 duels in a row",
              category: "duel",
              icon_name: "crown",
              icon_color: "#FFD93D",
              requirement_type: "duel_win_streak",
              requirement_value: { count: 5 },
              rarity: "epic",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 500, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 10);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 2 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 20, giant_kills: 0, win_streak: 6, best_win_streak: 6 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1", isDuel: true }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("duel-master");
    });

    it("awards Perfect Duel (duel_perfect with full score)", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "perfect-duel",
              slug: "perfect-duel",
              name: "Perfect Duel",
              description: "Get every answer right in a duel",
              category: "duel",
              icon_name: "sparkles",
              icon_color: "#FFD93D",
              requirement_type: "duel_perfect",
              requirement_value: {},
              rarity: "epic",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 1, giant_kills: 0, win_streak: 1, best_win_streak: 1 });
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        isDuel: true,
        quizScore: 10,
        quizTotal: 10,
      }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("perfect-duel");
    });

    it("does not award Perfect Duel if not a duel", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "perfect-duel",
              slug: "perfect-duel",
              name: "Perfect Duel",
              description: "Get every answer right in a duel",
              category: "duel",
              icon_name: "sparkles",
              icon_color: "#FFD93D",
              requirement_type: "duel_perfect",
              requirement_value: {},
              rarity: "epic",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 1, giant_kills: 0, win_streak: 1, best_win_streak: 1 });
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        isDuel: false, // not a duel
        quizScore: 10,
        quizTotal: 10,
      }, mockSupabase);
      expect(result.length).toBe(0);
    });

    it("awards Rivalry badge when enough duels against same opponent", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "rivalry",
              slug: "rivalry",
              name: "Rivalry",
              description: "Duel the same opponent 5 times",
              category: "duel",
              icon_name: "users",
              icon_color: "#E94560",
              requirement_type: "duel_rivalry",
              requirement_value: { count: 5 },
              rarity: "uncommon",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 3, giant_kills: 0, win_streak: 0, best_win_streak: 2 });
        // duel_matches rivalry count
        if (table === "duel_matches") return chain(null, 6);
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        isDuel: true,
        duelOpponentId: "opponent-1",
      }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("rivalry");
    });

  });

  // ── Daily Challenge Streak ────────────────────────────────────
  // Regression: previously used a total_quizzes fallback (wrongly awarded the
  // Daily Devotee badge to any user with N+ total quizzes). Now reads
  // user_profiles.daily_challenge_streak directly.

  describe("daily challenge streak badge", () => {
    const DAILY_7_BADGE = {
      id: "daily-7",
      slug: "daily-7",
      name: "Daily Devotee",
      description: "Complete daily challenges 7 days in a row",
      category: "daily",
      icon_name: "CalendarCheck",
      icon_color: "#00D1B2",
      requirement_type: "daily_challenge_streak",
      requirement_value: { days: 7 },
      rarity: "rare",
      created_at: "2024-01-01",
    };

    it("awards daily-7 when daily_challenge_streak >= 7 (even with low totalQuizzes)", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([DAILY_7_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({
            current_streak: 0,
            longest_streak: 0,
            total_xp: 100,
            created_at: "2024-01-01",
            daily_challenge_streak: 7,
          });
        }
        if (table === "quiz_sessions") return chain([], 3); // only 3 total quizzes
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("daily-7");
    });

    it("does NOT award daily-7 when daily_challenge_streak < 7 (even with high totalQuizzes)", async () => {
      // The old fallback would have awarded this (total_quizzes=50 >= 7).
      // The fixed checker reads daily_challenge_streak=2 and rejects.
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([DAILY_7_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({
            current_streak: 0,
            longest_streak: 0,
            total_xp: 100,
            created_at: "2024-01-01",
            daily_challenge_streak: 2,
          });
        }
        if (table === "quiz_sessions") return chain([], 50); // 50 total quizzes — would trigger old fallback
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  describe("duel badges: undefeated", () => {
    it("does not award Undefeated badge if best_win_streak < required count", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "undefeated",
              slug: "undefeated",
              name: "Undefeated",
              description: "Win 10 duels in a row",
              category: "duel",
              icon_name: "trophy",
              icon_color: "#FFD93D",
              requirement_type: "duel_win_streak",
              requirement_value: { count: 10 },
              rarity: "legendary",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 8, giant_kills: 0, win_streak: 3, best_win_streak: 7 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1", isDuel: true }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  // ── weekend_both_days last-7-days check (bug-1 fix) ────────
  // Verifies the bug-1 fix: checkWeekendBadge now queries
  // quiz_sessions over the last 7 days and awards only if the
  // user's distinct DOW set contains both Saturday (6) and
  // Sunday (0). Mock routing follows the file's inline-chain
  // call-count pattern: the weekend check is the 5th
  // quiz_sessions call (after gatherUserStats's 4).

  describe("weekend_both_days last-7-days check (bug-1 fix)", () => {
    const WEEKEND_BADGE = {
      id: "weekend-warrior",
      slug: "weekend-warrior",
      name: "Weekend Warrior",
      description: "Play on both Saturday and Sunday in the same weekend",
      category: "weekend",
      icon_name: "Calendar",
      icon_color: "#00D1B2",
      requirement_type: "weekend_both_days",
      requirement_value: {},
      rarity: "uncommon",
      created_at: "2024-01-01",
    };

    beforeEach(() => {
      vi.useFakeTimers();
      // Saturday April 25, 2026, noon local. Sliding 7-day
      // window covers [Apr 18 12:00, Apr 25 12:00] local time.
      vi.setSystemTime(new Date(2026, 3, 25, 12, 0, 0));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("awards weekend-warrior when user has played on both Saturday and Sunday in the last 7 days", async () => {
      let callCount = 0;
      let qsCallCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([WEEKEND_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") {
          qsCallCount++;
          if (qsCallCount === 5) {
            return chain([
              // Saturday Apr 25 — DOW 6, in window.
              { created_at: new Date(2026, 3, 25, 9, 0, 0).toISOString() },
              // Sunday Apr 19 — DOW 0, in window.
              { created_at: new Date(2026, 3, 19, 14, 0, 0).toISOString() },
            ]);
          }
          return chain([], 0);
        }
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("weekend-warrior");
    });

    it("does not award weekend-warrior when user has only played on Saturday in the last 7 days", async () => {
      let callCount = 0;
      let qsCallCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([WEEKEND_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") {
          qsCallCount++;
          if (qsCallCount === 5) {
            return chain([
              // Saturday only — DOW 6. Sunday absent.
              { created_at: new Date(2026, 3, 25, 9, 0, 0).toISOString() },
            ]);
          }
          return chain([], 0);
        }
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  // ── hour_after wraparound (bug-3 fix) ──────────────────────
  // Verifies the late-night-window wraparound: for hour >= 20,
  // the badge awards in early-morning hours up to (but not
  // including) the EARLY_MORNING_CUTOFF (5 AM local).

  describe("hour_after wraparound (bug-3 fix)", () => {
    const NIGHT_OWL_BADGE = {
      id: "night-owl",
      slug: "night-owl",
      name: "Night Owl",
      description: "Complete a quiz after 11 PM local time",
      category: "time",
      icon_name: "Moon",
      icon_color: "#6366F1",
      requirement_type: "hour_after",
      requirement_value: { hour: 23 },
      rarity: "uncommon",
      created_at: "2024-01-01",
    };

    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("awards night-owl badge in early-morning hours up to 5 AM cutoff", async () => {
      // 4:30 AM the morning after — wraps into the late-night window.
      vi.setSystemTime(new Date(2026, 3, 27, 4, 30, 0));

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([NIGHT_OWL_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("night-owl");
    });

    it("does not award night-owl badge at 5 AM cutoff", async () => {
      // 5:00 AM exactly — outside the wraparound window (strict <).
      vi.setSystemTime(new Date(2026, 3, 27, 5, 0, 0));

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([NIGHT_OWL_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  // ── HIGH-risk audit gap coverage (commit 3) ────────────────
  // Six gaps surfaced by the badge-checker audit. Each describe
  // block targets a single gap; tests are single-behavior and
  // negative-path-heavy since the existing suite already covers
  // the happy paths.

  // Gap 1: hour_after equality and below-required boundary.

  describe("hour_after boundary (gap-1)", () => {
    const NIGHT_OWL_BADGE = {
      id: "night-owl",
      slug: "night-owl",
      name: "Night Owl",
      description: "Complete a quiz after 11 PM local time",
      category: "time",
      icon_name: "Moon",
      icon_color: "#6366F1",
      requirement_type: "hour_after",
      requirement_value: { hour: 23 },
      rarity: "uncommon",
      created_at: "2024-01-01",
    };

    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("awards night-owl badge when current hour equals required hour (>= boundary)", async () => {
      vi.setSystemTime(new Date(2026, 3, 26, 23, 0, 0));

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([NIGHT_OWL_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("night-owl");
    });

    it("does not award night-owl badge when current hour is below required hour", async () => {
      vi.setSystemTime(new Date(2026, 3, 26, 22, 30, 0));

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([NIGHT_OWL_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  // Gap 2: hour_before strict-less-than boundary.

  describe("hour_before boundary (gap-2)", () => {
    const EARLY_BIRD_BADGE = {
      id: "early-bird",
      slug: "early-bird",
      name: "Early Bird",
      description: "Complete a quiz before 8 AM local time",
      category: "time",
      icon_name: "Sunrise",
      icon_color: "#FFD700",
      requirement_type: "hour_before",
      requirement_value: { hour: 8 },
      rarity: "uncommon",
      created_at: "2024-01-01",
    };

    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("does not award early-bird badge when current hour equals required hour (strict <)", async () => {
      vi.setSystemTime(new Date(2026, 3, 26, 8, 0, 0));

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([EARLY_BIRD_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(0);
    });

    it("does not award early-bird badge when current hour is above required hour", async () => {
      vi.setSystemTime(new Date(2026, 3, 26, 14, 0, 0));

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([EARLY_BIRD_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  // Gap 3: weekend_both_days on a weekday with no qualifying
  // history. The 5th quiz_sessions call (the weekend check)
  // returns no rows, so the DOW set stays empty.

  describe("weekend_both_days weekday no-history (gap-3)", () => {
    const WEEKEND_BADGE = {
      id: "weekend-warrior",
      slug: "weekend-warrior",
      name: "Weekend Warrior",
      description: "Play on both Saturday and Sunday in the same weekend",
      category: "weekend",
      icon_name: "Calendar",
      icon_color: "#00D1B2",
      requirement_type: "weekend_both_days",
      requirement_value: {},
      rarity: "uncommon",
      created_at: "2024-01-01",
    };

    beforeEach(() => {
      vi.useFakeTimers();
      // Wednesday April 22, 2026, noon local.
      vi.setSystemTime(new Date(2026, 3, 22, 12, 0, 0));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("does not award weekend badge on a weekday with no weekend sessions in window", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([WEEKEND_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  // Gap 4: joined_before strict-less-than boundary. Slug
  // verified against supabase/migrations/006_badges.sql:146
  // (og-player, threshold "2026-04-01").

  describe("joined_before boundary (gap-4)", () => {
    const OG_PLAYER_BADGE = {
      id: "og-player",
      slug: "og-player",
      name: "OG Player",
      description: "Joined OtakuQuiz in the first month",
      category: "special",
      icon_name: "Shield",
      icon_color: "#FF6B35",
      requirement_type: "joined_before",
      requirement_value: { date: "2026-04-01" },
      rarity: "epic",
      created_at: "2024-01-01",
    };

    it("awards og-player badge when user joined before threshold date", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([OG_PLAYER_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({
            current_streak: 0, longest_streak: 0, total_xp: 100,
            created_at: "2024-01-15T00:00:00Z",
          });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("og-player");
    });

    it("does not award og-player badge when joined date equals threshold (strict <)", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([OG_PLAYER_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({
            current_streak: 0, longest_streak: 0, total_xp: 100,
            created_at: "2026-04-01T00:00:00Z",
          });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(0);
    });

    it("does not award og-player badge when joined date is after threshold", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([OG_PLAYER_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({
            current_streak: 0, longest_streak: 0, total_xp: 100,
            created_at: "2026-06-15T00:00:00Z",
          });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({ userId: "user-1" }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  // Gap 5: duel_rivalry negative paths. Mock slug "rivalry"
  // matches the surrounding suite's existing rivalry test
  // (file convention; the migration's actual slug is
  // "duel-rivalry" in 010_duel_system.sql but that doesn't
  // affect the assertion since we only check length === 0).

  describe("duel_rivalry negative paths (gap-5)", () => {
    const RIVALRY_BADGE = {
      id: "rivalry",
      slug: "rivalry",
      name: "Rivalry",
      description: "Duel the same opponent 5 times",
      category: "duel",
      icon_name: "users",
      icon_color: "#E94560",
      requirement_type: "duel_rivalry",
      requirement_value: { count: 5 },
      rarity: "uncommon",
      created_at: "2024-01-01",
    };

    it("does not award rivalry badge when isDuel is false", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([RIVALRY_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        if (table === "duel_matches") return chain(null, 10);
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        duelOpponentId: "opp-1",
      }, mockSupabase);
      expect(result.length).toBe(0);
    });

    it("does not award rivalry badge when duelOpponentId is missing", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([RIVALRY_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        if (table === "duel_matches") return chain(null, 10);
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        isDuel: true,
      }, mockSupabase);
      expect(result.length).toBe(0);
    });

    it("does not award rivalry badge when duel_matches count is below required", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([RIVALRY_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        if (table === "duel_matches") return chain(null, 3);
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        isDuel: true,
        duelOpponentId: "opp-1",
      }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });

  // Gap 6: duel_perfect negative paths.

  describe("duel_perfect negative paths (gap-6)", () => {
    const PERFECT_DUEL_BADGE = {
      id: "perfect-duel",
      slug: "perfect-duel",
      name: "Perfect Duel",
      description: "Get every answer right in a duel",
      category: "duel",
      icon_name: "sparkles",
      icon_color: "#FFD93D",
      requirement_type: "duel_perfect",
      requirement_value: {},
      rarity: "epic",
      created_at: "2024-01-01",
    };

    it("does not award perfect-duel when quiz score is below total", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([PERFECT_DUEL_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        isDuel: true,
        quizScore: 9,
        quizTotal: 10,
      }, mockSupabase);
      expect(result.length).toBe(0);
    });

    it("does not award perfect-duel when quizScore is missing", async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") return chain([PERFECT_DUEL_BADGE]);
        if (table === "user_badges" && callCount <= 3) return chain([]);
        if (table === "user_profiles") {
          return chain({ current_streak: 0, longest_streak: 0, total_xp: 100, created_at: "2024-01-01" });
        }
        if (table === "quiz_sessions") return chain([], 0);
        if (table === "anime_series") return chain(null, 10);
        if (table === "league_history") return chain(null, 0);
        if (table === "league_memberships") return chain({ leagues: { tier: 1 } });
        if (table === "grand_prix_matches") return chain(null, 0);
        if (table === "grand_prix_tournaments") return chain(null, 0);
        if (table === "duel_stats") return chain({ wins: 0, giant_kills: 0, win_streak: 0, best_win_streak: 0 });
        return chain(null);
      });

      const result = await runBadgeChecks({
        userId: "user-1",
        isDuel: true,
        quizTotal: 10,
      }, mockSupabase);
      expect(result.length).toBe(0);
    });
  });
});
