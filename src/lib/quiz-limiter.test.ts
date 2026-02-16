import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

import { checkQuizLimit, incrementQuizCount } from "./quiz-limiter";

const chain = (resolvedData: unknown) => {
  const builder: Record<string, unknown> = {};
  const proxy: unknown = new Proxy(builder, {
    get(_t, prop: string) {
      if (prop === "then") {
        return (resolve: (v: unknown) => void) =>
          resolve({ data: resolvedData, error: null });
      }
      if (!builder[prop]) {
        builder[prop] = vi.fn().mockReturnValue(proxy);
      }
      return builder[prop];
    },
  });
  return proxy;
};

describe("checkQuizLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows free users under the 10 quiz limit", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockFrom.mockReturnValue(
      chain({
        subscription_tier: "free",
        daily_quiz_count: 5,
        daily_quiz_reset: today,
      })
    );

    const result = await checkQuizLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.count).toBe(5);
    expect(result.limit).toBe(10);
  });

  it("blocks free users at 10 quizzes", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockFrom.mockReturnValue(
      chain({
        subscription_tier: "free",
        daily_quiz_count: 10,
        daily_quiz_reset: today,
      })
    );

    const result = await checkQuizLimit("user-1");
    expect(result.allowed).toBe(false);
    expect(result.count).toBe(10);
    expect(result.limit).toBe(10);
  });

  it("allows pro users unlimited quizzes", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockFrom.mockReturnValue(
      chain({
        subscription_tier: "pro",
        daily_quiz_count: 50,
        daily_quiz_reset: today,
      })
    );

    const result = await checkQuizLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.count).toBe(50);
    expect(result.limit).toBe(Infinity);
  });

  it("resets count to 0 when reset date is not today", async () => {
    mockFrom.mockReturnValue(
      chain({
        subscription_tier: "free",
        daily_quiz_count: 10,
        daily_quiz_reset: "2024-01-01", // old date
      })
    );

    const result = await checkQuizLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.count).toBe(0); // reset because different day
    expect(result.limit).toBe(10);
  });

  it("returns not allowed when profile fetch fails", async () => {
    const builder: Record<string, unknown> = {};
    const proxy: unknown = new Proxy(builder, {
      get(_t, prop: string) {
        if (prop === "then") {
          return (resolve: (v: unknown) => void) =>
            resolve({ data: null, error: { message: "Not found" } });
        }
        if (!builder[prop]) {
          builder[prop] = vi.fn().mockReturnValue(proxy);
        }
        return builder[prop];
      },
    });
    mockFrom.mockReturnValue(proxy);

    const result = await checkQuizLimit("nonexistent");
    expect(result.allowed).toBe(false);
    expect(result.count).toBe(0);
    expect(result.limit).toBe(10);
  });
});

describe("incrementQuizCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("increments count on same day", async () => {
    const today = new Date().toISOString().split("T")[0];
    const updateFn = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "user_profiles") {
        const selectChain: Record<string, unknown> = {};
        const proxy: unknown = new Proxy(selectChain, {
          get(_t, prop: string) {
            if (prop === "then") {
              return (resolve: (v: unknown) => void) =>
                resolve({
                  data: { daily_quiz_count: 3, daily_quiz_reset: today },
                  error: null,
                });
            }
            if (prop === "update") return updateFn;
            if (!selectChain[prop]) {
              selectChain[prop] = vi.fn().mockReturnValue(proxy);
            }
            return selectChain[prop];
          },
        });
        return proxy;
      }
      return chain(null);
    });

    await incrementQuizCount("user-1");
    // Verify update was called (incremented from 3 to 4)
    expect(updateFn).toHaveBeenCalledWith({
      daily_quiz_count: 4,
      daily_quiz_reset: today,
    });
  });
});
