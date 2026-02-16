"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Gift, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { redeemPromoCode } from "@/lib/promo-codes";
import type { PromoCodeType } from "@/types";

const TYPE_LABELS: Record<PromoCodeType, string> = {
  pro_monthly: "1 Month of Pro",
  pro_yearly: "1 Year of Pro",
  pro_lifetime: "Lifetime Pro",
};

type PageState = "idle" | "submitting" | "success" | "error";

const RedeemPage = () => {
  const { user, refreshProfile } = useAuth();
  const [code, setCode] = useState("");
  const [state, setState] = useState<PageState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successType, setSuccessType] = useState<PromoCodeType | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code.trim()) return;

    setState("submitting");
    setErrorMsg("");

    const result = await redeemPromoCode(user.id, code);

    if (result.success) {
      setSuccessType(result.type);
      setExpiresAt(result.expiresAt);
      setState("success");
      await refreshProfile();
    } else {
      setErrorMsg(result.error);
      setState("error");
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Gift size={48} className="mx-auto text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-3">Redeem a Code</h1>
        <p className="text-white/50 mb-6">
          Sign in to redeem your promo code.
        </p>
        <Link
          href="/auth"
          className="inline-block px-6 py-3 font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Profile
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Gift size={40} className="mx-auto text-primary mb-3" />
        <h1 className="text-3xl font-bold mb-2">Redeem a Code</h1>
        <p className="text-white/50">
          Enter your promo code below to unlock Pro features.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-surface rounded-2xl border border-success/30 p-8 text-center"
          >
            {/* Celebration sparkles */}
            <div className="relative inline-block mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              >
                <Sparkles size={48} className="text-success" />
              </motion.div>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary"
                  initial={{ opacity: 1, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    x: Math.cos((i * Math.PI * 2) / 6) * 50,
                    y: Math.sin((i * Math.PI * 2) / 6) * 50,
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }}
                />
              ))}
            </div>

            <h2 className="text-2xl font-bold text-success mb-2">
              Code Redeemed!
            </h2>
            <p className="text-lg font-semibold text-white mb-1">
              {successType && TYPE_LABELS[successType]}
            </p>
            {expiresAt && (
              <p className="text-sm text-white/40">
                Expires {new Date(expiresAt).toLocaleDateString()}
              </p>
            )}
            {!expiresAt && successType === "pro_lifetime" && (
              <p className="text-sm text-white/40">Never expires</p>
            )}

            <Link
              href="/profile"
              className="inline-block mt-6 px-6 py-3 font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Go to Profile
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-surface rounded-2xl border border-white/10 p-6 space-y-4"
          >
            <div>
              <label
                htmlFor="promo-code"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Promo Code
              </label>
              <input
                id="promo-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (state === "error") setState("idle");
                }}
                placeholder="e.g. OTAKU2026"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg font-mono tracking-widest placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                autoComplete="off"
                autoCapitalize="characters"
                disabled={state === "submitting"}
              />
            </div>

            {state === "error" && errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-accent"
              >
                <AlertCircle size={16} />
                {errorMsg}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={state === "submitting" || !code.trim()}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {state === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redeeming...
                </span>
              ) : (
                "Redeem Code"
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RedeemPage;
