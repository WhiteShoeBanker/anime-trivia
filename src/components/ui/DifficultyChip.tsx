"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DifficultyTone } from "@/themes";

// Tone → utility-class lookup tables (active / inactive). Static strings so
// Tailwind v4's build-time extractor can see every class — no template
// composition. Active is filled (bg-{tone} text-ink); inactive is ghost
// (bg-{tone}/20 text-{tone}); both deepen 10% on hover per the canonical
// hover convention. All five active tones pair with text-ink per the
// 5#5a contrast table (text-white fails AA on every tone).
const activeToneClasses: Record<DifficultyTone, string> = {
  easy: "bg-audience-junior text-ink hover:bg-audience-junior/90",
  medium: "bg-audience-teen text-ink hover:bg-audience-teen/90",
  hard: "bg-audience-mature text-ink hover:bg-audience-mature/90",
  impossible:
    "bg-difficulty-impossible text-ink hover:bg-difficulty-impossible/90",
  mixed: "bg-difficulty-mixed text-ink hover:bg-difficulty-mixed/90",
};

const inactiveToneClasses: Record<DifficultyTone, string> = {
  easy: "bg-audience-junior/20 text-audience-junior hover:bg-audience-junior/30",
  medium: "bg-audience-teen/20 text-audience-teen hover:bg-audience-teen/30",
  hard: "bg-audience-mature/20 text-audience-mature hover:bg-audience-mature/30",
  impossible:
    "bg-difficulty-impossible/20 text-difficulty-impossible hover:bg-difficulty-impossible/30",
  mixed:
    "bg-difficulty-mixed/20 text-difficulty-mixed hover:bg-difficulty-mixed/30",
};

// Sizing matches pill-interactive in <Pill> (44px touch floor, label
// typography). The chip is pill-shaped per DESIGN.md's difficulty-chip
// token.
const sizing =
  "px-3.5 py-2.5 min-h-[44px] text-xs font-semibold leading-none tracking-[0.04em]";

const baseClasses =
  "inline-flex items-center justify-center rounded-pill transition-colors";

const focusClasses =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Locked = COPPA age-gate suppression (junior tier locked out of
// hard/impossible/mixed). Distinct from answer-tile-disabled which is
// reveal-state suppression. Matches difficulty-chip-locked token in
// DESIGN.md.
const lockedClasses =
  "bg-surface border border-rule text-text-muted opacity-50 cursor-not-allowed";

// Warn-and-render fallback on unknown tone (dev/browser surfaces missing
// tone). Mirrors Pill's pattern. Renders a transparent neutral chip so
// layout doesn't collapse.
const fallbackClasses = "bg-transparent text-text-muted";

interface DifficultyChipProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "type" | "onClick"
  > {
  tone: DifficultyTone;
  active: boolean;
  locked?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

export const DifficultyChip = forwardRef<
  HTMLButtonElement,
  DifficultyChipProps
>(function DifficultyChip(
  { tone, active, locked = false, onClick, className, children, ...rest },
  ref,
) {
  const toneMap = active ? activeToneClasses : inactiveToneClasses;
  const knownTone = tone in toneMap;

  if (
    !knownTone &&
    typeof window !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.warn(
      `[DifficultyChip] Unknown tone "${tone}" — rendering transparent neutral fallback.`,
    );
  }

  const toneClass = knownTone ? toneMap[tone] : fallbackClasses;

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      aria-disabled={locked ? true : undefined}
      aria-pressed={locked ? undefined : active}
      className={cn(
        baseClasses,
        sizing,
        locked ? lockedClasses : toneClass,
        focusClasses,
        className,
      )}
    >
      {children}
    </button>
  );
});
