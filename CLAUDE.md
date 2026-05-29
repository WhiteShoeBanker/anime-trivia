# OtakuQuiz - Anime Trivia App

## Overview
A mobile-first web app for anime trivia with questions
ranging from Easy to Hard across 50+ anime titles.
Target: Gen Z and Gen Alpha anime fans (ages 10-24).
Web-first (Next.js on Vercel), then wrapped for iOS/Android
using Capacitor.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **UI Animation**: Framer Motion
- **Icons**: Lucide React
- **State**: Zustand for client-side quiz state
- **Backend/DB**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel (web), Capacitor (mobile)
- **Package Manager**: pnpm (NOT npm or yarn)

## Architecture Decisions
- Use Next.js App Router with Server Components by default
- Client Components only when interactivity needed ('use client')
- All database queries through src/lib/queries.ts
- Supabase browser client: src/lib/supabase/client.ts
- Supabase server client: src/lib/supabase/server.ts
- Quiz game state: src/stores/quizStore.ts (Zustand)
- Mobile-first responsive design (min-width breakpoints)
- Touch targets minimum 44px for mobile/tablet usability

## Variant configuration

Dual-variant support (`full` + `kids`) is gated through a single
configuration module:

- **Source of truth:** `src/config/variants.ts`. Exports `AppVariant`,
  `APP_VARIANT`, `VariantConfig`, `VARIANT_CONFIG`, `variantConfig`,
  and `isKidsVariant`.
- **Selector:** `NEXT_PUBLIC_APP_VARIANT` env var (build-time). Valid
  values: `full` or `kids`. Unset / invalid → defaults to `full`.
  Add `NEXT_PUBLIC_APP_VARIANT=full` to `.env.local.example` and your
  local `.env.local` if you need to override.
- **`VariantConfig` field set (per Part 20 §20.1):**
  - `displayName` — brand label (e.g., `OtakuQuiz`, `OtakuQuiz Kids`).
  - `bundleId` / `domain` — Phase 5 Capacitor + Vercel project wiring.
  - `enabledContentRatings: readonly ContentRating[]` — array (not a
    single max) because §20.2's `getEnabledAnime()` filter calls
    `.includes(a.contentRating)`.
  - `enabledAgeGroups` / `showAgeGate` / `forcedAgeGroup` — Phase 2 age
    filter + Phase 3 age-gate UI.
  - `monetization: { ads, pro, trialDays }` — Phase 4+ monetization
    gates; nested object, no Phase 1 consumer.
  - `legalRoutes: { terms, privacy }` — object with named keys
    referenced as `variantConfig.legalRoutes.terms` /
    `.privacy` by Phase 4.
  - `metadata: { title, description }` — feeds `next/head` SEO via
    `app/layout.tsx` in a later phase.
- **Usage rule:** all variant-aware decisions (anime registry, age
  filter, age gate, monetization gates, legal routes, brand display
  name, SEO metadata, Capacitor bundle wiring) must go through
  `variantConfig` / `isKidsVariant`. **Never reference
  `process.env.NEXT_PUBLIC_APP_VARIANT` directly outside
  `src/config/variants.ts`.**
- **Phase status:** Phase 1 (2026-05-28) landed the seam in isolation —
  no consumers wired yet, app behaves identically to pre-variant master
  with `APP_VARIANT === "full"`. Consumer migrations (anime registry,
  age filter, age gate, monetization, legal, brand, SEO, Capacitor)
  land in Phase 2+.

## Design system

Visual design tokens (colors, typography, spacing, rounded, components) and design rationale live in **DESIGN.md** at the project root. This is the source of truth for all UI work. When implementing or refactoring components, read DESIGN.md first.

