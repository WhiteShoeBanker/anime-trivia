"use client";

import * as LucideIcons from "lucide-react";
import type { GrandPrixEmblem } from "@/types";

interface MonthlyEmblemProps {
  emblem: GrandPrixEmblem;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

// md container width 56px is the emblem-monthly canonical declared in
// DESIGN.md; sm (40px) / lg (80px) are proportional scales. Rounded corner
// consumes --radius-card via the rounded-card utility.
const SIZE_MAP = {
  sm: { container: "w-10 h-10", icon: 16, text: "text-[10px]" },
  md: { container: "w-14 h-14", icon: 22, text: "text-xs" },
  lg: { container: "w-20 h-20", icon: 32, text: "text-sm" },
};

const MonthlyEmblem = ({
  emblem,
  size = "md",
  showLabel = true,
}: MonthlyEmblemProps) => {
  const sizeConfig = SIZE_MAP[size];

  const IconComponent = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ size: number; className?: string; style?: React.CSSProperties }>
    >
  )[emblem.icon_name] ?? LucideIcons.Trophy;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative ${sizeConfig.container} rounded-card border-2 border-tier-3/80 bg-tier-3/10 flex items-center justify-center overflow-hidden`}
      >
        <IconComponent
          size={sizeConfig.icon}
          style={{ color: emblem.icon_color }}
        />
        {/* Golden shimmer overlay.
         * TODO(phase-5-#7): the rgba(255,215,0) gold-shimmer literal mirrors
         * BadgeIcon's legendary overlay; migrate both to a shared named
         * animation/gradient token alongside the modal-chrome pass. */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-card">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.5) 50%, transparent 60%)",
              animation: "shimmer 2.5s infinite",
            }}
          />
        </div>
      </div>
      {showLabel && (
        <span className={`${sizeConfig.text} text-white/50 font-medium text-center`}>
          {emblem.month_label}
        </span>
      )}
    </div>
  );
};

export default MonthlyEmblem;
