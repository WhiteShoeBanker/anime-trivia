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

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  ageGroup: AgeGroup;
  isJunior: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isLoading: true,
  ageGroup: "full",
  isJunior: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabaseRef.current
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        // Surface the failure so pages gated on profile (Pro badge, Pro stats)
        // can be diagnosed in devtools instead of silently rendering the
        // free-tier view.
        console.error("[AuthContext] fetchProfile failed:", error);
        setProfile(null);
        return;
      }
      setProfile((data as UserProfile | null) ?? null);
    } catch (err) {
      console.error("[AuthContext] fetchProfile threw:", err);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabaseRef.current.auth.signOut();
    } catch {
      // Sign-out network/API failure — still clear local state below
    }
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch {
        // Auth not available
      }
      setIsLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED" ||
          event === "INITIAL_SESSION") &&
        session?.user
      ) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

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
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
