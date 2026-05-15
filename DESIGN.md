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
  error-strong: "#f87171"
  paper: "#f7f3eb"
  ink: "#0a0a0a"
  rule-paper: "#d6d3d1"
  tier-1: "#a16207"
  tier-2: "#94a3b8"
  tier-3: "#eab308"
  tier-4: "#cbd5e1"
  tier-5: "#3b82f6"
  tier-6: "#dc2626"
  audience-junior: "#10b981"
  audience-teen: "#facc15"
  audience-mature: "#ef4444"
  difficulty-impossible: "#a855f7"
  difficulty-mixed: "#60a5fa"
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
  field-label:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  caption:
    fontFamily: DM Sans
    fontSize: 10px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.06em
  weight-medium: 500
  weight-semibold: 600
rounded:
  sharp: 2px
  card: 12px
  pill: 9999px
aspectRatio:
  tcg-card: "3 / 4"
shadow:
  ink: "0 4px 0 0 rgba(0,0,0,0.4)"
motion:
  tilt-card:
    perspective: 800px
    maxRotate: 12deg
    transitionStiffness: 200
    transitionDamping: 20
  reducedMotionFallback: "static foil image; no tilt; no animation"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sharp}"
    padding: 12px 20px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sharp}"
    padding: 12px 20px
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sharp}"
    padding: 12px 20px
  button-outline:
    backgroundColor: "transparent"
    borderColor: "{colors.rule}"
    textColor: "{colors.text}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sharp}"
    padding: 12px 20px
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.sharp}"
    width: 44px
    height: 44px
  card-default:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  card-elevated:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  badge-icon-sm:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    width: 32px
    height: 32px
  badge-icon-md:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    width: 48px
    height: 48px
  badge-icon-lg:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    width: 64px
    height: 64px
  badge-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: 16px
    typography: "{typography.body-sm}"
  emblem-monthly:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    width: 56px
    height: 56px
  panel-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.warning}"
    borderColor: "{colors.warning}"
    rounded: "{rounded.card}"
    padding: 16px 20px
  badge-foil-card:
    aspectRatio: "3 / 4"
    width: 96px
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.rule}"
    rounded: "{rounded.card}"
    typography: "{typography.body-sm}"
  badge-foil-common:
    treatment: matte
    overlay: none
  badge-foil-uncommon:
    treatment: gloss
    overlay: gradient-sheen-linear
    animation: foil-sheen-2s
  badge-foil-rare:
    treatment: reverse-holo
    overlay: gradient-holo-background-only
    animation: foil-shimmer-3s
  badge-foil-epic:
    treatment: full-holo
    overlay: conic-rainbow-parallax
    animation: foil-shimmer-tilt-driven
  badge-foil-legendary:
    treatment: secret-rare
    overlay: conic-rainbow-parallax-with-sparkles
    animation: foil-shimmer-tilt-driven + sparkle-stagger-3s
  pill-sm:
    rounded: "{rounded.pill}"
    padding: 2px 8px
    typography: "{typography.caption}"
  pill-md:
    rounded: "{rounded.pill}"
    padding: 4px 12px
    typography: "{typography.label}"
  pill-interactive:
    rounded: "{rounded.pill}"
    padding: 10px 14px
    minHeight: 44px
    typography: "{typography.label}"
  pill-pro:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    treatment: filled
  pill-audience-junior:
    backgroundColor: "{colors.audience-junior}"
    textColor: "{colors.ink}"
    treatment: filled
  pill-audience-teen:
    backgroundColor: "{colors.audience-teen}"
    textColor: "{colors.ink}"
    treatment: filled
  pill-audience-mature:
    backgroundColor: "{colors.audience-mature}"
    textColor: "{colors.ink}"
    treatment: filled
  pill-content-rating-e:
    backgroundColor: "{colors.audience-junior}"
    textColor: "{colors.ink}"
    treatment: filled
  pill-content-rating-t:
    backgroundColor: "{colors.audience-teen}"
    textColor: "{colors.ink}"
    treatment: filled
  pill-content-rating-m:
    backgroundColor: "{colors.audience-mature}"
    textColor: "{colors.ink}"
    treatment: filled
  pill-difficulty-easy:
    backgroundColor: "{colors.audience-junior}"
    textColor: "{colors.audience-junior}"
    treatment: ghost
  pill-difficulty-medium:
    backgroundColor: "{colors.audience-teen}"
    textColor: "{colors.audience-teen}"
    treatment: ghost
  pill-difficulty-hard:
    backgroundColor: "{colors.audience-mature}"
    textColor: "{colors.audience-mature}"
    treatment: ghost
  pill-difficulty-impossible:
    backgroundColor: "{colors.difficulty-impossible}"
    textColor: "{colors.difficulty-impossible}"
    treatment: ghost
  pill-difficulty-mixed:
    backgroundColor: "{colors.difficulty-mixed}"
    textColor: "{colors.difficulty-mixed}"
    treatment: ghost
  count-badge-sm:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    width: 16px
    height: 16px
    typography: "{typography.caption}"
  count-badge-md:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    width: 20px
    height: 20px
    typography: "{typography.caption}"
  pill-status-positive:
    backgroundColor: "{colors.success}"
    textColor: "{colors.success}"
    treatment: ghost
  pill-status-negative:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent}"
    treatment: ghost
  pill-status-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.warning}"
    treatment: ghost
  pill-status-neutral:
    backgroundColor: "{colors.text-muted}"
    textColor: "{colors.text-muted}"
    treatment: ghost
  answer-tile-default:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.rule}"
    textColor: "{colors.text}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sharp}"
    padding: 12px 16px
    minHeight: 56px
  answer-tile-selected:
    backgroundColor: "{colors.primary}"
    borderColor: "{colors.primary}"
    treatment: ghost
  answer-tile-correct:
    backgroundColor: "{colors.success}"
    borderColor: "{colors.success}"
    treatment: ghost
  answer-tile-incorrect:
    backgroundColor: "{colors.accent}"
    borderColor: "{colors.accent}"
    treatment: ghost
  answer-tile-disabled:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.rule}"
    treatment: ghost
  difficulty-chip:
    rounded: "{rounded.pill}"
    padding: 10px 14px
    minHeight: 44px
    typography: "{typography.label}"
  difficulty-chip-easy-active:
    backgroundColor: "{colors.audience-junior}"
    textColor: "{colors.ink}"
    treatment: filled
  difficulty-chip-medium-active:
    backgroundColor: "{colors.audience-teen}"
    textColor: "{colors.ink}"
    treatment: filled
  difficulty-chip-hard-active:
    backgroundColor: "{colors.audience-mature}"
    textColor: "{colors.ink}"
    treatment: filled
  difficulty-chip-impossible-active:
    backgroundColor: "{colors.difficulty-impossible}"
    textColor: "{colors.ink}"
    treatment: filled
  difficulty-chip-mixed-active:
    backgroundColor: "{colors.difficulty-mixed}"
    textColor: "{colors.ink}"
    treatment: filled
  difficulty-chip-easy-inactive:
    backgroundColor: "{colors.audience-junior}"
    textColor: "{colors.audience-junior}"
    treatment: ghost
  difficulty-chip-medium-inactive:
    backgroundColor: "{colors.audience-teen}"
    textColor: "{colors.audience-teen}"
    treatment: ghost
  difficulty-chip-hard-inactive:
    backgroundColor: "{colors.audience-mature}"
    textColor: "{colors.audience-mature}"
    treatment: ghost
  difficulty-chip-impossible-inactive:
    backgroundColor: "{colors.difficulty-impossible}"
    textColor: "{colors.difficulty-impossible}"
    treatment: ghost
  difficulty-chip-mixed-inactive:
    backgroundColor: "{colors.difficulty-mixed}"
    textColor: "{colors.difficulty-mixed}"
    treatment: ghost
  difficulty-chip-locked:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.rule}"
    textColor: "{colors.text-muted}"
    treatment: ghost
  input-default:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.rule}"
    textColor: "{colors.text}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sharp}"
    padding: 12px 16px
    minHeight: 44px
  input-error:
    borderColor: "{colors.error}"
    treatment: ghost
  input-disabled:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.rule}"
    treatment: ghost
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

