import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

// Mock the Supabase client BEFORE importing AuthContext.

type AuthEvent =
  | "INITIAL_SESSION"
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED";

interface MockSession {
  user: { id: string };
}

type AuthListener = (event: AuthEvent, session: MockSession | null) => void;

const mockState = {
  session: null as MockSession | null,
  signOutImpl: vi.fn(async () => ({ error: null as { message: string } | null })),
  // Profile fetch is a function so each test can control timing/payload.
  profileFetchImpl: vi.fn(async (userId: string) => ({
    data: { id: userId, age_group: "full" } as Record<string, unknown> | null,
    error: null as { message?: string } | null,
  })),
  listeners: new Set<AuthListener>(),
};

const fireAuth = (event: AuthEvent, session: MockSession | null) => {
  mockState.session = session;
  for (const fn of Array.from(mockState.listeners)) {
    fn(event, session);
  }
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn(async () => ({ data: { session: mockState.session } })),
      signOut: (...args: unknown[]) => mockState.signOutImpl(...(args as [])),
      onAuthStateChange: (cb: AuthListener) => {
        mockState.listeners.add(cb);
        return {
          data: {
            subscription: {
              unsubscribe: () => mockState.listeners.delete(cb),
            },
          },
        };
      },
    },
    from: () => ({
      select: () => ({
        eq: (_col: string, value: string) => ({
          maybeSingle: () => mockState.profileFetchImpl(value),
        }),
      }),
    }),
  }),
}));

import { AuthProvider, useAuth } from "./AuthContext";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const flush = () => act(async () => {});

