"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile, AgeGroup } from "@/types";

export interface SignOutResult {
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  ageGroup: AgeGroup;
  isJunior: boolean;
  signOut: () => Promise<SignOutResult>;
  forceSignOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// 8s cap on refreshProfile so callers (redeem, badges, profile) cannot hang.
// Picked > P99 Supabase round-trip, < a user's patience.
const REFRESH_TIMEOUT_MS = 8000;

const isAbortError = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const e = err as { name?: string; code?: string; message?: string };
  return (
    e.name === "AbortError" ||
    e.code === "20" ||
    (typeof e.message === "string" && e.message.includes("aborted"))
  );
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isLoading: true,
  ageGroup: "full",
  isJunior: false,
  signOut: async () => ({}),
  forceSignOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  // Monotonic counter — every fetchProfile captures the current value at start
  // and drops its result if a newer fetch (or auth event) has bumped it.
  // Prevents stale fetches for User A from clobbering state once User B is in.
  const requestIdRef = useRef(0);

  // Mirror of `user` for use inside callbacks (refreshProfile, auth listener)
  // without making them depend on `user` and re-run the subscription.
  const userRef = useRef<User | null>(null);
  const setUserSynced = useCallback((u: User | null) => {
    userRef.current = u;
    setUser(u);
  }, []);

  const fetchProfile = useCallback(async (userId: string | null) => {
    const requestId = ++requestIdRef.current;

    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabaseRef.current
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // A newer fetch (or sign-out) has started since we kicked off — drop.
      if (requestId !== requestIdRef.current) return;

      if (error) {
        if (isAbortError(error)) return;
        console.error("[AuthContext] fetchProfile failed:", error);
        setProfile(null);
        return;
      }
      setProfile((data as UserProfile | null) ?? null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (isAbortError(err)) return;
      console.error("[AuthContext] fetchProfile threw:", err);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const userId = userRef.current?.id;
    if (!userId) return;
    // Bounded — if Supabase hangs, callers (redeem page, etc.) still resolve.
    await Promise.race([
      fetchProfile(userId),
      new Promise<void>((resolve) => setTimeout(resolve, REFRESH_TIMEOUT_MS)),
    ]);
  }, [fetchProfile]);

  const signOut = useCallback(async (): Promise<SignOutResult> => {
    try {
      const { error } = await supabaseRef.current.auth.signOut();
      if (error) {
        // Do NOT clear local state — cookies may still be valid server-side.
        // Surface the error so the caller can offer a retry / force-sign-out.
        return { error: error.message };
      }
      // Successful sign-out emits SIGNED_OUT, which clears state in the
      // listener. Don't pre-clear — that creates a brief inconsistent UI.
      return {};
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Sign out failed",
      };
    }
  }, []);

  // Last-resort sign-out: invalidate the session locally (nukes the cookies
  // even if the server call hangs) and hard-reload to drop all React state.
  const forceSignOut = useCallback(async (): Promise<void> => {
    try {
      await Promise.race([
        supabaseRef.current.auth.signOut({ scope: "local" }),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch {
      // Still going to hard-reload below.
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUserSynced(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUserSynced(null);
          setProfile(null);
        }
      } catch {
        // Auth not available — leave state as null.
      }
      if (mounted) setIsLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Bump the request counter on EVERY auth event. Any in-flight
      // fetchProfile will see a newer requestId and drop its result.
      // This is what guarantees A → B switches don't show A's profile.
      requestIdRef.current++;

      if (event === "SIGNED_OUT" || !session?.user) {
        setUserSynced(null);
        setProfile(null);
        return;
      }

      const prevUserId = userRef.current?.id;
      const nextUserId = session.user.id;

      // User identity changed → wipe the stale profile immediately so the UI
      // never displays B's user paired with A's profile data, even for a tick.
      if (prevUserId !== nextUserId) {
        setProfile(null);
      }

      setUserSynced(session.user);
      // Fire-and-forget; race-safe via the requestId we just bumped.
      void fetchProfile(nextUserId);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, setUserSynced]);

  const ageGroup: AgeGroup = profile?.age_group ?? "full";
  const isJunior = ageGroup === "junior";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        ageGroup,
        isJunior,
        signOut,
        forceSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
