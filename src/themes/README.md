# Themes

OtakuQuiz ships with the "Heat Check" theme as the default — Arcade Edition,
single-hot-color discipline (sunset vermillion `#ea580c` on ink black) with
sci-fi notched panels, halftone bursts, and terminal-cursor accents. The
architecture leaves a clean path for a future general-trivia app to register
its own theme without touching component code: every consumer reads from
semantic tokens (Tailwind utilities generated from `--color-*`, `--font-*`,
etc.) or from a single TS registry (`src/themes/index.ts`) for the JS-only
cases.

## Directory layout

```
src/themes/
├── index.ts                # active-theme registry; JS-readable values
├── README.md               # this file
└── heat-check/
    ├── palette.ts          # JS palette — mirrors tokens.css colors
    └── tokens.css          # CSS @theme inline + texture utilities
```

A second theme would live as a sibling directory (e.g. `src/themes/general-trivia/`)
with the same two files.

## Theme contract

### Required CSS tokens (defined in `<theme>/tokens.css`)

Every theme must define these inside a single `@theme inline { … }` block so
Tailwind v4 can generate the corresponding utilities (`bg-primary`,
`text-success`, `font-display`, etc.).

**Brand:**
- `--color-primary`
- `--color-secondary`
- `--color-accent`
- `--color-success`
- `--color-surface`

**Text & structural:**
- `--color-text`
- `--color-text-muted`
- `--color-rule`

**Status:**
- `--color-warning`
- `--color-error`

**Tier foils (six-step ladder, Bronze → Champion equivalents):**
- `--color-tier-1` … `--color-tier-6`

**Typography:**
- `--font-display` — Heat Check Arcade Edition uses **Rajdhani** (variable,
  sci-fi geometric, designed for ALL CAPS legibility from 12px to 80px).
  Replaced Anton after Round 1 smoke test feedback that condensed-display
  ALL CAPS hurt readability.
- `--font-body` — DM Sans
- `--font-sans` (alias of `--font-body`, kept for backwards compatibility)
- `--font-mono` — JetBrains Mono (used for terminal cursor accents and
  numerics on stat cards)

**Radii & shadows:**
- `--radius-sharp`
- `--radius-pill`
- `--shadow-ink`
- `--shadow-hot` — single-hot-color offset shadow (Heat Check: `4px 4px 0 0
  #ea580c`); used for the "current tier" highlight and CTA hover states.

**Animations** (must include keyframes inside the `@theme inline` block):
- `--animate-fade-in`, `--animate-slide-up`, `--animate-slide-in-right`,
  `--animate-pulse-slow`, `--animate-shake`, `--animate-scale-up`,
  `--animate-float`, `--animate-count-pulse`

### Required TS exports (from `<theme>/palette.ts`)

`palette.ts` exports a single `palette` object whose keys mirror the CSS
custom properties one-to-one (camelCase: `--color-text-muted` → `textMuted`,
`--color-tier-1` → `tier1`). The Heat Check file is the canonical reference.

### Optional CSS utilities

Themes may define additional utility classes outside `@theme inline` for
texture / decoration. Heat Check Arcade Edition ships:

- `.texture-halftone` — radial-dot pattern using `currentColor`
- `.texture-grain` — SVG turbulence noise overlay
- `.clip-notch-corners` — 8-point polygon clip-path notching all four corners
  (sci-fi panel motif)
- `.clip-notch-tr-bl` — diagonal clip notching top-right + bottom-left only
  (used on CTA buttons and stat cards)
- `.hl-hot` — inline keyword highlight box (`bg-primary text-black`, padded);
  apply to a span around punch words inside body copy
- `.cursor` — appends a blinking terminal underscore via `::after`. Pair with
  `@keyframes cursor-blink` (1.1s steps animation). Honors
  `prefers-reduced-motion` — animation disabled, cursor stays solid.
- `.halftone-burst` — radial gradient orange wash plus a fine dot grid stacked
  directly (not via `background-blend-mode: multiply`, which crushed dots
  against the dark hero). Used behind hero focal points.
- `.tech-grid` — subtle wireframe grid background for hero zones

These are applied via `className` on individual elements and aren't part of
the required contract. Other themes can ship different decorations.

### Heading typography rule

`globals.css` defines a deliberately restrained default for `h1`–`h6`:
`font-family: var(--font-body); font-weight: 700; letter-spacing: -0.02em`.
Headings render in DM Sans Bold sentence case by default.

Marquee moments (hero greeting, prestige zone titles, tier badge labels)
opt **into** Rajdhani uppercase via Tailwind classes:

```tsx
<h1 className="font-display uppercase tracking-tight">Welcome back,</h1>
```

This is intentional — Round 1 applied the display font globally to every
heading, which the user rejected as "very hard to read." Apply marquee
typography selectively, not globally.

## Activating a theme

Two switches need to flip:

1. **CSS:** the import at the top of `src/app/globals.css` selects the theme's
   `tokens.css`:
   ```css
   @import "../themes/heat-check/tokens.css";
   ```

2. **TS:** the import inside `src/themes/index.ts` selects the theme's
   `palette.ts`:
   ```ts
   import { palette } from "./heat-check/palette";
   ```

`process.env.NEXT_PUBLIC_THEME` is exposed via `activeThemeName` for any
runtime branching that needs to know which theme is active. (Today both
imports are static — switching themes still requires editing those two
lines, not just an env var. Phase 1 may wire them to NEXT_PUBLIC_THEME.)

## Adding a new theme

1. Create `src/themes/<theme-slug>/` with `tokens.css` and `palette.ts`,
   following the contract above.
2. Update the two import lines in `src/app/globals.css` and `src/themes/index.ts`
   to point at the new theme.
3. Set `data-theme="<theme-slug>"` on `<html>` in `src/app/layout.tsx`
   (currently static; will be dynamic when general-trivia theme exists).
4. Verify: every component should still build and render — they read from
   semantic tokens, not literal hex values.

## Consumers

CSS consumers (the common case): use Tailwind utilities — `bg-primary`,
`text-success`, `border-rule`, `rounded-sharp`, `shadow-ink`, `font-display`,
`font-body`, etc.

JS consumers: import from `@/themes`:
- `tierColors` — `Array<{ tier, name, color }>`, six entries
- `chartPalette` — 8-color string array for Recharts series
- `confettiPalette` — 5-color string array for celebration effects
- `rarityColors` — badge rarity → Tailwind class mapping
- `palette` — full keyed palette for one-off color reads
- `activeThemeName` — current theme slug

## Known TODOs

- **Admin Recharts pages** (`src/app/admin/page.tsx`, `admin/duels/page.tsx`,
  `admin/engagement/page.tsx`, `admin/leagues/page.tsx`, `admin/retention/page.tsx`,
  `admin/revenue/page.tsx`) still hardcode ~80 hex literals. Phase 0 leaves
  them alone; they're a focused follow-up session that swaps to `chartPalette`.
- **Badge / emblem `icon_color`** is per-row data in Postgres
  (`badges.icon_color` column), not a theme concern. Phase 3 will decide
  whether to (a) add a theme-tinted overlay, (b) re-seed colors per theme,
  or (c) leave badges as data-driven and theme-independent.
- **`data-theme` attribute** on `<html>` is static (`manga-ink`). When a
  second theme is registered, wire this to `activeThemeName` and switch the
  CSS / TS imports accordingly.
