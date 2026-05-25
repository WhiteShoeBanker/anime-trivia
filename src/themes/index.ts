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

import type { DuelDifficulty } from "@/types";

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
// admin/revenue/page.tsx) still hardcode their own series + DIFFICULTY palettes.
// A1 landed chart-chrome + tooltipStyle migration; A2 will land semantic
// palette consumption (difficultyPalette, chartPalette, audiencePalette).
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

// Rarity human-readable labels + text-color utility for prose. Hoisted from
// BadgeCard.tsx and BadgeCelebration.tsx (both carried identical copies).
// Pairs with rarityColors: rarityColors drives the frame (border + bg),
// rarityLabels drives the inline label (text + color).
export const rarityLabels: Record<Rarity, { text: string; color: string }> = {
  common: { text: "Common", color: "text-gray-400" },
  uncommon: { text: "Uncommon", color: "text-emerald-400" },
  rare: { text: "Rare", color: "text-blue-400" },
  epic: { text: "Epic", color: "text-purple-400" },
  legendary: { text: "Legendary", color: "text-yellow-400" },
};

// Audience-fit palette. Hoisted per DESIGN.md spec gap #2 closure —
// junior/teen/mature are the three identity-chip hues for age-tier and
// content-rating registers. Mirrors --color-audience-* in tokens.css; the
// exported hexes are for JS code paths that can't read CSS custom
// properties (theme-color meta, framer-motion, etc.).
export const audiencePalette = {
  junior: "#10b981",
  teen: "#facc15",
  mature: "#ef4444",
} as const;

// Difficulty palette. easy/medium/hard reference the audience hues directly
// (same visual register, different semantic axis — the "easy reuses
// audience-junior" contract is enforced here in code, not just in comments);
// impossible + mixed are net-new. Mirrors --color-difficulty-impossible /
// --color-difficulty-mixed in tokens.css.
export const difficultyPalette = {
  easy: audiencePalette.junior,
  medium: audiencePalette.teen,
  hard: audiencePalette.mature,
  impossible: "#a855f7",
  mixed: "#60a5fa",
} as const;

// Admin Recharts chart chrome. Slate-palette values used for axis ticks,
// axis lines, and tooltip frames across all 6 admin chart pages. Previously
// these hexes were copy-pasted inline at every chart instance; A1 hoisted
// them here so the dark-shell chrome contract is single-sourced.
//
// Not part of palette: these are chart-internal chrome, not brand colors.
export const adminChartChrome = {
  axisTick: "#94a3b8",
  axisLine: "#475569",
  tooltipBg: "#1e293b",
  tooltipBorder: "#334155",
  tooltipText: "#f1f5f9",
} as const;

// Canonical Recharts <Tooltip contentStyle={...}> object. Derives from
// adminChartChrome so any chrome change propagates. Consumers needing extra
// keys (fontSize, etc.) should spread: `contentStyle={{ ...tooltipStyle, fontSize: "0.875rem" }}`.
export const tooltipStyle = {
  backgroundColor: adminChartChrome.tooltipBg,
  border: `1px solid ${adminChartChrome.tooltipBorder}`,
  borderRadius: "0.5rem",
  color: adminChartChrome.tooltipText,
} as const;

// DifficultyTone aliases the canonical @/types DuelDifficulty (= Difficulty |
// "mixed"). The name is kept so existing consumers (DuelClient, DifficultyChip)
// don't churn; the single source of truth is the types layer.
export type DifficultyTone = DuelDifficulty;

export const difficultyLabels: Record<DifficultyTone, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  impossible: "Impossible",
  mixed: "Mixed",
};

export { palette };
