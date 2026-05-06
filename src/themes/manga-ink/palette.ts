// Manga Ink theme — JS-readable palette.
// Mirrors the CSS custom properties declared in ./tokens.css for code paths
// that can't read CSS vars (Recharts, framer-motion confetti, theme-color meta).
// Keep this file in sync with tokens.css; src/themes/README.md describes the contract.

export const palette = {
  // Brand
  primary: "#d4451d", // hanko vermillion
  secondary: "#0c0a09", // warm ink-black, page
  accent: "#b91c1c", // blood ink
  success: "#16a34a", // jade
  surface: "#1c1917", // raised stone, cards

  // Text + structural
  text: "#ede9e0", // bone
  textMuted: "#a3a097", // washed bone
  rule: "#262626", // hairline borders

  // Status
  warning: "#d97706", // amber
  error: "#991b1b", // washed ink red

  // Paper-mode (prestige surfaces, applied in later phases)
  paper: "#f7f3eb",
  ink: "#0a0a0a",
  rulePaper: "#d6d3d1",

  // Tier foils (Bronze → Champion)
  tier1: "#a16207", // copper
  tier2: "#94a3b8", // gunmetal
  tier3: "#eab308", // sun gold
  tier4: "#cbd5e1", // platinum sheen
  tier5: "#3b82f6", // cobalt holo
  tier6: "#dc2626", // red foil champion
} as const;

export type Palette = typeof palette;
