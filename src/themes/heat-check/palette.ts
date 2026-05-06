// Heat Check theme — JS-readable palette.
// Mirrors the CSS custom properties declared in ./tokens.css for code paths
// that can't read CSS vars (Recharts, framer-motion confetti, theme-color
// meta). Keep in sync with tokens.css; src/themes/README.md describes the
// contract.

export const palette = {
  // Brand
  primary: "#dc2828",     // vermillion — the single commanding hot
  secondary: "#0a0a0a",   // ink black, page
  accent: "#dc2828",      // same as primary (single-hot discipline)
  success: "#16a34a",     // jade
  surface: "#1a1a1a",     // raised card
  electric: "#dfff20",    // chartreuse punch

  // Text + structural
  text: "#f5f1e8",        // bone
  textMuted: "#a8a29e",   // washed bone
  rule: "#262626",

  // Status
  warning: "#d97706",     // amber
  error: "#991b1b",       // washed ink red

  // Paper-mode (prestige surfaces)
  paper: "#f5f1e8",
  ink: "#000000",
  rulePaper: "#d6d3d1",

  // Tier foils (Bronze → Champion)
  tier1: "#c87d3e",       // warm copper
  tier2: "#b8b8c2",       // cool gunmetal pearl
  tier3: "#f4c430",       // bright sun gold
  tier4: "#dde2e8",       // platinum sheen
  tier5: "#38bdf8",       // electric cobalt
  tier6: "#dc2828",       // red foil champion
} as const;

export type Palette = typeof palette;
