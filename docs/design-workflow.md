# Design system workflow

The pattern this project uses to take the visual design from spec to shipped UI. Same workflow as peptide-intel; reference that codebase for live examples.

## Phase 1: Brand direction (chat-Claude)

Done in conversation with chat-Claude. Outputs:
- 2-3 visual directions discussed via inline mockups (SVG/HTML widgets)
- One direction agreed and locked
- Synthesis of agreed direction including: brand color anchor, surface palette, typography choices, component approach

Not done in Claude Code. The output is a written design direction, not files.

## Phase 2: DESIGN.md install

A single Claude Code prompt creates DESIGN.md at the project root with the agreed direction encoded in Google Labs format (YAML front matter + canonical sections). Updates project CLAUDE.md to reference it. Runs `design.md lint DESIGN.md` until errors=0.

Spec lives at https://github.com/google-labs-code/design.md.

Tooling commands (provided by `@google/design.md@0.1.1`):

- Validate after edits: `design.md lint DESIGN.md`
- Compare versions: `design.md diff old-DESIGN.md DESIGN.md`
- Export to Tailwind: `design.md export --format tailwind DESIGN.md > tailwind.theme.json`
- Export to W3C DTCG: `design.md export --format dtcg DESIGN.md > tokens.json`

**Windows note:** Invoking `design.md` directly from PowerShell falls through to the `.md` file association (opens in editor) instead of executing. From PowerShell, use `npx @google/design.md ...` instead. From Bash (including Claude Code's shell on Windows), `design.md` resolves correctly. A user-level `designmd.cmd` shim can be created with `copy "$env:APPDATA\npm\design.md.cmd" "$env:APPDATA\npm\designmd.cmd"` (run once), after which both forms work in both shells.

Common gotchas:
- 8-digit hex codes (RRGGBBAA) are rejected by the linter. Use 6-digit precomputed solid hex composited over the canonical surface, document the composition in prose.
- "Unused token" warnings are expected and acceptable while the components block is incomplete. They resolve as more components get defined.
- Light mode is canonical. Dark mode hex values can be documented in prose; CSS implementation handles the toggle separately.

## Phase 3: Audit pass

A single Claude Code prompt reads DESIGN.md against the current codebase. Produces a markdown report at `docs/design-audit-YYYY-MM-DD.md` with:
- Color findings (raw hex, default-Tailwind palette usage, brand drift)
- Typography findings (font weights, sizes, families)
- Spacing findings (off-scale values)
- Component-level findings (per-component drift)
- Spec gaps (things the codebase needs that DESIGN.md doesn't define yet)
- Refactor queue, ordered: buttons → pills → cards → tables → forms → navigation → footer → article body

Read-only. Does not modify any source file other than the report itself.

## Phase 4: Stage 0 foundation

First refactor pass. Wires DESIGN.md tokens into Tailwind v4 `@theme` in `app/globals.css`. Loads fonts via `next/font/google`. Sets up `vitest.setup.ts` for global component test config. Removes any vestigial scaffold (Geist references, default Next.js theme variables) and migrates them to backwards-compat aliases.

Stage 0 is ADDITIVE. Existing component classNames keep rendering. Only the global page background and body font change visibly. Component refactors come after.

## Phase 5: Component-by-component refactor

One Claude Code prompt per component group, in this order:

1. **Buttons** — shared `<Button>` component with primary/secondary/tertiary variants, polymorphic between `<button>` and Next.js `<Link>` via href detection. Migrate all button-shaped call sites.
2. **Pills** — verified, stock, category-tag, others. May require DESIGN.md amendments alongside (e.g., splitting category-tag into per-category variants).
3. **Cards** — collapse copy-paste card sites into one shared `<Card>`.
4. **Tables** — comparison/data tables. Style only — preserve any existing logic.
5. **Forms** — input/label/error patterns. May require new DESIGN.md tokens.
6. **Navigation** — header, mobile menu.
7. **Footer** — three-column or single-column layout.
8. **Article body / hero patterns** — typography-heavy long-form content.

Each pass:
- Builds the shared component(s) first under `src/components/ui/`
- Writes vitest tests for each
- Migrates call sites to use the new component
- Removes old utility classNames
- Runs typecheck + lint + vitest + build to verify
- Reports back with file:line list of migrations and visual delta

## Component conventions

- Server-component-safe by default (no hooks unless genuinely needed)
- Polymorphic via discriminated TypeScript unions when supporting multiple element types
- Class composition via lookup objects, not template strings (Tailwind's build-time class extraction can't see template strings)
- Positional/layout className stays on the call site (`mt-4`, `w-full`)
- Shape/identity className is owned by the component (`bg-brand`, `rounded-md`, etc.)

## DESIGN.md amendments

Made alongside the refactor pass that needs them. Don't speculatively add tokens. When a refactor surfaces a need (e.g., "form needs an input-default token"), the same prompt amends DESIGN.md, re-lints, and uses the new token in the component.

## Vitest setup

Global setup at `vitest.setup.ts`:

    import '@testing-library/jest-dom/vitest';
    import { cleanup } from '@testing-library/react';
    import { afterEach } from 'vitest';

    afterEach(() => {
      cleanup();
    });

Reference in `vitest.config.{ts,mts,js}` under test config:
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],

Per-component test files don't need per-file directives once this is in place.

## File locations summary

- `DESIGN.md` — project root, source of truth for design tokens
- `CLAUDE.md` — project root, design system tooling section
- `.claude/settings.json` — permission rules
- `docs/design-workflow.md` — this file
- `docs/design-audit-YYYY-MM-DD.md` — audit reports (one per audit pass)
- `src/app/globals.css` — Tailwind v4 `@theme` token wiring
- `src/components/ui/` — shared component library
- `vitest.setup.ts` — project root, global test setup
