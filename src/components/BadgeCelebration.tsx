"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BadgeIcon from "@/components/BadgeIcon";
import type { Badge, BadgeRarity } from "@/types";

const RARITY_LABELS: Record<BadgeRarity, { text: string; color: string }> = {
  common: { text: "Common", color: "text-gray-400" },
  uncommon: { text: "Uncommon", color: "text-emerald-400" },
  rare: { text: "Rare", color: "text-blue-400" },
  epic: { text: "Epic", color: "text-purple-400" },
  legendary: { text: "Legendary", color: "text-yellow-400" },
};

interface BadgeCelebrationProps {
  badges: Badge[];
  onComplete: () => void;
}

const ConfettiParticle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      left: `${x}%`,
      top: "40%",
      background: [
        "#FF6B35", "#00D1B2", "#FFD700", "#E94560", "#B9F2FF",
        "#6366F1", "#A855F7",
      ][Math.floor(Math.random() * 7)],
    }}
    initial={{ y: 0, opacity: 1, scale: 1 }}
    animate={{
      y: [0, -120, -80],
      x: [0, (Math.random() - 0.5) * 200],
      opacity: [1, 1, 0],
      scale: [1, 1.5, 0.3],
      rotate: [0, Math.random() * 360],
    }}
    transition={{
      duration: 2,
      delay,
      ease: "easeOut",
    }}
  />
);

const BadgeCelebration = ({ badges, onComplete }: BadgeCelebrationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentBadge = badges[currentIndex];
  const isLast = currentIndex >= badges.length - 1;

  useEffect(() => {
    if (!currentBadge) {
      onComplete();
      return;
    }

    // Auto-advance after 3 seconds if multiple badges
    if (!isLast) {
      const timer = setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentBadge, isLast, onComplete]);

  if (!currentBadge) return null;

  const rarityInfo = RARITY_LABELS[currentBadge.rarity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={isLast ? onComplete : () => setCurrentIndex((i) => i + 1)}
      >
        {/* Confetti */}
        {Array.from({ length: 20 }).map((_, i) => (
          <ConfettiParticle key={i} delay={i * 0.08} x={5 + i * 4.5} />
        ))}

        <motion.div
          key={currentBadge.id}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-4 p-8"
        >
          {/* Badge label */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-semibold text-white/50 uppercase tracking-wider"
          >
            Badge Unlocked!
          </motion.p>

          {/* Badge icon (large) */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          >
            <BadgeIcon
              iconName={currentBadge.icon_name}
              iconColor={currentBadge.icon_color}
              rarity={currentBadge.rarity}
              size="lg"
              earned
              shimmer
            />
          </motion.div>

          {/* Badge name */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-white text-center"
          >
            {currentBadge.name}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-white/50 text-center max-w-xs"
          >
            {currentBadge.description}
          </motion.p>

          {/* Rarity */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`text-xs font-bold uppercase ${rarityInfo.color}`}
          >
            {rarityInfo.text}
          </motion.span>

          {/* Progress indicator for multiple badges */}
          {badges.length > 1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-white/30 mt-2"
            >
              {currentIndex + 1} of {badges.length} — Tap to continue
            </motion.p>
          )}

          {/* Dismiss */}
          {isLast && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-white/30 mt-2"
            >
              Tap anywhere to close
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeCelebration;
