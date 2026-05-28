# OtakuQuiz — Architecture Baseline (2026-05)

> Read-only baseline captured 2026-05-27, the day before the **dual-variant
> migration** (variants config layer, anime registry, scaffold script, kids
> build, legal routes) begins. Produced via 5 parallel Haiku discovery passes
> (src/ tree, data layer, build/test surface, legal+age filters, admin
> Recharts) synthesized by Opus. Not committed by default — Eugene decides
> whether to track in git. A prior baseline lives at `baseline-2026-02.md`
> (May 26 capture); this one is an independent re-pass.

---

## 1. Stack & Build Surface

**Runtime:** Next.js 16.1.6 (App Router, RSC by default), React 19.2.3,
TypeScript strict, Tailwind v4 (via `@tailwindcss/postcss`, no `tailwind.config.*`),
Framer Motion 12, Recharts 3.7, Zustand 5, Supabase (`@supabase/ssr` 0.8 +
`@supabase/supabase-js` 2.95). Capacitor 8 (iOS/Android).

**Package manager:** pnpm (not pinned in `package.json`).
**Tests:** Vitest 4.0.18 (jsdom) + `@testing-library/react` 16.3.2;
Playwright 1.59 for E2E. **Lint:** ESLint flat config extending
`eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`.

**Scripts (`package.json`):**
- `dev`, `build`, `start`, `typecheck` (`tsc --noEmit`), `lint`, `test`
  (`vitest run`), `test:watch`, `test:e2e*` (incl. `:ui`, `:headed`,
  `:codegen`, `:report`)
- `build:mobile`: `CAPACITOR_BUILD=true next build && npx cap sync`
- `cap:ios` / `cap:android`
- `backup`: `tsx scripts/backup-db.ts`

**`next.config.ts`:** branches on `CAPACITOR_BUILD=true` → `output: 'export'`,
`images: { unoptimized: true }`. Web build: deviceSizes [640,750,828,1080,1200],
imageSizes [16,32,48,64,96], formats `[webp, avif]`. Tied to
`capacitor.config.ts` (`webDir: 'out'`).

**`capacitor.config.ts`:** `appId: com.otakuquiz.app`, `appName: OtakuQuiz`,
`webDir: out`. Plugins: SplashScreen (dark, 2000ms), StatusBar (DARK,
#1A1A2E), PushNotifications, LocalNotifications (smallIcon `ic_stat_icon`,
color `#FF6B35`).

**`vercel.json` crons:**

| Path | Schedule | Purpose |
|---|---|---|
| `/api/process-leagues` | `5 0 * * 1` (Mon 00:05 UTC) | Promote/demote, rebuild groups, reset weekly plays |
| `/api/process-grand-prix` | `10 0 1 * *` (1st of month) | Bracket advancement / emblem awarding |
| `/api/expire-duels` | `0 2 * * *` (daily 02:00) | Mark stale duel rows expired |
| `/api/analytics-cleanup` | `0 3 * * *` (daily 03:00) | Roll up `analytics_events` >90d into `analytics_daily_rollup`, delete originals |

Each cron has a sibling `retry/` route and writes state to
`admin_config[<job>_status]` for the admin Overview status panel.

