# Design audit — 2026-05-08

Audit of the OtakuQuiz codebase (`master` @ a94ebd2) against `DESIGN.md` (Manga Ink theme, alpha schema, lints clean). Read-only pass; findings only. Remediations deferred to the prioritized refactor queue at the end of this document.

## Summary

The Phase 0 wiring is in: `src/themes/manga-ink/tokens.css` exposes the required `--color-*`, `--font-*`, `--radius-*`, `--shadow-*` and animation tokens via Tailwind v4 `@theme inline`, and `src/themes/index.ts` exports `tierColors`, `chartPalette`, `confettiPalette`, `palette`, and `rarityColors` for JS-side consumers. Most user-facing surfaces correctly consume `bg-surface`, `bg-primary`, `text-primary`, `border-rule`, `bg-accent`, `text-success` — the theme contract works. The drift is concentrated in a handful of recurring patterns rather than scattered chaos, which makes the refactor surface much smaller than the raw counts suggest.

The two biggest gaps are **shape language** and **typography hierarchy**. DESIGN.md defines exactly two rounded tokens (`sharp` 2px, `pill` 9999px) with a deliberate gap; the codebase fills the gap aggressively — 173 `rounded-xl`, 88 `rounded-full`, 85 `rounded-lg`, 60 `rounded-2xl`, 3 `rounded-3xl` (411 mid-rounded utilities total in the gap). Almost every card, button, modal, and pill in the app reads as soft-rounded rather than the spec's sharp-or-pill register. On typography, **Anton (`--font-display`) is loaded but consumed in zero `className` references** — `font-display` appears nowhere in user-facing markup. Headlines lean on `font-extrabold` (5 instances) or `font-bold` (200 instances) DM Sans, exactly as DESIGN.md predicted in the install pass.

The third pain point is the **achievement-badge system**. There are 32 seeded badges in `006_badges.sql` mapped to 22 unique Lucide icons, with two material duplicates (`Crown` shared by `quiz-1000` and `xp-hokage`; `Swords` shared by all three difficulty badges and `league-champion`) and a per-row `icon_color` column whose values (`#FF6B35`, `#FFD700`, `#00D1B2`, `#E94560`, `#6366F1`, etc.) live entirely outside the Manga Ink palette. The rarity ring (`border-emerald-500/60` etc.) bypasses brand tokens by deliberate contract (`rarityColors` in `src/themes/index.ts`), but the rarity-label colors in `BadgeCard.tsx`, `BadgeCelebration.tsx`, and several other surfaces re-implement that mapping inline — three copies in three files.

Headline counts (user-facing surfaces only; admin and tests excluded):

- **Color**: ~18 raw hex literals across 6 user-facing files (Timer, ScoreDisplay, BadgeIcon glow, LandingContent SAMPLE_BADGES, auth/page Google/Discord SVGs, useCapacitor StatusBar, global-error). 109 default-Tailwind named-color utilities across 26 user-facing files (yellow/red/emerald/purple/blue/amber dominantly) — most legitimately encode rarity tiers, difficulty colors, or league-rank icons that are conceptually outside the brand palette but repeated inline in multiple places.
- **Typography**: 723 `text-*` size utilities across 56 files, 503 `font-*` weight utilities across 53 files. 200 `font-bold` and 185 `font-semibold` instances. Zero `font-display` usages — Anton is loaded and unused. Zero user-facing `tabular-nums` — no score readout, leaderboard rank, timer, or XP counter opts in. (Admin pages use `tabular-nums` on chart KPI tiles.)
- **Shape**: 411 mid-rounded utilities (lg/xl/2xl/3xl) in DESIGN.md's deliberate sharp-to-pill gap. Only 2 `rounded-sm` usages. The codebase's effective rounded scale is `rounded-lg`/`-xl` for cards and buttons, `rounded-2xl` for modals, `rounded-full` for pills.
- **Shadows**: 8 forbidden shadow utilities (`shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-primary/N`, `shadow-accent/N`, `shadow`) on user-facing surfaces. `--shadow-ink` is defined but never consumed via `shadow-ink`.
- **Components**: zero shared `<Button>`, `<Card>`, `<Pill>`, `<Badge>`, `<Modal>`, `<Input>` — every site is duplicated copy-paste at the className level. The card pattern `bg-surface rounded-2xl border border-white/10 p-4` recurs across 15+ files. The primary-button pattern `px-N py-N rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors min-h-[44px]` recurs across 30+ call sites with mostly-consistent variations.

**Top headline recommendation**: lead Phase 5 with **Buttons + Card** as a single combined first pass. They share the rounded-resolution decision (whether to actually adopt `rounded-sharp`, add a `rounded-md` token, or stay with `rounded-xl` and amend DESIGN.md), they share the hover-state token recommendation, and they cover ~50 user-facing call sites between them. Achievement badges follow as a focused second pass with DB schema work.

## Methodology

**In scope (primary):** All user-facing surfaces under `src/` shipped to anime-trivia-iota.vercel.app — auth flows, browse, quiz, league, profile, leaderboard, daily challenge, landing, sign-up, parent-consent, all components under `src/components/`.

**In scope (secondary, separate track):** admin pages under `src/app/admin/`. Admin uses a deliberately separate slate/dark aesthetic (`bg-slate-800`, `text-slate-100`, `text-slate-400`); brand-consistency stakes are lower. Findings counted but the refactor queue lists admin as separate-track items not interleaved with user-facing work.

**Out of scope:** tests (`*.test.ts`, `*.test.tsx`, `e2e/`), scripts (`scripts/`), `supabase/migrations/` (referenced for badge schema only, not refactored), `.scratch/`, `node_modules/`, `.next/`, build artifacts, `src/themes/` (the source-of-truth files).

**Method:** static read of source files via `grep`/glob — no Playwright run, no built artifact inspection, no runtime DOM diff. Findings are line-anchored to current `master`.

## Color findings

### Raw hex literals (non-admin, non-test)

| File:line | Current | Drift | Recommended |
|---|---|---|---|
| `src/hooks/useCapacitor.ts:20` | `'#1A1A2E'` (StatusBar bg) | One-off, not bound to canvas | Bind to `palette.secondary` (`#0c0a09`) for parity with web canvas. Reason: native status-bar should match web ink-black. |
| `src/app/global-error.tsx:11,32` | `#1A1A2E`, `#fff`, `#FF6B35` | Inline style fallback for crash overlay | Acceptable as fallback (no theme available during global error), but bind to `palette.secondary` and `palette.primary` via the JS export. |
| `src/components/Timer.tsx:21,22` | `#facc15` (warn yellow), `#ef4444` (danger red) | Conditional ring-stroke for time-pressure | No semantic match in Manga Ink — `warning` is `#d97706` (more saturated amber), `accent` is `#b91c1c` (blood ink). Recommend binding to `var(--color-warning)` and `var(--color-accent)` and accept the slightly darker tones, OR amend DESIGN.md to add a `--color-warning-light` token. |
| `src/components/ScoreDisplay.tsx:64` | `#facc15` (mid-band yellow) | Same conditional pattern as Timer | Same recommendation as Timer; the two should resolve identically. |
| `src/components/BadgeIcon.tsx:67,76` | `rgba(255,255,255,0.3)` (unearned tint), `rgba(255,215,0,0.4)` (legendary shimmer) | Inline rgba | Bind unearned tint to `text-text-muted` via opacity-modulated currentColor. Shimmer can stay literal — gold leaf is not a Manga Ink token, and adding a `--color-shimmer` would over-tokenize a single decorative effect. |
| `src/components/MonthlyEmblem.tsx:47` | `rgba(255,215,0,0.5)` (gold shimmer) | Same shimmer as BadgeIcon | Centralize the shimmer linear-gradient in a `.shimmer-gold` utility under `tokens.css` and apply via className from both call sites. |
| `src/components/DifficultySelector.tsx:27,32,37,42` | `rgba(16,185,129,0.4)` etc. ×4 (selected-state glow) | Box-shadow glow per difficulty | Whole component re-encodes difficulty palette inline. See "Difficulty palette" below. |
| `src/components/Navbar.tsx:152` | `rgba(255,255,255,0.7)` | Inactive nav-link color (inline style) | Bind to `text-text-muted` (`#a3a097`) — currently uses inline `style={{ color: ... }}` because the active-state vs inactive-state branch ergonomically prefers a JS expression. The `color` is set via `style`, not `className`, so Tailwind's `text-text-muted` utility doesn't compete. Refactor to className-based variants. |
| `src/app/auth/page.tsx:303` (etc.) `bg-[#5865F2]` | Discord brand color | Brand-required exception | Acceptable. Discord's brand-mandated #5865F2 (used twice on the OAuth button) cannot be brand-mapped. Tag with a comment explaining the exception. |
| `src/app/auth/page.tsx:433-445` | `#4285F4`/`#34A853`/`#FBBC05`/`#EA4335` (Google logo SVG) | Brand-required SVG fill | Acceptable. Google's brand SVG must use exact brand colors. |
| `src/app/LandingContent.tsx:78-83` | 6 hex literals in `SAMPLE_BADGES` (`#FF6B35` Flame, `#00D1B2` Target, `#facc15` Zap, `#a855f7` Crown, `#FFD700` Star, `#3b82f6` Shield) | Showcase hardcodes db-style icon_color values | These mimic the badge-table `icon_color` data. They aren't brand drift in the strict sense — they're sample data that mirrors what's stored in Postgres. Consider sourcing from a real badge query so the showcase stays in sync; the colors themselves are properly DB-resident. |
| `src/app/api/process-grand-prix/route.ts:288` | `#FFD700` (gold trophy emblem) | Server-issued `icon_color` for monthly emblem | Same as DB seed data — this is the authoritative write path. Inventory only; not a frontend drift. |