beforeEach(() => {
  mockState.session = null;
  mockState.listeners.clear();
  mockState.signOutImpl = vi.fn(async () => ({ error: null }));
  mockState.profileFetchImpl = vi.fn(async (userId: string) => ({
    data: { id: userId, age_group: "full" },
    error: null,
  }));
  // Suppress console.error noise from intentional failure tests.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AuthContext", () => {
  it("login success: profile is fetched and exposed", async () => {
    mockState.session = { user: { id: "user-A" } };
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user?.id).toBe("user-A");
    expect(result.current.profile?.id).toBe("user-A");
  });

  it("logout success: state clears via SIGNED_OUT event", async () => {
    mockState.session = { user: { id: "user-A" } };
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe("user-A"));

    let signOutResult: { error?: string } | undefined;
    await act(async () => {
      signOutResult = await result.current.signOut();
      // Real Supabase fires SIGNED_OUT after signOut resolves; emulate it.
      fireAuth("SIGNED_OUT", null);
    });

    expect(signOutResult).toEqual({});
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it("logout server failure: state is NOT cleared, error is surfaced", async () => {
    mockState.session = { user: { id: "user-A" } };
    mockState.signOutImpl = vi.fn(async () => ({
      error: { message: "Network is down" },
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe("user-A"));

    let signOutResult: { error?: string } | undefined;
    await act(async () => {
      signOutResult = await result.current.signOut();
    });

    expect(signOutResult?.error).toBe("Network is down");
    // Critical: do NOT pretend the user is logged out when cookies may
    // still be valid server-side.
    expect(result.current.user?.id).toBe("user-A");
    expect(result.current.profile?.id).toBe("user-A");
  });

  it("page mount while authenticated: state matches server", async () => {
    mockState.session = { user: { id: "user-A" } };
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user?.id).toBe("user-A");
    expect(result.current.profile?.id).toBe("user-A");
  });

  it("page mount while unauthenticated: no spurious profile fetch", async () => {
    mockState.session = null;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(mockState.profileFetchImpl).not.toHaveBeenCalled();
  });

  it("late async response is dropped when a newer fetch has started", async () => {
    // Slow first fetch, fast second fetch — second arrives first.
    let resolveSlow: ((v: unknown) => void) | null = null;

    mockState.profileFetchImpl = vi.fn((userId: string) => {
      if (userId === "user-A") {
        return new Promise((resolve) => {
          resolveSlow = resolve as typeof resolveSlow;
        });
      }
      return Promise.resolve({
        data: { id: userId, age_group: "full" as const },
        error: null,
      });
    }) as typeof mockState.profileFetchImpl;

    mockState.session = { user: { id: "user-A" } };
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flush();

    // While A's fetch is in-flight, switch to B.
    await act(async () => {
      fireAuth("SIGNED_IN", { user: { id: "user-B" } });
    });

    await waitFor(() => expect(result.current.profile?.id).toBe("user-B"));

    // Now resolve A's fetch — it should be DROPPED.
    await act(async () => {
      resolveSlow?.({
        data: { id: "user-A", age_group: "full" },
        error: null,
      });
      await flush();
    });

    expect(result.current.user?.id).toBe("user-B");
    expect(result.current.profile?.id).toBe("user-B");
  });

  it("USER SWITCH: A logs out, B logs in within ms — never mixes A's profile with B's user", async () => {
    mockState.session = { user: { id: "user-A" } };
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.profile?.id).toBe("user-A"));

    // Slow profile for B so we can observe the in-between state.
    let resolveB: ((v: unknown) => void) | null = null;
    mockState.profileFetchImpl = vi.fn((userId: string) => {
      if (userId === "user-B") {
        return new Promise((resolve) => {
          resolveB = resolve as typeof resolveB;
        });
      }
      return Promise.resolve({
        data: { id: userId, age_group: "full" as const },
        error: null,
      });
    }) as typeof mockState.profileFetchImpl;

    await act(async () => {
      fireAuth("SIGNED_OUT", null);
      fireAuth("SIGNED_IN", { user: { id: "user-B" } });
    });

    // Before B's profile arrives, profile must NOT be A's. Either null or B's.
    expect(result.current.user?.id).toBe("user-B");
    expect(result.current.profile?.id).not.toBe("user-A");

    await act(async () => {
      resolveB?.({
        data: { id: "user-B", age_group: "teen" },
        error: null,
      });
      await flush();
    });

    expect(result.current.user?.id).toBe("user-B");
    expect(result.current.profile?.id).toBe("user-B");
  });

  it("TOKEN_REFRESHED during in-flight fetch: latest write wins", async () => {
    let resolveFirst: ((v: unknown) => void) | null = null;
    let calls = 0;
    mockState.profileFetchImpl = vi.fn((userId: string) => {
      calls += 1;
      if (calls === 1) {
        return new Promise((resolve) => {
          resolveFirst = resolve as typeof resolveFirst;
        });
      }
      return Promise.resolve({
        data: { id: userId, age_group: "full" as const, total_xp: 999 },
        error: null,
      });
    }) as typeof mockState.profileFetchImpl;

    mockState.session = { user: { id: "user-A" } };
    const { result } = renderHook(() => useAuth(), { wrapper });
    await flush();

    // Fire TOKEN_REFRESHED while first fetch is still pending.
    await act(async () => {
      fireAuth("TOKEN_REFRESHED", { user: { id: "user-A" } });
    });

    await waitFor(() =>
      expect(
        (result.current.profile as { total_xp?: number } | null)?.total_xp,
      ).toBe(999),
    );

    // Now resolve the OLD fetch with stale data — must NOT clobber.
    await act(async () => {
      resolveFirst?.({
        data: { id: "user-A", age_group: "full", total_xp: 0 },
        error: null,
      });
      await flush();
    });

    expect(
      (result.current.profile as { total_xp?: number } | null)?.total_xp,
    ).toBe(999);
  });

  it("refreshProfile: returns within bounded time even if fetch hangs forever", async () => {
    mockState.session = { user: { id: "user-A" } };
    // Initial fetch resolves; subsequent fetches (the refreshProfile call)
    // hang forever. Without the internal timeout, refreshProfile would
    // never resolve.
    let initialDone = false;
    mockState.profileFetchImpl = vi.fn(() => {
      if (!initialDone) {
        initialDone = true;
        return Promise.resolve({
          data: { id: "user-A", age_group: "full" as const },
          error: null,
        });
      }
      return new Promise(() => {}); // hang forever
    }) as typeof mockState.profileFetchImpl;

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe("user-A"));

    // Switch to fake timers AFTER mount has settled, so waitFor's real
    // setTimeout-based polling above isn't affected. The internal 8s timeout
    // in refreshProfile() is the only setTimeout we now need to advance.
    vi.useFakeTimers();
    try {
      let settled = false;
      const refreshPromise = act(async () => {
        await result.current.refreshProfile();
        settled = true;
      });

      await vi.advanceTimersByTimeAsync(9000);
      await refreshPromise;

      expect(settled).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("F5 reload mid-auth: state matches server-reported session", async () => {
    // Simulate server has User A's session. Fresh mount.
    mockState.session = { user: { id: "user-A" } };
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user?.id).toBe("user-A");
    expect(result.current.profile?.id).toBe("user-A");
  });

  it("does not leak across re-renders or remounts", async () => {
    mockState.session = { user: { id: "user-A" } };
    const { unmount } = render(
      <AuthProvider>
        <div>x</div>
      </AuthProvider>,
    );
    await flush();
    unmount();
    expect(mockState.listeners.size).toBe(0);
  });
});
