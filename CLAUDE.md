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

