"use client";

import { motion } from "framer-motion";
import BadgeFoilCard from "@/components/BadgeFoilCard";
import type { Badge } from "@/types";
import { rarityLabels } from "@/themes";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: string;
  onClick?: () => void;
  selected?: boolean;
}

// Horizontal list-view row: foil card on the left, text panel on the right.
// Phase 6c reshape — was a tile + sans-serif text block. The foil card
// composes BadgeFoilCard size="sm" and inherits its tilt + foil treatment
// when hovered. State borders (selected/earned/locked) remain on the
// outer wrapper per the badge-card token contract in DESIGN.md.
const BadgeCard = ({
  badge,
  earned = false,
  earnedAt,
  onClick,
  selected = false,
}: BadgeCardProps) => {
  const rarityInfo = rarityLabels[badge.rarity];

  return (
    <motion.button
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={cn(
        "w-full text-left bg-surface rounded-card shadow-ink border p-4 transition-colors",
        "flex items-center gap-4",
        selected
          ? "border-primary/60 bg-primary/10"
          : earned
            ? "border-white/10 hover:border-white/20"
            : "border-white/5 opacity-60",
      )}
    >
      <BadgeFoilCard
        badge={badge}
        earned={earned}
        size="sm"
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-semibold text-sm",
            earned ? "text-white" : "text-white/40",
          )}
        >
          {badge.name}
        </h3>
        <p
          className={cn(
            "text-xs mt-0.5",
            earned ? "text-white/50" : "text-white/25",
          )}
        >
          {badge.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] font-bold uppercase ${rarityInfo.color}`}>
            {rarityInfo.text}
          </span>
          {earnedAt && (
            <span className="text-[10px] text-white/30">
              {new Date(earnedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export default BadgeCard;
