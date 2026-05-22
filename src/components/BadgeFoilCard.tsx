"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { Badge, BadgeRarity } from "@/types";
import { rarityColors } from "@/themes";
import useReducedMotion from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

export type BadgeFoilCardSize = "sm" | "md" | "lg" | "xl";

interface BadgeFoilCardProps {
  badge: Badge;
  earned?: boolean;
  size?: BadgeFoilCardSize;
  onClick?: () => void;
  className?: string;
  /**
   * Apex "Champion Foil" treatment (DESIGN.md badge-foil-prestige). When true,
   * applies `.foil-prestige` + `border-tier-6`, bypassing the rarity foil/border
   * maps. Collectible emblems ONLY — never apply to page chrome per DESIGN.md
   * principle #2 ("Don't apply foil to every surface"). Implemented as an opt-in
   * prop, not a BadgeRarity enum value, so prestige can't leak into normal badges.
   */
  prestige?: boolean;
}

// Width + icon sizes per the DESIGN.md badge-foil-card token (96px default
// md width, 3:4 aspect anchored via Tailwind utility). 72/96/128/192 widths
// give 96/128/170/256 heights at 3:4. xl introduced in Phase 6d-i for the
// Tournament Champion hero on /grand-prix.
const SIZE_MAP: Record<
  BadgeFoilCardSize,
  { width: string; iconSize: number; titleClass: string }
> = {
  sm: { width: "w-[72px]", iconSize: 28, titleClass: "text-[11px]" },
  md: { width: "w-24", iconSize: 36, titleClass: "text-[12px]" },
  lg: { width: "w-32", iconSize: 48, titleClass: "text-[14px]" },
  xl: { width: "w-48", iconSize: 64, titleClass: "text-[16px]" },
};

// Rarity → foil-class lookup. Static object (not template string) so
// Tailwind's class extraction and the CSS bundler both see every class.
const FOIL_CLASS_MAP: Record<BadgeRarity, string> = {
  common: "foil-common",
  uncommon: "foil-uncommon",
  rare: "foil-rare",
  epic: "foil-epic",
  legendary: "foil-legendary",
};

type LucideIconComponent = React.ComponentType<{
  size: number;
  className?: string;
  style?: React.CSSProperties;
}>;

const LucideIconMap = LucideIcons as unknown as Record<
  string,
  LucideIconComponent
>;

const BadgeFoilCard = ({
  badge,
  earned = true,
  size = "md",
  onClick,
  className,
  prestige = false,
}: BadgeFoilCardProps) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | HTMLButtonElement | null>(null);
  const sizeConfig = SIZE_MAP[size];

  // Normalized pointer offset from card center, range -1..1 on each axis.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Smoothed via spring for weighty motion. Stiffness/damping match the
  // motion.tilt-card token in DESIGN.md.
  const sx = useSpring(px, { stiffness: 200, damping: 20 });
  const sy = useSpring(py, { stiffness: 200, damping: 20 });

  // Rotation transforms — rotateX is inverted so pushing the cursor up
  // tilts the top of the card away (anchored at center).
  const rotateY = useTransform(sx, [-1, 1], [-12, 12]);
  const rotateX = useTransform(sy, [-1, 1], [12, -12]);

  // Foil-parallax CSS custom properties. Tracks pointer so the conic
  // gradient origin shifts under the cursor.
  const foilX = useTransform(sx, [-1, 1], ["20%", "80%"]);
  const foilY = useTransform(sy, [-1, 1], ["20%", "80%"]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion || !earned || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    py.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handlePointerLeave = () => {
    if (reducedMotion || !earned) return;
    px.set(0);
    py.set(0);
  };

  // Warn-and-render: mirrors BadgeIcon's Phase 5 #2c contract. Dev/browser
  // surfaces unknown icon_name values; production silently falls back to
  // HelpCircle to preserve render robustness.
  const ResolvedIcon = LucideIconMap[badge.icon_name];
  if (
    !ResolvedIcon &&
    typeof window !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.warn(
      `[BadgeFoilCard] Unknown icon_name: "${badge.icon_name}" — falling back to HelpCircle`,
    );
  }
  const IconComponent = ResolvedIcon ?? LucideIcons.HelpCircle;

  // Prestige opt-in (Champion Foil) overrides the rarity foil + border maps.
  const foilClass = prestige ? "foil-prestige" : FOIL_CLASS_MAP[badge.rarity];
  const borderClass = prestige ? "border-tier-6" : rarityColors[badge.rarity].border;

  const wrapperClass = cn(
    "relative aspect-[3/4] rounded-card border-2 shadow-ink overflow-hidden flex flex-col",
    sizeConfig.width,
    borderClass,
    foilClass,
    !earned && "opacity-60 grayscale",
    onClick &&
      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary",
    className,
  );

  const motionStyle = {
    perspective: 800,
    rotateX: reducedMotion ? 0 : rotateX,
    rotateY: reducedMotion ? 0 : rotateY,
    transformStyle: "preserve-3d" as const,
    "--foil-x": reducedMotion ? "50%" : foilX,
    "--foil-y": reducedMotion ? "50%" : foilY,
  } as React.CSSProperties;

  const cardChildren = (
    <>
      {/* Card title. Inherits font-body (DM Sans) from layout.tsx — Anton
       * was retired here after the first smoke pass. Uppercase + tight
       * tracking preserves the manga-title-card energy without depending
       * on Anton's condensed shape. line-clamp-2 allows wrapping for
       * longer badge names ("Grand Prix Champion") rather than clipping. */}
      <h3
        className={cn(
          "font-semibold tracking-tight uppercase leading-[1.15]",
          "text-center px-1.5 pt-2 pb-1 line-clamp-2 text-white",
          sizeConfig.titleClass,
        )}
      >
        {badge.name}
      </h3>

      {/* Icon-hero zone. className `badge-hero` is the anchor for
       * foil-rare's icon-clean override (reverse-holo convention). */}
      <div className="badge-hero relative flex-1 flex items-center justify-center">
        <IconComponent
          size={sizeConfig.iconSize}
          style={{ color: earned ? badge.icon_color : "rgba(255,255,255,0.3)" }}
        />
      </div>
    </>
  );

  if (onClick) {
    return (
      <motion.button
        type="button"
        ref={ref as React.Ref<HTMLButtonElement>}
        onClick={onClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        aria-label={badge.name}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
        className={wrapperClass}
        style={motionStyle}
      >
        {cardChildren}
      </motion.button>
    );
  }

  return (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={wrapperClass}
      style={motionStyle}
    >
      {cardChildren}
    </motion.div>
  );
};

export default BadgeFoilCard;
export { FOIL_CLASS_MAP };
