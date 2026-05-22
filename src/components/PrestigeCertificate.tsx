"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import useReducedMotion from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

interface PrestigeCertificateProps {
  /** Display headline, rendered in the Anton display face (font-display). */
  title: string;
  /** Lucide glyph carved into the hanko seal. Icon-only — never text
   *  (the seal's paper-on-vermillion clears the 3:1 graphical-object bar,
   *  not the 4.5:1 text bar — see DESIGN.md prestige-seal contrast note). */
  sealIcon: LucideIcon;
  /** Optional eyebrow label above the title (e.g. "Coming Soon"). */
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
}

// Paper-mode prestige surface (DESIGN.md prestige-certificate / prestige-seal,
// Direction 1 "Hanko Decree"). Inverts the canonical dark palette to a cream
// paper decree stamped with a vermillion hanko seal. Reserved for prestige
// surfaces — certificates, end-game splash screens, prestige badges. Never
// bind paper-mode to regular dark-canvas UI.
const PrestigeCertificate = ({
  title,
  sealIcon: SealIcon,
  eyebrow,
  children,
  className,
}: PrestigeCertificateProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className={cn(
        "bg-paper text-ink border border-rule-paper rounded-card shadow-ink px-7 py-6",
        className,
      )}
    >
      <div className="flex flex-col items-center text-center">
        {/* Hanko seal: one-shot stamp-press on mount (scale 1.6→1 + rotate
         *  -8°→0, ~360ms). useReducedMotion() gated → settled, no press. */}
        <motion.div
          data-seal-motion={reducedMotion ? "settled" : "stamp"}
          initial={reducedMotion ? false : { scale: 1.6, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={
            reducedMotion ? { duration: 0 } : { duration: 0.36, ease: "easeOut" }
          }
          className="flex h-16 w-16 items-center justify-center rounded-pill bg-primary text-paper"
        >
          <SealIcon size={28} aria-hidden className="text-paper" />
        </motion.div>

        {eyebrow && (
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.06em] text-ink/60">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 font-display text-4xl md:text-5xl text-ink">
          {title}
        </h2>
      </div>

      {children && <div className="mt-6 text-ink/70">{children}</div>}
    </section>
  );
};

export default PrestigeCertificate;
