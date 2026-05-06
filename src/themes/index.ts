// Theme registry. Single point of truth for JS-readable theme values
// (Recharts series colors, confetti palettes, tier foil arrays, etc.).
//
// Components consume CSS-readable tokens via Tailwind utilities generated
// from the active theme's tokens.css. This module covers the cases that
// can't read CSS vars: Recharts series, framer-motion confetti color arrays,
// next/metadata theme-color, and any place we need the tier name + color
// pair in JS.
//
// Contract: src/themes/README.md.

import { palette } from "./manga-ink/palette";

export const activeThemeName: string =
  process.env.NEXT_PUBLIC_THEME ?? "manga-ink";

export type TierColor = { tier: number; name: string; color: string };

export const tierColors: TierColor[] = [
  { tier: 1, name: "Bronze", color: palette.tier1 },
  { tier: 2, name: "Silver", color: palette.tier2 },
  { tier: 3, name: "Gold", color: palette.tier3 },
  { tier: 4, name: "Platinum", color: palette.tier4 },
  { tier: 5, name: "Diamond", color: palette.tier5 },
  { tier: 6, name: "Champion", color: palette.tier6 },
];

// 8-color sequence for Recharts series. Distinct hues, all aligned with
// Manga Ink's vermillion / jade / gold / cobalt / copper accent set.
//
// TODO(theming): admin Recharts pages (admin/page.tsx, admin/duels/page.tsx,
// admin/engagement/page.tsx, admin/leagues/page.tsx, admin/retention/page.tsx,
// admin/revenue/page.tsx) still hardcode their own slate/orange palettes.
// Phase 0 leaves them alone — refactor in a follow-up session.
export const chartPalette: string[] = [
  palette.primary,
  palette.success,
  palette.tier3,
  palette.tier5,
  palette.tier1,
  palette.warning,
  palette.tier2,
  palette.accent,
];

// 5-color celebration palette for confetti / spark effects.
export const confettiPalette: string[] = [
  palette.primary,
  palette.success,
  palette.tier3,
  palette.accent,
  palette.tier5,
];

// Badge rarity styling. Uses Tailwind named-color utilities (not theme tokens)
// to preserve the existing rarity tier visuals — those colors are part of
// the rarity contract, not the brand palette. Centralized here so consumers
// import once instead of redeclaring the mapping.
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const rarityColors: Record<Rarity, { bg: string; border: string }> = {
  common: { bg: "bg-gray-500/10", border: "border-gray-500/50" },
  uncommon: { bg: "bg-emerald-500/10", border: "border-emerald-500/60" },
  rare: { bg: "bg-blue-500/10", border: "border-blue-500/60" },
  epic: { bg: "bg-purple-500/10", border: "border-purple-500/60" },
  legendary: { bg: "bg-yellow-400/10", border: "border-yellow-400/80" },
};

export { palette };