**Admin charts (deferred per `src/themes/README.md` TODO):** ~80 hex literals across `admin/page.tsx`, `admin/duels/page.tsx`, `admin/engagement/page.tsx`, `admin/leagues/page.tsx`, `admin/retention/page.tsx`, `admin/revenue/page.tsx`. All are Recharts series colors, axis tick colors, tooltip styles, and CartesianGrid stroke colors. The refactor target is `chartPalette` from `@/themes`.

### Tailwind named-color utilities (user-facing surfaces — 109 lines across 26 files)

Bucketed by semantic category:

**Difficulty palette (re-encoded in 4 components):**
- `src/components/DifficultySelector.tsx:25-42` — emerald/yellow/red/purple `bg-{color}-500 text-white` selected + `border-{color}-500 text-{color}-400` unselected + glow rgba.
- `src/components/QuizCard.tsx:21-23` — easy/medium/hard `bg-{color}-500/20 text-{color}-400`.
- `src/components/ChallengeModal.tsx:36-40` — easy/medium/hard/impossible/mixed `bg-{color}-500/20 text-{color}-400 border-{color}-500/30`.
- `src/app/duels/[duelId]/DuelClient.tsx:37-41` — same five-difficulty palette as ChallengeModal.

Drift type: each component re-derives the difficulty→color mapping inline. No shared `difficultyTokens` export. Reason this matters: the difficulty palette is a semantic register (easy=success-adjacent, medium=warning-adjacent, hard=accent-adjacent) that should live alongside `tierColors` in `src/themes/index.ts` once it's extracted. DESIGN.md gap: difficulty colors are not in the spec, even though they're a load-bearing UX signal.

**Rarity palette (re-encoded in 4 components):**
- `src/components/BadgeIcon.tsx:6-19` — RARITY_BORDERS + RARITY_BG (5 variants × 2 = 10 utilities). Mirrors `rarityColors` in `src/themes/index.ts`.
- `src/components/BadgeCard.tsx:7-13` — RARITY_LABELS color (`text-gray-400`, `text-emerald-400`, etc.).
- `src/components/BadgeCelebration.tsx:10-16` — same RARITY_LABELS.
- `src/themes/index.ts:61-67` — `rarityColors` deliberate Tailwind mapping (the contract).

Drift type: BadgeCard and BadgeCelebration redefine `RARITY_LABELS` independently with identical content but only the text-color variant — neither imports from `@/themes`. Recommend unifying via a `rarityLabels` export from `src/themes/index.ts` so the palette has a single source of truth (matching the existing `rarityColors` precedent).

**League-rank icon colors (Top 3 medals):**
- `src/app/leagues/page.tsx:75-77` — Crown `text-yellow-400` (rank 1), Medal `text-gray-300` (rank 2), Medal `text-amber-600` (rank 3).
- `src/app/profile/page.tsx:143,148,153` — Trophy `text-yellow-400`, Calendar `text-emerald-400`, Award `text-purple-400` (stat tile icons).
- `src/components/LeagueBanners.tsx:114-115` — `text-amber-400`, `text-amber-300` (so-close warning panel).
- `src/components/LeagueNudge.tsx:50-58` — `text-amber-400`, `text-amber-300`, `bg-amber-500/10`, `border-amber-500/30` (XP-nudge panel).

Drift type: rank colors should bind to `tier-1` … `tier-6` foils. `text-yellow-400` for top-rank icon is a near-match for `tier-3` (`#eab308` sun gold) but not exact. The amber-leaning warning panels duplicate `--color-warning` (`#d97706`) tinting — should bind to `bg-warning/10`, `text-warning`, `border-warning/30`.

**Avatar/age-group pills:**
- `src/components/Navbar.tsx:36,43` — Junior `bg-emerald-500 text-white`, Teen `bg-yellow-500 text-black`.
- `src/components/AnimeCard.tsx:26-30` — content-rating pills (E `bg-emerald-500`, T `bg-yellow-500 text-black`, M `bg-red-500`).

Drift type: age-group and content-rating both use the same emerald/yellow/red ramp. They're conceptually the same semantic register (audience-fit traffic light). Recommend a shared `audienceTokens` mapping in `src/themes/index.ts`. DESIGN.md gap: audience-fit colors are not specified.

**Shop rarity (gradient palettes — also forbidden gradients, see Component findings):**
- `src/app/shop/page.tsx:7-14,19-21` — eight gradient-pair entries (`from-orange-500 to-red-500`, `from-pink-400 to-rose-500`, etc.) plus rarity text colors. This is a separate aesthetic from the rest of the app (decorative shop catalog). Recommend full re-style alongside the gradient-removal pass.

**Star League promo block:**
- `src/app/LandingContent.tsx:443-445,454` — `bg-gradient-to-br from-purple-900/30 to-purple-600/10`, `border-purple-500/20`, `text-purple-400`/`-300`, `bg-purple-600 hover:bg-purple-500`. Purple-themed Star League CTA tile. Conceptually the "star" aesthetic — could bind to `tier-5` (cobalt) for consistency with the tier-foil register, but Star League is a separate prestige product. Spec gap: prestige/Star League colors are not yet specified in DESIGN.md.

**Quiz-no-content notice:**
- `src/app/quiz/[animeSlug]/QuizClient.tsx:335-336` — `bg-purple-500/10 border border-purple-500/30 text-purple-400` for "No Questions Available". Out-of-register; recommend `bg-warning/10 border border-warning/30 text-warning` to read as a normal warning panel.

**Locked content warning:**
- `src/app/quiz/[animeSlug]/QuizClient.tsx:441` — `text-amber-300` (junior-locked label). Bind to `text-warning` or `text-warning/80`.

**Daily challenge highlights:**
- `src/app/daily/DailyContent.tsx:205,206,245,288,289` — `text-yellow-400` for XP-bonus emphasis (Zap icon + label). Should bind to a tier-3-tinted "bonus" semantic, or to `text-warning` if amber is conceptually a "limited-time" signal.

**Duels yellow accents:**
- `src/app/duels/page.tsx:317,436,521` — `text-yellow-400`, `bg-yellow-400/20` for DRAW state. Bind to `text-warning` (amber=neutral outcome).
- `src/app/grand-prix/match/[matchId]/MatchClient.tsx:183,196,245,262,317,336` — `text-yellow-400` for clock icons. Same recommendation.

**Privacy / shop misc:**
- `src/app/privacy/page.tsx:25,37` — `text-yellow-400`, `text-blue-400` for content section icons. Decorative.
- `src/app/grand-prix/page.tsx:106,137,201` — `text-yellow-400`, `border-yellow-400/30` for trophy iconography. Could bind to `tier-3` or `palette.warning`.

### rgba/hsla/oklch (user-facing — 11 lines)

| File:line | Current | Recommendation |
|---|---|---|
| `src/components/Navbar.tsx:152` | `"rgba(255,255,255,0.7)"` (inline style for active nav link state) | Replace inline-style branch with className-based active variant; bind to `text-text` / `text-text-muted`. |
| `src/components/BadgeIcon.tsx:67,76` | `"rgba(255,255,255,0.3)"` (unearned tint), `"rgba(255,215,0,0.4)"` (gold shimmer in linear-gradient) | Unearned tint → `currentColor` modulated by `text-text-muted`. Shimmer → centralize as `.shimmer-gold` utility in `tokens.css`. |
| `src/components/MonthlyEmblem.tsx:47` | `"rgba(255,215,0,0.5)"` (gold shimmer) | Share `.shimmer-gold` utility with BadgeIcon. |
| `src/components/DifficultySelector.tsx:27,32,37,42` | `"0 0 20px rgba(16,185,129,0.4)"` etc. — 4 difficulty glows | Centralize via difficulty-token export, OR drop the glow entirely if Manga Ink restraint principle wins. The glow is a "showmanship" effect that pulls against principle #1. |
| `src/components/Timer.tsx:40` | `"rgba(255,255,255,0.1)"` (SVG ring track) | Bind to `var(--color-rule)` or `currentColor` modulated by `text-text-muted`. |
| `src/components/ScoreDisplay.tsx:77` | `"rgba(255,255,255,0.1)"` (SVG ring track) | Same as Timer. |
| `src/app/global-error.tsx:24` | `"rgba(255,255,255,0.5)"` (inline style for fallback) | Acceptable in global-error fallback (theme unavailable). |