**Env surface (validated at import, fail-fast):**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` →
  `src/lib/env/client-env.ts`
- `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS` (CSV) →
  `src/lib/env/server-env.ts`
- `NEXT_PUBLIC_THEME` (read by `src/themes/index.ts` as `activeThemeName`;
  defaults to `'manga-ink'`)
- `CRON_SECRET` (cron auth)
- `CAPACITOR_BUILD` (build switch)

**`tsconfig.json`:** strict, target ES2017, `moduleResolution: bundler`,
paths `{ "@/*": "./src/*" }`.

---

## 2. App Router Map

`src/app/` — App Router. `<html lang="en" data-theme="manga-ink">` is
**hardcoded** at `src/app/layout.tsx:86`. Not env-driven, not per-request.

### Public / auth

| Route | Files | Notes |
|---|---|---|
| `/` | `page.tsx`, `LandingContent.tsx` | RSC fetches top anime + stats counts; client renders auth-aware hero, Popular Quizzes, Impossible Mode, 1v1 Duels, League Tiers, Badges, Grand Prix, How It Works, Promo, Safe & Private, Final CTA. Hero loads `/images/hero/{hero-left,hero-right}.png` decorative flanks (xl+). |
| `/auth` | `page.tsx`, `actions.ts`, `callback/route.ts` | Sign in / up flow: AgeGate → ParentConsentForm (junior) → email-password or OAuth (Google, Discord; Apple gated by `APPLE_OAUTH_ENABLED=false`) or phone-OTP. Junior users blocked from OAuth. `complete_profile=true` query param drives OAuth-completion forced flow. |
| `/privacy` | `page.tsx` | Static "plain language" privacy summary with placeholder `<Link href="#">Read Full Privacy Policy (Coming Soon)</Link>` at line 77. **Only legal route today.** |

### Player-facing

| Route | Notes |
|---|---|
| `/browse` (`BrowseContent.tsx`) | Lists active anime; JS-side filter by ageGroup. Guests get a sign-in modal on T/M cards. |
| `/quiz/[animeSlug]` (`QuizClient.tsx`) | RSC reads `freeQuizLimit`, `adVisible`, user `ageGroup`; enforces age gate before render (`notFound()` on content_rating mismatch). Client uses `useQuizStore`; submits via `/api/quiz/submit`. |
| `/daily` + `DailyContent.tsx` | 10 mixed-difficulty questions, 1.5× XP. Submits `/api/daily-challenge/submit`. |
| `/duels`, `/duels/[duelId]` | Friend & quick-match. Submits `/api/duels/submit`. |
| `/grand-prix`, `/grand-prix/match/[matchId]` | Monthly bracket. Submits `/api/grand-prix/submit-score`. |
| `/leagues` | Weekly league standings + history. |
| `/badges` | Badge collection + emblem selection. |
| `/profile` | Profile, friends, recent quizzes. |
| `/stats` | Per-anime breakdown (Pro). |
| `/redeem`, `/shop`, `/star-league` | Promo redemption, swag placeholder, waitlist. |
| `/test-components` | Component playground. |

### Admin (RSC shell + client pages)

`src/app/admin/layout.tsx` — fixed dark-slate shell (`bg-slate-900`,
`text-orange-400` brand), nav: Overview / Users / Engagement / Content /
Leagues / Duels / Revenue / Retention / Settings. Auth gate is in
`src/proxy.ts`: 404 (not 403) if `ADMIN_EMAILS` empty or caller email is not
allowlisted.

All admin pages are **client components** calling server actions from
`src/app/admin/actions.ts` — **942-line monolith** (`getOverviewStats`,
`getUsersList`, `getEngagementData`, `getContentStats`, `getLeagueDistribution`,
`getDuelsData`, `getRevenueData`, `getRetentionData`, `getAdminSettings`,
`updateAdminSetting`, `upgradeUserToPro`, `revokeUserPro`, `generatePromoCode`,
`getCronStatuses`, `retryCronJob`, etc.). All use `createServiceClient()`.

Six pages render Recharts — see §10 below.

### API routes (`src/app/api/`)

Two classes:

**Player submission routes (trust boundaries):**
`quiz/submit`, `daily-challenge/submit`, `duels/submit`,
`grand-prix/submit-score`, `badges/check`. Two-client pattern: SSR client
(cookie/RLS) for `auth.getUser` + RPC calls that need `auth.uid()`;
service-role client for writes that bypass RLS triggers locked by
migrations 024–028. Server re-derives `isCorrect`, score, XP from
`questions.options[].isCorrect`; only `{questionId, selectedOption, timeMs}`
trusted from the body.

**Cron routes (service-role only):**
`process-leagues`, `process-grand-prix`, `expire-duels`,
`analytics-cleanup`, plus per-cron `retry/route.ts`. All write state to
`admin_config[<job>_status]` with idle/in_progress/completed/failed/partial
states + double-run + stale-threshold guards. 45s timeout-budgeted with
batched/partial completion.

`auth/callback/route.ts` exchanges OAuth code → session.

**API totals:** 13 routes (5 player-submission + 4 cron × 2 (route + retry) = 8 + auth callback = ~13 endpoints).

---

## 3. Components Inventory (`src/components/`)

31 `.tsx` files. Notable couplings:

- **`AnimeCard.tsx`** — HARDCODED `animeImages` map (lines 17–24) with 8 anime
  slugs → percent-encoded `/images/<slug>.png` paths. Build-time anime
  registry. **First migration target.**
- **`AgeGate.tsx`** — modal age-group selector (junior/teen/full); options
  hardcoded with labels "Under 13", etc.
- **`ParentConsentForm.tsx`** — COPPA consent flow.
- **`Footer.tsx`** — links to `/privacy` only (line 84). User disclosure text
  about age-appropriate content (line 38). **Single legal extension point.**
- **`Navbar.tsx`** — header nav with menu, auth state, badge notifications.
- **`AnnouncementBanner.tsx`**, **`AdBanner.tsx`** — admin-config-driven
  site-wide UI.
- Badge family: `BadgeIcon`, `BadgeCard`, `BadgeGrid`, `BadgeFoilCard`,
  `BadgeCelebration`, `MonthlyEmblem`, `EmblemSelector`, `StarLeagueEmblem`,
  `PrestigeCertificate`.
- League family: `LeagueBanners`, `LeagueNudge`.
- Duel family: `DuelResults`, `DuelNotification`, `ChallengeModal`.
- Quiz primitives: `QuizCard`, `AnswerButton`, `DifficultySelector`, `Timer`,
  `ScoreDisplay`, `ProgressBar`.
- Misc: `TournamentBracket`, `AnimeDiversityTracker`, `SignOutErrorModal`,
  `ToastContainer`.

No component hardcodes a brand string beyond `Footer`/`Navbar` chrome
(needs verification per file during Phase 1 audit).

---

## 4. Lib Layer (`src/lib/`)

32 modules. Grouped:

**Supabase clients:**
- `supabase/client.ts` — browser
- `supabase/server.ts` — SSR (cookie/RLS)
- `supabase/service.ts` — service-role (RLS bypass)

**Env validators:** `env/validators.ts`, `env/client-env.ts`,
`env/server-env.ts` — fail-fast.

**Data:** `queries.ts` (getAnimeList, getAnimeBySlug, getQuestions — age-aware).

**Feature modules:**
- `scoring.ts`, `ranks.ts` — XP & rank math (Genin → Hokage thresholds)
- `badges.ts`, `badges-engine.ts` — fetch + condition evaluation
- `duels.ts`, `duels-matchmaking.ts` — duel lifecycle; `assertNonJunior()`
  COPPA gate at top of every duel function (`duels.ts:381`)
- `grand-prix.ts` — tournament fetch/update
- `daily-challenge.ts` — daily question selection
- `league-xp.ts` — multipliers + tier promotion/demotion
- `friends.ts` — friend graph
- `analytics.ts`, `track-actions.ts` — event tracking → `analytics_events`
- `admin-config.ts`, `config-actions.ts`, `admin-metrics.ts` — admin reads
- `promo-codes.ts` — promo validation/redeem
- `profile-completeness.ts` — onboarding score
- `notifications.ts` — Capacitor push/local notification setup
- `content-validation.ts` — length-bias symmetric-invariant checker
- `utils.ts` — `cn()` class merger

**A11y hooks (in lib/):** `use-reduced-motion.ts`, `use-focus-trap.ts`,
`use-scroll-lock.ts`.

**Test gates:** `__tests__/length-bias-corpus.test.ts` — strict validator
across 480 questions (CI gate).

---

## 5. Stores, Hooks, Contexts

**Zustand stores (`src/stores/`, 5 files):**

| File | Owns |
|---|---|
| `quizStore.ts` | currentAnime, questions, currentQuestionIndex, answers, score, leagueResult. **Duplicates kid_safe filter from server** (line 108). |
| `duelStore.ts` | duel match, questions, answers, submitted result |
| `dailyChallengeStore.ts` | daily questions, current question, answers, status |
| `grandPrixStore.ts` | match, questions, answers, submitted result |
| `toastStore.ts` | toast notifications (success/error/info, auto-dismiss) |

**Hooks (`src/hooks/`, 1 file):**
- `useCapacitor.ts` — status bar, keyboard, splash, push setup (mobile only)

**Contexts (`src/contexts/`, 1 file):**
- `AuthContext.tsx` — user, profile, isLoading, ageGroup, isJunior, signOut

---

## 6. Themes (`src/themes/index.ts`)

12 exports. **All but `activeThemeName` are hardcoded to manga-ink:**

| Export | Shape | Variant-aware? | Notes |
|---|---|---|---|
| `activeThemeName` | string | **yes** (env) | `process.env.NEXT_PUBLIC_THEME ?? 'manga-ink'` |
| `tierColors` | array | no | 6 TierColor objects, from `palette.tier1–6` |
| `chartPalette` | array (8) | no | Recharts series |
| `confettiPalette` | array (5) | no | framer-motion confetti |
| `rarityColors` | object | no | Tailwind named utilities, not brand |
| `rarityLabels` | object | no | Text labels + Tailwind colors |
| `audiencePalette` | object | no | `{junior: #10b981, teen: #facc15, mature: #ef4444}` |
| `difficultyPalette` | object | no | aliases audiencePalette + `impossible: #a855f7`, `mixed: #60a5fa` |
| `adminChartChrome` | object | no | dark-slate Recharts axis/tooltip chrome |
| `tooltipStyle` | object | no | Recharts `contentStyle` spread |
| `difficultyLabels` | object | no | human-readable labels |
| `palette` | object | no | re-export of `./manga-ink/palette.ts` (~35 colors) |

**Variant seam:** `activeThemeName` reads env; nothing downstream branches on
it. To go variant-aware: turn each palette export into a record keyed by
theme name, then select via `activeThemeName`. Or import per-theme palette
modules from `./manga-ink/` and `./<kids-theme>/`.

---

## 7. Data Layer

### Question JSON (`src/data/questions/`, 8 files)

| File | Anime slug | Q's | Easy/Med/Hard | Ratings |
|---|---|---:|---|---|
| `naruto.json` | naruto | 51 | 10/12/29 | E, T |
| `dragon-ball-z.json` | dragon-ball-z | 51 | 11/12/28 | E, T |
| `demon-slayer.json` | demon-slayer | 51 | 11/13/27 | T |
| `jujutsu-kaisen.json` | jujutsu-kaisen | 51 | 10/12/29 | T |
| `my-hero-academia.json` | my-hero-academia | 51 | 10/12/29 | E, T |
| `death-note.json` | death-note | 51 | 10/12/29 | T |
| `attack-on-titan.json` | attack-on-titan | 51 | 10/12/29 | T, M |
| `one-piece.json` | one-piece | 51 | 10/12/29 | E, T |

**JSON totals: 8 files, 408 questions** (Easy 82, Medium 97, Hard 229).

**Impossible tier** (~72 questions) lives in SQL migrations `008a–008f` →
**dual-channel seeding** (JSON for E/M/H + SQL for impossible). CLAUDE.md
quotes "480 questions" — matches 408 JSON + ~72 SQL.

### SQL migrations (`supabase/migrations/`, 31 files + consolidation)

| # | File | Touches |
|---|---|---|
| 001 | `001_initial_schema.sql` | core tables + RLS on all |
| 002 | `002_monetization.sql` | subscription_tier, star_league_waitlist |
| 003 | `003_admin_analytics.sql` | analytics_events, admin_config |
| **004** | `004_auth_age_filtering.sql` | **content_rating (E/T/M), kid_safe, age_group, birth_year, parent_email, parent_consent_at; RLS by age** |
| 005 | `005_league_system.sql` | leagues (6 tiers), enrollments, weekly_anime_plays |
| 006 | `006_badges.sql` | badges, user_badge_awards |
| 007 | `007_add_impossible_difficulty.sql` | extends questions difficulty CHECK |
| 008a–008f, 008e | impossible question seeds | dual-channel content |
| 009 | `009_grand_prix.sql` | grand_prix_* tables |
| 010 | `010_duel_system.sql` | duels, duel_answers |
| 011 | `011_monetization_promo.sql` | promo_codes, redemptions |
| 012 | `012_daily_challenge.sql` | daily_challenges, responses, stats |
| 013 | `013_admin_enhancements.sql` | admin role, audit_log |
| 014 | `014_performance_indexes.sql` | indexes |
| 015 | `015_analytics_daily_rollup.sql` | rollup table |
| **016** | `016_fix_age_group_invariant.sql` | **NULL age_group treated as safest tier (security fix)** |
| 017 | `017_atomic_promo_redeem.sql` | RPC `redeem_promo_code()` |
| 018 | `018_signup_profile_from_metadata.sql` | `handle_new_user()` trigger |
| 019 | `019_atomic_quiz_start.sql` | RPC `start_quiz_session()` |
| **020** | `020_harden_anime_rls_fallback.sql` | **RLS hardens against NULL age_group** |
| 021 | `021_daily_challenge_streak.sql` | current_streak, longest_streak |
| 022 | `022_atomic_weekly_anime_play.sql` | RPC `increment_weekly_anime_play()` |
| **023** | `023_daily_challenge_mix_age.sql` | **junior-specific daily mix** |
| **024–028** | secure-scoring batch | RPCs that lock client writes on score columns |
| 029 | `029_league_enrollment_bootstrap.sql` | RPC `enroll_in_league()` |
| 030 | `030_handle_new_user_unique_username.sql` | unique username from email prefix |
| 031 | `031_badge_icon_reseed.sql` | reseed badge icons |
| — | `catch_up_everything.sql` | consolidation fallback (pre-016) |
| — | `run_impossible_questions.sql` | utility |

**Schema tables (~26):** anime_series, questions, user_profiles, quiz_sessions,
user_answers, duel_matches, star_league_waitlist, analytics_events,
admin_config, weekly_anime_plays, leagues, league_enrollments, badges,
user_badge_awards, grand_prix_events, grand_prix_leaderboards,
grand_prix_rankings, duels, duel_answers, promo_codes,
user_promo_redemptions, daily_challenges, daily_challenge_responses,
daily_challenge_stats, admin_audit_log, analytics_daily_rollup.

**RLS enabled on all player-data tables.** Server-side RPCs (9):
`redeem_promo_code`, `start_quiz_session`, `increment_weekly_anime_play`,
`submit_grand_prix_score`, `award_badge`, `submit_quiz_answers`,
`submit_duel_answers`, `submit_daily_challenge`, `enroll_in_league`.

### Hardcoded anime registries (3 places — Phase 2 targets)

1. **`scripts/seed.ts`** — `ANIME_METADATA` Record with 8 entries (title,
   description, genre[])
2. **`scripts/generate-sql-seed.ts`** — duplicate of ANIME_METADATA
3. **`src/components/AnimeCard.tsx`** — `animeImages` map (8 slugs →
   percent-encoded `/images/<slug>.png`)

No central `getEnabledAnime()` / anime registry module exists.

---

## 8. Test Surface

- **Vitest unit tests:** **56 files** under `src/` (`*.test.ts` /
  `*.test.tsx`). Per CLAUDE.md, individual test count sits at ~710 (target
  ≥730). `vitest.config.ts` excludes `**/e2e/**`, `**/.scratch/**`.
  Environment: jsdom. Setup: `./src/test/setup.ts`.
- **Playwright E2E:** **6 specs** under `e2e/`. Browsers: chromium (Desktop
  Chrome) + mobile-safari (iPhone 14). `fullyParallel: false, workers: 1`
  (serialized for shared Supabase state). `baseURL: http://localhost:3000`.
- **E2E fixtures (`e2e/fixtures/`):**
  - `seed-users.ts` — `seedUsers()` / `resetUsers()` for three test users
    (`e2e-junior@`, `e2e-teen@`, `e2e-full@otakuquiz.test`).
  - `auth-helpers.ts` — `submitSignInForm()`, `signIn()`,
    `switchToSignInMode()`.
- **Scripts (`scripts/`):**
  - `seed.ts` — full DB seed from JSON
  - `generate-sql-seed.ts` — produces `supabase/migrations/seed.sql`
  - `audit-question-lengths.ts` — length-bias symmetric-invariant audit
    (`--summary` / `--detail`)
  - `backup-db.ts` — CSV/ZIP backup
  - `verify-prod-signin-nav.ts`, `verify-prod-middleware.ts`,
    `check-e2e-user.ts` — diagnostic / verification (untracked in git per
    `git status`)

---

## 9. Legal / Footer Surface

Only **1 legal route** (`/privacy`) and **3 legal-link sites**:

| File | Line | Destination | Kind |
|---|---:|---|---|
| `src/components/Footer.tsx` | 84 | `/privacy` | internal |
| `src/app/LandingContent.tsx` | 750 | `/privacy` | internal |
| `src/app/privacy/page.tsx` | 77 | `#` | placeholder ("Coming Soon") |

`Footer.tsx` is the single mounted footer (mounted in `src/app/layout.tsx`).
**`PUBLIC_PATHS` in `src/proxy.ts:14` contains only `["/", "/privacy"]`** —
any new legal route (`/terms`, `/cookies`, `/coppa`, etc.) must be added
here to bypass the auth gate.

---

## 10. Age-Group / Content-Rating Filtering Touchpoints

**15 source touchpoints** + RLS policies. No exported canonical mapper;
logic distributed for defense-in-depth.

| File | Line | Kind | Notes |
|---|---:|---|---|
| `src/types/index.ts` | 15, 33, 63 | type defs | `AgeGroup = "junior" \| "teen" \| "full"`; `ContentRating` on anime; `age_group` on profile |
| `src/proxy.ts` | 14 | route guard | `PUBLIC_PATHS = ["/", "/privacy"]` |
| `src/proxy.ts` | 77 | server query | `.select("age_group")` — redirects to `/auth?complete_profile` if NULL |
| `src/components/AgeGate.tsx` | 16 | client filter | hardcoded option list |
| `src/lib/queries.ts` | 67 | server query | `if (ageGroup === "junior") query.eq("kid_safe", true)` |
| `src/stores/quizStore.ts` | 108 | **client filter** | **duplicates server-side `kid_safe` filter** |
| `src/lib/duels.ts` | 364, 381 | COPPA gate | `assertNonJunior()` called by every duel function |
| `src/lib/config-actions.ts` | 18 | server query | `getDailyChallengeMixForAge(ageGroup)` |
| `src/lib/admin-config.ts` | 20 | config seed | `daily_challenge_mix_junior: {easy:5, medium:5}` |
| `src/components/Footer.tsx` | 38 | disclosure | "age-appropriate content" copy |

**RLS policies (in migrations `004`, `016`, `020`):**
- `anime_series_select` — junior→E, teen→E|T, full→all; NULL → safest tier
- `questions_select` — junior→kid_safe + easy/medium; NULL → safest tier
- `023` — admin_config seed for junior daily mix

**Canonical mapping (de facto):**
- junior → ratings `[E]`, `kid_safe=true` only, no hard/impossible in daily
- teen → ratings `[E, T]`, all difficulties
- full → ratings `[E, T, M]`, all difficulties

---

## 11. Admin Recharts Modules (post-A1/A2)

**6 admin Recharts pages, zero hex literals remaining**, all consume
`@/themes`:

| File | Charts | Theme imports |
|---|---|---|
| `admin/page.tsx` | LineChart, BarChart | `adminChartChrome`, `tooltipStyle`, `chartPalette`, `audiencePalette` |
| `admin/engagement/page.tsx` | AreaChart, BarChart | `adminChartChrome`, `tooltipStyle`, `chartPalette` |
| `admin/duels/page.tsx` | PieChart, BarChart | `adminChartChrome`, `tooltipStyle`, `chartPalette`, `difficultyPalette` |
| `admin/leagues/page.tsx` | BarChart | `tierColors`, `adminChartChrome`, `tooltipStyle` |
| `admin/retention/page.tsx` | BarChart | `adminChartChrome`, `tooltipStyle`, `chartPalette` |
| `admin/revenue/page.tsx` | BarChart, PieChart | `adminChartChrome`, `tooltipStyle`, `chartPalette`, `audiencePalette` |

All wrap charts with `ResponsiveContainer` + `adminChartChrome` axis/tooltip
chrome. Recharts is the only chart library; no non-admin Recharts usage.

**Implication for variants:** if `chartPalette`, `audiencePalette`,
`difficultyPalette`, `tierColors`, and `adminChartChrome` become
variant-aware in §6, all 6 pages inherit the variant for free.

---

## 12. Dual-Variant Migration — Observations & Tech-Debt Callouts

Captured for Phase 1–5 planning. Not prescriptive — surfaces concrete
seams.

1. **Three hardcoded anime registries to consolidate** (Phase 2
   `getEnabledAnime()` migration target):
   - `scripts/seed.ts` `ANIME_METADATA`
   - `scripts/generate-sql-seed.ts` (duplicates the above)
   - `src/components/AnimeCard.tsx` `animeImages` map (percent-encoded paths)

2. **Themes variant seam exists but unused.**
   `src/themes/index.ts` reads `NEXT_PUBLIC_THEME` into `activeThemeName`,
   but nothing branches on it — every palette export hardcodes manga-ink.
   `<html data-theme="manga-ink">` in `layout.tsx:86` is also hardcoded.
   Phase 4 (kids build) will need to either (a) key palette exports by
   theme and select via `activeThemeName`, or (b) split into per-theme
   modules selected at import time.

3. **Age-filter logic distributed across ≥9 places, no canonical mapper.**
   The "junior → [E]" / "teen → [E,T]" / "full → [E,T,M]" rule is
   re-expressed in RLS (×3 migrations), `proxy.ts`, `queries.ts`,
   `quizStore.ts` (client duplicate of server filter), `duels.ts`
   `assertNonJunior`, `config-actions.ts`, and `admin-config.ts`. A single
   exported `allowedRatingsFor(ageGroup)` helper would compress this,
   though RLS must remain authoritative.

4. **Single legal-link site = clean extension surface.** `Footer.tsx:84`
   and `LandingContent.tsx:750` are the only internal `/privacy` links;
   `privacy/page.tsx:77` has the dead "Coming Soon" placeholder. Adding
   `/terms`, `/cookies`, `/coppa` requires editing those 3 files **plus**
   `PUBLIC_PATHS` in `src/proxy.ts:14` (currently `["/", "/privacy"]`).

5. **Capacitor surface is small (Phase 5).**
   - `capacitor.config.ts` (1 file, brand-hardcoded: `com.otakuquiz.app`)
   - `src/hooks/useCapacitor.ts` (1 hook)
   - `src/lib/notifications.ts` (1 lib)
   - `package.json`: `build:mobile`, `cap:ios`, `cap:android`
   - `next.config.ts` `CAPACITOR_BUILD` branch
   Kids-variant mobile build needs a separate `appId`/`appName` — likely
   per-variant `capacitor.config.<variant>.ts` or env-driven config.

6. **Brand strings hardcoded in ~6 places.** `appId`
   (`com.otakuquiz.app`), `appName` (`OtakuQuiz`), splash/status bar
   colors (`#1A1A2E`, `#FF6B35`), `data-theme="manga-ink"`, `ADMIN_EMAILS`
   defaults, footer copy. A `BRAND` config object exported from
   `src/lib/brand.ts` (variant-keyed) would centralize this.

7. **`src/app/admin/actions.ts` is a 942-line monolith.** All admin
   server actions live in one file. Variant-aware admin (showing only one
   variant's anime/users to that variant's admins) would benefit from
   splitting by domain (overview, users, engagement, content, leagues,
   duels, revenue, retention, settings) before the variant layer is
   added — otherwise variant-scoping logic gets duplicated 12 times.

8. **Dual-channel content seeding (JSON + SQL) is fragile.** 408
   questions live in `src/data/questions/*.json`; ~72 impossible-tier
   questions live in `supabase/migrations/008a–008f`. Adding a new
   anime requires touching: (a) the JSON file, (b) `seed.ts`
   `ANIME_METADATA`, (c) `generate-sql-seed.ts` (duplicate), (d) an
   impossible-tier SQL migration, (e) the `AnimeCard.tsx` `animeImages`
   map, (f) a hero image in `/public/images/`. Variant-aware content
   gating (variant → enabled anime slugs) should land alongside a
   single source of truth.

### Architectural surprises / tech debt worth flagging

- **`stores/quizStore.ts:108` duplicates the server-side `kid_safe`
  filter.** Defense-in-depth, but two places to maintain.
- **`scripts/audit-question-lengths.ts` operates on JSON only;** the ~72
  impossible-tier questions in SQL migrations bypass the length-bias
  audit unless separately validated. The Vitest gate
  (`length-bias-corpus.test.ts`) presumably loads from JSON too — worth
  confirming before launching the migration.
- **Three untracked diagnostic scripts** (`verify-prod-signin-nav.ts`,
  `verify-prod-middleware.ts`, `check-e2e-user.ts`) per `git status`.
  Decide whether to track or `.gitignore` them before the migration
  branch starts (so they don't accidentally get committed).
- **`/auth` `complete_profile=true` query-param forced-flow** is a
  subtle UX coupling — any variant-aware sign-up redirect needs to
  preserve it.
- **`PUBLIC_PATHS` is a 2-entry literal in `src/proxy.ts`,** not a
  config-driven list. Easy to miss when adding routes.
- **Recharts post-A1/A2 consolidation is clean** — zero hex literals
  remaining in 6 admin pages. The chart-chrome refactor de-risked the
  variant-aware-themes work substantially. Good shape entering Phase 4.

---

*End of baseline-2026-05. Read-only capture; no code modified.*
