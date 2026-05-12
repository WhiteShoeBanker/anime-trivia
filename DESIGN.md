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
  weight-medium: 500
  weight-semibold: 600
  card-title:
    fontFamily: Anton
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0.05em
    textTransform: uppercase
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
    typography: "{typography.card-title}"
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
- **emblem-monthly** — monthly emblem display for Grand Prix winners and other named monthly artifacts. 56 px square, raised-stone surface, `rounded-card`. Gold-tinted via `border-tier3/80` + `bg-tier3/10` at the call site (replacing the hardcoded `yellow-400` literal from the pre-Phase-5 codebase — tier3 is sun gold `#eab308`). Carries a golden shimmer overlay during the legendary-shimmer animation. Candidate for `--shadow-ink` per the shadow usage rule (monthly emblems are tactile/collectible) — opt in at the call site when the surface earns it.
- **panel-warning** — canonical caution surface for heads-up notices that aren't action-bearing: missed-promotion banners, diminishing-returns nudges, time-pressure callouts. Composes warning-tinted text on warning `/10` fill with warning `/30` border (the YAML anchors the palette; the `/10`–`/30` composition is enforced at call sites via Tailwind opacity modifiers — `bg-warning/10`, `border-warning/30`, `text-warning`). Uses `rounded-card` per the dwell-vs-act principle (panels are read, not clicked). Don't reach for accent (blood ink) — accent is reserved for incorrect-answer flashes and danger states; warning is heads-up, not alarm.
- **badge-foil-card** — collectible card primitive for showcase badge surfaces. 3:4 aspect ratio (TCG-canonical), 96 px default width (md), card-rounded corners, manga-panel offset shadow when rendered as elevated. Anton `card-title` typography for the badge name at the top. The icon-hero zone consumes the full center; the foil overlay (per-rarity, see below) sits between background and icon. Composes `<BadgeFoilCard>` at the call site, which adds 3D tilt + Pointer Events for showcase surfaces (Badges page grid, BadgeCelebration overlay, EmblemSelector picker, profile featured-emblem, daily completion row, landing showcase). Utility surfaces (Navbar chip, profile avatar overlap, leagues roster) keep the matte tile primitive (`BadgeIcon`) — foil signals collectible, not navigation.
- **badge-foil-{common, uncommon, rare, epic, legendary}** — foil treatment tokens that intensify up the rarity ladder. `common` is matte cardboard (no overlay). `uncommon` adds a slow linear sheen sweeping diagonally. `rare` applies a reverse-holo (rainbow conic gradient on the card background, the icon-hero zone stays clean — Pokémon TCG convention). `epic` applies a full-holo (rainbow conic gradient parallaxing against the 3D tilt; gradient origin tracks pointer position via CSS custom properties `--foil-x` / `--foil-y`). `legendary` inherits `epic` + adds animated radial-gradient sparkle particles staggered over a 3 s loop. All treatments degrade to static foil under `prefers-reduced-motion` (no tilt, no animation, lower-intensity static gradient).

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

Not captured (deferred):

- Pills (age-tier "Jr"/"T", PRO subscription, pendingDuels count, stock-style status pills)
- Tables (admin analytics, leagues, leaderboards)
- Forms (auth, parent consent, profile edit)
- Navigation (lifted Navbar mobile overlay just shipped — fix/mobile-nav-overlay)
- Footer
- Quiz answer-choice tiles

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
- **Anton is for card titles + display headings.** Pair with DM Sans for everything else. The canonical Anton consumers are: foil-card badge titles, monthly emblem labels, Grand Prix headers, homepage hero text, rank-up splashes. Closes the audit finding that Anton was loaded but zero-consumed.

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

**Hover convention.** Hover deepens existing fills by 10% (e.g., `bg-primary` on hover becomes `bg-primary/90`; `bg-white/20` becomes `bg-white/30`). Hover deepens text by 20% (e.g., `text-text` on hover becomes `text-text/80`). Focus-visible mirrors hover. The codebase converged on this convention organically — captured here as the canonical rule. Do not invent per-element opacity values.

**Shadow usage rule.** `--shadow-ink` (`0 4px 0 0 rgba(0,0,0,0.4)`) is reserved for surfaces with a "pressable" or "tactile" semantic. Apply to: primary action buttons (gives visual weight to the main CTA), badge cards on the Badges page (tactile collectible feel), monthly emblem displays. Do not apply to: cards used as informational containers, modal surfaces, navigation chrome, table rows. The default is no shadow — opt in deliberately.

When implementation deviates from this spec, update DESIGN.md FIRST, then code. The spec is the contract.
