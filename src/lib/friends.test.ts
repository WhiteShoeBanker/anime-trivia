import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

// Mock league-xp (imported by duels.ts)
vi.mock("@/lib/league-xp", () => ({
  getUserLeagueInfo: vi.fn(),
  getCurrentWeekStart: vi.fn().mockReturnValue("2026-02-09"),
  updateLeagueMembershipXp: vi.fn(),
}));

vi.mock("@/lib/scoring", () => ({
  calculateQuestionXP: vi.fn().mockReturnValue(25),
}));

vi.mock("@/lib/badges", () => ({
  checkAndAwardBadges: vi.fn().mockResolvedValue([]),
}));

import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriends,
  getPendingFriendRequests,
  getHeadToHeadMap,
  JuniorBlockedError,
} from "./duels";

const chain = (resolvedData: unknown, error?: unknown) => {
  const builder: Record<string, unknown> = {};
  const proxy: unknown = new Proxy(builder, {
    get(_t, prop: string) {
      if (prop === "then") {
        return (resolve: (v: unknown) => void) =>
          resolve({ data: resolvedData, error: error ?? null });
      }
      if (!builder[prop]) {
        builder[prop] = vi.fn().mockReturnValue(proxy);
      }
      return builder[prop];
    },
  });
  return proxy;
};

