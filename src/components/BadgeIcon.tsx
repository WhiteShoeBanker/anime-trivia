"use client";

import * as LucideIcons from "lucide-react";
import type { BadgeRarity } from "@/types";
import { rarityColors } from "@/themes";

interface BadgeIconProps {
  iconName: string;
  iconColor: string;
  rarity: BadgeRarity;
  size?: "sm" | "md" | "lg";
  earned?: boolean;
}

// Container dimensions mirror the badge-icon-sm/md/lg tokens declared in
// DESIGN.md (32 / 48 / 64 px). Rounded corner consumes --radius-card via
// the rounded-card utility.
const SIZE_MAP = {
  sm: { container: "w-8 h-8", icon: 14, border: "border" },
  md: { container: "w-12 h-12", icon: 20, border: "border-2" },
  lg: { container: "w-16 h-16", icon: 28, border: "border-2" },
};

type LucideIconComponent = React.ComponentType<{
  size: number;
  className?: string;
  style?: React.CSSProperties;
}>;

const LucideIconMap = LucideIcons as unknown as Record<string, LucideIconComponent>;

// Utility-shape tile primitive for non-collectible surfaces (Navbar emblem
// chip, profile avatar overlap, leagues roster, inline daily/landing
// "Recent:" chips). Collectible surfaces consume <BadgeFoilCard> instead
// (Phase 6c migration). The `shimmer` prop was dropped in 6c — the inline
// overlay it controlled referenced a @keyframes shimmer that was never
// defined anywhere in the project (dead since landing, confirmed in Phase
// 6b investigation). Foil shimmer now lives in BadgeFoilCard's
// foil-uncommon/rare treatments.
const BadgeIcon = ({
  iconName,
  iconColor,
  rarity,
  size = "md",
  earned = true,
}: BadgeIconProps) => {
  const sizeConfig = SIZE_MAP[size];

  // Warn-and-render: dev/browser surfaces unknown icon_name values so seed
  // typos are caught early; production silently falls back to HelpCircle
  // to preserve render robustness.
  const ResolvedIcon = LucideIconMap[iconName];
  if (
    !ResolvedIcon &&
    typeof window !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.warn(
      `[BadgeIcon] Unknown icon_name: "${iconName}" — falling back to HelpCircle`,
    );
  }
  const IconComponent = ResolvedIcon ?? LucideIcons.HelpCircle;

  return (
    <div
      className={`relative ${sizeConfig.container} rounded-card ${sizeConfig.border} flex items-center justify-center ${
        earned
          ? `${rarityColors[rarity].border} ${rarityColors[rarity].bg}`
          : "border-white/10 bg-white/5 opacity-40"
      }`}
    >
      <IconComponent
        size={sizeConfig.icon}
        style={{ color: earned ? iconColor : "rgba(255,255,255,0.3)" }}
      />
    </div>
  );
};

export default BadgeIcon;
