"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Shield, AlertTriangle } from "lucide-react";
import type { LeagueResult } from "@/types";

interface LeagueBannerProps {
  result: LeagueResult;
  leagueName: string;
  previousLeagueName?: string;
}

// ── Confetti particles for promotion ────────────────────────

const ConfettiParticle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      left: `${x}%`,
      top: "50%",
      background: [
        "#FF6B35", "#00D1B2", "#FFD700", "#E94560", "#B9F2FF",
      ][Math.floor(Math.random() * 5)],
    }}
    initial={{ y: 0, opacity: 1, scale: 1 }}
    animate={{
      y: [0, -60, -40],
      x: [0, (Math.random() - 0.5) * 80],
      opacity: [1, 1, 0],
      scale: [1, 1.2, 0.5],
    }}
    transition={{
      duration: 1.5,
      delay,
      ease: "easeOut",
    }}
  />
);

// ── Promotion Banner ────────────────────────────────────────

const PromotionBanner = ({ leagueName }: { leagueName: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, type: "spring" }}
    className="relative overflow-hidden bg-success/10 border border-success/30 rounded-2xl p-5 text-center"
  >
    {/* Confetti */}
    {Array.from({ length: 12 }).map((_, i) => (
      <ConfettiParticle key={i} delay={i * 0.1} x={10 + i * 7} />
    ))}

    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
    >
      <TrendingUp size={32} className="mx-auto text-success mb-2" />
    </motion.div>
    <h3 className="text-lg font-bold text-success mb-1">Promoted!</h3>
    <p className="text-sm text-white/60">
      Welcome to <span className="font-bold text-white">{leagueName}</span>!
      Keep up the great work!
    </p>
  </motion.div>
);

// ── Demotion Banner (encouraging, orange not red) ───────────

const DemotionBanner = ({ leagueName }: { leagueName: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center"
  >
    <TrendingDown size={32} className="mx-auto text-primary mb-2" />
    <h3 className="text-lg font-bold text-primary mb-1">
      Dropped to {leagueName}
    </h3>
    <p className="text-sm text-white/60">
      Come back stronger! A fresh week is a fresh start.
    </p>
  </motion.div>
);

// ── Stayed Banner ───────────────────────────────────────────

const StayedBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center"
  >
    <Shield size={32} className="mx-auto text-white/60 mb-2" />
    <h3 className="text-lg font-bold text-white/80 mb-1">Solid Week!</h3>
    <p className="text-sm text-white/60">
      You held your ground. Push harder next week for a promotion!
    </p>
  </motion.div>
);

// ── Missed Promotion Banner ─────────────────────────────────

const MissedPromotionBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center"
  >
    <AlertTriangle size={32} className="mx-auto text-amber-400 mb-2" />
    <h3 className="text-lg font-bold text-amber-300 mb-1">So Close!</h3>
    <p className="text-sm text-white/60">
      You had the XP but needed more anime variety. Broaden your horizons next
      week!
    </p>
  </motion.div>
);

// ── Junior Demotion Banner (no demotion language) ───────────

const JuniorDemotionBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center"
  >
    <TrendingDown size={32} className="mx-auto text-primary mb-2" />
    <h3 className="text-lg font-bold text-primary mb-1">
      Try Again Next Week!
    </h3>
    <p className="text-sm text-white/60">
      Every week is a new adventure. You've got this!
    </p>
  </motion.div>
);

// ── Main Export ──────────────────────────────────────────────

const LeagueBanner = ({
  result,
  leagueName,
  previousLeagueName,
}: LeagueBannerProps & { isJunior?: boolean }) => {
  switch (result) {
    case "promoted":
      return <PromotionBanner leagueName={leagueName} />;
    case "demoted":
      return <DemotionBanner leagueName={previousLeagueName ?? leagueName} />;
    case "stayed":
      return <StayedBanner />;
    case "missed_promotion":
      return <MissedPromotionBanner />;
    default:
      return null;
  }
};

export default LeagueBanner;
export {
  PromotionBanner,
  DemotionBanner,
  StayedBanner,
  MissedPromotionBanner,
  JuniorDemotionBanner,
};
