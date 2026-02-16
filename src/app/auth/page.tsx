"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfileAfterSignup } from "./actions";
import AgeGate from "@/components/AgeGate";
import ParentConsentForm from "@/components/ParentConsentForm";
import type { AgeGroup } from "@/types";

type AuthStep = "age-gate" | "parent-consent" | "auth-form";
type AuthMode = "sign-in" | "sign-up";

const AuthPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshProfile, signOut } = useAuth();
  const supabase = createClient();

  const callbackError = searchParams.get("error");
  const isCompleteProfile = searchParams.get("complete_profile") === "true";

  const [step, setStep] = useState<AuthStep>(
    isCompleteProfile ? "age-gate" : "age-gate"
  );
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [ageData, setAgeData] = useState<{
    birthYear: number;
    ageGroup: AgeGroup;
    age: number;
  } | null>(null);
  const [parentEmail, setParentEmail] = useState("");
  const [oauthJuniorBlocked, setOauthJuniorBlocked] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isJunior = ageData?.ageGroup === "junior";

  const handleAgeConfirmed = async (data: {
    birthYear: number;
    ageGroup: AgeGroup;
    age: number;
  }) => {
    setAgeData(data);

    // OAuth user completing profile
    if (isCompleteProfile && user) {
      if (data.ageGroup === "junior") {
        // Juniors can't use OAuth — sign them out
        await signOut();
        setOauthJuniorBlocked(true);
        return;
      }

      // 13+ OAuth user: save age data and redirect
      setIsSubmitting(true);
      const result = await updateProfileAfterSignup({
        birthYear: data.birthYear,
        ageGroup: data.ageGroup,
      });
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      await refreshProfile();
      setIsSubmitting(false);
      router.push("/browse");
      return;
    }

    if (data.ageGroup === "junior") {
      setStep("parent-consent");
    } else {
      setStep("auth-form");
    }
  };

  const handleParentConsent = (email: string) => {
    setParentEmail(email);
    setStep("auth-form");
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    if (newMode === "sign-in") {
      setStep("auth-form");
    } else {
      setStep("age-gate");
      setAgeData(null);
      setParentEmail("");
    }
  };

  const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;

  const handleOAuthSignIn = async (
    provider: "google" | "apple" | "discord"
  ) => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setIsSubmitting(false);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsSubmitting(false);
          return;
        }

        // Update profile with age data
        if (ageData) {
          const result = await updateProfileAfterSignup({
            birthYear: ageData.birthYear,
            ageGroup: ageData.ageGroup,
            parentEmail: parentEmail || undefined,
            username: isJunior ? username : undefined,
          });
          if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
          }
        }

        await refreshProfile();
        router.push("/browse");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setIsSubmitting(false);
          return;
        }

        await refreshProfile();
        router.push("/browse");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneSendOtp = async () => {
    setError("");
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setOtpSent(true);
    setResendCooldown(60);

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otpCode,
      type: "sms",
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    if (mode === "sign-up" && ageData) {
      await updateProfileAfterSignup({
        birthYear: ageData.birthYear,
        ageGroup: ageData.ageGroup,
        parentEmail: parentEmail || undefined,
      });
    }

    await refreshProfile();
    setIsSubmitting(false);
    router.push("/browse");
  };

  // OAuth junior blocked message
  if (oauthJuniorBlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold mb-3">Junior Account Required</h2>
          <p className="text-white/60 mb-6">
            Junior accounts use email/password only for your safety. Please sign
            up with email instead.
          </p>
          <button
            onClick={() => {
              setOauthJuniorBlocked(false);
              setAgeData(null);
              setStep("age-gate");
              setMode("sign-up");
            }}
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Sign Up with Email
          </button>
        </motion.div>
      </div>
    );
  }

  // Age gate step (complete_profile for OAuth or normal sign-up)
  if (isCompleteProfile && user && step === "age-gate") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">One More Step!</h2>
          <p className="text-white/60">
            Tell us your age to personalize your experience
          </p>
        </div>
        <AgeGate onAgeConfirmed={handleAgeConfirmed} />
        {isSubmitting && (
          <p className="text-center text-white/50 mt-4">Saving...</p>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 mt-4">
            <p className="text-sm text-accent text-center">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Age gate step
  if (step === "age-gate" && mode === "sign-up") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <AgeGate onAgeConfirmed={handleAgeConfirmed} />
        <div className="text-center mt-8">
          <p className="text-sm text-white/50">
            Already have an account?{" "}
            <button
              onClick={() => handleModeSwitch("sign-in")}
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Parent consent step
  if (step === "parent-consent") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ParentConsentForm
          onConsent={handleParentConsent}
          onCancel={() => {
            setStep("age-gate");
            setAgeData(null);
          }}
        />
      </div>
    );
  }

  // Auth form step
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          {mode === "sign-in" ? "Welcome Back!" : "Create Account"}
        </h1>
        <p className="text-white/60 text-center mb-8">
          {mode === "sign-in"
            ? "Sign in to continue your quiz journey"
            : isJunior
              ? "Set up your Junior Otaku account"
              : "Join the anime trivia community"}
        </p>

        {/* Mode toggle */}
        <div className="flex rounded-xl bg-surface border border-white/10 p-1 mb-6">
          <button
            onClick={() => handleModeSwitch("sign-in")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              mode === "sign-in"
                ? "bg-primary text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleModeSwitch("sign-up")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              mode === "sign-up"
                ? "bg-primary text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {callbackError && (
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 mb-4">
            <p className="text-sm text-accent">
              Authentication failed. Please try again.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 mb-4">
            <p className="text-sm text-accent">{error}</p>
          </div>
        )}

        {/* OAuth buttons — hidden for junior */}
        {!isJunior && (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthSignIn("google")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors min-h-[44px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthSignIn("apple")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors min-h-[44px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>

            <button
              onClick={() => handleOAuthSignIn("discord")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#5865F2] text-white font-medium hover:bg-[#5865F2]/90 transition-colors min-h-[44px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Continue with Discord
            </button>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/40">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>
        )}

        {/* Email/password form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isJunior && mode === "sign-up" && (
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white/70 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/70 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/70 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {mode === "sign-up" && (
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-white/70 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* Phone OTP — hidden for junior */}
        {!isJunior && (
          <div className="mt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/40">or use phone</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {!otpSent ? (
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="flex-1 px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={handlePhoneSendOtp}
                  disabled={isSubmitting}
                  className="px-4 py-3 text-sm font-semibold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  Send Code
                </button>
              </div>
            ) : (
              <form onSubmit={handlePhoneVerifyOtp} className="space-y-3">
                <p className="text-sm text-white/60">
                  Enter the 6-digit code sent to {phone}
                </p>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors font-mono"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePhoneSendOtp}
                    disabled={resendCooldown > 0 || isSubmitting}
                    className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    {resendCooldown > 0
                      ? `Resend (${resendCooldown}s)`
                      : "Resend Code"}
                  </button>
                  <button
                    type="submit"
                    disabled={otpCode.length !== 6 || isSubmitting}
                    className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    Verify
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Toggle mode */}
        <p className="text-center text-sm text-white/50 mt-6">
          {mode === "sign-in" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => handleModeSwitch("sign-up")}
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => handleModeSwitch("sign-in")}
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

const AuthPage = () => (
  <Suspense>
    <AuthPageContent />
  </Suspense>
);

export default AuthPage;
