"use client";

import * as LucideIcons from "lucide-react";
import type { BadgeRarity } from "@/types";

const RARITY_BORDERS: Record<BadgeRarity, string> = {
  common: "border-gray-500/50",
  uncommon: "border-emerald-500/60",
  rare: "border-blue-500/60",
  epic: "border-purple-500/60",
  legendary: "border-yellow-400/80",
};

const RARITY_BG: Record<BadgeRarity, string> = {
  common: "bg-gray-500/10",
  uncommon: "bg-emerald-500/10",
  rare: "bg-blue-500/10",
  epic: "bg-purple-500/10",
  legendary: "bg-yellow-400/10",
};

interface BadgeIconProps {
  iconName: string;
  iconColor: string;
  rarity: BadgeRarity;
  size?: "sm" | "md" | "lg";
  earned?: boolean;
  shimmer?: boolean;
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

const BadgeIcon = ({
  iconName,
  iconColor,
  rarity,
  size = "md",
  earned = true,
  shimmer = false,
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

  const isLegendary = rarity === "legendary" && earned;

  return (
    <div
      className={`relative ${sizeConfig.container} rounded-card ${sizeConfig.border} flex items-center justify-center ${
        earned
          ? `${RARITY_BORDERS[rarity]} ${RARITY_BG[rarity]}`
          : "border-white/10 bg-white/5 opacity-40"
      } ${isLegendary && shimmer ? "animate-pulse" : ""}`}
    >
      <IconComponent
        size={sizeConfig.icon}
        style={{ color: earned ? iconColor : "rgba(255,255,255,0.3)" }}
      />
      {/* Legendary shimmer overlay.
       * TODO(phase-5-#7): the rgba(255,215,0) gold-shimmer literal still
       * lives inline. Migrate to a named animation/gradient token alongside
       * the modal-chrome pass (BadgeCelebration + EmblemSelector share it). */}
      {isLegendary && shimmer && (
        <div className="absolute inset-0 rounded-card overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.4) 50%, transparent 60%)",
              animation: "shimmer 2s infinite",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BadgeIcon;
export { RARITY_BORDERS, RARITY_BG };