## Typography findings

### Type-scale utility usage (counts across all 56 files)

| Utility | Count | Maps to DESIGN.md token | Notes |
|---|---|---|---|
| `text-sm` (14px) | 345 | `body-sm` | Clean map. Heaviest-used size — body of UI chrome, link copy, captions in many places. |
| `text-xs` (12px) | 177 | `label` (12px / 700 / 0.04em) **or** `body-sm` if not eyebrow-styled | Tension: most `text-xs` usage is regular-weight body micro-copy (counts, percentages, captions), not the spec's bold-uppercase-tracked label. The DESIGN.md `label` token is too narrow for current usage; spec gap. |
| `text-lg` (18px) | 93 | `body-lg` (18px) **or** `h3` (20px) | Mostly section headings and prominent body. Mixed mapping. |
| `text-2xl` (24px) | 54 | `h2` (24px) | Clean map. |
| `text-3xl` (30px) | 43 | NO MAP — between `h2` (24px) and `h1` (36px) | Most are admin (engagement/users/duels). User-facing instances: `ScoreDisplay.tsx:95` (centered ring score), modal headlines (`auth/page.tsx:317,412`). Spec gap or visual-shrink to `h2`/grow to `h1`. |
| `text-xl` (20px) | 18 | `h3` (20px) | Clean map. |
| `text-4xl` (36px) | 11 | `h1` (36px) | Clean map. Used on layout maintenance h1 (`layout.tsx:91`), error/not-found, profile rank, duels tournament headings. |
| `text-5xl` (48px) | 4 | NO MAP — between `h1` (36px) and `display` (56px) | `LandingContent.tsx:348` `text-4xl sm:text-5xl md:text-6xl` (visitor hero); `ParentConsentForm.tsx:40` `text-5xl` (star emoji size); `auth/page.tsx:290` `text-5xl` (shield emoji size). For copy, recommend `display` (56px). For decorative emoji sizing, the literal sizes are defensible. |
| `text-6xl` (60px) | 1 | NO MAP — closer to `display` | `LandingContent.tsx:348` (visitor hero md+ breakpoint). Should resolve to `display` token via Anton. |
| `text-base` (16px) | 2 | `body` (16px) | Clean map but underused — most components default to `text-sm`. |

### Font-weight usage

| Utility | Count | DESIGN.md mapping | Notes |
|---|---|---|---|
| `font-bold` (700) | 200 | `h2`/`h3` (700), `label` (700), `caption` (700) | Heaviest weight in active use; OK on h2/h3/labels, but used widely on body emphasis where it shouldn't be. |
| `font-semibold` (600) | 185 | NO MAP — DESIGN.md tokens are 400/700/800 only | Not in the spec at all. Spec gap: 600 weight is essentially the codebase's default for "emphasized but not heading," with no token to bind to. Either amend DESIGN.md to add `weight-semibold` (600) or systematically downgrade to 400/700. |
| `font-medium` (500) | 112 | NO MAP — DESIGN.md tokens are 400/700/800 only | Same spec gap as `font-semibold`. Used heavily on nav links, button copy, label rows. |
| `font-extrabold` (800) | 5 | `h1` (800) | Clean map but rare. The codebase prefers `font-bold` for h1, which is one weight under spec. |
| `font-normal` (400) | 1 | `body`, `body-lg`, `body-sm` (all 400) | Should be the default — fact that explicit `font-normal` appears suggests it's overriding a parent. |

### Anton (`--font-display`) usage — zero

`grep` for `font-display` across `src/` returns hits only in `src/themes/manga-ink/tokens.css:44` (declaration), `src/themes/README.md` (docs), and `src/app/layout.tsx:13` (variable assignment). No component consumes the utility class. Anton is loaded in the document head, costing a font-fetch on every page load, but rendering nowhere. DESIGN.md install-pass deliverable predicted exactly this; this audit confirms.

