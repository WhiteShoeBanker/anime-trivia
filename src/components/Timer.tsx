"use client";

import { motion } from "framer-motion";

interface TimerProps {
  totalSeconds: number;
  timeLeft: number;
}

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Timer = ({ totalSeconds, timeLeft }: TimerProps) => {
  const fraction = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - fraction);

  const color =
    fraction > 0.6
      ? "var(--color-success)"
      : fraction > 0.3
        ? "#facc15"
        : "#ef4444";

  const shouldPulse = timeLeft <= 5 && timeLeft > 0;

  return (
    <motion.div
      animate={shouldPulse ? { scale: [1, 1.1, 1] } : { scale: 1 }}
      transition={shouldPulse ? { duration: 0.6, repeat: Infinity } : undefined}
      className="relative flex items-center justify-center w-12 h-12"
      role="timer"
      aria-label={`${timeLeft} seconds remaining`}
    >
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
        />
        <motion.circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>
        {timeLeft}
      </span>
    </motion.div>
  );
};

export default Timer;
