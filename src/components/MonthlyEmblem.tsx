"use client";

import type { Badge, BadgeRarity, GrandPrixEmblem } from "@/types";
import BadgeFoilCard, { type BadgeFoilCardSize } from "./BadgeFoilCard";

interface MonthlyEmblemProps {
  emblem: GrandPrixEmblem;
  size?: BadgeFoilCardSize;
  showLabel?: boolean;
}

const VALID_RARITIES: readonly BadgeRarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];

const toRarity = (raw: string): BadgeRarity =>
  (VALID_RARITIES as readonly string[]).includes(raw)
    ? (raw as BadgeRarity)
    : "legendary";

// Phase 6d-i: MonthlyEmblem composes <BadgeFoilCard> via an adapter.
// GrandPrixEmblem and Badge are structurally close but not identical —
// the synthetic Badge fills the contract slots BadgeFoilCard doesn't read
// (slug, category, requirement_*) with sensible defaults so the card can
// render through its existing foil ladder + tilt + reduced-motion gates.
const MonthlyEmblem = ({
  emblem,
  size = "md",
  showLabel,
}: MonthlyEmblemProps) => {
  const adapterBadge: Badge = {
    id: emblem.id,
    slug: emblem.tournament_id,
    name: emblem.month_label,
    description: emblem.description,
    icon_name: emblem.icon_name,
    icon_color: emblem.icon_color,
    category: "grand_prix",
    rarity: toRarity(emblem.rarity),
    requirement_type: "tournament_win",
    requirement_value: {},
    created_at: emblem.created_at,
  };

  // Dense grids (size="sm") want the external label for legibility under
  // the small card; hero/showcase sizes already carry the month_label as
  // the card title, so the external label would double up.
  const resolvedShowLabel = showLabel ?? size === "sm";

  return (
    <div className="flex flex-col items-center">
      <BadgeFoilCard badge={adapterBadge} size={size} earned />
      {resolvedShowLabel && (
        <p className="text-xs text-white/50 font-medium text-center mt-1.5">
          {emblem.month_label}
        </p>
      )}
    </div>
  );
};

export default MonthlyEmblem;
