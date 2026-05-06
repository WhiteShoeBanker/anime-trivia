"use client";

import { Shield, Medal, Star, Award, Gem, Swords } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ──────────────────────────────────────────────────────────────
// Heat Check tier badge — six distinct materials, not six shades.
// Each tier escalates the frame: simple → inner-stroke → double →
// triple-sandwich → iridescent gradient → vermillion+chartreuse
// champion. Shared neobrutalist anchor: 4px hard ink-black offset
// shadow on every wrapper; sharp corners.
// ──────────────────────────────────────────────────────────────

export type TierLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TierBadgeSize = "sm" | "md" | "lg";

interface TierBadgeProps {
  tier: TierLevel;
  size?: TierBadgeSize;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
  /**
   * Override the wrapper's hard offset shadow (e.g. electric chartreuse for
   * a "current tier" highlight on the leagues progression strip). Defaults
   * to the standard ink-black 4px hard offset.
   */
  highlightShadow?: string;
}

interface TierSpec {
  name: string;
  icon: LucideIcon;
  fill: string;
  iconColor: string;
  outerBorder: string; // CSS border shorthand
  halftoneOpacity: number;
  halftoneColor: string;
}

const TIER_FOIL = {
  1: "#c87d3e",
  2: "#b8b8c2",
  3: "#f4c430",
  4: "#dde2e8",
  5: "#38bdf8",
  6: "#dc2828",
} as const;

const TIERS: Record<TierLevel, TierSpec> = {
  1: {
    name: "Bronze",
    icon: Shield,
    fill: TIER_FOIL[1],
    iconColor: "#0a0a0a",
    outerBorder: `2px solid ${TIER_FOIL[1]}`,
    halftoneOpacity: 0,
    halftoneColor: "#000",
  },
  2: {
    name: "Silver",
    icon: Medal,
    fill: TIER_FOIL[2],
    iconColor: "#0a0a0a",
    outerBorder: `2.5px solid ${TIER_FOIL[2]}`,
    halftoneOpacity: 0.08,
    halftoneColor: "#000",
  },
  3: {
    name: "Gold",
    icon: Star,
    fill: TIER_FOIL[3],
    iconColor: "#0a0a0a",
    outerBorder: `3px solid ${TIER_FOIL[3]}`,
    halftoneOpacity: 0.12,
    halftoneColor: "#000",
  },
  4: {
    name: "Platinum",
    icon: Award,
    fill: TIER_FOIL[4],
    iconColor: "#0a0a0a",
    outerBorder: `2px solid ${TIER_FOIL[2]}`,
    halftoneOpacity: 0.15,
    halftoneColor: "#000",
  },
  5: {
    name: "Diamond",
    icon: Gem,
    fill: `linear-gradient(135deg, ${TIER_FOIL[5]} 0%, #dfff20 50%, ${TIER_FOIL[5]} 100%)`,
    iconColor: "#f5f1e8",
    outerBorder: `3px solid ${TIER_FOIL[5]}`,
    halftoneOpacity: 0.18,
    halftoneColor: "#000",
  },
  6: {
    name: "Champion",
    icon: Swords,
    fill: TIER_FOIL[6],
    iconColor: "#dfff20",
    outerBorder: `2.5px solid ${TIER_FOIL[6]}`,
    halftoneOpacity: 0.2,
    halftoneColor: "#fff",
  },
};

const SIZE_DIMS: Record<TierBadgeSize, { dim: number; icon: number; label: string }> = {
  sm: { dim: 32, icon: 16, label: "text-[10px]" },
  md: { dim: 64, icon: 28, label: "text-xs" },
  lg: { dim: 128, icon: 56, label: "text-sm" },
};

/**
 * XP → tier approximation. The /leagues page reads the authoritative tier
 * from the membership table; this helper is for surfaces that only have XP
 * and need a quick visual indicator (navbar, landing hero stat card).
 */
export const tierFromXP = (xp: number): TierLevel => {
  if (xp >= 25000) return 6;
  if (xp >= 10000) return 5;
  if (xp >= 5000) return 4;
  if (xp >= 2000) return 3;
  if (xp >= 500) return 2;
  return 1;
};

const TierBadge = ({
  tier,
  size = "md",
  showLabel = false,
  animated = false,
  className = "",
  highlightShadow,
}: TierBadgeProps) => {
  const spec = TIERS[tier];
  const dims = SIZE_DIMS[size];
  const Icon = spec.icon;
  const wrapperShadow = highlightShadow ?? "4px 4px 0 0 #000";

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
      <div
        role="img"
        aria-label={`${spec.name} tier badge`}
        className="relative inline-flex items-center justify-center overflow-hidden"
        style={{
          width: dims.dim,
          height: dims.dim,
          background: spec.fill,
          border: spec.outerBorder,
          boxShadow: wrapperShadow,
          borderRadius: 0,
        }}
      >
        {/* Inner frame layers — material escalation per tier. */}
        {tier === 2 && (
          <div
            aria-hidden="true"
            className="absolute inset-[2px] pointer-events-none"
            style={{ border: "1px solid rgba(0,0,0,0.25)" }}
          />
        )}
        {tier === 3 && (
          <div
            aria-hidden="true"
            className="absolute inset-[4px] pointer-events-none"
            style={{ border: "1px solid rgba(0,0,0,0.45)" }}
          />
        )}
        {tier === 4 && (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-[2px] pointer-events-none"
              style={{ border: "1px solid #f5f1e8" }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-[3px] pointer-events-none"
              style={{ border: "1px solid #b8b8c2" }}
            />
          </>
        )}
        {tier === 6 && (
          <div
            aria-hidden="true"
            className="absolute inset-[2px] pointer-events-none"
            style={{ border: "1px solid #dfff20" }}
          />
        )}

        {/* Halftone overlay — currentColor inherits from the wrapper. */}
        {spec.halftoneOpacity > 0 && (
          <div
            aria-hidden="true"
            className="absolute inset-0 texture-halftone pointer-events-none"
            style={{ color: spec.halftoneColor, opacity: spec.halftoneOpacity }}
          />
        )}

        {/* Icon */}
        <Icon
          size={dims.icon}
          color={spec.iconColor}
          strokeWidth={2.5}
          className="relative z-10"
        />

        {/* Champion-tier shimmer sweep — chartreuse highlight every 4s. */}
        {tier === 6 && animated && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <div
              className="absolute -inset-y-2 w-1/2"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(223,255,32,0.45) 50%, transparent 100%)",
                animation: "heat-shimmer 4s ease-in-out infinite",
              }}
            />
          </div>
        )}
      </div>

      {showLabel && (
        <span
          className={`font-display uppercase ${dims.label} text-text leading-none`}
          style={{ letterSpacing: "-0.02em" }}
        >
          {spec.name}
        </span>
      )}
    </div>
  );
};

export default TierBadge;
