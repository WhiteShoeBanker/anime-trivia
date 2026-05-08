---
version: alpha
name: Manga Ink
description: Anime-energetic dark theme — vermillion hanko stamp on warm ink-black, paired with extra-bold display sans for headlines and DM Sans for body. Anton is loaded as the display family but currently underused; today the codebase leans on DM Sans extrabold at large sizes for headline emphasis. Crunchyroll-meets-Duolingo energy executed with editorial restraint.
colors:
  primary: "#d4451d"
  secondary: "#0c0a09"
  accent: "#b91c1c"
  success: "#16a34a"
  surface: "#1c1917"
  text: "#ede9e0"
  text-muted: "#a3a097"
  rule: "#262626"
  warning: "#d97706"
  error: "#991b1b"
  paper: "#f7f3eb"
  ink: "#0a0a0a"
  rule-paper: "#d6d3d1"
  tier-1: "#a16207"
  tier-2: "#94a3b8"
  tier-3: "#eab308"
  tier-4: "#cbd5e1"
  tier-5: "#3b82f6"
  tier-6: "#dc2626"
typography:
  display:
    fontFamily: Anton
    fontSize: 56px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  h1:
    fontFamily: DM Sans
    fontSize: 36px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  h2:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
  h3:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.04em
  caption:
    fontFamily: DM Sans
    fontSize: 10px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.06em
rounded:
  sharp: 2px
  pill: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sharp}"
    padding: 12px 20px
---

## Overview

Manga Ink is OtakuQuiz's default theme. The audience is Gen Z and Gen Alpha anime fans (10–24); the tone is anime-energetic but deliberately restrained — Crunchyroll showmanship met with Duolingo discipline. The visual reference is the manga page: warm ink-black paper, a single vermillion hanko stamp as the trust signal, hairline rules instead of glassmorphism, and bold sans-serif type doing the lifting that gradients or shadows would carry in a generic gamified UI.

