"use client";

import type { Badge } from "@/types";
import BadgeFoilCard from "./BadgeFoilCard";

// Static decorative artifact for the /star-league "Coming Soon" page — the
// Champion Foil membership card (Direction 2, DESIGN.md badge-foil-prestige).
// No DB backing or earned-state lookup: Star League hasn't launched, so the
// emblem is aspirational marketing chrome. The prestige foil treatment is
// collectible-emblem-scoped — this adapter is its sole consumer.
//
// Crown glyph (gold) over the red-foil prestige card: signals elite/champion
// membership, distinct from the Diamond *prerequisite* league tier, and
// consistent with the app's existing Crown=league iconography.
const STAR_LEAGUE_BADGE: Badge = {
  id: "star-league-emblem",
  slug: "star-league",
  name: "Star League",
  description: "Elite competitive arena membership.",
  icon_name: "Crown",
  icon_color: "#eab308",
  category: "special",
  requirement_type: "manual",
  requirement_value: {},
  // rarity is required by the Badge type but inert here — the `prestige` prop
  // overrides both the foil class and the border, so this value is unused.
  rarity: "legendary",
  created_at: "2026-01-01T00:00:00Z",
};

const StarLeagueEmblem = () => (
  <BadgeFoilCard badge={STAR_LEAGUE_BADGE} prestige earned size="xl" />
);

export default StarLeagueEmblem;