The file follows the **Google Labs DESIGN.md spec** (https://github.com/google-labs-code/design.md), currently at `alpha`. Format: YAML front matter for machine-readable tokens, markdown body for rationale, in canonical section order (Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts).

Tooling:

- Validate after edits: `design.md lint DESIGN.md`
- Compare versions: `design.md diff old-DESIGN.md DESIGN.md`
- Export to Tailwind: `design.md export --format tailwind DESIGN.md > tailwind.theme.json`
- Export to W3C DTCG: `design.md export --format dtcg DESIGN.md > tokens.json`

From Windows PowerShell, prefer `npx @google/design.md ...` to avoid `.md` file association. From Bash (including Claude Code's shell), `design.md` resolves correctly.

Rules:

- DESIGN.md is the spec. Tailwind config and CSS custom properties are derived from it. When values diverge, update DESIGN.md first, then propagate to implementation.
- Run the linter after any DESIGN.md edit and resolve errors before committing.
- The format is at `alpha` — expect schema changes. Pin tooling to the version that lints clean today; revisit on minor releases.
- Component refactors should reference component tokens by name (e.g., `button-primary`, `pill-stock-in`) rather than re-deriving values inline.

See `docs/design-workflow.md` for the audit-and-refactor workflow.

## Code Standards
- TypeScript strict mode, NO 'any' types ever
- Functional components with arrow syntax
- Tailwind CSS only, no CSS modules or styled-components
- Each component in its own file in src/components/
- All user-facing strings in components, not hardcoded magic strings

## Database Schema
- Tables: anime_series, questions, user_profiles,
  quiz_sessions, user_answers, duel_matches
- RLS (Row Level Security) enabled on ALL tables
- Questions: 3 difficulty levels (easy, medium, hard)
- Question options stored as JSONB: [{text, isCorrect}]
- User ranks: Genin(0), Chunin(500), Jonin(2000),
  ANBU(5000), Kage(10000), Hokage(25000) XP thresholds

## Testing
- **Unit tests**: Vitest. Co-located *.test.tsx / *.test.ts files under src/.
- **E2E tests**: Playwright. .spec.ts files under e2e/ (never .test.ts — that
  extension belongs to Vitest, and vitest.config.ts excludes **/e2e/**).
- **Selectors**: always getByRole / getByLabel / getByText. Never CSS selectors.
- **Test accounts**: e2e-junior@otakuquiz.test, e2e-teen@otakuquiz.test,
  e2e-full@otakuquiz.test (password E2ETestPass123!) — one per age tier.
- **Seed/reset**: e2e/fixtures/seed-users.ts. Run seedUsers() once to create
  the accounts, resetUsers() before any stateful test to restore the baseline
  (daily_quiz_count=0, subscription_tier='free', current_streak=0).
- Thoroughly test scoring logic and quiz state transitions.

## Git Conventions
- Conventional commits: feat:, fix:, refactor:, test:, docs:
- Branch per feature: feature/quiz-engine, feature/auth, etc.
- Commit after each meaningful change

## Communication Style
- Do NOT provide suggestions or next steps after completing a task. Just finish and stop.

## Deployment
- Do NOT deploy to Vercel or run any deployment commands. The user will deploy manually when ready.

## Important Rules
- COPPA compliance: age-gating for users under 13
- NO copyrighted images. Use placeholder art or CSS illustrations
- Questions are text-based trivia about publicly known facts
- App disclaimer: not affiliated with any anime studio
- Must work well on phones (375px width) and tablets (768px+)

---

## Workflow (mandatory)

- Superpowers loop for any non-trivial work: brainstorm → spec → plan → subagent-driven execution → finish branch. Never jump straight to code.
- /code-review on every multi-file diff before commit.
- /security-guidance on any work touching auth, API routes, env vars, DB writes, or external/user input.
- Claude-Mem runs passively (user-level hooks already wired). Wrap secrets/PII in <private>...</private> tags so they don't persist.

## Skill discovery

When a task surfaces a workflow Claude is fumbling, run `npx skills find ""` from PowerShell to search skills.sh. Do not preinstall speculatively.

## Privacy hygiene

Wrap secrets, credentials, or PII in <private>...</private> tags so claude-mem doesn't persist them.

## Content authoring (length-bias guardrail)

Every multiple-choice question MUST satisfy the symmetric length invariant:

    min(distractor.length) <= correct.length <= max(distractor.length)

where length is the trimmed Unicode **code-point** count (`[...str.trim()].length`),
not UTF-8 bytes. The correct answer must NOT be the strict longest or strict
shortest option; ties at either extreme are allowed.

**Rationale:** an unconstrained corpus drifts toward "the longest option is the
answer" — a content tell that makes the game trivially pattern-solvable without
knowing the anime.

**Authoring rule:** when writing or editing a multiple-choice question, keep the
correct answer within the distractor length range. If the true answer is
naturally long, lengthen a distractor so the correct option is no longer the
unique extremum in either direction. Elaborate a decoy — do not trim the correct
answer.

**Tooling:**

- Audit before committing: `pnpm tsx scripts/audit-question-lengths.ts --summary`
  (or `--detail` for per-question output).
- Gate (CI): `pnpm vitest run src/lib/__tests__/length-bias-corpus` — runs the
  invariant **strictly** across all 480 questions; any violation fails the test.

**History:** length-bias normalization was completed via Track B (T1 guardrail
through T9 + T_final, 2026-05-18 → 2026-05-22). 240 violations were resolved
across 8 per-anime batches (DBZ 18, DS 37, JJK 36, naruto 33, MHA 32, DN 31,
AoT 27, OP 26). The burn-down allowlist was removed at closeout; the validator
now runs strict — every new or edited question must comply on its own.

## Test gates (before any commit)

- `pnpm typecheck` — TypeScript typecheck. **Baseline: 0 errors.** Gate is "no new errors".
- `pnpm lint` — ESLint. **Baseline: 0 errors / 0 warnings**, with 22 inline `eslint-disable-next-line` suppressions for legitimate React patterns flagged by React 19's strict rules (`react-hooks/set-state-in-effect`, `react-hooks/purity`); each suppression carries a rationale comment. Gate is "no new errors / no new warnings".
- `pnpm test` — Vitest unit suite (`vitest run`). **Baseline: 747 tests passing.**
- `pnpm build` — Next.js production build.
- `pnpm vitest run src/lib/__tests__/length-bias-corpus` — strict length-bias symmetric-invariant validator (project-specific gate per Content authoring section).

A11y must stay at 1.0. Test count must hold or grow with each commit (currently 747).

**History:** the Part 21 hot-items cleanup (2026-05-27) brought the project from
the prior baseline of 7 typecheck errors / 28 lint errors / 17 lint warnings down
to 0/0/0. The 22 react-hooks behavioral suppressions are intentional and were
added with per-line rationale; the underlying refactors (useSyncExternalStore,
derived state, `key`-prop overlay reset, etc.) are deferred to dedicated PRs.

## Restricted scope

Add .env* and .claude/settings.local.json to CC-denied files if not already excluded. As of this commit, both are explicitly denied in .claude/settings.local.json's permissions.deny block.