describe("Friend System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── sendFriendRequest ──────────────────────────────────────

  describe("sendFriendRequest", () => {
    it("creates a pending friendship when no prior relationship exists", async () => {
      let callNum = 0;
      let insertedData: unknown = null;

      mockFrom.mockImplementation(() => {
        callNum++;
        if (callNum === 1) {
          // Check for existing friendship → not found
          return chain(null, { code: "PGRST116" });
        }
        // Insert new friendship
        const builder: Record<string, unknown> = {};
        const proxy: unknown = new Proxy(builder, {
          get(_t, prop: string) {
            if (prop === "then") {
              return (resolve: (v: unknown) => void) =>
                resolve({ data: null, error: null });
            }
            if (prop === "insert") {
              return (data: unknown) => {
                insertedData = data;
                return proxy;
              };
            }
            if (!builder[prop]) {
              builder[prop] = vi.fn().mockReturnValue(proxy);
            }
            return builder[prop];
          },
        });
        return proxy;
      });

      const result = await sendFriendRequest("user-a", "user-b");
      expect(result).toBe(true);
      expect(insertedData).toEqual({
        requester_id: "user-a",
        recipient_id: "user-b",
        status: "pending",
      });
    });

    it("returns false when friendship already exists (duplicate)", async () => {
      mockFrom.mockImplementation(() => {
        // Existing friendship found
        return chain({ id: "existing-friendship", status: "accepted" });
      });

      const result = await sendFriendRequest("user-a", "user-b");
      expect(result).toBe(false);
    });
  });

  // ── acceptFriendRequest ────────────────────────────────────

  describe("acceptFriendRequest", () => {
    it("updates status to accepted for the recipient", async () => {
      let updatedWith: unknown = null;

      mockFrom.mockImplementation(() => {
        const builder: Record<string, unknown> = {};
        const proxy: unknown = new Proxy(builder, {
          get(_t, prop: string) {
            if (prop === "then") {
              return (resolve: (v: unknown) => void) =>
                resolve({ data: null, error: null });
            }
            if (prop === "update") {
              return (data: unknown) => {
                updatedWith = data;
                return proxy;
              };
            }
            if (!builder[prop]) {
              builder[prop] = vi.fn().mockReturnValue(proxy);
            }
            return builder[prop];
          },
        });
        return proxy;
      });

      const result = await acceptFriendRequest("friendship-1", "user-b");
      expect(result).toBe(true);
      expect(updatedWith).toEqual({ status: "accepted" });
    });

    it("returns true even if no row matched (Supabase returns no error)", async () => {
      mockFrom.mockImplementation(() => {
        const builder: Record<string, unknown> = {};
        const proxy: unknown = new Proxy(builder, {
          get(_t, prop: string) {
            if (prop === "then") {
              return (resolve: (v: unknown) => void) =>
                resolve({ data: null, error: null }); // no error
            }
            if (prop === "update") {
              return () => proxy;
            }
            if (!builder[prop]) {
              builder[prop] = vi.fn().mockReturnValue(proxy);
            }
            return builder[prop];
          },
        });
        return proxy;
      });

      const result = await acceptFriendRequest("friendship-1", "wrong-user");
      expect(result).toBe(true); // no error from Supabase
    });
  });

  // ── removeFriend ──────────────────────────────────────────

  describe("removeFriend", () => {
    it("deletes the friendship row", async () => {
      let deleteCalled = false;

      mockFrom.mockImplementation(() => {
        const builder: Record<string, unknown> = {};
        const proxy: unknown = new Proxy(builder, {
          get(_t, prop: string) {
            if (prop === "then") {
              return (resolve: (v: unknown) => void) =>
                resolve({ data: null, error: null });
            }
            if (prop === "delete") {
              deleteCalled = true;
              return () => proxy;
            }
            if (!builder[prop]) {
              builder[prop] = vi.fn().mockReturnValue(proxy);
            }
            return builder[prop];
          },
        });
        return proxy;
      });

      const result = await removeFriend("friendship-1", "user-a");
      expect(result).toBe(true);
      expect(deleteCalled).toBe(true);
    });

    it("returns false when deletion errors", async () => {
      mockFrom.mockImplementation(() => {
        const builder: Record<string, unknown> = {};
        const proxy: unknown = new Proxy(builder, {
          get(_t, prop: string) {
            if (prop === "then") {
              return (resolve: (v: unknown) => void) =>
                resolve({ data: null, error: { message: "Delete failed" } });
            }
            if (prop === "delete") {
              return () => proxy;
            }
            if (!builder[prop]) {
              builder[prop] = vi.fn().mockReturnValue(proxy);
            }
            return builder[prop];
          },
        });
        return proxy;
      });

      const result = await removeFriend("friendship-1", "user-a");
      expect(result).toBe(false);
    });
  });

  // ── COPPA age-gate: backend must reject juniors ──────────────
  // Defense-in-depth for the UI filter on src/app/duels/page.tsx. Without
  // this, a junior bypassing the client (devtools, direct fetch) would
  // interact with the friend graph. Each of the six exported friend
  // functions must throw JuniorBlockedError when the caller's age_group
  // is "junior", and proceed normally for "teen" / "full".

  describe("junior age-gate (COPPA)", () => {
    const mockAgeGroup = (ageGroup: string) => {
      mockFrom.mockImplementation(() => chain({ age_group: ageGroup }));
    };

    it("sendFriendRequest rejects a junior caller", async () => {
      mockAgeGroup("junior");
      await expect(sendFriendRequest("junior-user", "friend-b")).rejects.toBeInstanceOf(
        JuniorBlockedError
      );
    });

    it("acceptFriendRequest rejects a junior caller", async () => {
      mockAgeGroup("junior");
      await expect(acceptFriendRequest("friendship-1", "junior-user")).rejects.toBeInstanceOf(
        JuniorBlockedError
      );
    });

    it("removeFriend rejects a junior caller", async () => {
      mockAgeGroup("junior");
      await expect(removeFriend("friendship-1", "junior-user")).rejects.toBeInstanceOf(
        JuniorBlockedError
      );
    });

    it("getFriends rejects a junior caller", async () => {
      mockAgeGroup("junior");
      await expect(getFriends("junior-user")).rejects.toBeInstanceOf(JuniorBlockedError);
    });

    it("getPendingFriendRequests rejects a junior caller", async () => {
      mockAgeGroup("junior");
      await expect(getPendingFriendRequests("junior-user")).rejects.toBeInstanceOf(
        JuniorBlockedError
      );
    });

    it("getHeadToHeadMap rejects a junior caller", async () => {
      mockAgeGroup("junior");
      await expect(
        getHeadToHeadMap("junior-user", ["opp-1"])
      ).rejects.toBeInstanceOf(JuniorBlockedError);
    });

    it("getFriends allows a teen caller (no throw)", async () => {
      // age_group check returns "teen", then the actual friendships query
      // resolves to empty. getFriends should complete normally.
      let call = 0;
      mockFrom.mockImplementation(() => {
        call++;
        if (call === 1) return chain({ age_group: "teen" });
        return chain([]);
      });
      await expect(getFriends("teen-user")).resolves.toEqual([]);
    });

    it("sendFriendRequest allows a full caller (no throw)", async () => {
      let call = 0;
      let insertedData: unknown = null;
      mockFrom.mockImplementation(() => {
        call++;
        if (call === 1) return chain({ age_group: "full" }); // age-gate
        if (call === 2) return chain(null, { code: "PGRST116" }); // existence check: not found
        // insert path
        const builder: Record<string, unknown> = {};
        const proxy: unknown = new Proxy(builder, {
          get(_t, prop: string) {
            if (prop === "then") {
              return (resolve: (v: unknown) => void) =>
                resolve({ data: null, error: null });
            }
            if (prop === "insert") {
              return (data: unknown) => {
                insertedData = data;
                return proxy;
              };
            }
            if (!builder[prop]) {
              builder[prop] = vi.fn().mockReturnValue(proxy);
            }
            return builder[prop];
          },
        });
        return proxy;
      });
      const result = await sendFriendRequest("full-user", "friend-b");
      expect(result).toBe(true);
      expect(insertedData).toEqual({
        requester_id: "full-user",
        recipient_id: "friend-b",
        status: "pending",
      });
    });
  });
});
