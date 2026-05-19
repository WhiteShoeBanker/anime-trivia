"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ModalShell } from "@/components/ui/ModalShell";
import BadgeFoilCard from "@/components/BadgeFoilCard";
import type { Badge } from "@/types";
import useReducedMotion from "@/lib/use-reduced-motion";
import { confettiPalette, rarityLabels } from "@/themes";

interface BadgeCelebrationProps {
  isOpen: boolean;
  badges: Badge[];
  onComplete: () => void;
}

const ConfettiParticle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      left: `${x}%`,
      top: "40%",
      background:
        confettiPalette[Math.floor(Math.random() * confettiPalette.length)],
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

interface BadgeCelebrationCardProps {
  badge: Badge;
  reducedMotion: boolean;
  index: number;
  total: number;
  isLast: boolean;
}

// The bespoke spring content card. Split out (mirroring the in-file
// ConfettiParticle precedent) so `rarityInfo` derives from a
// non-optional `badge` prop — the early `if (!currentBadge) return null`
// guard is gone now that ModalShell owns mount/unmount, and a
// component boundary keeps the rarity lookup type-safe without a
// non-null assertion. All motion config is preserved verbatim from the
// pre-ModalShell implementation.
const BadgeCelebrationCard = ({
  badge,
  reducedMotion,
  index,
  total,
  isLast,
}: BadgeCelebrationCardProps) => {
  const rarityInfo = rarityLabels[badge.rarity];

  return (
    <>
      {/* Confetti — skip when reduced motion */}
      {!reducedMotion &&
        Array.from({ length: 20 }).map((_, i) => (
          <ConfettiParticle key={i} delay={i * 0.08} x={5 + i * 4.5} />
        ))}

      <motion.div
        key={badge.id}
        initial={reducedMotion ? false : { scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 15 }}
        className="flex flex-col items-center gap-4 p-8"
      >
        {/* Badge label */}
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.3 }}
          className="text-sm font-semibold text-white/50 uppercase tracking-wider"
        >
          Badge Unlocked!
        </motion.p>

        {/* Badge icon (large) */}
        <motion.div
          initial={reducedMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <BadgeFoilCard badge={badge} earned size="lg" />
        </motion.div>

        {/* Badge name */}
        <motion.h2
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.4 }}
          className="text-2xl font-bold text-white text-center"
        >
          {badge.name}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.5 }}
          className="text-sm text-white/50 text-center max-w-xs"
        >
          {badge.description}
        </motion.p>

        {/* Rarity */}
        <motion.span
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.6 }}
          className={`text-xs font-bold uppercase ${rarityInfo.color}`}
        >
          {rarityInfo.text}
        </motion.span>

        {/* Progress indicator for multiple badges */}
        {total > 1 && (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { delay: 0.7 }}
            className="text-xs text-white/30 mt-2"
          >
            {index + 1} of {total} — Tap to continue
          </motion.p>
        )}

        {/* Dismiss */}
        {isLast && (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { delay: 0.8 }}
            className="text-xs text-white/30 mt-2"
          >
            Tap anywhere to close
          </motion.p>
        )}
      </motion.div>
    </>
  );
};

const BadgeCelebration = ({
  isOpen,
  badges,
  onComplete,
}: BadgeCelebrationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const currentBadge = badges[currentIndex];
  const isLast = currentIndex >= badges.length - 1;

  // Reset to the first badge each time the overlay (re)opens, so a
  // second celebration starts from the first badge instead of
  // resuming mid-sequence.
  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!currentBadge) {
      onComplete();
      return;
    }

    // Auto-advance after 3 seconds. On the last badge, the next tick
    // pushes currentIndex past the array; the next render hits the
    // `!currentBadge` branch above and onComplete fires. Tap-to-advance
    // is the faster-dismissal path that co-exists with this — the "Tap
    // anywhere to close" copy invites the tap, but the timer still ends
    // the sequence if the user does nothing.
    const timer = setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, currentIndex, currentBadge, onComplete]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onComplete}
      zIndex="celebration"
      dismissOnBackdrop={false}
      closeOnEscape={false}
      backdropClassName="bg-ink/70 backdrop-blur-sm"
      aria-label="Badge unlocked"
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        onClick={isLast ? onComplete : () => setCurrentIndex((i) => i + 1)}
      >
        {currentBadge && (
          <BadgeCelebrationCard
            badge={currentBadge}
            reducedMotion={reducedMotion}
            index={currentIndex}
            total={badges.length}
            isLast={isLast}
          />
        )}
      </div>
    </ModalShell>
  );
};

export default BadgeCelebration;
