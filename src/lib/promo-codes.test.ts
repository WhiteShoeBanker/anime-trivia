import { describe, it, expect, vi, beforeEach } from "vitest";

// Track all calls to from() for assertion
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

import { redeemPromoCode } from "./promo-codes";

// Build a chainable mock resolving to the given data/error
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

describe("redeemPromoCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for empty code", async () => {
    const result = await redeemPromoCode("user-1", "   ");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Please enter a promo code.");
    }
  });

  it("returns error for invalid/unknown code", async () => {
    mockFrom.mockReturnValue(chain(null, { code: "PGRST116" }));

    const result = await redeemPromoCode("user-1", "FAKECODE");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Code not found. Please check and try again.");
    }
  });

  it("returns error for expired code", async () => {
    const pastDate = new Date("2023-01-01").toISOString();
    let callNum = 0;
    mockFrom.mockImplementation(() => {
      callNum++;
      if (callNum === 1) {
        // promo_codes lookup
        return chain({
          id: "promo-1",
          code: "EXPIRED",
          type: "pro_monthly",
          max_uses: 100,
          current_uses: 5,
          expires_at: pastDate,
          created_at: "2023-01-01",
        });
      }
      return chain(null);
    });

    const result = await redeemPromoCode("user-1", "EXPIRED");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("This code has expired.");
    }
  });

  it("returns error when code is maxed out", async () => {
    let callNum = 0;
    mockFrom.mockImplementation(() => {
      callNum++;
      if (callNum === 1) {
        return chain({
          id: "promo-2",
          code: "MAXEDOUT",
          type: "pro_monthly",
          max_uses: 10,
          current_uses: 10, // maxed
          expires_at: null,
          created_at: "2024-01-01",
        });
      }
      return chain(null);
    });

    const result = await redeemPromoCode("user-1", "MAXEDOUT");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("This code has already been fully redeemed.");
    }
  });

  it("returns error when user already redeemed code", async () => {
    let callNum = 0;
    mockFrom.mockImplementation(() => {
      callNum++;
      if (callNum === 1) {
        // promo_codes lookup
        return chain({
          id: "promo-3",
          code: "ALREADYUSED",
          type: "pro_monthly",
          max_uses: 100,
          current_uses: 5,
          expires_at: null,
          created_at: "2024-01-01",
        });
      }
      if (callNum === 2) {
        // promo_redemptions check — user already redeemed
        return chain({ id: "existing-redemption" });
      }
      return chain(null);
    });

    const result = await redeemPromoCode("user-1", "ALREADYUSED");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("You've already redeemed this code.");
    }
  });

  it("successfully redeems a valid monthly code", async () => {
    let callNum = 0;
    mockFrom.mockImplementation(() => {
      callNum++;
      if (callNum === 1) {
        // promo_codes lookup
        return chain({
          id: "promo-valid",
          code: "MONTHLY",
          type: "pro_monthly",
          max_uses: 100,
          current_uses: 5,
          expires_at: null,
          created_at: "2024-01-01",
        });
      }
      if (callNum === 2) {
        // promo_redemptions check — not redeemed
        return chain(null, { code: "PGRST116" });
      }
      // Remaining calls: insert redemption, update profile, update code
      return chain(null);
    });

    const result = await redeemPromoCode("user-1", "MONTHLY");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.type).toBe("pro_monthly");
      expect(result.expiresAt).toBeTruthy();
      // Check expiration is ~1 month from now
      const expires = new Date(result.expiresAt!);
      const now = new Date();
      const diffDays = (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(27);
      expect(diffDays).toBeLessThan(32);
    }
  });

  it("successfully redeems a valid yearly code", async () => {
    let callNum = 0;
    mockFrom.mockImplementation(() => {
      callNum++;
      if (callNum === 1) {
        return chain({
          id: "promo-yearly",
          code: "YEARLY",
          type: "pro_yearly",
          max_uses: 50,
          current_uses: 10,
          expires_at: null,
          created_at: "2024-01-01",
        });
      }
      if (callNum === 2) {
        return chain(null, { code: "PGRST116" });
      }
      return chain(null);
    });

    const result = await redeemPromoCode("user-1", "YEARLY");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.type).toBe("pro_yearly");
      expect(result.expiresAt).toBeTruthy();
      const expires = new Date(result.expiresAt!);
      const now = new Date();
      const diffDays = (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(360);
      expect(diffDays).toBeLessThan(370);
    }
  });

  it("successfully redeems a lifetime code with null expiration", async () => {
    let callNum = 0;
    mockFrom.mockImplementation(() => {
      callNum++;
      if (callNum === 1) {
        return chain({
          id: "promo-lifetime",
          code: "LIFETIME",
          type: "pro_lifetime",
          max_uses: 10,
          current_uses: 2,
          expires_at: null,
          created_at: "2024-01-01",
        });
      }
      if (callNum === 2) {
        return chain(null, { code: "PGRST116" });
      }
      return chain(null);
    });

    const result = await redeemPromoCode("user-1", "LIFETIME");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.type).toBe("pro_lifetime");
      expect(result.expiresAt).toBeNull();
    }
  });

  it("trims and uppercases the input code", async () => {
    let callNum = 0;
    mockFrom.mockImplementation(() => {
      callNum++;
      if (callNum === 1) {
        return chain({
          id: "promo-trim",
          code: "TRIMTEST",
          type: "pro_monthly",
          max_uses: 100,
          current_uses: 0,
          expires_at: null,
          created_at: "2024-01-01",
        });
      }
      if (callNum === 2) {
        return chain(null, { code: "PGRST116" });
      }
      return chain(null);
    });

    const result = await redeemPromoCode("user-1", "  trimtest  ");
    expect(result.success).toBe(true);
  });
});
