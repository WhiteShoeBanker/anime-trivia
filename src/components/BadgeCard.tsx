"use client";

import { motion } from "framer-motion";
import BadgeIcon from "@/components/BadgeIcon";
import type { Badge, BadgeRarity } from "@/types";

const RARITY_LABELS: Record<BadgeRarity, { text: string; color: string }> = {
  common: { text: "Common", color: "text-gray-400" },
  uncommon: { text: "Uncommon", color: "text-emerald-400" },
  rare: { text: "Rare", color: "text-blue-400" },
  epic: { text: "Epic", color: "text-purple-400" },
  legendary: { text: "Legendary", color: "text-yellow-400" },
};

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: string;
  onClick?: () => void;
  selected?: boolean;
}

const BadgeCard = ({
  badge,
  earned = false,
  earnedAt,
  onClick,
  selected = false,
}: BadgeCardProps) => {
  const rarityInfo = RARITY_LABELS[badge.rarity];

  return (
    <motion.button
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={`w-full text-left bg-surface rounded-2xl border p-4 transition-colors ${
        selected
          ? "border-primary/60 bg-primary/10"
          : earned
            ? "border-white/10 hover:border-white/20"
            : "border-white/5 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <BadgeIcon
          iconName={badge.icon_name}
          iconColor={badge.icon_color}
          rarity={badge.rarity}
          size="lg"
          earned={earned}
          shimmer={earned}
        />
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm ${earned ? "text-white" : "text-white/40"}`}
          >
            {badge.name}
          </h3>
          <p
            className={`text-xs mt-0.5 ${earned ? "text-white/50" : "text-white/25"}`}
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
      </div>
    </motion.button>
  );
};

export default BadgeCard;
