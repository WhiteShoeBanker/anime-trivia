import { describe, it, expect, vi, beforeEach } from "vitest";

// The client is a thin wrapper over supabase.rpc('redeem_promo_code', ...).
// We mock at the network boundary (rpc) — per spec, we do NOT attempt to
// reimplement or mock the Postgres function's logic in JS. Behavior of the
// function itself is covered by supabase/tests/017_promo_redeem.test.sql.

// vi.mock is hoisted above `const` declarations, so the mock factory
// cannot close over module-scope vars. Use vi.hoisted to share refs.
const { mockRpc, mockGetUser, mockTrack } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockGetUser: vi.fn(),
  mockTrack: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    rpc: mockRpc,
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock("@/lib/track-actions", () => ({
  trackPromoCodeRedeemed: mockTrack,
}));

import { redeemPromoCode } from "./promo-codes";

describe("redeemPromoCode — client wrapper over RPC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null } });
  });

  describe("pre-RPC validation", () => {
    it("rejects empty input without calling the RPC", async () => {
      const result = await redeemPromoCode("   ");
      expect(result.success).toBe(false);
      expect(mockRpc).not.toHaveBeenCalled();
      if (!result.success) {
        expect(result.errorCode).toBe("invalid");
        expect(result.error).toBe("Please enter a promo code.");
      }
    });
  });

  describe("RPC request shape", () => {
    it("trims whitespace but passes the user's casing through to the RPC (the DB normalizes)", async () => {
      mockRpc.mockResolvedValue({
        data: {
          success: true,
          tier: "pro_monthly",
          code_id: "abc",
          expires_at: "2026-05-20T00:00:00Z",
        },
        error: null,
      });

      await redeemPromoCode("  otaku-abcd-efgh  ");

      expect(mockRpc).toHaveBeenCalledWith("redeem_promo_code", {
        p_code: "otaku-abcd-efgh",
      });
    });
  });

  describe("error_code → user message mapping", () => {
    const cases: [string, string, string][] = [
      ["invalid", "invalid", "That code isn't valid. Please check and try again."],
      ["expired", "expired", "This code has expired."],
      ["exhausted", "exhausted", "This code has already been fully redeemed."],
      [
        "already_redeemed",
        "already_redeemed",
        "You've already redeemed this code.",
      ],
      [
        "already_pro",
        "already_pro",
        "You already have Pro — no need to redeem.",
      ],
      [
        "unauthenticated",
        "unauthenticated",
        "Please sign in to redeem a code.",
      ],
    ];

    it.each(cases)(
      "error_code=%s surfaces the right user message",
      async (_label, errorCode, expectedMessage) => {
        mockRpc.mockResolvedValue({
          data: { success: false, error_code: errorCode },
          error: null,
        });

        const result = await redeemPromoCode("SOMECODE");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errorCode).toBe(errorCode);
          expect(result.error).toBe(expectedMessage);
        }
      }
    );

    it("network/RPC error → internal message", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "db unreachable" },
      });
      const result = await redeemPromoCode("SOMECODE");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("internal");
        expect(result.error).toBe("Something went wrong. Please try again.");
      }
    });

    it("unknown error_code from future DB version → falls back to internal message", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error_code: "some_future_code" },
        error: null,
      });
      const result = await redeemPromoCode("SOMECODE");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Something went wrong. Please try again.");
      }
    });
  });

  describe("success path", () => {
    it("surfaces tier and expires_at from the RPC payload", async () => {
      mockRpc.mockResolvedValue({
        data: {
          success: true,
          tier: "pro_yearly",
          code_id: "code-uuid-1",
          expires_at: "2027-04-20T00:00:00.000Z",
        },
        error: null,
      });

      const result = await redeemPromoCode("GOODCODE");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.type).toBe("pro_yearly");
        expect(result.expiresAt).toBe("2027-04-20T00:00:00.000Z");
      }
    });

    it("lifetime: expires_at is null", async () => {
      mockRpc.mockResolvedValue({
        data: {
          success: true,
          tier: "pro_lifetime",
          code_id: "code-uuid-2",
          expires_at: null,
        },
        error: null,
      });

      const result = await redeemPromoCode("LIFETIME");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.expiresAt).toBeNull();
      }
    });

    it("fires analytics on success, using session userId (not a client-supplied one)", async () => {
      mockRpc.mockResolvedValue({
        data: {
          success: true,
          tier: "pro_monthly",
          code_id: "code-uuid-3",
          expires_at: "2026-05-20T00:00:00Z",
        },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: { id: "session-user-99" } },
      });

      await redeemPromoCode("GOOD");
      // Analytics is fire-and-forget — wait a microtask for the .then() chain
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockTrack).toHaveBeenCalledWith("session-user-99", {
        code_type: "pro_monthly",
        code_id: "code-uuid-3",
      });
    });

    it("does not fire analytics when no session user is present", async () => {
      mockRpc.mockResolvedValue({
        data: {
          success: true,
          tier: "pro_monthly",
          code_id: "code-uuid-4",
          expires_at: null,
        },
        error: null,
      });
      mockGetUser.mockResolvedValue({ data: { user: null } });

      await redeemPromoCode("GOOD");
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockTrack).not.toHaveBeenCalled();
    });

    it("analytics failure does not affect the returned result", async () => {
      mockRpc.mockResolvedValue({
        data: {
          success: true,
          tier: "pro_lifetime",
          code_id: "code-uuid-5",
          expires_at: null,
        },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-99" } },
      });
      mockTrack.mockRejectedValueOnce(new Error("analytics down"));

      const result = await redeemPromoCode("GOOD");
      expect(result.success).toBe(true);
    });
  });
});