The brand color is hanko vermillion (#d4451d). It appears on primary actions, focus rings, brand wordmarks, and the "you're correct" jade-bordered moments. The accent (#b91c1c, blood ink) is reserved for incorrect-answer flashes and other high-tension states. Everything else recedes into bone-on-ink-black to keep attention on questions, scores, and answer choices.

Design principles, in priority order:

1. Restraint over showmanship. Energy comes from typography weight and vermillion accents, not from gradients or animation chrome.
2. Manga-page semantics. Ink, paper, hanko stamp, hairline rules. Avoid glass, glow, neon — those belong to a different aesthetic.
3. Single trust color. The vermillion primary is reserved for primary actions, focus, and brand. It is not used for body links or decoration.
4. Tier foils carry rank, not personality. The six-step Bronze→Champion ladder uses distinct foils (copper, gunmetal, gold, platinum, cobalt, red foil) that signal achievement without competing with the brand color.
5. Dark is canonical. The Manga Ink palette is dark-mode-canonical. Paper-mode tokens (paper, ink, rule-paper) exist for prestige surfaces — certificates, end-game splash screens, prestige badges — applied in later phases.

## Colors

The palette pivots on a single vermillion brand anchor over a warm ink-black canvas, with bone for type and a steel-cool tier ladder for ranks.

Brand and surfaces:

- **Primary (#d4451d, hanko vermillion):** The trust signal. Primary buttons, focus rings, brand wordmark, "correct" celebrations, the dot on the OtakuQuiz logo when it exists. Reserved — never used for body links.
- **Secondary (#0c0a09, warm ink-black):** Page canvas. Slightly warm so it reads as ink on paper rather than OLED-black.
- **Accent (#b91c1c, blood ink):** High-tension states — incorrect-answer flashes, danger-mode timers, error overlays. Distinct enough from primary that the user reads them as different signals.
- **Success (#16a34a, jade):** Correct-answer markers, streaks, success toasts. Cool foil to the warm primary.
- **Surface (#1c1917, raised stone):** Card and elevated-container fills. Sits one notch warmer than the secondary canvas so cards have presence without shadows.

Text and structural:

- **Text (#ede9e0, bone):** Body text and headings. Slight warm undertone so it reads as ink on aged paper, not pure white.
- **Text-muted (#a3a097, washed bone):** Captions, metadata, secondary labels.
- **Rule (#262626, hairline):** Default border between ink and surface. Subtle separation without drawing attention.

Status (semantic):

- **Warning (#d97706, amber):** Time-sensitive cautions, "almost out" states.
- **Error (#991b1b, washed ink red):** Form validation errors, sign-out failure modals. Distinct from accent because it's lower saturation — error is calmer than alarm.

Paper-mode (prestige inversions, applied in later phases):

- **Paper (#f7f3eb):** Light cream surface for certificate/prestige UI. Inverts the canonical palette.
- **Ink (#0a0a0a):** Near-black ink for paper-mode type. Slightly darker than secondary so the inversion reads as a different surface entirely.
- **Rule-paper (#d6d3d1):** Hairline borders on paper-mode surfaces.

Tier foils (Bronze → Champion ladder):

- **tier-1 (#a16207, copper):** Bronze tier.
- **tier-2 (#94a3b8, gunmetal):** Silver tier.
- **tier-3 (#eab308, sun gold):** Gold tier.
- **tier-4 (#cbd5e1, platinum sheen):** Platinum tier.
- **tier-5 (#3b82f6, cobalt holo):** Diamond tier.
- **tier-6 (#dc2626, red foil champion):** Champion tier.

The tier foils are deliberately cooler than the brand vermillion — they signal achievement using a steel/jewel-tone register that doesn't compete for the primary's role.

Note: the JS-side `palette` export in `src/themes/manga-ink/palette.ts` mirrors these tokens for code paths that can't read CSS custom properties (Recharts series, framer-motion confetti, `theme-color` meta). `src/themes/index.ts` further composes `chartPalette` (8-color Recharts sequence) and `confettiPalette` (5-color celebration array) from these primitives.

## Typography

Two faces, with strict role separation:

- **Anton (display, condensed sans):** Loaded via `next/font/google` with the `--font-display` variable, weight 400. Intended for hero displays, splash titles, prestige moments. Currently underutilized — most headline-shaped content in the codebase uses DM Sans extrabold instead. Phase 3 audit will surface specific call sites.
- **DM Sans (body sans, variable weight):** Loaded via `next/font/google` with the `--font-body` variable, full weight axis available. Carries body, headings (in practice), labels, captions, button copy. Pairs with Anton as the display foil when display is invoked.

Type roles captured in tokens are grounded in current codebase usage. Sizes match Tailwind v4 defaults the codebase already consumes (`text-base` 16px, `text-lg` 18px, `text-xl` 20px, `text-2xl` 24px, `text-3xl` 30px, `text-4xl` 36px). Headline tokens reflect actual rendering: `font-extrabold` on h1-shaped elements is widespread, hence h1 weight 800.

Application rules:

- Headline weight is 700–800. Visual hierarchy comes from weight + size, not letter-spacing tricks.
- Body weight is 400. Bold within prose is reserved for genuine emphasis, not decoration.
- Labels and captions are 700 weight at small sizes (10–12px), letter-spaced — they read as eyebrows / metadata.
- Tabular numerics (`font-variant-numeric: tabular-nums`) are not yet wired but should be applied to score readouts, leaderboard ranks, and timer displays. Phase 3 audit will flag.
- Anton's reserved use case: the homepage hero, the rank-up splash, prestige certificate UI. If a designer reaches for "extra bold sans-serif at 4xl" for headline drama, prefer Anton.

## Layout

OtakuQuiz uses **Tailwind v4 default spacing** — there are no custom spacing tokens in `tokens.css`. The codebase consumes `gap-1` … `gap-12`, `p-2` … `p-8`, etc. directly. Sub-pixel adjustments and arbitrary values are discouraged but not enforced; this will tighten in Phase 4 (Stage 0 foundation).

Containers:

- Most pages use `max-w-7xl mx-auto` for the outer chrome (1280px effective max).
- Quiz reading column on long-form pages targets `max-w-3xl` (768px).
- Mobile breakpoint baseline is 375px (iPhone SE) — content must still be reachable at that width without horizontal scroll.

Touch targets:

- **44×44px minimum** for any interactive element on mobile/tablet (per CLAUDE.md project rule). This is not negotiable — COPPA-aged users (junior tier, 10–12) have less precise touch.

Breakpoints follow Tailwind v4 defaults: sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1536px. The header collapses to a hamburger overlay below `md`.

## Elevation & Depth

Manga Ink is largely flat. Depth comes from surface contrast (raised-stone cards on ink-black canvas) and hairline rules, not from box-shadows.

The single defined shadow token is `--shadow-ink` (`0 4px 0 0 rgba(0,0,0,0.4)`) — a hard-edged offset, not a blur. It evokes the offset registration of a manga panel rather than a floating-card glow. Reserved for tactile elements that benefit from "pressable" feel (primary action buttons in some contexts, badge cards on the Badges page).

There are no soft blur shadows. There are no gradients. Hover states deepen existing fills or shift opacity; they do not introduce new visual layers.

The Navbar's `backdrop-blur-lg + bg-secondary/80` glass treatment is the one exception, and even there the blur is subtle — the canvas underneath is already near-black, so the effect reads as "frosted ink" rather than glassmorphism.

## Shapes

The shape language is **sharp**. The two rounded tokens are intentionally extreme:

- **rounded.sharp (2px):** Cards, buttons, inputs, modals — anything rectangular. Not zero, because absolute zero reads as "unfinished," but barely softened.
- **rounded.pill (9999px):** Avatar circles, status pills, score-bar caps, the Pro / age-tier chips. Reserved for tokens that semantically should be round-ended.

There is no medium rounded value. The visual language alternates between sharp rectangles and full pills — not a smooth scale of softness. Mid-rounding (4–12px) would dilute both registers.

## Components

Component-level tokens are defined alongside their refactors in **Phase 5 (component-by-component pass)**. The audit (Phase 3) will surface which components most urgently need named tokens — likely buttons, pills, age-tier chips, and the badge-card pattern.

Currently captured in YAML:

- **button-primary** — minimum viable definition: vermillion background, white text, body-sm typography, sharp rounding, 12px×20px padding. Reflects the existing `bg-primary text-white px-4 py-2` pattern in Navbar and similar call sites. The hover variant is not yet captured because the codebase is inconsistent — `hover:bg-primary/90` appears in some places, raw `hover:bg-primary/80` in others. Audit flags this.

Not captured (deferred):

- Pills (age-tier "Jr"/"T", PRO subscription, pendingDuels count, stock-style status pills)
- Cards (BadgeIcon, anime-series cards, leaderboard rows)
- Tables (admin analytics, leagues, leaderboards)
- Forms (auth, parent consent, profile edit)
- Navigation (lifted Navbar mobile overlay just shipped — fix/mobile-nav-overlay)
- Footer
- Quiz answer-choice tiles
- Badge / emblem rendering

Each of these will get its own Phase 5 prompt with named tokens added to DESIGN.md alongside the component refactor.

## Do's and Don'ts

Do:

- Reserve hanko vermillion (primary) for primary actions, focus rings, brand wordmark, and correct-answer celebrations. It is the single trust color.
- Use bone (text) on ink-black (secondary) as the default contrast pairing. WCAG AA passes comfortably.
- Use raised-stone (surface) for elevated cards on the ink-black canvas. Skip the shadow — surface contrast is the depth.
- Pair Anton with DM Sans 700–800 when both display drama and body legibility are needed in the same view. Don't introduce a third typeface.
- Treat the tier foils (Bronze → Champion) as a separate semantic register from the brand. Champions wear red foil, but it is foil, not vermillion.
- Maintain 44×44px touch targets. Junior-tier users are real users; their thumbs are smaller.

Don't:

- Don't use raw black (#000000) — secondary is warm-tinted ink-black for a reason. Same for raw white (#ffffff) — text is bone.
- Don't introduce gradients. The ink-and-paper register is the brand.
- Don't introduce glass / blur effects beyond the existing Navbar treatment. They erode the manga-page semantics.
- Don't use accent (blood ink) for decoration — it is reserved for incorrect-answer / danger states.
- Don't use vermillion for body links. Body links are bone with underline, vermillion on hover only.
- Don't render Anton at body sizes. It is a display face; below 32px it loses character.
- Don't add medium-rounded corners (4–12px). The shape language is sharp-or-pill, not a continuous scale.
- Don't paint admin analytics charts in raw Tailwind palette colors. Use `chartPalette` from `@/themes`. The current admin pages drift here and will be refactored in a focused follow-up session.

When implementation deviates from this spec, update DESIGN.md FIRST, then code. The spec is the contract.
