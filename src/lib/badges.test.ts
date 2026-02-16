import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase before importing badges module
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

import { checkAndAwardBadges } from "./badges";

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

describe("checkAndAwardBadges", () => {
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

      const result = await checkAndAwardBadges({ userId: "user-1" });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(badgeId);
    });
  });

  // ── Weekend Hero ──────────────────────────────────────────

  describe("weekend hero badge", () => {
    it("awards on weekend days (Saturday or Sunday)", async () => {
      const now = new Date();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === "badges") {
          return chain([
            {
              id: "weekend-hero",
              slug: "weekend-hero",
              name: "Weekend Hero",
              description: "Play on both Saturday and Sunday",
              category: "weekend",
              icon_name: "calendar",
              icon_color: "#00D1B2",
              requirement_type: "weekend_both_days",
              requirement_value: {},
              rarity: "uncommon",
              created_at: "2024-01-01",
            },
          ]);
        }
        if (table === "user_badges" && callCount <= 3) {
          return chain([]);
        }
        if (table === "user_profiles") {
          return chain({
            current_streak: 1, longest_streak: 1, total_xp: 100, created_at: "2024-01-01",
          });
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

      const result = await checkAndAwardBadges({ userId: "user-1" });
      if (isWeekend) {
        expect(result.length).toBe(1);
      } else {
        expect(result.length).toBe(0);
      }
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

      const result = await checkAndAwardBadges({ userId: "user-1" });
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

      const result = await checkAndAwardBadges({
        userId: "user-1",
        quizScore: 9,
        quizTotal: 10,
        difficulty: "hard",
      });
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

      const result = await checkAndAwardBadges({
        userId: "user-1",
        quizScore: 10,
        quizTotal: 10,
        difficulty: "easy", // not hard
      });
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

      const result = await checkAndAwardBadges({ userId: "user-1", isDuel: true });
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

      const result = await checkAndAwardBadges({ userId: "user-1", isDuel: true });
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

      const result = await checkAndAwardBadges({ userId: "user-1", isDuel: true });
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

      const result = await checkAndAwardBadges({
        userId: "user-1",
        isDuel: true,
        quizScore: 10,
        quizTotal: 10,
      });
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

      const result = await checkAndAwardBadges({
        userId: "user-1",
        isDuel: false, // not a duel
        quizScore: 10,
        quizTotal: 10,
      });
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

      const result = await checkAndAwardBadges({
        userId: "user-1",
        isDuel: true,
        duelOpponentId: "opponent-1",
      });
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe("rivalry");
    });

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

      const result = await checkAndAwardBadges({ userId: "user-1", isDuel: true });
      expect(result.length).toBe(0);
    });
  });
});
