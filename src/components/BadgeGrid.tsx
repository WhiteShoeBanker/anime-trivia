"use client";

import { motion } from "framer-motion";
import BadgeIcon from "@/components/BadgeIcon";
import type { Badge } from "@/types";

interface BadgeGridProps {
  badges: Badge[];
  earnedBadgeIds: Set<string>;
  onBadgeClick?: (badge: Badge) => void;
}

const BadgeGrid = ({ badges, earnedBadgeIds, onBadgeClick }: BadgeGridProps) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
      {badges.map((badge, i) => {
        const earned = earnedBadgeIds.has(badge.id);
        return (
          <motion.button
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onBadgeClick?.(badge)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${
              earned
                ? "hover:bg-white/5"
                : "opacity-40 hover:opacity-60"
            }`}
            title={`${badge.name}: ${badge.description}`}
          >
            <BadgeIcon
              iconName={badge.icon_name}
              iconColor={badge.icon_color}
              rarity={badge.rarity}
              size="md"
              earned={earned}
              shimmer={earned}
            />
            <span
              className={`text-[10px] leading-tight text-center line-clamp-2 ${
                earned ? "text-white/70" : "text-white/30"
              }`}
            >
              {badge.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default BadgeGrid;
