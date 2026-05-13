"use client";

import { motion } from "framer-motion";
import BadgeFoilCard from "@/components/BadgeFoilCard";
import type { Badge } from "@/types";

interface BadgeGridProps {
  badges: Badge[];
  earnedBadgeIds: Set<string>;
  onBadgeClick?: (badge: Badge) => void;
}

const BadgeGrid = ({ badges, earnedBadgeIds, onBadgeClick }: BadgeGridProps) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 place-items-center">
      {badges.map((badge, i) => {
        const earned = earnedBadgeIds.has(badge.id);
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <BadgeFoilCard
              badge={badge}
              earned={earned}
              size="md"
              onClick={onBadgeClick ? () => onBadgeClick(badge) : undefined}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default BadgeGrid;
