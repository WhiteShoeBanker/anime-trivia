# Phase 0b — `src/app/admin/actions.ts` Domain Split (Plan, Not Executed)

> **Status:** Plan-only. No code changes this session. Drafted on
> `chore/phase-0-prep` for chat-side review before execution. Builds on
> the architecture baseline `docs/architecture/baseline-2026-05.md`.

---

## Why this plan exists

`src/app/admin/actions.ts` is a **942-line monolith** exporting **27
symbols** (17 async server actions + 10 interface types) consumed by **8 of
9 admin pages** (the 9th, `layout.tsx`, imports nothing from it). Today,
*every* admin page can transitively `import * from "../actions"` — there's
no domain boundary inside the file, so variant-aware admin work (Phase 2–3:
scoping admin reads/writes to a single variant's content + users) would
have to inject variant context into every server action one by one, in one
giant file.

**Splitting actions.ts by domain *before* the variant layer lands compresses
the cost of variant scoping from "27 function-by-function rewrites in a 942-
line file" to "10 module-boundary rewrites with explicit dependency
surfaces."**

This plan is the prep for that split. It is not part of the variant
migration itself.

---

## Note on the commit-2-that-wasn't

Phase 0 originally planned a **second commit** introducing
`src/lib/content-filter.ts` with `allowedRatingsFor(ageGroup): ContentRating[]`,
migrating 6 source-side filter touch points. Discovery against the actual
code surfaced that **none of the 6 sites inline a `ContentRating[]` list**:

| Site | Actual pattern |
|---|---|
| `proxy.ts:14` | route allowlist (`PUBLIC_PATHS`) — unrelated to age |
| `proxy.ts:77` | `age_group` null-check for redirect to `/auth?complete_profile=true` |
| `queries.ts:67` | `if (ageGroup === "junior") query.eq("kid_safe", true)` (boolean) |
| `quizStore.ts:108` | `if (ageGroup === "junior") query.eq("kid_safe", true)` (boolean) |
| `config-actions.ts:18` | `if (ageGroup !== "junior") return null` (boolean) |
| `admin-config.ts:20` | DEFAULTS key `daily_challenge_mix_junior: {...}` (no logic) |
| `duels.ts:381` | `if (data?.age_group === "junior") throw` (COPPA guard) |

The full `junior→[E] / teen→[E,T] / full→[E,T,M]` ratings mapping only
exists in the RLS policies (migrations 004, 016, 020). The source-side
code never needs the list — it asks "is this user junior?" and applies
binary `kid_safe` / COPPA / config-key gates.

**Decision (Eugene, this session):** skip the helper to avoid landing
dead code or forcing semantically-wrong rewrites (`kid_safe` ≠
`content_rating`). The corrected observation will replace baseline
observation #3 the next time the baseline doc is touched. Phase 2 will
start from accurate ground.

If a future site does need to enumerate ratings, the helper is a
~10-line addition at that point.

---

## What discovery found

### `actions.ts` — 27 exports, grouped by domain hint

| # | Symbol | Kind | ~Line | ~Size | Domain |
|---:|---|---|---:|---:|---|
| 1 | `OverviewStats` | interface | 12 | 30 | overview |
| 2 | `getOverviewStats` | async fn | 42 | 140 | overview |
| 3 | `UsersListResult` | interface | 185 | 22 | users |
| 4 | `getUsersList` | async fn | 207 | 50 | users |
| 5 | `upgradeUserToPro` | async fn | 258 | 38 | users |
| 6 | `revokeUserPro` | async fn | 297 | 24 | users |
| 7 | `getUserDuelStats` | async fn | 324 | 8 | duels¹ |
| 8 | `EngagementData` | interface | 335 | 12 | engagement |
| 9 | `getEngagementData` | async fn | 347 | 42 | engagement |
| 10 | `ContentStats` | interface | 391 | 12 | content |
| 11 | `getContentStats` | async fn | 403 | 18 | content |
| 12 | `LeagueData` | interface | 423 | 12 | leagues |
| 13 | `getLeagueDistribution` | async fn | 435 | 22 | leagues |
| 14 | `DuelsData` | interface | 460 | 22 | duels |
| 15 | `getDuelsData` | async fn | 482 | 110 | duels |
| 16 | `RevenueData` | interface | 593 | 28 | revenue |
| 17 | `getRevenueData` | async fn | 621 | 100 | revenue |
| 18 | `generatePromoCode` | async fn | 723 | 33 | revenue |
| 19 | `RetentionData` | interface | 759 | 12 | retention |
| 20 | `getRetentionData` | async fn | 771 | 18 | retention |
| 21 | `AdminSettings` | interface | 791 | 18 | settings |
| 22 | `getAdminSettings` | async fn | 809 | 14 | settings |
| 23 | `updateAdminSetting` | async fn | 824 | 35 | settings |
| 24 | `getRecentEvents` | async fn | 861 | 14 | events² |
| 25 | `CronStatusInfo` | interface | 884 | 11 | cron |
| 26 | `getCronStatuses` | async fn | 895 | 28 | cron |
| 27 | `retryCronJob` | async fn | 924 | 19 | cron |

¹ `getUserDuelStats` queries `duel_stats` (duels domain) but is consumed
only by `users/page.tsx`. Resolved in the proposal: lives in **`duels.ts`**
(domain wins over consumer); `users/page.tsx` imports across the boundary.

² `getRecentEvents` (analytics_events tail) has **no consumer in any of
the 9 admin pages** per the import map. Verify before the split — if
genuinely unused, delete in the same commit; if used by a cron retry or
admin script, keep in a dedicated `events.ts`.

### Import map — 9 admin files × actions.ts symbols

| Admin file | Symbols imported (functions / types) | Cross-domain? |
|---|---|---|
| `page.tsx` (Overview) | `getOverviewStats`, `getCronStatuses`, `retryCronJob`, `OverviewStats`, `CronStatusInfo` | **yes** (overview + cron) |
| `content/page.tsx` | `getContentStats`, `ContentStats` | no |
| `duels/page.tsx` | `getDuelsData`, `DuelsData` | no |
| `engagement/page.tsx` | `getEngagementData`, `EngagementData` | no |
| `leagues/page.tsx` | `getLeagueDistribution`, `LeagueData` | no |
| `retention/page.tsx` | `getRetentionData`, `RetentionData`, **`getUsersList`, `UsersListResult`** | **yes** (retention + users) |
| `revenue/page.tsx` | `getRevenueData`, `generatePromoCode`, `RevenueData` | no |
| `settings/page.tsx` | `getAdminSettings`, `updateAdminSetting`, `AdminSettings` | no |
| `users/page.tsx` | `getUsersList`, `upgradeUserToPro`, `revokeUserPro`, **`getUserDuelStats`**, `UsersListResult` | **yes** (users + duels) |
| `layout.tsx` (Shell) | *(no imports from actions)* | n/a |

**Cross-domain consumers found: 3.**
- `Overview` → `cron` (cron status panel on Overview page is the cron UI)
- `Retention` → `users` (joins retention metrics with user list)
- `Users` → `duels` (per-user duel record expansion)

All three are legitimate cross-domain dependencies, not refactor artifacts.

### `actions.ts` shared imports (lines 1–8)

```ts
"use server";
import { createServiceClient } from "@/lib/supabase/service";
import { invalidateConfig } from "@/lib/admin-config";
import { trackEvent } from "@/lib/analytics";
import { getIncompleteProfilesCount } from "@/lib/admin-metrics";

const PRO_PRICE = 4.99;
```

These need to be replicated in each split module that actually uses them
(most do). `PRO_PRICE` is used only by `upgradeUserToPro` and
`getRevenueData` — should move to `users.ts` and be either inlined into
`revenue.ts` or exported as a shared constant from one of them.

---

## Proposed domain split

**10 modules under `src/app/admin/actions/`,** plus the optional
`events.ts` pending the verify step:

```
src/app/admin/actions/
├── overview.ts       # OverviewStats, getOverviewStats
├── users.ts          # UsersListResult, getUsersList, upgradeUserToPro, revokeUserPro, PRO_PRICE
├── content.ts        # ContentStats, getContentStats
├── engagement.ts     # EngagementData, getEngagementData
├── leagues.ts        # LeagueData, getLeagueDistribution
├── duels.ts          # DuelsData, getDuelsData, getUserDuelStats
├── revenue.ts        # RevenueData, getRevenueData, generatePromoCode
├── retention.ts      # RetentionData, getRetentionData
├── settings.ts       # AdminSettings, getAdminSettings, updateAdminSetting
└── cron.ts           # CronStatusInfo, getCronStatuses, retryCronJob
```

Optional 11th module:

```
└── events.ts         # getRecentEvents   ← only if it has a verified consumer
```

Sizes after split (approximate):

| Module | Lines | Exports |
|---|---:|---:|
| `users.ts` | ~135 | 4 fns + 1 type |
| `duels.ts` | ~140 | 2 fns + 1 type |
| `revenue.ts` | ~160 | 2 fns + 1 type |
| `overview.ts` | ~170 | 1 fn + 1 type |
| `settings.ts` | ~70 | 2 fns + 1 type |
| `engagement.ts` | ~55 | 1 fn + 1 type |
| `cron.ts` | ~60 | 2 fns + 1 type |
| `leagues.ts` | ~35 | 1 fn + 1 type |
| `content.ts` | ~30 | 1 fn + 1 type |
| `retention.ts` | ~30 | 1 fn + 1 type |
| *(events.ts)* | ~14 | 1 fn |
| **Total** | **~885** | **27** |

Largest module: ~170 lines (Overview's 140-line `getOverviewStats`). Median:
~60 lines. All well under the 300-line "consider splitting" threshold.

### Per-domain rationale

- **`overview.ts`** — Single function, but it's 140 lines and joins ~6
  tables. Worth isolating so its complexity doesn't drag the rest of the
  split. Owned by the Overview page.

- **`users.ts`** — Two pure reads (list, duel-stats consumer) + two writes
  (upgrade/revoke pro). Anchors the user-management write surface that
  Phase 2 will likely variant-scope. `PRO_PRICE` const lives here since
  `upgradeUserToPro` is its primary consumer; `getRevenueData` imports it
  from here.

- **`content.ts`** — Two exports, tiny. Anchors content reads; variant
  layer will need to filter anime/questions by variant here.

- **`engagement.ts`** — One read + one type. Trivial split.

- **`leagues.ts`** — One read + one type. Trivial split. Note: weekly/
  league reads are heavily cross-table (`leagues`, `league_history`,
  `weekly_anime_plays`); leave as-is.

- **`duels.ts`** — Two functions: `getDuelsData` (110 lines, dashboard
  aggregates) and `getUserDuelStats` (8 lines, per-user lookup). The
  8-line function lives here because it queries the duels domain even
  though the only consumer today is the users page.

- **`revenue.ts`** — Two reads + one write (`generatePromoCode`). Imports
  `PRO_PRICE` from `./users`. Owns the promo-code write surface.

- **`retention.ts`** — One read + one type. Cohort analysis on
  `user_profiles + quiz_sessions`. Variant layer would scope by variant's
  user_profiles slice.

- **`settings.ts`** — Two functions (read + write) on `admin_config`.
  Pairs with `invalidateConfig`.

- **`cron.ts`** — Cron status reads + manual retry. Consumed only by
  Overview today. Anchors the cron UI logic.

- **`events.ts` (optional)** — Holding pen for `getRecentEvents` pending
  the verify step.

---

## Barrel re-export vs direct imports — decision

Two viable strategies:

### Option A — Direct imports, no barrel

Delete `src/app/admin/actions.ts`. Each admin page rewrites its imports:

```ts
// Before
import { getOverviewStats, getCronStatuses, retryCronJob, type OverviewStats, type CronStatusInfo } from "../actions";

// After
import { getOverviewStats, type OverviewStats } from "../actions/overview";
import { getCronStatuses, retryCronJob, type CronStatusInfo } from "../actions/cron";
```

**Per-page import-statement deltas:**

| Page | Imports today | Imports after | Statement delta |
|---|---:|---:|---:|
| `page.tsx` | 1 (5 symbols) | 2 (2 + 3 symbols) | +1 |
| `content/page.tsx` | 1 | 1 | 0 |
| `duels/page.tsx` | 1 | 1 | 0 |
| `engagement/page.tsx` | 1 | 1 | 0 |
| `leagues/page.tsx` | 1 | 1 | 0 |
| `retention/page.tsx` | 1 (4 symbols) | 2 (2 + 2 symbols) | +1 |
| `revenue/page.tsx` | 1 (3 symbols) | 1 | 0 |
| `settings/page.tsx` | 1 (3 symbols) | 1 | 0 |
| `users/page.tsx` | 1 (5 symbols) | 2 (4 + 1 symbols) | +1 |
| **Total** | **9 stmts** | **12 stmts** | **+3** |

**Real cost: 3 additional import statements + rewriting all 9 from `"../actions"`
to `"../actions/<domain>"` paths. Mechanical, low-risk, one-shot.**

Pros:
- Explicit dependency surface — each page's imports document its domain reach
- The 3 cross-domain pairings (Overview→cron, Retention→users, Users→duels)
  become visible at the import statement, prompting review
- Variant-aware admin (Phase 2–3) can introduce a variant-scoped client
  at the module boundary, not inside every function
- No indirection — `Go to Definition` lands you in the actual file
- Eliminates the "any admin page can call anything" pattern that
  variant work is fighting against

Cons:
- 9 page files touched in the same commit (vs 0)
- Two pages gain a second import statement

### Option B — Barrel re-export

Keep `src/app/admin/actions.ts` as a thin barrel:

```ts
// src/app/admin/actions.ts
export * from "./actions/overview";
export * from "./actions/users";
export * from "./actions/content";
// ... 7 more
```

Admin pages don't change. Underlying file split happens transparently.

Pros:
- Zero admin-page changes; PR diff is purely the split
- Drop-in compatible — no behavior change risk
- If a single test broke we'd instantly know the split itself caused it

Cons:
- Preserves the "import-everything-from-one-place" pattern that
  variant scoping needs to break — work just gets deferred
- Variant context still has to be threaded into each module's interior
  rather than the module boundary
- The cross-domain consumers (Overview→cron, etc.) stay invisible
- `Go to Definition` still hops through the barrel
- Two sources of truth for what `actions.ts` exports (the barrel + the
  actual modules)

### Decision

**Recommend Option A (direct imports, no barrel).**

The +3-import-statement cost is one-time, mechanical, and ships in the
same commit as the split — there's no separate "now migrate the pages"
followup. The benefit compounds: every Phase 2–3 variant-scoping change
will be smaller because the boundary is real, not architectural fiction.

Hybrid hedge if confidence is low: ship Option B first as a no-risk
split, then a follow-up commit deletes the barrel and migrates pages.
This trades one commit for two and a deferred (~3-statement) win, but
de-risks the actual content-split commit.

---

## Execution plan (when ready — NOT this session)

1. **Create the worktree / branch** — `chore/admin-actions-split` from
   master. Verify-before-completion at every step.

2. **Verify `getRecentEvents`** — `grep -r "getRecentEvents" src/ scripts/`.
   If no consumer, delete it in this commit. If a consumer exists, create
   `events.ts`.

3. **Create the 10 (or 11) modules** under `src/app/admin/actions/`. Each
   module:
   - Copies the relevant `"use server"` directive
   - Imports its needed dependencies (`createServiceClient`, etc.)
   - Re-defines the interfaces and async functions it owns
   - Owns the relevant private helpers (e.g., `PRO_PRICE` in `users.ts`)

4. **Rewrite admin page imports** — 9 files, 9 → 12 import statements.
   Pages affected: `page.tsx`, `content/page.tsx`, `duels/page.tsx`,
   `engagement/page.tsx`, `leagues/page.tsx`, `retention/page.tsx`,
   `revenue/page.tsx`, `settings/page.tsx`, `users/page.tsx`.

5. **Delete `src/app/admin/actions.ts`** — must come after step 4 so the
   typechecker catches any missed import rewrites.

6. **Verify gates:** `pnpm typecheck` (no new errors vs baseline),
   `pnpm test` (no regressions), `pnpm build` (admin pages still
   compile), `pnpm lint` (no new errors).

7. **Commit.** Single atomic commit:
   `refactor(admin): split 942-line actions.ts into 10 domain modules`

8. **Optional follow-up:** a `_internals.ts` or `_shared.ts` module if
   any helpers turn out to be needed by ≥2 domain modules. Defer the
   decision until the split surfaces it; don't pre-extract.

### What this plan does NOT do

- Does not touch RLS migrations (authoritative; Phase 2 alignment)
- Does not introduce the variants config layer (Phase 1)
- Does not change function behavior — pure file-level reshuffling
- Does not change any admin page's runtime behavior or network surface
- Does not add a `content-filter.ts` helper (see "commit-2-that-wasn't"
  above)

---

## Open questions for review

1. **`getRecentEvents`** — confirm whether it has a consumer before the
   split. If dead, delete in the split commit. If used by a cron retry
   route or admin script, place in `events.ts`.

2. **`getUserDuelStats` placement** — proposed: `duels.ts` (domain wins).
   Alternative: `users.ts` (consumer wins). Pick one before splitting.

3. **`PRO_PRICE` location** — proposed: `users.ts` (primary writer).
   `revenue.ts` imports it across the boundary. Alternative: extract
   into `_shared.ts`. Probably overkill until a third consumer appears.

4. **Hybrid hedge** — do you want the barrel-then-direct two-commit
   path, or a single direct-imports commit? Single commit is cleaner;
   hedge is safer if there's any production-incident risk window.

5. **Timing** — does this land before or after Phase 1 (variants config
   layer)? Recommendation: **before**, so Phase 2 variant scoping has a
   clean boundary to write against. But Phase 1 doesn't depend on it.

---

*End of phase-0b-actions-split-plan.md. No code modified.*
