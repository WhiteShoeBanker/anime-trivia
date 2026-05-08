"use client";

import { motion } from "framer-motion";
import useReducedMotion from "@/lib/use-reduced-motion";
import type { AgeGroup } from "@/types";

interface AgeGateProps {
  onAgeGroupSelected: (group: AgeGroup) => void;
}

const AGE_RANGES: ReadonlyArray<{
  group: AgeGroup;
  label: string;
  hint: string;
}> = [
  { group: "junior", label: "Under 13", hint: "Junior account" },
  { group: "teen", label: "13–15", hint: "Teen account" },
  { group: "full", label: "16+", hint: "Full access" },
] as const satisfies ReadonlyArray<{
  group: AgeGroup;
  label: string;
  hint: string;
}>;

const AgeGate = ({ onAgeGroupSelected }: AgeGateProps) => {
  const reducedMotion = useReducedMotion();

  const motionProps = reducedMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div {...motionProps} className="max-w-xl mx-auto text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-text mb-3">
        How old are you?
      </h2>
      <p className="text-text-muted mb-8 text-sm sm:text-base">
        We use this to keep age-appropriate content and follow privacy rules.
      </p>

      <div
        role="group"
        aria-label="Select your age range"
        className="flex flex-col sm:flex-row gap-3 sm:gap-4"
      >
        {AGE_RANGES.map(({ group, label, hint }) => (
          <button
            key={group}
            type="button"
            aria-label={`${label} (${hint})`}
            onClick={() => onAgeGroupSelected(group)}
            className="flex-1 min-h-[44px] py-6 px-4 rounded-xl bg-surface border border-rule text-text text-lg font-semibold hover:bg-primary hover:border-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-text-muted text-sm mt-6">
        If you&apos;re under 13, we&apos;ll need a parent&apos;s email next.
      </p>
    </motion.div>
  );
};

export default AgeGate;