Audience-fit and difficulty (semantic registers, orthogonal to the brand):

- **audience-junior (#10b981, jade-emerald):** The "safe for ages 6+" register. Surfaces the Junior age-tier chip in the Navbar and the "E 6+" content-rating chip on anime cards. Also serves as the visual base for difficulty-easy. Distinct from `success` (#16a34a) — success is the jade flash for correct answers; audience-junior is the steady identity green for tier/rating chips.
- **audience-teen (#facc15, warm yellow):** The "ages 13+" register. Surfaces the Teen age-tier chip and the "T 13+" content-rating chip. Also serves as the visual base for difficulty-medium. Deliberately a different yellow from `warning` (#d97706 amber) and from `tier-3` (#eab308 sun gold) — three warm yellows for three distinct semantics: heads-up caution, achievement gold, and audience identity.
- **audience-mature (#ef4444, red):** The "ages 16+" register. Surfaces the "M 16+" content-rating chip. Also serves as the visual base for difficulty-hard. Distinct from `accent` (#b91c1c blood ink — incorrect-answer / danger states), `error` + `error-strong` (#991b1b surface / #f87171 body — single form-validation semantic across two luminance registers, per the surface/body split codified in 5#6a), and `tier-6` (#dc2626 red foil champion). Five red tokens span four semantics — do not conflate. The pill bg+text pairing is `audience-mature` over `ink` (not white): white-on-#ef4444 measures 3.76:1, below AA; ink-on-#ef4444 measures ~5.5:1 and passes. This corrects the current `bg-red-500 text-white` AnimeCard M chip.
- **difficulty-impossible (#a855f7, purple):** Net-new hue for the impossible-difficulty register. Used only as a ghost (background and text both rendered from this hue at /20 and full alpha respectively, per the pill-difficulty-* component tokens). Orthogonal to the brand and tier ladders.
- **difficulty-mixed (#60a5fa, sky blue):** Net-new hue for the mixed-difficulty register (currently surfaces only in DuelClient's pre-quiz chip). Distinct from `tier-5` (#3b82f6 cobalt holo) — tier-5 carries the Diamond league achievement signal; difficulty-mixed is a calmer sky tone that doesn't compete.

The audience and difficulty registers exist precisely because the codebase reached for the same emerald/yellow/red traffic-light values inline in 4+ sites without a shared map. The hoist into named tokens closes audit doc spec gap #2 (audience-fit palette) and seeds the difficulty palette for the Phase 5 #4 pill refactor; the JS-side hoist into `audiencePalette` and `difficultyPalette` lands in 5#4b.

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

The shape register has three values: two extremes and one mid-band. The default is **sharp** — soft corners are the exception, reached for only when a surface has a specific reason to read as a place to dwell rather than a thing to act on.

- **rounded.sharp (2px):** Default for buttons, quiz answer tiles, navigation elements, inputs, label pills, table cells, modals, and any standard rectangular wrapper. Not zero, because absolute zero reads as "unfinished," but barely softened. Sharp corners reinforce the ink-and-paper aesthetic — pages that feel drawn rather than rendered.
- **rounded.card (12px):** Reserved for elevated containers — achievement badge cards, emblem displays, prestige surfaces, and content cards that benefit from the softer container treatment. The threshold is semantic, not decorative: surfaces where the user is meant to **dwell and parse content** opt into `card`. Surfaces where the user **takes action** stay `sharp`. When in doubt, default to sharp.
- **rounded.pill (9999px):** Avatar circles, status pills, score-bar caps, the Pro / age-tier chips. Reserved for tokens that semantically should be round-ended.

The earlier two-token register (sharp + pill with a deliberate gap) was intentional but failed contact with implementation: the codebase organically picked a soft mid-band on dwelling surfaces, and the Phase 3 audit found 411 mid-rounded utility usages versus 2 sharp ones. The `card` token codifies that lesson — a third value with a strict semantic, not a smooth scale of softness. Nothing between `sharp` and `card` (3–11px), nothing between `card` and `pill` (13–9998px). Mid-rounding off these three values dilutes the register.

## Components

Component-level tokens are defined alongside their refactors in **Phase 5 (component-by-component pass)**. The audit (Phase 3) will surface which components most urgently need named tokens — likely buttons, pills, age-tier chips, and the badge-card pattern.

Currently captured in YAML:

- **button-primary** — minimum viable definition: vermillion background, white text, body-sm typography, sharp rounding, 12px×20px padding. Reflects the existing `bg-primary text-white px-4 py-2` pattern in Navbar and similar call sites. The hover variant is no longer captured per-token — see the codified hover convention in Do's and Don'ts.
- **button-secondary** — supporting action alongside a primary. Raised-stone surface fill, bone text, sharp rounding. Reach for it when an action matters enough to be a button but should not compete with the page's primary CTA (e.g., "Cancel" next to "Save", "Skip" next to "Continue").
- **button-tertiary** — inline, text-link-like action. Transparent fill, vermillion text, sharp rounding. Reach for it when the action belongs in flowing text or a dense row of small actions, and a surface fill would feel heavy. Never carries the tactile shadow.
- **button-outline** — secondary action on bare/unsurfaced backgrounds where a filled secondary would disappear. Transparent fill, hairline rule border, bone text. Reach for it on hero sections, empty-state CTAs, or anywhere the parent container is the ink-black canvas rather than a raised surface.
- **button-icon** — compact, icon-only action. Transparent fill, washed-bone text, 44×44px square (matches the COPPA touch-target floor). Reach for it for header toggles, close buttons, share/menu affordances. Label via `aria-label` — the icon is not the accessible name.
- **card-default** — standard surface for grouping content. Raised-stone fill, soft `card` rounding, no shadow. The everyday container — anime-series tiles, leaderboard rows, settings panels.
- **card-elevated** — tactile/dwell surface that earns the manga-panel offset shadow. Raised-stone fill, soft `card` rounding, `--shadow-ink` applied. Reserved for surfaces the user is meant to handle as objects rather than read past — badge cards on the Badges page, monthly emblem displays, and other collectible artifacts. See the shadow usage rule in Do's and Don'ts.
- **badge-icon-sm / badge-icon-md / badge-icon-lg** — rectangular icon tiles for achievement badges. Three sizes (32 / 48 / 64 px squares), all `rounded-card`, all on raised-stone surface. These are *tiles*, not cards — they hold a single Lucide glyph and a rarity-tinted border + bg. Don't apply `--shadow-ink` here; the parent surface (a `badge-card` or grid cell) carries the tactile semantic. Sizes correspond to call-site density: `sm` for the Navbar emblem chip and inline confirmation rows, `md` for grid thumbnails and modal-picker cells, `lg` for the badge-card hero icon and the unlock-celebration overlay.
- **badge-card** — wrapper around each badge on the Badges page list view. Raised-stone fill, soft `card` rounding, `body-sm` typography, 16 px internal padding. At the call site it composes with `<Card variant="elevated">` so the `--shadow-ink` lands on the *card* (tactile collectible), with the inner `badge-icon-lg` staying shadow-less. Selected, earned, and unearned states layer borders (`border-primary/60`, `border-white/10`, `border-white/5 opacity-60`) on top of the base via call-site className — those state borders are rarity-orthogonal.
- **emblem-monthly** — monthly emblem display for Grand Prix winners and other named monthly artifacts. 56 px square, raised-stone surface, `rounded-card`. Gold-tinted via `border-tier3/80` + `bg-tier3/10` at the call site (replacing the hardcoded `yellow-400` literal from the pre-Phase-5 codebase — tier3 is sun gold `#eab308`). Renders via the `<BadgeFoilCard>` primitive with the `foil-legendary` treatment, since runtime emblem creation always assigns rarity `legendary` (process-grand-prix route). The original 1:1 square shape transitions to the 3:4 TCG-card aspect inherited from `badge-foil-card`. The foil glow halo (yellow @ 28px blur) supplies the tactile/collectible signal the previous --shadow-ink candidate flagged.
- **panel-warning** — canonical caution surface for heads-up notices that aren't action-bearing: missed-promotion banners, diminishing-returns nudges, time-pressure callouts. Composes warning-tinted text on warning `/10` fill with warning `/30` border (the YAML anchors the palette; the `/10`–`/30` composition is enforced at call sites via Tailwind opacity modifiers — `bg-warning/10`, `border-warning/30`, `text-warning`). Uses `rounded-card` per the dwell-vs-act principle (panels are read, not clicked). Don't reach for accent (blood ink) — accent is reserved for incorrect-answer flashes and danger states; warning is heads-up, not alarm.
- **badge-foil-card** — collectible card primitive for showcase badge surfaces. 3:4 aspect ratio (TCG-canonical), 96 px default width (md), card-rounded corners, rarity-tinted glow halo via `box-shadow` (uncommon emerald, rare blue, epic purple, legendary yellow) layered over the manga-panel ink shadow. The card title uses the app's default sans (DM Sans) at 11/12/14 px (sm/md/lg), uppercase, tight tracking, `line-clamp-2` so longer badge names wrap rather than clip. Phase 6c first smoke tested Anton at 13 px and dropped it — the condensed display face didn't carry at small sizes; sans-condensed-uppercase reads cleaner. The icon-hero zone consumes the full center; the foil overlay (per-rarity, see below) sits between background and icon. Composes `<BadgeFoilCard>` at the call site, which adds 3D tilt + Pointer Events for showcase surfaces (Badges page grid, BadgeCelebration overlay, EmblemSelector picker, profile featured-emblem, daily completion row, landing showcase). Utility surfaces (Navbar chip, profile avatar overlap, leagues roster) keep the matte tile primitive (`BadgeIcon`) — foil signals collectible, not navigation.
- **badge-foil-{common, uncommon, rare, epic, legendary}** — foil treatment tokens that intensify up the rarity ladder. `common` is matte cardboard (no overlay). `uncommon` adds a slow linear sheen sweeping diagonally. `rare` applies a reverse-holo (rainbow conic gradient on the card background, the icon-hero zone stays clean — Pokémon TCG convention). `epic` applies a full-holo (rainbow conic gradient parallaxing against the 3D tilt; gradient origin tracks pointer position via CSS custom properties `--foil-x` / `--foil-y`). `legendary` inherits `epic` + adds animated radial-gradient sparkle particles staggered over a 3 s loop. All treatments degrade to static foil under `prefers-reduced-motion` (no tilt, no animation, lower-intensity static gradient).
- **answer-tile-default** — base quiz answer-choice tile. Sharp corners (action surface, per the L398 sharp-defaults list — quiz tiles are explicitly named there), `body-sm` typography, 56 px minimum height (answer-tile-specific exception above the 44 px floor; tap density during quiz play warrants the extra room). Composes `bg-surface` fill with `border-rule` hairline (call-site `border-white/10` is the near-equivalent the codebase ships today). Hover and focus-visible deepen neutrally per the L495 10/20% convention (`border-white/20`, `bg-white/5` overlay) — explicitly NOT brand-tinted; the brand tint is reserved for the `selected` state, not for pre-commit hover.
- **answer-tile-{selected, correct, incorrect, disabled}** — reveal-state variants. Each extends the default and only overrides the palette anchor: `selected` → `{colors.primary}`, `correct` → `{colors.success}`, `incorrect` → `{colors.accent}` (closes audit L444 `red-500` drift — accent is reserved per L307 for incorrect-answer flashes), `disabled` keeps the default palette and layers `opacity-50` at the call site. Tile composition is ghost (`bg-{tone}/10 border-{tone}`); the `/10` (rather than `pill-difficulty-*`'s `/20`) is intentional because the tile carries body-length answer copy that needs to read against the tinted fill. The inner letter-chip (32×32 px, `rounded-pill`) flips to filled treatment paired with the tile state: `selected` → `bg-primary` + `text-white`; `correct` → `bg-success` + `text-ink` (6.0:1 AA, beats `text-white` at 3.3:1); `incorrect` → `bg-accent` + `text-white` (6.5:1 AA, beats `text-ink` at 3.1:1). The asymmetry between correct (text-ink) and incorrect (text-white) is contrast-driven, not stylistic.
- **difficulty-chip** — interactive pill primitive for the quiz-idle difficulty cluster (`DifficultySelector`) and the duel `ChallengeModal` picker. `rounded-pill`, `label` typography, 10 px × 14 px padding (matches `pill-interactive`), `min-h-[44px]` floor. Distinct from `pill-interactive` because each chip carries its own identity hue rather than the brand-color toggle pattern.
- **difficulty-chip-{easy, medium, hard, impossible, mixed}-{active, inactive}** — per-tone active/inactive pairing. *Active* is filled (`bg-{difficulty-tone}` + `text-ink`); all five tones pair with `text-ink` per AA contrast (easy 7.8:1, medium 12.9:1, hard 5.3:1, impossible 5.0:1, mixed 7.8:1 — all pass; `text-white` fails on every tone). *Inactive* is ghost (`bg-{difficulty-tone}/20` + `text-{difficulty-tone}`), visually identical to the static `pill-difficulty-{tone}` token — the duplicate name is intentional, marking the semantic split between read-only label (`pill-difficulty`) and interactive cluster member (`difficulty-chip`).
- **difficulty-chip-locked** — junior-tier lock state for hard / impossible / mixed tones (COPPA age gate). `bg-surface` with `border-rule`, `text-text-muted`, `opacity-50` at the call site, `cursor-not-allowed`. Lock icon pairs in the component. Distinct from `answer-tile-disabled` (which is reveal-state suppression, not an age gate).
- **input-default** — base text-input chrome. Sharp corners (action surface, per the L398 sharp-defaults list — inputs are explicitly named there alongside buttons and quiz answer tiles), `body-sm` typography, 44 px minimum height (matches the COPPA touch-target floor). Composes `bg-surface` fill with `border-rule` hairline (call-site `border-white/10` is the near-equivalent the codebase ships today — same precedent as `answer-tile-default`'s drift, corrected by token-binding in 5#6c). Placeholder text binds to `text-text-muted/60` (the `/60` alpha maintains distinction from helper text and labels, which both render at full `text-text-muted` alpha). Focus-visible is additive: `border-primary` border swap + `ring-1 ring-primary/30` thin primary ring, no `ring-offset`. The thin-ring + border-swap is intentionally distinct from `pill-interactive` / `button-*`'s `focus-visible:ring-2 ring-offset-2 ring-offset-secondary` — chunky offset rings read heavy around tall text-entry fields; thin ring + border swap reads as "active text field" without competing with the discrete-tap focus signature.
- **input-error** — error state. Extends `input-default`; overrides `borderColor` to `{colors.error}` and optionally adds a `bg-error/10` tint at the call site. The input's own text stays `text-text` (bone) — error red lives on the sibling `<FieldError>` message, not in the input itself (mirrors the `answer-tile` ghost-tile + filled-chip asymmetry from 5#5a: surface carries one signal, annotation carries another). Companion `<FieldError>` sibling carries `text-xs text-error-strong mt-1`. ARIA wiring is automatic via the `<Field>` wrapper: `aria-invalid="true"` on the input + `aria-describedby="{id}-error"` referencing the error message id. Critical binding rule: form-validation errors bind to the `error` / `error-strong` token pair (#991b1b surface + #f87171 body), NOT `{colors.accent}` (#b91c1c, L307 reservation for incorrect-answer flashes / danger states). The split between `border-error` (surface, #991b1b) and `text-error-strong` (body, #f87171) is AA-driven, not stylistic — mirrors the answer-tile correct/incorrect `text-ink`-vs-`text-white` asymmetry codified in 5#5a. `text-error` (#991b1b) falls to ~2.38:1 on `bg-secondary` (sub-AA); `text-error-strong` (#f87171) clears 7.14:1 on `bg-secondary` and 6.31:1 on `bg-surface`. Current canonical drift across `auth/page.tsx`, `ParentConsentForm.tsx`, `redeem/page.tsx`, `star-league/page.tsx` uses `text-accent` for form errors — same drift class as the `border-red-500 → border-accent` correction in 5#5b, this is the analogous `text-accent → text-error-strong` correction.
- **input-disabled** — disabled state. Extends `input-default`; keeps the default palette and layers `opacity-50` + `cursor-not-allowed` at the call site (mirrors `answer-tile-disabled` and `difficulty-chip-locked` precedents — opacity is a composition rule, not a token override). Native `disabled` attribute drives the state; `aria-disabled` is inherent to the native semantic.

**Rarity contract.** Badge visual styling resolves through two independent axes:

1. **Rarity** drives the *frame* — border color and background tint. Bound at render time through `rarityColors` (in `src/themes/index.ts`): common gray, uncommon emerald, rare blue, epic purple, legendary yellow, all at `/10` bg and `/50`–`/80` border. The `rarityLabels` companion export carries the human-readable text + Tailwind text-color for each rarity. These are deliberately Tailwind named-color utilities, not brand-palette tokens — the rarity register is its own visual contract and intentionally orthogonal to the theme.
2. **Icon color** drives the *glyph* — the Lucide stroke color, applied via inline `style={{ color: badge.icon_color }}`. The value comes from `badges.icon_color` in Postgres, which after the Phase 5 #2b migration is palette-anchored (`palette.primary` for milestone-identity badges, `palette.tier1..tier6` for ladder badges, category-mapped palette values for the remainder). Pre-#2b the column still holds the original hand-picked hex literals.

Category does not participate in visual styling at render time. Category-driven palette selection happens at seed time (in the icon_color column), not at render time — components stay category-agnostic. Closes audit spec gap #3 (rarity palette token export).

**Foil contract.** Badge visual styling now resolves through three independent axes:

1. **Rarity** drives the *frame* (border + background tint) — established Phase 5 #2a, bound via `rarityColors` in `src/themes/index.ts`.
2. **Icon color** drives the *glyph* — established Phase 5 #2b, palette-anchored via `badges.icon_color`.
3. **Foil** drives the *surface treatment* — new third axis introduced in Phase 6, intensifies up the rarity ladder per the `badge-foil-*` tokens above.

The three axes compose: a legendary badge with a tier-6 glyph color on a yellow rarity frame still picks up the full-holo + sparkle treatment from the foil axis — the axes layer, they don't conflict. Foil is only applied to showcase surfaces (`BadgeFoilCard`); utility surfaces (`BadgeIcon` tile) consume rarity + icon-color only.

**3D tilt.** Showcase badge surfaces tilt up to 12° around their center, anchored on Pointer Events position relative to the card (perspective 800 px, `transformStyle: preserve-3d`). Driven by `useMotionValue` + `useTransform` + `useSpring` for weighty motion. Pointer Events cover mouse + touch + pen — no `DeviceOrientationEvent` (iOS permission complexity outweighs the gain on first load). Gated by `useReducedMotion()`; when reduced motion is on, tilt is locked to 0 and foil overlays render their static fallback variants.

**Pill register.** The pill family covers the textual status/identity chips that the codebase previously redeclared inline in ~9 sites with two competing shape registers (`rounded` 4px off-spec, `rounded-full` on-spec). Component tokens resolve through three composable axes:

1. **Size** — `pill-sm` (caption typography 10/700/tracked, 2px×8px padding) for Navbar microchips; `pill-md` (label typography 12/700/tracked, 4px×12px padding) for everywhere else. The Navbar's existing `text-[10px]` arbitrary graduates to the `caption` typography role at the same 10 px — same size, gains proper weight (700) and tracking (0.06em) so micro-pills read as eyebrows rather than shrunk body text. Two sizes is the entire informational range; no `lg` because interactive pills carry their own sizing.
2. **Semantic** — `pill-pro` (filled brand identity), `pill-audience-{junior,teen,mature}` (filled identity chips for the age-tier register), `pill-content-rating-{e,t,m}` (filled identity chips for the content-rating register; visually identical to audience because the registers share a palette but carry distinct semantics — user-age vs. content-age), and `pill-difficulty-{easy,medium,hard,impossible,mixed}` (ghost status chips). Filled and ghost are the two treatments — see "Filled vs. ghost" in Do's and Don'ts.
3. **Interactivity** — `pill-interactive` carries the 44 px touch-target floor (DESIGN.md L274 / CLAUDE.md 44×44 rule). Reach for it on filter chips and toggle clusters (Badges category filter is the canonical case; the existing chip there at ~28 px tall is below the touch floor and will rise to 44 px in the 5#4b refactor). Active state composes `bg-primary/20 text-primary`; inactive composes `bg-white/5 text-text-muted`; both deepen per the canonical hover convention.

The `count-badge-{sm,md}` tokens are a **sibling primitive**, not a pill variant. The shape is 1:1 (16/20 px square), filled with `bg-accent`, and rendered as a notification numeric indicator. The current Navbar uses two sizes (16 px desktop, 20 px mobile); both are captured. Despite the shared `rounded-pill` token, the aspect ratio and content register (numbers, not labels) make this a different primitive — call out as `<CountBadge>` at the React boundary, not `<Pill variant="count">`.

**Status register.** Four generic status tones complement the difficulty register for non-difficulty result chips: `pill-status-positive` (success ghost — duel WIN, leagues Promoted), `pill-status-negative` (accent ghost — duel LOSS, leagues Demoted), `pill-status-warning` (warning ghost — duel DRAW, leagues Missed promotion), and `pill-status-neutral` (text-muted ghost — leagues Stayed, future no-op states). The leagues Demoted chip shifts from its current `bg-primary/20 text-primary` to `pill-status-negative` per the codified filled-vs-ghost and "demotion ≠ brand identity" rules — demotion is danger, not brand. The duel "DUEL vs {opp}" mode header chip is a composite (icon + avatar + name) and stays as a locally-styled element, not a Pill variant.

Foil treatment does not apply to any pill. The foil register signals collectible — applied to `BadgeFoilCard` only. Pills are status/identity chrome, matte by definition. Closes audit spec gap #5 (component tokens for pill-status / pill-count / pill-tag) and seeds the L551–554 priority M pill refactor.

**Quiz answer-tile register.** The answer-tile family covers the four-option grid surfaced during every quiz / duel / grand-prix question. The tile resolves through two composable parts: (1) **tile state** — `answer-tile-default` carries the base; `selected`, `correct`, `incorrect`, `disabled` override the palette anchor only, all using the ghost treatment (`bg-{tone}/10 border-{tone}`) so the answer text stays on `text-text` (bone) and the tinted fill reads as status; and (2) **letter chip** — filled, 32 px square `rounded-pill`, paired with the tile state. Correct chip pairs `bg-success` with `text-ink` (6.0:1 AA — beats `text-white` at 3.3:1); incorrect chip pairs `bg-accent` with `text-white` (6.5:1 AA — beats `text-ink` at 3.1:1). The contrast asymmetry is AA-driven, not stylistic. Shake animation on `incorrect` lives in the component motion config (gated by `useReducedMotion()`) — tokens describe surface palette, not behavior. The tile is action-bearing — keeps `rounded-sharp` per the L398 sharp-defaults list, distinct from `card-default`'s dwell-rounding. The `min-h-[56px]` floor is an answer-tile-specific exception above the 44 px touch baseline; tap density during quiz play warrants the extra room.

**Difficulty-chip cluster.** The difficulty-chip family covers the active / inactive cluster surfaced on the quiz-idle screen (`DifficultySelector`) and inside the duel `ChallengeModal`. Pill-shaped, 44 px floor, filled-when-active and ghost-when-inactive per the canonical "filled = identity, ghost = status" rule — with one nuance: each chip carries its own difficulty hue, NOT the `pill-interactive` brand-color toggle (`bg-primary/20 text-primary`). All five active tones pair with `text-ink` per the AA contrast table (easy 7.8:1, medium 12.9:1, hard 5.3:1, impossible 5.0:1, mixed 7.8:1 — `text-white` fails on every tone). When migrating, drop the current `boxShadow: 0 0 20px rgba(...)` glow and the `motion.div border-2` overlay ring on the active chip — both are L388 forbidden-shadow / L293 showmanship anti-patterns. The inactive treatment is visually identical to the static `pill-difficulty-{tone}` token — the duplicate name is intentional, marking the semantic split between read-only label (`pill-difficulty`) and interactive cluster member (`difficulty-chip`). Closes audit gap #1's 4th redeclaration site by token-binding `ChallengeModal.tsx:36–42`'s `DIFFICULTY_COLORS` map to the same primitive.

**Forms register.** The form-input family covers the text-entry chrome surfaced across `auth/page.tsx` (email / password / username / phone / OTP), `ParentConsentForm.tsx` (parent email + COPPA consent checkbox), `redeem/page.tsx` (promo code), `star-league/page.tsx` (waitlist email), `browse/BrowseContent.tsx` (anime search), and `duels/page.tsx` (friend-username search). The codebase ships a single canonical inline pattern (`w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50`) repeated across ~9 sites with five micro-variants (base fill `bg-surface` vs `bg-secondary` vs `bg-white/5`, monospace promo code, leading-icon search, OTP letter-spacing, `<select>` chrome). Inputs resolve through three composable parts: (1) **chrome** — `input-default` carries the base, with `input-error` and `input-disabled` overriding the palette / opacity anchor only; (2) **field wrapper** — the `<Field>` primitive composes `<Label>` + child input + optional `<FieldHint>` + optional `<FieldError>`, and auto-wires `htmlFor` ↔ `id`, `aria-describedby` ↔ hint+error ids, and `aria-invalid` ↔ error-truthy. Standalone `<Input>` chrome is also exposed for search inputs and inline pickers that don't need the labelled wrapper (visually-hidden labels still required for a11y — never placeholder-only); (3) **label typography** — form labels bind to the new `field-label` typography token (DM Sans 14/500/normal), distinct from the existing `label` token (DM Sans 12/700/0.04em tracked). The split is semantic, not stylistic: `label` is pill-chrome eyebrow scope (reads as ALL-CAPS eyebrow above microchips); `field-label` is form-context scope (reads as soft label above text fields). Same precedent as the `pill-difficulty-*` vs `difficulty-chip-*` split — shared shape neighborhood, distinct semantic register.

Per-field hints and error messages are utility-bound compositions (not YAML tokens). `<FieldHint>` renders at `text-xs text-text-muted` (12 px DM Sans 400, washed bone at full alpha — distinct from `text-text-muted/60` placeholder), positioned as a sibling under the input, before the error if both render. `<FieldError>` renders at `text-xs text-error-strong mt-1`, with an `id="{field}-error"` auto-bound for `aria-describedby`. The text uses `error-strong` (#f87171) rather than `error` (#991b1b) because the latter falls to ~2.38:1 contrast on `bg-secondary` — sub-AA. `error-strong` is the luminance-shifted sibling reserved for body-text where 4.5:1 must clear; `error` remains the surface-color token bound to borders, fills, and plates where UI-component 3:1 contrast suffices. Required fields wire `aria-required="true"` + a visible `*` suffix in the label rendered at `text-text-muted` (required is normal form state, not a warning — quiet asterisk preserves scan rhythm). Focus-visible follows the L495 hover-convention precedent: additive on top of `input-default` — `border-primary` swap + `ring-1 ring-primary/30` thin primary ring, no `ring-offset`, no separate focus YAML token (mirrors how hover is codified as a rule, not a YAML variant).

Closes the deferred forms entry below.

Not captured (deferred):

- Tables (admin analytics, leagues, leaderboards)
- Navigation (lifted Navbar mobile overlay just shipped — fix/mobile-nav-overlay)
- Footer

Each of these will get its own Phase 5 prompt with named tokens added to DESIGN.md alongside the component refactor.

## Do's and Don'ts

Do:

- Reserve hanko vermillion (primary) for primary actions, focus rings, brand wordmark, and correct-answer celebrations. It is the single trust color.
- Use bone (text) on ink-black (secondary) as the default contrast pairing. WCAG AA passes comfortably.
- Use raised-stone (surface) for elevated cards on the ink-black canvas. Skip the shadow — surface contrast is the depth.
- Pair Anton with DM Sans 700–800 when both display drama and body legibility are needed in the same view. Don't introduce a third typeface.
- Treat the tier foils (Bronze → Champion) as a separate semantic register from the brand. Champions wear red foil, but it is foil, not vermillion.
- Maintain 44×44px touch targets. Junior-tier users are real users; their thumbs are smaller.
- Hoist repeated label/color maps into `src/themes/index.ts` as named exports. The duplicated `RARITY_LABELS` object between `BadgeCard.tsx` and `BadgeCelebration.tsx` is the canonical anti-pattern this fixes — single source of truth, theme-portable. Phase 5 #2a hoists `rarityLabels`; future passes hoist analogous repeated maps as they're identified (difficulty palette, audience-fit palette, etc., per audit spec gaps #1–#2).
- **tier-3 (sun gold) vs warning (amber).** Both sit in the warm-yellow register; their semantics differ. `tier-3` signals achievement — the Gold league foil, top-3 medal rank 1, monthly emblem frame, achievement-gold register. `warning` signals caution — almost-out states, missed-promotion banners, diminishing-returns nudges. When reaching for "warm yellow," ask: is this a reward or a heads-up? Don't grab `text-yellow-400` or `text-amber-400` — bind to the right semantic token.
- **Anton is loaded but currently unused.** The font ships at the body via `--font-display` for any future surface that earns a display register, but as of Phase 6c there are zero canonical consumers. The Phase 6c first smoke pass tried Anton on foil-card badge titles at 13 px; it didn't carry — the condensed display face lost character at that scale and the descender clearance fought the 3:4 card aspect. Card titles reverted to DM Sans (the body sans, condensed via uppercase + tight tracking). When a future surface reaches for Anton (homepage hero, rank-up splash, prestige certificate UI), confirm at the rendered size before committing — Anton wants ≥32 px to read as intended. Don't introduce a third typeface; pair Anton with DM Sans when both display drama and body legibility are needed in the same view.
- **Filled fill = identity. Ghost (color/20) fill = status.** The pill family resolves through two treatments. *Filled* (`bg-{color}` at full alpha + contrast-paired text) signals identity — PRO, age-tier (Jr/T/M for the user), content-rating (E/T/M for the content). *Ghost* (`bg-{color}/20 text-{color}` at full alpha) signals status — difficulty, duel result, leagues result, the active branch of an interactive filter. The two registers must stay legible side by side, so don't render the same semantic with both treatments. The stats-page PRO chip (`bg-primary/20 text-primary`, ghost) is the canonical violation — same brand mark as the Navbar PRO chip but a different register — and resolves to filled in the 5#4b refactor.
- **Interactive pills carry `min-h-[44px]`.** Informational pills (PRO, Jr/T, content-rating, duel-result, leagues-result, the QuizCard difficulty indicator) stay text-tight at `pill-sm` or `pill-md`. *Interactive* pills (filter chips, toggle clusters — Badges category filter is the canonical case) must satisfy the 44 px touch-target floor that DESIGN.md L274 and CLAUDE.md enforce. The existing Badges category chip at ~28 px tall is the failure mode the `pill-interactive` token corrects.
- **Audience yellow, warning amber, and tier-3 gold are three distinct hues for three distinct semantics.** `audience-teen` (#facc15 warm yellow) is heads-up identity for the 13+ register; `warning` (#d97706 amber) is heads-up caution for missed-promotion / almost-out states; `tier-3` (#eab308 sun gold) is achievement gold for the Gold league and monthly emblem frame. Reaching for "warm yellow" without picking the right semantic token is the same anti-pattern flagged in the existing tier-3-vs-warning rule above.
- **Quiz answer tiles use `rounded-sharp` (action surface).** Listed explicitly in the L398 sharp-defaults list. Distinct from `card-default`'s dwell-rounding — answer tiles are picked, not read past. The current `rounded-xl` (12 px) in `AnswerButton.tsx:60` is drift; bind to `{rounded.sharp}` in the 5#5b refactor.
- **Answer reveal pattern = ghost tile + filled chip.** Tile carries status (`bg-{tone}/10 border-{tone}`); letter chip is the discrete acknowledgement glyph (`bg-{tone}` + paired text token). The hybrid is canonical — codified in `answer-tile-*` per 5#5a.
- **Correct chip pairs `bg-success` with `text-ink` (6.0:1 AA). Incorrect chip pairs `bg-accent` with `text-white` (6.5:1 AA).** The asymmetry is contrast-driven, not stylistic. `text-white` on `bg-success` falls to 3.3:1 (fails); `text-ink` on `bg-accent` falls to 3.1:1 (fails). Codified per 5#5a so future contributors don't "balance" the pairing into symmetry.
- **Difficulty chip clusters render active = filled, inactive = ghost — each chip carries its own identity hue.** Distinct from `pill-interactive`, whose canonical active state is `bg-primary/20 text-primary` (brand-color toggle for filter-cluster patterns like the Badges category filter). Difficulty clusters bind to `difficulty-chip-{tone}-{active,inactive}`.
- **Inputs use `rounded-sharp` (action surface).** Listed explicitly in the L398 sharp-defaults list alongside buttons and quiz answer tiles. Distinct from `card-default`'s dwell-rounding — inputs accept user action, they are not dwell-and-parse surfaces. The current `rounded-xl` (12 px) across `auth/page.tsx`, `ParentConsentForm.tsx`, `redeem/page.tsx`, `star-league/page.tsx`, `browse/BrowseContent.tsx`, `duels/page.tsx`, `ChallengeModal.tsx` is the canonical drift this rule corrects in 5#6c (same drift class as the `AnswerButton.tsx` `rounded-xl → rounded-sharp` correction in 5#5b).
- **Form labels bind to `field-label` (DM Sans 14/500/normal).** Distinct from pill-chrome `label` (DM Sans 12/700/0.04em tracked), which is eyebrow scope. The split is semantic — form-context labels are soft, pill-chrome labels are eyebrow. Same precedent as `pill-difficulty-*` vs `difficulty-chip-*`.
- **Form errors split surface vs body.** Input border binds to `border-error` (#991b1b, surface-contrast OK at UI-component 3:1); `<FieldError>` message text binds to `text-error-strong` (#f87171, ≥ 4.5:1 AA on dark surfaces). `error` (#991b1b) is the L394 form-validation surface reservation; `error-strong` is its luminance-shifted body-text sibling. Reusing `accent` (#b91c1c) for form validation collapses two distinct semantics (L307 incorrect-answer reservation). The split mirrors the answer-tile correct/incorrect `text-ink`-vs-`text-white` asymmetry from 5#5a — contrast-driven, not stylistic.
- **Placeholders bind to `text-text-muted/60`.** The `/60` alpha keeps placeholder visually distinct from helper text and labels (both at full `text-text-muted` alpha). Current `placeholder:text-white/30` (raw alpha-bone) is drift; bind to the token.
- **Required fields wire `aria-required="true"` + a visible `*` suffix in the label.** The asterisk renders in `text-text-muted` — required is a normal form state, not a warning. Don't use `text-accent` or `text-primary` for the asterisk; both pull semantic weight the indicator doesn't carry. Don't use a "Required" string suffix; it's verbose and breaks scan rhythm.
- **Inputs satisfy the 44 px touch-target floor.** Codified `min-h-[44px]` in the `<Input>` primitive. Defends against future `py-2` shrinkage. Same COPPA floor as buttons and chips.
- **The `<Field>` wrapper auto-wires `aria-invalid` + `aria-describedby` when an `error` prop is present.** Never bypass the wrapper to write ARIA attributes by hand on the input — the wrapper is the single source of truth and prevents id-mismatch drift.
- **Input focus uses `border-primary` + `ring-1 ring-primary/30` (no offset).** Thinner than `pill-interactive` / `button-*` `focus-visible:ring-2 ring-offset-2 ring-offset-secondary`. Intentional differentiation — discrete-tap targets get chunky offset rings; dwell text-entry surfaces get thin border-swap + thin ring. Mirrors how hover is codified as a rule, not a per-element YAML variant.

Don't:

- Don't use raw black (#000000) — secondary is warm-tinted ink-black for a reason. Same for raw white (#ffffff) — text is bone.
- Don't introduce gradients. The ink-and-paper register is the brand.
- Don't introduce glass / blur effects beyond the existing Navbar treatment. They erode the manga-page semantics.
- Don't use accent (blood ink) for decoration — it is reserved for incorrect-answer / danger states.
- Don't use vermillion for body links. Body links are bone with underline, vermillion on hover only.
- Don't render Anton at body sizes. It is a display face; below 32px it loses character.
- Don't add medium-rounded corners (4–12px). The shape language is sharp-or-pill, not a continuous scale.
- Don't paint admin analytics charts in raw Tailwind palette colors. Use `chartPalette` from `@/themes`. The current admin pages drift here and will be refactored in a focused follow-up session.
- **Don't apply foil treatment to every surface.** Foil signals collectible — reserve for badges, monthly emblems, and Grand Prix emblem templates. Non-collectible surfaces (notifications, alerts, navigation chrome, inline chips, leaderboard rows) stay matte/flat. A nav chip with a foil sheen reads as gauche, not premium.
- **Don't redeclare emerald / yellow / red inline for traffic-light registers.** The audience, content-rating, and difficulty registers all hoist into named tokens (`audience-junior`, `audience-teen`, `audience-mature`, `difficulty-impossible`, `difficulty-mixed`) and into the `audiencePalette` / `difficultyPalette` JS maps (5#4b). Reach for `bg-audience-junior` / `pill-difficulty-easy`, not raw `bg-emerald-500` / `bg-emerald-500/20 text-emerald-400`.
- **Don't use `text-black` on pill text.** The "bone over ink" discipline runs both ways — when a brand pill (`pill-pro`) carries white text, the white is `#ffffff`; when a dark-on-light pill (`pill-audience-{junior,teen,mature}`, `pill-content-rating-{e,t,m}`) needs dark text, bind to the `ink` token (#0a0a0a), not raw black. The existing `text-black` on the Navbar Teen pill and the AnimeCard T rating is the anti-pattern this rule corrects.
- **Don't bind `audience-teen` to `--color-tier-3` (sun gold).** Tier-3 is achievement gold — the Gold-league foil, top-3 medal rank 1, monthly emblem frame. Audience-teen is heads-up identity yellow. They share a warm-yellow neighborhood but signal different things; collapsing them muddles the achievement register.
- **Don't redeclare difficulty palettes inline in components.** Bind to `difficulty-chip-*` (interactive cluster) or `pill-difficulty-*` (read-only label). Closes audit gap #1's 4th redeclaration site — `ChallengeModal.tsx:36–42` `DIFFICULTY_COLORS` map.
- **Don't use `red-500` raw for incorrect-answer surfaces.** Bind to `{colors.accent}` (#b91c1c). DESIGN.md L307 reserves accent for "incorrect-answer flashes"; the current `AnswerButton.tsx` `border-red-500 bg-red-500/10` is the canonical drift this rule corrects (audit L444).
- **Don't add soft-blur shadows (`boxShadow: 0 0 X rgba(...)`) to difficulty chips or any surface.** Reaffirms L388. The current `DifficultySelector.tsx:27,32,37,42` rgba glows are the failure mode.
- **Don't layer motion ring overlays atop active-state filled chips.** `layoutId` spring transitions are fine without visible chrome rings; the current `DifficultySelector.tsx:78–82` `motion.div border-2 border-white/30` ring is L293 showmanship the cluster doesn't need.
- **Don't pair `text-white` with `bg-success`.** Falls to 3.3:1 — below AA. Use `text-ink` (6.0:1).
- **Don't use `rounded-xl` on inputs.** Inputs are listed explicitly in the L398 sharp-defaults list. Bind to `{rounded.sharp}`. The current `rounded-xl` across `auth/page.tsx`, `ParentConsentForm.tsx`, `redeem/page.tsx`, `star-league/page.tsx`, `browse/BrowseContent.tsx`, `duels/page.tsx`, `ChallengeModal.tsx` `<select>` is the canonical drift the 5#6c migration corrects.
- **Don't bind form errors to `text-accent`.** Accent (#b91c1c) is the L307 incorrect-answer / danger reservation. Form-validation errors bind to the surface/body split: `border-error` (#991b1b) on the input, `text-error-strong` (#f87171) on the message. Same drift class as the AnswerButton `border-red-500 → border-accent` correction in 5#5b — this is the analogous `text-accent → text-error-strong` correction.
- **Don't bind `<FieldError>` message text to `text-error` (#991b1b).** The token's surface luminance falls to ~2.38:1 on `bg-secondary` and ~2.11:1 on `bg-surface` — sub-AA. Use `text-error-strong` (#f87171) for body text. `error` stays the border / fill surface token.
- **Don't use `placeholder:text-white/30` (raw alpha-bone).** Bind to `placeholder:text-text-muted/60`. The `/60` alpha keeps placeholder visually distinct from helper text and labels at full alpha.
- **Don't bind form labels to the pill-chrome `label` typography token.** `label` is 12 px / 700 / 0.04em tracked — an eyebrow register that reads as ALL-CAPS-feel above text fields. Form labels bind to `field-label` (14 px / 500 / normal).
- **Don't ship inputs without an associated label.** Visible `<Label>` for primary form fields; visually-hidden labels (`sr-only` class) for search inputs and inline pickers (e.g., `browse/BrowseContent.tsx`, `duels/page.tsx` friend-search, `star-league/page.tsx` waitlist) — never placeholder-only. Placeholders disappear on input; labels persist.
- **Don't skip `aria-invalid` + `aria-describedby` on error-bearing fields.** The `<Field>` wrapper does this automatically when an `error` prop is present; never bypass the wrapper to write inputs by hand without the ARIA wiring.
- **Don't use offset focus rings (`ring-offset-2`) on inputs.** Offset rings belong on discrete-tap targets (buttons, pills, chips). Inputs are tall dwell text-entry surfaces; the offset gap reads heavy. Use `border-primary` + `ring-1 ring-primary/30` (no offset).

**Hover convention.** Hover deepens existing fills by 10% (e.g., `bg-primary` on hover becomes `bg-primary/90`; `bg-white/20` becomes `bg-white/30`). Hover deepens text by 20% (e.g., `text-text` on hover becomes `text-text/80`). Focus-visible mirrors hover. The codebase converged on this convention organically — captured here as the canonical rule. Do not invent per-element opacity values.

**Shadow usage rule.** `--shadow-ink` (`0 4px 0 0 rgba(0,0,0,0.4)`) is reserved for surfaces with a "pressable" or "tactile" semantic. Apply to: primary action buttons (gives visual weight to the main CTA), badge cards on the Badges page (tactile collectible feel), monthly emblem displays. Do not apply to: cards used as informational containers, modal surfaces, navigation chrome, table rows. The default is no shadow — opt in deliberately.

When implementation deviates from this spec, update DESIGN.md FIRST, then code. The spec is the contract.