Reserved use cases per DESIGN.md: homepage hero, rank-up splash, prestige certificate UI. Specific call sites that should opt in:
- `src/app/LandingContent.tsx:348` — visitor hero `OtakuQuiz` wordmark (currently `text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight` with a `bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent` gradient that also violates DESIGN.md's no-gradient rule). The hero wordmark is the highest-impact Anton candidate.
- `src/components/ScoreDisplay.tsx:129` — `text-2xl font-bold text-primary` for the rank-up "Hokage" name. Display weight + Anton would amplify the celebration moment.
- `src/components/BadgeCelebration.tsx:128` — `text-2xl font-bold` for badge name on celebration overlay. Mid-priority — the celebration is already a moment.
- Any future prestige/certificate UI (none today).

### `tabular-nums` opportunities — zero on user-facing surfaces

`grep` for `tabular-nums` returns 7 admin files only. Should opt in:
- `src/components/ScoreDisplay.tsx:95` (`{displayScore}`), `:106` (`{correct}/{total}`), `:111` (`{accuracy}%`), `:115` (`+{xpEarned}`).
- `src/components/Timer.tsx:56` (countdown number).
- `src/components/BadgeIcon.tsx` — N/A (no numeric display).
- `src/app/leagues/page.tsx:78` (`#{rank}`), and league member XP rows throughout the leaderboard.
- `src/app/profile/page.tsx:139` (`{profile.total_xp.toLocaleString()}`), `:144` (rank name — not numeric), `:149` (streak), `:154` (badge count), `:170` (`{xp} / {nextRankXP} XP`), `:286` (duel draws).
- `src/app/LandingContent.tsx:259` (`{profile.total_xp.toLocaleString()} XP`), AnimatedCounter outputs.
- `src/app/daily/DailyContent.tsx` — daily-score and streak displays.
- `src/app/duels/page.tsx:436` (`text-lg font-bold text-yellow-400` count display).
- `src/app/grand-prix/match/[matchId]/MatchClient.tsx` — match score, time-remaining.
- `src/app/stats/page.tsx` — all stat counters.

Where numbers slide on rerender (timers ticking, score animating), `tabular-nums` is a perceptual fix — characters stop jumping.

## Spacing findings

Tailwind v4 default spacing scale, no custom tokens. Per DESIGN.md, sub-pixel adjustments and arbitrary values are "discouraged but not enforced." Inventory of arbitrary `[…]` spacing values:

**Defensible / on-spec exceptions:**
- `min-h-[44px]` ×11 instances — touch target requirement from CLAUDE.md, not Tailwind-scale (closest scale value is `min-h-12` 48px). Keep.
- `min-h-[56px]` (`AnswerButton.tsx:60`) — answer-tile size for finger-friendly tap on quiz. Keep, document as the answer-tile-specific exception.
- `h-[280px]` (`AnimeCard.tsx:38`, `LandingContent.tsx:425`, several admin chart containers) — fixed-aspect card height. Keep — aspect-ratio constraint, not spacing.
- `h-[90px]` (`AdBanner.tsx:17`) — IAB ad slot dimensions, externally determined.
- `h-[200px]`, `min-w-[180px]`, `min-w-[120px]`, `min-w-[280px]` etc. — layout primitives for tournament bracket and skeletons. Keep.
- `min-h-[60vh]` / `min-h-[70vh]` / `min-h-[80vh]` — viewport-relative heights for centered states. Keep.

**Possible drift (off-scale, no clear external constraint):**
- None of meaningful concern. The codebase generally lives on the Tailwind scale (`gap-1.5`, `gap-2`, `py-0.5`, `py-1.5`, `px-1.5`, `px-2.5` show up but those are valid v4 utilities, just on the half-step scale).

**Half-step scale usage** (`py-0.5`, `gap-1.5`, `px-1.5`, `px-2.5`, `py-1.5`, `gap-0.5`): used in pill paddings (Navbar Jr/T pills, PRO pill, count badges) and small icon-row gaps. On-scale per Tailwind v4. Whether the half-step variants belong in DESIGN.md depends on whether the project wants the spec to assert a stricter scale.

## Rounded findings

DESIGN.md defines exactly two tokens — `--radius-sharp: 2px` and `--radius-pill: 9999px`. Bucketed usage:

| Utility | Pixel value | Count | Maps to | Recommendation |
|---|---|---|---|---|
| `rounded-xl` | 12px | 173 | NEITHER (in deliberate gap) | Buttons (most common), cards, modals, info panels, OAuth buttons. Spec decision needed. |
| `rounded-full` | 9999px | 88 | `pill` ✓ | Avatar circles, status pills, count chips, score-bar caps. On-spec. |
| `rounded-lg` | 8px | 85 | NEITHER (in deliberate gap) | Smaller buttons, tag chips, secondary cards, IDs in tables. |
| `rounded-2xl` | 16px | 60 | NEITHER (in deliberate gap) | Larger cards (AnimeCard, BadgeCard, modal containers). |
| `rounded` | 4px | 22 | NEITHER (smaller gap) | Tiny pills (Navbar Jr/T/PRO), small icon backgrounds. |
| `rounded-3xl` | 24px | 3 | NEITHER (in deliberate gap) | Bottom-sheet modals (`ChallengeModal:106`, `EmblemSelector:62`) — `sm:rounded-3xl` used on the desktop variant. |
| `rounded-t` | 8px (top corners only) | 3 | NEITHER | Bottom-sheet modal top corners (`rounded-t-3xl`). |
| `rounded-sm` | 2px | 2 | `sharp` ✓ | Currently used in 2 isolated places. Should be the dominant token if the spec is honored. |

**Total in the deliberate gap: 411 usages** (rounded-xl + rounded-lg + rounded-2xl + rounded-3xl + rounded). This is the single largest visual delta from spec.

Three resolutions are possible (Phase 5 needs to pick one, alongside the buttons refactor):
1. **Honor the spec strictly:** every rectangle becomes `rounded-sharp` (2px), every pill stays `rounded-full`. Accept that the visual register changes substantially — sharp ink-stamp aesthetic everywhere. Highest brand consistency, biggest visual delta.
2. **Amend DESIGN.md to add `rounded-md` (8px) and/or `rounded-lg` (12px):** acknowledge that the codebase has converged on a softened-card register and codify it. Keeps the refactor surface small but breaks the principle "shape language is sharp-or-pill, not a continuous scale."
3. **Hybrid:** sharp for buttons and inline elements; keep one mid-rounded token for surface containers (cards, modals). E.g., `--radius-card: 8px` reserved specifically for elevated containers. Compromise that preserves the spec's spirit (still no continuous scale) while accepting that 2px-cornered cards on a dark canvas read as harsh.

This audit recommends option 3 with a single `--radius-card: 8px` token added, but flags it for orchestrator decision — option 1 is the most principled.

## Shadow findings

DESIGN.md defines `--shadow-ink: 0 4px 0 0 rgba(0,0,0,0.4)` — a hard offset, not a blur. The CSS variable exists in `tokens.css` but **the `shadow-ink` Tailwind utility is consumed nowhere**.

Shadow utilities currently used (8 user-facing instances):

| Utility | Count | Files |
|---|---|---|
| `shadow-lg` | 4 | `AnimeCard:38` (`hover:shadow-lg hover:shadow-primary/10`), `ToastContainer:31`, `Navbar:374` (signout-error modal), one more |
| `shadow-2xl` | 1 | `DuelNotification:36` (`shadow-2xl shadow-accent/10`) |
| `shadow-xl` | 1 | `admin/users/page.tsx:534` (admin) |
| `shadow-primary` / `shadow-accent` | 2 (color-only modifiers paired with above) | AnimeCard, DuelNotification |
| `shadow` | 1 | (single inline) |

Plus 1 `drop-shadow-lg` on `AnimeCard:61` for the title text overlay.

**Findings:**
- AnimeCard's `hover:shadow-lg hover:shadow-primary/10` is the most prominent — the anime-grid hover effect introduces a soft glow that's both forbidden (no soft shadows in spec) and the wrong register (glow ≠ ink stamp). Refactor: drop the shadow, deepen the border (`hover:border-primary/40`) or keep the existing `transition-shadow` rename to `transition-colors` once shadow is removed.
- DuelNotification's `shadow-2xl shadow-accent/10` is a notification floating banner. Same recommendation — drop shadow, deepen border or use `shadow-ink` with a horizontal offset.
- ToastContainer's `shadow-lg` is per-toast. Keep some elevation here — toasts are temporal floating elements that benefit from "this is above your work" visual layer. Bind to `shadow-ink` if it reads acceptably.
- Navbar signout-error modal `shadow-2xl` is a modal floating card. Keep elevation; bind to `shadow-ink`.

The `--shadow-ink` token is well-defined; the codebase just doesn't use it. The refactor opportunity is to migrate the 4 legitimate "this floats above the page" surfaces to `shadow-ink`, drop the rest.

## Interaction state findings

Hover/focus state opacity modifiers — surveyed for inconsistency with the DESIGN.md install-pass observation that `hover:bg-primary/90` and `hover:bg-primary/80` both exist.

**Dominant pattern (consistent):**
- `hover:bg-primary/90` — primary fill buttons, ~30+ call sites. Consistent.
- `hover:bg-accent/90` — accent fill buttons (DuelNotification, error/danger CTAs). Consistent.
- `hover:bg-white/20` (paired with base `bg-white/10`) — secondary/tertiary buttons. Consistent across ~15 sites.
- `hover:bg-primary/30` (paired with base `bg-primary/20`) — translucent emphasis chips ("Change" emblem, etc.). Consistent.
- `hover:bg-success/30` (paired with base `bg-success/20`) — accept-duel CTA pattern.

**Outliers:**
- `hover:text-primary/80` — appears on 6+ inline links (`privacy/page.tsx:79`, `LandingContent.tsx:433,503,533,644`, `LeagueNudge.tsx:65`, `profile/page.tsx:238,269,329`). The outlier here is `text-primary/80` rather than `/90` — for text the slightly stronger contrast change reads better.

**Verdict:** the codebase converged on a clean `+10%` hover delta for fills (`/90` from `/100`, `/30` from `/20`, `/20` from `/10`) and a `+20%` delta for text links (`/80` from `/100`). No spec violation; recommend codifying the rule rather than refactoring. DESIGN.md amendment opportunity: explicitly state the +10% / +20% interaction-state convention.

## Touch target findings

CLAUDE.md mandates 44×44px minimum for any interactive element on mobile/tablet. `min-h-[44px]` appears on 11 explicit call sites. There are 101 `<button>` elements across the codebase.

**Explicit 44px-asserted call sites** (sample): all OAuth buttons in `auth/page.tsx`, sign-in/sign-up pill toggles (`auth/page.tsx:352,364`), all primary/secondary auth-flow CTAs, `AgeGate.tsx:52` age-tier picker, `BrowseContent.tsx:147` sign-in modal CTA, `Navbar.tsx:347,378,385,392` (logout, sign-in, sign-out flows). The `AnswerButton.tsx:60` quiz answer tile uses `min-h-[56px]` — even larger, correct.

**Underspecified or potentially short:**
- `Navbar.tsx:198` (`<button onClick={handleSignOut} className="p-2 ...">`) — desktop sign-out icon button. `p-2` = 8px padding × 2 + 18px icon = 34px — under 44px. Acceptable on desktop where mouse is precise; flag as drift on mobile if it ever surfaces.
- `Navbar.tsx:218` (`<button className="md:hidden p-2" ...>`) — hamburger menu trigger. `p-2` + 24px icon = 40px. Under 44px on mobile, where it matters most.
- `Navbar.tsx:251` (close-overlay X button, `<button className="p-2">`) — same pattern, mobile, 40px. Under spec.
- `ChallengeModal.tsx:117` (`<button className="p-2 rounded-full hover:bg-white/10 ...">`) — close button. Likely under 44px.
- `EmblemSelector.tsx:70` (close button, `<button className="p-2 rounded-full ...">`) — same.
- `DuelNotification.tsx:40` (close button, `<button className="absolute top-2 right-2 p-1.5 rounded-full ...">`) — `p-1.5` + 16px icon = 28px. Significantly under spec.
- `BrowseContent.tsx:136` (`<button className="text-white/40 hover:text-white/70 transition-colors">`) — close icon for sign-in modal. No padding asserted.
- `ToastContainer.tsx:36` (close-toast button, `p-1`) — under spec.

**Pattern:** modal/notification close buttons (X icons) consistently miss 44px because they're styled compactly. Phase 5 recommendation: when extracting `<IconButton>` (likely as part of the buttons refactor), bake `min-h-[44px] min-w-[44px]` into the variant.

## Component findings

### Buttons (101 button-shaped call sites, no shared `<Button>` component)

**Pattern inventory:**

The dominant primary button pattern (~30+ recurrences) is structurally:
```
className="px-{4|6|8} py-{2|3|4} rounded-xl bg-primary text-white font-{semibold|bold} hover:bg-primary/90 transition-colors min-h-[44px]"
```
Variations: padding (smaller for compact contexts, larger for hero CTAs), font weight (`semibold` more common, `bold` on landing/marketing), occasional `disabled:opacity-50 disabled:cursor-not-allowed`. The semantic shape is highly consistent.

**Other recurring variants:**
- **Secondary (translucent fill, ~20 call sites):** `px-{4|6|8} py-{2|3|4} rounded-xl bg-white/10 text-white font-{semibold|bold} hover:bg-white/20 transition-colors min-h-[44px]`. "Cancel," "Back," "View Profile," "Skip."
- **Tertiary (translucent emphasis, ~10 call sites):** `px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors`. "Change" emblem, "Accept" duel.
- **Outline (~3 call sites):** `border border-primary/30 text-primary hover:bg-primary/10` (DuelResults rematch).
- **Icon button (~8 call sites):** `p-{1.5|2} rounded-{full|lg} hover:bg-white/10 transition-colors`. Modal close, Navbar logout icon.
- **Pill toggle (~4 call sites):** `flex-1 py-2.5 min-h-[44px] text-sm font-semibold rounded-lg` with `bg-primary text-white` for active and `text-text-muted hover:text-text` for inactive (auth mode toggle pattern).
- **Sample brand-mandated:** Discord (`bg-[#5865F2]`), Google/Apple (`bg-white text-black`). Three OAuth buttons in `auth/page.tsx` — these stay literal.

**Deliberate one-off:**
- `app/auth/page.tsx:303` — single bg-primary with rounded-xl that diverges from the dominant by being a CTA inside an error-state branch. Same shape, contextually one-off.

**Recommendation:** extract a shared `<Button variant="primary"|"secondary"|"tertiary"|"outline"|"icon"|"toggle">` polymorphic between `<button>` and Next.js `<Link>` via `href` discriminated union. ~50 call sites consolidate. Bake `min-h-[44px]` into all variants (closes the touch-target gap mentioned above). Resolve the rounded question (sharp vs xl vs new card-radius token) at the same time.

**Files affected**: `Navbar.tsx`, `AgeGate.tsx`, `ParentConsentForm.tsx`, `BadgeCard.tsx` (motion.button wrapper), `AnswerButton.tsx`, `ChallengeModal.tsx`, `DuelNotification.tsx`, `DuelResults.tsx`, `EmblemSelector.tsx`, `ToastContainer.tsx`, `LandingContent.tsx`, `BrowseContent.tsx`, `auth/page.tsx`, `badges/page.tsx`, `daily/DailyContent.tsx`, `duels/page.tsx`, `duels/[duelId]/DuelClient.tsx`, `grand-prix/page.tsx`, `grand-prix/match/[matchId]/MatchClient.tsx`, `leagues/page.tsx`, `not-found.tsx`, `error.tsx`, `profile/page.tsx`, `quiz/[animeSlug]/QuizClient.tsx`, `redeem/page.tsx`, `shop/page.tsx`, `star-league/page.tsx`, `stats/page.tsx`, `test-components/page.tsx`.

### Achievement badges (PRIORITY — flagged user pain point)

**(a) Schema.** `supabase/migrations/006_badges.sql` creates `badges (id, slug, name, description, category, icon_name, icon_color, requirement_type, requirement_value, rarity)` plus `user_badges` join table. `008_…` is impossible-difficulty seeds (unrelated). `025_badges_secure_awarding.sql` likely guards the awarding function (read for completeness).

**(b) Renderer:** `src/components/BadgeIcon.tsx` is the single dynamic-icon renderer. It maps `iconName` (string) → Lucide component via:
```tsx
const IconComponent = (LucideIcons as unknown as Record<...>)[iconName] ?? LucideIcons.HelpCircle;
```
The `??LucideIcons.HelpCircle` fallback masks bad data — if a `icon_name` value doesn't resolve, the user sees a generic question mark, no error logged. `iconColor` is a CSS color string from the DB applied via inline `style`.

**(c) Where badges render:**
- `src/components/BadgeCard.tsx` (Badges page grid item, `motion.button` with onClick selector for emblem-picker context).
- `src/components/BadgeCelebration.tsx` (full-screen unlock celebration overlay).
- `src/components/EmblemSelector.tsx` (modal picker on Profile page).
- `src/components/Navbar.tsx:186-194,307-314` (small emblem chip beside avatar, both desktop and mobile).
- `src/app/LandingContent.tsx` (sample badges showcase).
- `src/app/badges/page.tsx` (Badges page list/grid views).
- `src/app/profile/page.tsx:194-201` (current emblem display).

**(d) Lucide icon assignment audit (32 seeded badges, 22 unique icons):**

| Icon | Badges using it | Issue |
|---|---|---|
| `Flame` | streak-3, streak-7, streak-30 | 3 streak ladder badges. Acceptable (rarity disambiguates). |
| `Calendar` | weekend-warrior | unique |
| `CalendarCheck` | daily-7 | unique |
| `Sunrise` | early-bird | unique |
| `Moon` | night-owl | unique |
| `Swords` | hard-starter, hard-master, hard-perfect, **league-champion** | **MATERIAL DUPLICATE** — 3 difficulty badges + 1 league badge share the same icon across categories. League Champion looks identical to a Hard-mode achievement. |
| `Sparkles` | first-quiz | unique |
| `Compass` | anime-explorer | unique |
| `Globe` | anime-master | unique |
| `BookOpen` | quiz-50, quiz-100, quiz-500 | 3 volume ladder. Acceptable (rarity disambiguates). |
| `Crown` | quiz-1000, **xp-hokage** | **MATERIAL DUPLICATE** — Quiz volume legend and XP rank legend share Crown across categories. |
| `Target` | perfect-10 | unique |
| `Crosshair` | accuracy-90 | unique |
| `Zap` | speed-demon, lightning-hard | 2 speed badges. Acceptable. |
| `Medal` | league-silver | unique |
| `Star` | league-gold | unique |
| `Gem` | league-platinum | unique |
| `Award` | league-diamond | unique |
| `TrendingUp` | first-promotion, promo-5 | 2 league-promotion badges. Acceptable. |
| `Shield` | og-player | unique |
| `GraduationCap` | xp-genin | unique |

**Verdict:** 2 of the 32 badges (~6%) have a confusing cross-category duplicate. Phase 5 badge refactor should reassign one of each pair. Suggested: `quiz-1000` → `Library` or `Bookmark` (it's the volume-ladder peak); `league-champion` → `Trophy` or `Flame` reserved for that purpose.

**(e) icon_color audit:** all 32 badges have `icon_color` literal hex values that live outside the Manga Ink palette: `#FF6B35`, `#FF8C00`, `#FF4500`, `#00D1B2`, `#FFD700`, `#6366F1`, `#E94560`, `#FF0000`, `#B9F2FF`, `#C0C0C0`, `#E5E4E2`. These predate the theme. Three options:
1. **Re-seed icon_color values** to bind to brand palette equivalents (`palette.primary`, `palette.tier-{1..6}`, `palette.success`, `palette.warning`). Migration alters all 32 rows. Pros: brand consistency. Cons: visual variety drops dramatically — 8 of the badges become vermillion, 6 become tier foils, leaving a much narrower palette.
2. **Treat icon_color as semantic per-badge data**, theme-independent. Don't migrate. Pros: per-badge personality preserved. Cons: brand palette doesn't reach badges; the badge wall always reads as a separate aesthetic.
3. **Hybrid:** add a `theme_icon_color` JSONB column keyed by theme name, fall back to `icon_color` on miss. Pros: future-proof for the general-trivia theme planned in `src/themes/README.md`. Cons: schema growth for one feature.

`src/themes/README.md` already flags this as TODO (option for the badge refactor decision). Recommend taking the decision in the Phase 5 badge refactor pass with stakeholder input.

**(f) Visual-treatment consistency:** BadgeIcon is structurally consistent across consumers — `rounded-xl`, sized via `SIZE_MAP` (sm/md/lg), border + bg per rarity. The legendary shimmer is gold linear-gradient overlay. RARITY_LABELS color mapping is **duplicated independently in BadgeCard.tsx and BadgeCelebration.tsx** with identical content; should be hoisted to a shared `rarityLabels` export from `src/themes/index.ts` alongside `rarityColors`.

**(g) DB write path:** `src/app/api/process-grand-prix/route.ts:288` writes Grand Prix monthly emblems with hardcoded `icon_color: "#FFD700"`. Awarding regular badges goes through the secure SQL function in migration 025. Phase 5 badge refactor will need to:
1. Decide icon_color treatment (option 1/2/3 above).
2. If option 1: write a migration to update all `badges.icon_color` rows.
3. Update `process-grand-prix/route.ts` write path if changing color contract.

### League tier badges

**Files:** `src/app/leagues/page.tsx:35-44` (LEAGUE_ICONS map: tier 1-6 → Shield/Medal/Star/Award/Gem/Swords), `src/components/LeagueBanners.tsx`, `src/components/LeagueNudge.tsx`, `src/themes/index.ts:19-26` (tierColors export).

**Pattern:** `tierColors` already provides the canonical Bronze→Champion ladder mapped to `palette.tier1..tier6`. The colors are wired correctly — `leagues/page.tsx` and the LandingContent league preview both consume `tierColors` from `@/themes`. The icon assignments are local to leagues/page.tsx and not duplicated elsewhere.

**Drift surfaces:**
- `leagues/page.tsx:75-77` — top-3 medal icons (`text-yellow-400`, `text-gray-300`, `text-amber-600`) bypass tier tokens. Should bind to `text-tier-3`, `text-tier-2`, `text-tier-1` for visual coherence.
- `LeagueNudge.tsx`, `LeagueBanners.tsx` — use `text-amber-{300,400}`, `bg-amber-500/N`, `border-amber-500/N` for "so close" warnings. Bind to `--color-warning` (amber `#d97706`) instead.
- League-icon mapping uses `Swords` for tier 6 — same icon as the league-champion badge (see badge duplicates above). Coordinate the resolution: if `league-champion` badge gets a new icon, LEAGUE_ICONS[6] should follow.

**Recommendation:** small refactor pass to bind league rank-icon colors to `tierColors`/`palette` and warning panels to `--color-warning`. Combined refactor with achievement-badge pass since they share the foil/rank visual register.

### Pills (age-tier, PRO, count, content-rating, genre tags)

**Inventory:**
- **Age-tier pills (Jr / T):** `Navbar.tsx:33-49` (`AgeBadge`). `bg-emerald-500 text-white` for Junior, `bg-yellow-500 text-black` for Teen. Two-step traffic light register. `px-1.5 py-0.5 text-[10px] font-bold rounded` (note `text-[10px]` arbitrary — could be `text-caption` once token shapes are added).
- **PRO pill:** `Navbar.tsx:181-183,302-304`. `px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary text-white` (desktop) and `px-2 py-0.5 text-xs font-bold rounded bg-primary text-white` (mobile, slightly larger). Two minor inconsistencies — same brand mark, two paddings.
- **Pending duel count:** `Navbar.tsx:160-164` (desktop, `w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold`), `:285-289` (mobile, `w-5 h-5 rounded-full bg-accent text-white text-xs font-bold`). Circular count badge.
- **Content-rating pills (E/T/M):** `AnimeCard.tsx:53-58`. `absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-bold` with bg from `ratingConfig`. Same emerald/yellow/red traffic light as age-tier.
- **Difficulty pill (in QuizCard):** `QuizCard.tsx:54-58`. `px-3 py-1 rounded-full text-xs font-semibold capitalize`. Capitalized text + rounded-full = visually distinct from rounded rating pill above.
- **Difficulty selector pill (DifficultySelector.tsx):** `rounded-xl border` with selected/unselected per-difficulty styling. Larger pill behavior — more like a button than a status pill.
- **Toast pill (ToastContainer):** `px-4 py-3 rounded-xl border text-sm font-medium` with type-styled background.

**Pattern variants observed:** at least 4 distinct shape registers (rounded vs rounded-xl vs rounded-full vs rounded with arbitrary `text-[10px]`). All semantically "pills" but no shared visual contract.

**DESIGN.md gap:** `pill` token covers shape only (rounded.pill = 9999px). No `pill-status`, `pill-count`, `pill-tag` component tokens. Audit recommends adding these alongside the Phase 5 pill refactor — see Spec gaps below.

### Cards

**Inventory:** the `bg-surface rounded-{xl|2xl} border border-white/10 p-{3|4|5|6}` pattern recurs across:
- `AnimeCard.tsx:38` — `relative h-[280px] bg-surface rounded-2xl border border-white/10 overflow-hidden ...`
- `BadgeCard.tsx:36` — `bg-surface rounded-2xl border p-4 transition-colors`
- `QuizCard.tsx:48` — `bg-surface rounded-2xl border border-white/10 p-5 md:p-6`
- `LandingContent.tsx:265` — `bg-surface rounded-xl border border-white/10 p-4`
- `LandingContent.tsx:246-260` — three stat tiles `bg-surface rounded-lg px-3 py-2 border border-white/10`
- `LandingContent.tsx:201` — `bg-surface rounded-2xl border border-yellow-400/30 p-6 text-center`
- `profile/page.tsx:137,142,147,152` — four stat tiles `bg-surface rounded-2xl border border-white/10 p-4 text-center`
- `profile/page.tsx:164` — `bg-surface rounded-2xl border border-white/10 p-4` (rank progress)
- `profile/page.tsx:189` — same (emblem section)
- `ScoreDisplay.tsx:104,110,114` — three score-stat tiles `bg-surface rounded-xl p-3 border border-white/10`
- `BrowseContent.tsx:129` — sign-in modal `bg-surface border border-white/10 rounded-2xl p-6`
- `Navbar.tsx:370` — sign-out error modal `bg-surface border border-accent/30 rounded-2xl p-6`
- `DuelNotification.tsx:36` — `bg-surface border border-accent/30 rounded-2xl shadow-2xl shadow-accent/10 p-4`
- Plus several more in `daily/DailyContent.tsx`, `duels/page.tsx`, `grand-prix/page.tsx`, `redeem/page.tsx`, `quiz/[animeSlug]/QuizClient.tsx`.

15+ near-identical card sites. The variations are:
- `rounded-xl` vs `rounded-2xl` (mostly arbitrary)
- `p-3` / `p-4` / `p-5` / `p-6` (size-driven, but not formalized)
- `border border-white/10` (default) vs `border border-accent/30` (alert/critical context) vs `border-yellow-400/30` (warning context)
- Some cards have `text-center`, some don't.

**Recommendation:** extract `<Card variant="default"|"alert"|"warning" padding="sm"|"md"|"lg">` shared component. Resolves rounded inconsistency, formalizes the border-color semantic, lets the `text-warning` etc. token bind one place not many.

### Forms

**Files in scope:** `src/app/auth/page.tsx` (sign-in / sign-up email + password), `src/components/ParentConsentForm.tsx` (parent email + consent checkbox), `src/app/star-league/page.tsx` (form-shaped), `src/app/redeem/page.tsx` (promo code).

**Common input pattern:** `className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"` — present in `auth/page.tsx:565,591,etc` and `ParentConsentForm.tsx:66`. Consistent.

**Common label pattern:** `className="block text-sm font-medium text-white/70 mb-1"` — used 4× in `auth/page.tsx`, also in `ParentConsentForm.tsx:51-53`. Consistent.

**Error display:** `<p className="text-accent text-xs mt-1">{emailError}</p>` (`ParentConsentForm.tsx:69`), `<p className="text-sm text-accent">{error}</p>` (`auth/page.tsx:384`). Two slightly different error treatments.

**Autocomplete attributes:** spot-checked, mostly missing on auth inputs. Email inputs should have `autocomplete="email"`; password should have `autocomplete="current-password"` (sign-in) or `"new-password"` (sign-up). Accessibility improvement opportunity.

**Recommendation:** small Phase 5 form pass — extract `<TextInput>`, `<Label>`, `<FormError>` components alongside DESIGN.md amendments for `input-default`, `label-default`, `error-message` component tokens. ~6 sites, low complexity.

### Quiz answer tiles

**File:** `src/components/AnswerButton.tsx`.

**State variants (5 total):**
1. **Default unanswered:** `bg-surface border-white/10 hover:border-primary/50 hover:bg-white/5`
2. **Selected (pre-reveal):** `border-primary bg-primary/10`
3. **Revealed correct:** `border-success bg-success/10` + green `bg-success` letter chip
4. **Revealed incorrect (selected):** `border-red-500 bg-red-500/10` + red `bg-red-500` letter chip + shake animation
5. **Revealed but not selected (incorrect dimmed):** `border-white/10 bg-surface opacity-50`

The letter chip nests its own state machine: `bg-success`/`bg-red-500`/`bg-primary`/`bg-white/10` with `text-white`/`text-white/70` foreground.

**Drift:** `border-red-500` and `bg-red-500/10` for incorrect-selected use raw Tailwind red instead of `--color-accent` (`#b91c1c` blood ink). DESIGN.md says "blood ink" is reserved for incorrect-answer flashes — this is exactly the use case the spec contemplated. Should bind to `border-accent` and `bg-accent/10`. Same for the inner chip's `bg-red-500`.

**Touch target:** `min-h-[56px]` — comfortably above 44px spec.

**Recommendation:** drop-in token swap for accent (red → blood-ink). No structural refactor needed.

### Tables

**Inventory:** `<table>` / `<thead>` / `<tbody>` markup appears only in `src/app/admin/` (out of scope for this audit's primary track). User-facing leaderboard rows in `src/app/leagues/page.tsx` use grid + flex layout, not semantic tables. No user-facing table refactor needed.

### Navigation

**File:** `src/components/Navbar.tsx`.

Recently refactored (`fix/mobile-nav-overlay` merge `986760a`, `fix/auth-flow-separation` merge `f80edae`). Current state:
- Desktop sticky header `fixed top-0 left-0 right-0 z-50 h-16 bg-secondary/80 backdrop-blur-lg border-b border-white/10` — uses brand `bg-secondary/80` with `backdrop-blur-lg` (the "frosted ink" exception explicitly allowed by DESIGN.md elevation/shapes section).
- Mobile overlay rendered as sibling of `<nav>` (the recent fix). `bg-secondary` solid.
- Brand wordmark `text-xl font-bold text-primary` — vermillion. On-spec.
- Active-link state via `style={{ color: ... }}` inline (not className). Inactive uses `rgba(255,255,255,0.7)` raw rgba — drift, should bind to `text-text-muted`.
- Sign-out error overlay (lines 360-401) — modal with focus management opportunity (no explicit focus trap; `role="alertdialog"` and `aria-labelledby` present).

**Drift:**
- `style={{ color: "rgba(255,255,255,0.7)" }}` for inactive nav links — refactor to className-based variants.
- Hamburger button `<button className="md:hidden p-2">` — under 44px touch target.
- Close-overlay X button `<button className="p-2">` — same.

**Recommendation:** Navbar is mostly done. Token-bind the inactive nav-link color and bake 44px into the icon-trigger buttons (likely as part of the buttons refactor's `<IconButton>` extraction).

### Modals / dialogs

**Files using `AnimatePresence + role="dialog"`/`aria-modal`:** `BrowseContent.tsx` (sign-in prompt), `BadgeCelebration.tsx` (badge unlock), `ChallengeModal.tsx` (challenge picker), `EmblemSelector.tsx` (emblem picker), `Navbar.tsx` (mobile menu, sign-out error overlay), `QuizCard.tsx` (uses AnimatePresence for explanation expansion, not a modal).

**Pattern variants:**
- Most use `bg-black/{50|60|70}` backdrop with `backdrop-blur-sm` (BadgeCelebration only).
- Container card consistently `bg-surface border border-white/10 rounded-2xl p-{4|5|6}`.
- Bottom-sheet variants on mobile (ChallengeModal, EmblemSelector): `rounded-t-3xl sm:rounded-3xl` — larger rounded corners on mobile, full-rounded on desktop.

**Focus management:** none of the modals appear to implement focus trapping. Tabbing past the last focusable element will exit the modal. `aria-modal="true"` is set in some places but the focus-trap behavior isn't enforced. Accessibility refactor opportunity.

**Backdrop blur:** `BadgeCelebration.tsx:80` uses `bg-black/70 backdrop-blur-sm` — this is a second `backdrop-blur` instance beyond the Navbar exception DESIGN.md grants. Given the celebration is a moment-of-glory overlay and the underlying canvas is already dark, the perceptual cost is low — but it's drift if the spec is read strictly.

**Recommendation:** Phase 5 modal pass should extract `<Modal>` (with focus trap) and `<BottomSheet>` shared components. Resolve the `backdrop-blur` question (allow on celebration overlays, or restrict to Navbar only).

### Footer / landing / hero

**Footer (`src/components/Footer.tsx`):** four-column grid `border-t border-white/10 bg-secondary py-8`. Uses `text-white/40 hover:text-primary` for links, `text-white/70` for column headings, `text-white/30` for the about column body, `text-white/20` for the copyright line. All white-tints rather than `text-text`/`text-text-muted` bindings. Should refactor to bind to `text-text-muted` (`#a3a097`) and inversions thereof. No font-display usage.

**Landing (`src/app/LandingContent.tsx`):**
- Visitor hero `text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight` with `bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent` — **forbidden gradient** per DESIGN.md. Should be the primary Anton call-site (display-token candidate), and the gradient should be dropped for solid `text-primary` (the wordmark is already on the trust-color register).
- Logged-in hero `text-3xl sm:text-4xl font-extrabold` — Welcome message with `<span className="text-primary">{name}</span>`. On-spec for color, font-extrabold (800) maps to h1 token weight — could be `text-h1` once tokens land.
- Star League promo block (lines 443-454) — purple gradient, purple border, `bg-purple-600 hover:bg-purple-500` button. Drifts on three vectors: gradient forbidden, purple not in palette, custom hover delta. Spec gap: prestige/Star League aesthetic not specified.
- Pre-Pro hero block — uses `bg-yellow-500 text-black hover:bg-yellow-400` button (line 551) — yellow-as-prestige register. Same spec gap.
- Three "floating shapes" decoration (`bg-primary/5`, `bg-accent/5`, `bg-success/5` circles with `float` animation) — on-spec, uses brand tokens, very subtle. Keep.

**Hero pattern recommendations:**
1. Switch visitor hero to `font-display text-display text-primary` (Anton, 56px, vermillion). Drop gradient.
2. Logged-in hero stays bold DM Sans, becomes `text-h1`.
3. Resolve Star League promo aesthetic via DESIGN.md amendment (add Star League as a named prestige sub-aesthetic, with token recommendations).

## Spec gaps for DESIGN.md

Things the codebase needs that DESIGN.md doesn't yet define. Each entry: (a) what's missing; (b) recommended remediation; (c) which Phase 5 pass should propose the amendment.

1. **Difficulty palette tokens.** Easy/Medium/Hard/Impossible/Mixed colors are re-encoded in 4 components (DifficultySelector, QuizCard, ChallengeModal, DuelClient). They're a load-bearing UX signal but live entirely in raw Tailwind. Recommendation: add `--color-difficulty-{easy,medium,hard,impossible,mixed}` to `tokens.css` and a `difficultyColors` export to `src/themes/index.ts`. Phase 5 pass: quiz-tile refactor (the highest-traffic surface).

2. **Audience-fit / content-rating palette.** Junior/Teen/Adult and content-rating E/T/M use the same emerald/yellow/red traffic light independently in 2 components. Recommend `--color-audience-{junior,teen,full}` tokens. Phase 5 pass: pill refactor.

3. **Rarity palette token export.** `rarityColors` already lives in `src/themes/index.ts` (border + bg). `rarityLabels` (text-color per rarity) is duplicated in BadgeCard and BadgeCelebration with no shared source. Recommend `rarityLabels: Record<Rarity, { text: string; color: string }>` export to match the existing `rarityColors` pattern. Phase 5 pass: badge refactor.

4. **Mid-rounded token (`--radius-card` or similar).** 411 mid-rounded utility usages. Either honor the spec strictly (every card → `rounded-sharp`), amend with one or two new tokens, or pick the hybrid where elevated containers get one mid-rounded value. Phase 5 pass: combined buttons + card refactor (these resolve together).

5. **Component tokens not yet defined:** the install pass listed buttons, pills, cards, tables, forms, navigation, footer, quiz answer tiles, badge cards. For each Phase 5 component pass, name + define the relevant tokens alongside the refactor. Example `pill-status-junior`, `pill-status-teen`, `pill-pro`, `pill-count`, `pill-content-rating-{E,T,M}`, `pill-difficulty-{easy,medium,hard,impossible}`.

6. **`weight-medium` (500) and/or `weight-semibold` (600) tokens.** 297 utility usages (185 + 112) reference weights that have no DESIGN.md token. Either downgrade systematically to 400/700 or amend the typography block to add the missing weights. Phase 5 pass: typography pass (or fold into the buttons + card pass since most live there).

7. **`tabular-nums` utility binding.** DESIGN.md mentions in prose ("not yet wired but should be applied to score readouts, leaderboard ranks, and timer displays"). Recommend either (a) a `.tabular` utility class in `tokens.css` plus a DESIGN.md typography rule applying it to numeric tokens, or (b) per-component className opt-in (`tabular-nums` already works in Tailwind v4). The decision is whether numerics get a typography token of their own (`numeric-lg`, `numeric`, `numeric-sm`) or whether `tabular-nums` is just a utility applied on top of body tokens. Phase 5 pass: ScoreDisplay/Timer/leaderboard refactor.

8. **Star League / prestige sub-aesthetic.** Purple-themed Star League promo block on landing has no spec home. Either declare a prestige sub-palette (cobalt + purple foil for Star League, gold + amber for monthly Grand Prix emblems) or refactor Star League to use existing tier tokens (tier-5 cobalt for Star League could read as on-brand). Phase 5 pass: landing/hero refactor.

9. **Hover state convention.** Codebase converged on `+10%` for fills and `+20%` for text links but the convention isn't stated in DESIGN.md. Recommend adding a one-line "Interaction states: hover deepens existing fills by 10% (`/100 → /90`, `/20 → /30`); hover deepens text by 20% (`/100 → /80`)" to the Do's section. Phase 5 pass: buttons refactor.

10. **Modal / dialog tokens + focus management contract.** No `modal-backdrop`, `modal-container`, `bottom-sheet` tokens. No spec rule on whether `backdrop-blur-sm` is permitted on celebration overlays. Phase 5 pass: modal refactor.

11. **Shadow token usage rule.** `--shadow-ink` is defined and unused. Spec says "reserved for tactile elements that benefit from 'pressable' feel (primary action buttons in some contexts, badge cards on the Badges page)" — but neither buttons nor badge cards consume it. The spec is too vague — needs concrete rule for which surfaces opt in. Phase 5 pass: combined buttons + card refactor.

12. **`tier-3` warning vs `--color-warning`.** `tier-3` (sun gold `#eab308`) and `--color-warning` (amber `#d97706`) both occupy the warm-yellow register but signal different things (achievement vs caution). The codebase often grabs `text-yellow-400` or `text-amber-400` for either. Worth a Do/Don't entry clarifying which to reach for.

## Prioritized refactor queue

Each entry: scope, file count, estimated complexity (S/M/L), DESIGN.md amendments required, dependencies. The order minimizes downstream rework — foundational extractions land first so later passes can reference them.

**1. Buttons + Card (combined)** — S+M
- **Why combined:** they share the rounded-resolution decision, the hover-state convention amendment, and the `min-h-[44px]` touch-target standardization. ~50 button call sites + 15 card call sites. Resolving the rounded gap once unblocks both.
- **DESIGN.md amendments:** mid-rounded token decision (gap #4); `weight-medium`/`weight-semibold` (gap #6); hover convention (gap #9); shadow usage rule (gap #11); pill component tokens for buttons (`button-primary` already partial, add `button-secondary`, `button-tertiary`, `button-outline`, `button-icon`, `button-toggle`); `card-default`, `card-alert`, `card-warning` tokens.
- **Files:** 30+ button call sites across `Navbar`, `AgeGate`, `ParentConsentForm`, `BadgeCard`, `AnswerButton`, `ChallengeModal`, `DuelNotification`, `DuelResults`, `EmblemSelector`, `ToastContainer`, `LandingContent`, `BrowseContent`, `auth/page`, `badges/page`, `daily/DailyContent`, `duels/page`, `duels/[duelId]/DuelClient`, `grand-prix/page`, `grand-prix/match/MatchClient`, `leagues/page`, `not-found`, `error`, `profile/page`, `quiz/[animeSlug]/QuizClient`, `redeem/page`, `shop/page`, `star-league/page`, `stats/page`. 15+ card call sites across the same set.
- **Reasoning:** the install pass and standard workflow put buttons first because they're the foundational primitive every later component reuses. Cards come right after for the same reason. Bundling them avoids rebuilding the click-region wrapper logic twice.

**2. Achievement badges** — M
- **DESIGN.md amendments:** `rarityLabels` export (gap #3); badge component tokens (`badge-card`, `badge-celebration`, `badge-icon-sm/md/lg`); decision on `icon_color` schema (option 1/2/3 per audit findings).
- **Files:** `BadgeIcon.tsx`, `BadgeCard.tsx`, `BadgeCelebration.tsx`, `EmblemSelector.tsx`, `Navbar.tsx` (small emblem chip), `LandingContent.tsx` (sample showcase), `app/badges/page.tsx`, `app/profile/page.tsx`. Plus `006_badges.sql` migration to fix Crown duplicate (`quiz-1000` → new icon) and Swords duplicate (`league-champion` → new icon). Plus `process-grand-prix/route.ts` if `icon_color` contract changes.
- **Reasoning:** flagged user pain point. Needs Supabase MCP for the icon_name reassignment migration. Pulls in DESIGN.md amendments specific to badge surfaces. Independent enough from buttons that it can land in parallel if the team has bandwidth, but sequencing-wise comes after buttons because BadgeCard is a `motion.button` whose touch-region behavior wants the new `<Button>` polymorphic primitive.

**3. League tier badges + warning panels** — S
- **DESIGN.md amendments:** Do/Don't clarification on `tier-3` vs `--color-warning` (gap #12); coordinate icon-assignment update with badge refactor (Swords ambiguity).
- **Files:** `leagues/page.tsx` (top-3 medal icons), `LeagueBanners.tsx`, `LeagueNudge.tsx`. ~5 call sites.
- **Reasoning:** small, mechanical token swap. Pairs naturally with achievement badges since both deal with the foil/rank visual register, but small enough to be its own pass.

**4. Pills (age-tier, PRO, count, content-rating, genre tags)** — M
- **DESIGN.md amendments:** pill component tokens (gap #5); audience-fit palette tokens (gap #2).
- **Files:** `Navbar.tsx` (Jr/T, PRO, pendingDuelCount), `AnimeCard.tsx` (E/T/M rating). ~6 call sites.
- **Reasoning:** small, but highly visible (every Navbar render shows them). Visual cousins of badges — same pass naturally introduces the audience-fit palette. Comes after badges so the pill-shape language can echo the badge-shape language consistently (both should resolve their `rounded-{full|sharp|md}` decision the same way).

**5. Quiz answer tiles** — S
- **DESIGN.md amendments:** difficulty palette tokens (gap #1).
- **Files:** `AnswerButton.tsx`, `QuizCard.tsx`, `DifficultySelector.tsx`, `ChallengeModal.tsx`, `duels/[duelId]/DuelClient.tsx` (uses difficulty color map).
- **Reasoning:** highest-traffic surface (every quiz session). State-variant heavy. Drop-in `border-accent`/`bg-accent/10` swap for incorrect-answer state aligns with DESIGN.md's "blood ink for incorrect-answer flashes" rule. Difficulty color extraction de-duplicates 4 components.

**6. Forms (auth, parent consent)** — S
- **DESIGN.md amendments:** form input tokens (`input-default`, `label-default`, `error-message`).
- **Files:** `app/auth/page.tsx`, `ParentConsentForm.tsx`, `app/redeem/page.tsx`, `app/star-league/page.tsx`. ~6 input + 4 label sites.
- **Reasoning:** small surface, well-isolated, contained drift. Mostly token swap + a11y improvements (autocomplete attributes).

**7. Modals / dialogs** — M
- **DESIGN.md amendments:** modal/dialog tokens (gap #10); decision on `backdrop-blur-sm` permission for celebration overlays.
- **Files:** `BadgeCelebration.tsx`, `ChallengeModal.tsx`, `EmblemSelector.tsx`, `BrowseContent.tsx` (sign-in prompt), `Navbar.tsx` (sign-out error overlay), plus `DuelNotification.tsx` floating banner.
- **Reasoning:** focus management overhaul opportunity (none of the modals trap focus). Bottom-sheet vs centered-modal pattern formalization. Mid-complexity because of focus-trap implementation.

**8. ScoreDisplay / Timer / numeric displays** — S
- **DESIGN.md amendments:** `tabular-nums` rule (gap #7); resolution of `#facc15` mid-band yellow → `--color-warning` or new token.
- **Files:** `ScoreDisplay.tsx`, `Timer.tsx`. Then opt-in `tabular-nums` across leaderboards, profile, daily, duels, grand-prix. ~10 call sites.
- **Reasoning:** small, perceptual fix. Pairs with the typography pass conceptually but has its own discrete deliverable.

**9. Footer / landing / hero polish (Anton elevation)** — M
- **DESIGN.md amendments:** Star League / prestige sub-aesthetic decision (gap #8).
- **Files:** `Footer.tsx` (token swap), `LandingContent.tsx` (Anton on visitor hero, gradient removal, Star League block redesign), maintenance h1 in `layout.tsx:91`. 
- **Reasoning:** polish pass. Anton elevation is the headline visible change. Star League block redesign requires a stakeholder decision on the prestige sub-aesthetic.

**10. Difficulty palette + shared theme exports finalization** — S
- **Files:** `src/themes/index.ts` (add `difficultyColors`, `audienceColors`, `rarityLabels`).
- **Reasoning:** belongs as the cleanup pass after #1, #2, #4, #5 land. Once the components are using the local maps, this pass collapses them into shared exports.

### Separate track — admin pages

**A1. Admin chart palette binding** — M
- **Files:** `admin/page.tsx`, `admin/duels/page.tsx`, `admin/engagement/page.tsx`, `admin/leagues/page.tsx`, `admin/retention/page.tsx`, `admin/revenue/page.tsx`. ~80 hex literal swaps to `chartPalette` from `@/themes`.
- **Reasoning:** TODO already documented in `src/themes/index.ts:31-34`. Mechanical refactor.

**A2. Admin slate-aesthetic token decision** — M
- **Files:** all admin pages.
- **Reasoning:** admin uses `bg-slate-800`, `text-slate-100`, `text-slate-400` consistently. Either accept slate as the deliberate admin sub-aesthetic and document in DESIGN.md, or migrate to dark Manga Ink tokens (surface, text, text-muted). Stakeholder decision needed.

## Out of scope

- Tests (`*.test.ts`, `*.test.tsx` under `src/`, all `e2e/`).
- Scripts under `scripts/`.
- Supabase migrations (referenced for badge schema only; refactor track will need to write a new migration to update icon_name assignments and possibly icon_color contract).
- Build artifacts (`.next/`).
- Vercel/Capacitor configuration.
- `node_modules/`, `.scratch/`.
- Logic in `src/lib/` and server actions — only the styling-adjacent surfaces (`api/process-grand-prix/route.ts:288` icon_color literal flagged) are referenced.
- Type definitions in `src/types/`.
- Animation tokens (`--animate-*` keyframes) — fully defined in `tokens.css`, no drift surfaced.
- Texture utilities (`.texture-halftone`, `.texture-grain`) — defined, surveyed for usage; appear underused but that's a feature opportunity, not drift.

## Appendix — raw scan outputs

`.scratch/audit/` (gitignored, not committed):
- `named-color-all.txt` — 628 lines, all `(bg|text|border|ring|from|to|via)-(color)-N` matches in `*.tsx`.
- `named-color-non-admin.txt` — 109 lines, user-facing subset.
- `rounded-buckets.txt` — usage counts per rounded utility.
- `shadow-buckets.txt` — usage counts per shadow utility.

Reproduction commands captured in this document's Methodology section. All scans run from `S:\dev\anime-trivia` against `master` @ a94ebd2.
