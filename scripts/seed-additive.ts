/**
 * scripts/seed-additive.ts
 *
 * Phase 2.6 — additive production seed for Hunter x Hunter and My Neighbor
 * Totoro. Strictly additive: NEVER deletes from `questions`. Aborts loudly on
 * any precondition failure (wrong host, missing JSON, anime already populated,
 * post-flight count mismatch).
 *
 * Run: pnpm tsx --env-file=.env.local scripts/seed-additive.ts
 *
 * Differences vs scripts/seed.ts:
 *   - Allowlist of slugs (not a directory scan).
 *   - No DELETE on `questions` — pre-flight requires zero existing rows for
 *     the two target anime; insert is the only write to `questions`.
 *   - Single atomic 800-row insert (Supabase REST insert is row-set atomic).
 *   - Re-resolves anime UUIDs via explicit SELECT after upsert.
 *   - Post-flight verification: total delta, per-anime count, per-difficulty
 *     breakdown.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { ANIME_REGISTRY } from "../src/data/anime/registry";

// ── Configuration ───────────────────────────────────────────────────────────

const TARGET_HOST = "iwrejwbrggehrakxlqxv.supabase.co";

const TARGET_SLUGS = ["hunter-x-hunter", "my-neighbor-totoro"] as const;
type TargetSlug = (typeof TARGET_SLUGS)[number];

const EXPECTED_PER_DIFFICULTY = 100;
const EXPECTED_PER_ANIME = 400;
const EXPECTED_TOTAL_INSERT = TARGET_SLUGS.length * EXPECTED_PER_ANIME; // 800

// Genre is seed-only metadata, not part of the runtime registry.
const ANIME_GENRES: Record<TargetSlug, string[]> = {
  "hunter-x-hunter": ["Shonen", "Action", "Adventure"],
  "my-neighbor-totoro": ["Family", "Fantasy", "Slice of Life"],
};

const DIFFICULTIES = ["easy", "medium", "hard", "impossible"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

// Expected per-anime content_rating value in the question JSON (corpus
// integrity check). Note: content_rating is NOT a column on `questions`
// (it lives on `anime_series`), so this is validation only, not insert data.
const EXPECTED_CR: Record<TargetSlug, "E" | "T" | "M"> = {
  "hunter-x-hunter": "T",
  "my-neighbor-totoro": "E",
};

// ── Types ────────────────────────────────────────────────────────────────────

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface QuestionData {
  question_text: string;
  question_type: string;
  difficulty: string;
  options: QuestionOption[];
  explanation: string;
  kid_safe: boolean;
  content_rating: string;
}

interface InsertRow {
  anime_id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  options: QuestionOption[];
  explanation: string;
  kid_safe: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function abort(message: string): never {
  console.error(`\n[ABORT] ${message}\n`);
  process.exit(1);
}

const log = (message: string) => console.log(message);
const section = (title: string) => console.log(`\n── ${title} ${"─".repeat(Math.max(0, 60 - title.length))}`);

// ── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  log("Starting additive seed for HxH + Totoro (Phase 2.6)\n");

  // ── Env ──────────────────────────────────────────────────────────────────
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL) abort("NEXT_PUBLIC_SUPABASE_URL is not set.");
  if (!SUPABASE_SERVICE_ROLE_KEY) abort("SUPABASE_SERVICE_ROLE_KEY is not set.");

  // ── Pre-flight 1: host check ─────────────────────────────────────────────
  section("Pre-flight 1: host check");
  const host = new URL(SUPABASE_URL!).host;
  log(`  NEXT_PUBLIC_SUPABASE_URL host: ${host}`);
  log(`  Required host:                 ${TARGET_HOST}`);
  if (host !== TARGET_HOST) {
    abort(
      `Refusing to run: SUPABASE_URL host '${host}' does not match required production host '${TARGET_HOST}'.`,
    );
  }
  log("  OK — pointing at production project.");

  // ── Pre-flight 2: JSON files exist, parse, length 400 ────────────────────
  section("Pre-flight 2: JSON files");
  const questionsDir = join(__dirname, "..", "src", "data", "questions");

  const loaded: Record<TargetSlug, QuestionData[]> = {} as Record<TargetSlug, QuestionData[]>;

  for (const slug of TARGET_SLUGS) {
    const filePath = join(questionsDir, `${slug}.json`);
    if (!existsSync(filePath)) abort(`Missing JSON file: ${filePath}`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(filePath, "utf-8"));
    } catch (err) {
      abort(`Failed to parse JSON for ${slug}: ${(err as Error).message}`);
    }

    if (!Array.isArray(parsed)) abort(`${slug}.json did not parse to an array.`);
    if (parsed.length !== EXPECTED_PER_ANIME) {
      abort(
        `${slug}.json has ${parsed.length} questions; expected exactly ${EXPECTED_PER_ANIME}.`,
      );
    }

    const questions = parsed as QuestionData[];

    // Per-difficulty sanity inside each JSON
    const tally: Record<string, number> = {};
    for (const q of questions) tally[q.difficulty] = (tally[q.difficulty] ?? 0) + 1;
    for (const d of DIFFICULTIES) {
      if ((tally[d] ?? 0) !== EXPECTED_PER_DIFFICULTY) {
        abort(
          `${slug}.json: difficulty '${d}' has ${tally[d] ?? 0} rows; expected ${EXPECTED_PER_DIFFICULTY}.`,
        );
      }
    }

    // Per-question integrity: kid_safe must be boolean; content_rating must
    // be string and match the expected per-anime value (JSON metadata sanity
    // check — content_rating is not inserted, but a mismatch indicates the
    // corpus was authored against the wrong anime, which would also imply
    // miscategorized kid_safe flags downstream).
    const expectedCR = EXPECTED_CR[slug];
    const kidSafeTally = { true: 0, false: 0 };
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (typeof q.kid_safe !== "boolean") {
        abort(
          `${slug}.json question[${i}]: kid_safe must be boolean, got ${typeof q.kid_safe} (${JSON.stringify(q.kid_safe)}).`,
        );
      }
      if (typeof q.content_rating !== "string") {
        abort(
          `${slug}.json question[${i}]: content_rating must be string, got ${typeof q.content_rating}.`,
        );
      }
      if (q.content_rating !== expectedCR) {
        abort(
          `${slug}.json question[${i}]: content_rating='${q.content_rating}' does not match expected '${expectedCR}' for this anime.`,
        );
      }
      kidSafeTally[q.kid_safe ? "true" : "false"]++;
    }

    loaded[slug] = questions;
    log(
      `  OK ${slug.padEnd(20)} length=${questions.length}  ${JSON.stringify(tally)}  kid_safe=${JSON.stringify(kidSafeTally)}`,
    );
  }

  // ── Client ───────────────────────────────────────────────────────────────
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // ── Upsert anime_series for each target slug (idempotent) ────────────────
  section("Upsert anime_series rows");
  for (const slug of TARGET_SLUGS) {
    const entry = ANIME_REGISTRY.find((a) => a.slug === slug);
    if (!entry) abort(`Registry has no entry for slug '${slug}'.`);

    const { error } = await supabase.from("anime_series").upsert(
      {
        slug: entry!.slug,
        title: entry!.displayName,
        description: entry!.description,
        genre: ANIME_GENRES[slug],
        content_rating: entry!.contentRating,
        total_questions: EXPECTED_PER_ANIME,
        is_active: true,
      },
      { onConflict: "slug" },
    );
    if (error) abort(`Upsert failed for ${slug}: ${error.message}`);
    log(`  OK upserted anime_series for ${slug}`);
  }

  // ── Re-resolve anime UUIDs via explicit SELECT ───────────────────────────
  section("Resolve anime_id UUIDs");
  const { data: animeRows, error: selectErr } = await supabase
    .from("anime_series")
    .select("id, slug")
    .in("slug", [...TARGET_SLUGS]);

  if (selectErr) abort(`Failed to read back anime_series: ${selectErr.message}`);
  if (!animeRows || animeRows.length !== TARGET_SLUGS.length) {
    abort(
      `Expected ${TARGET_SLUGS.length} anime_series rows, got ${animeRows?.length ?? 0}.`,
    );
  }

  const slugToId = new Map<TargetSlug, string>();
  for (const row of animeRows) {
    if (!TARGET_SLUGS.includes(row.slug)) continue;
    slugToId.set(row.slug as TargetSlug, row.id as string);
  }
  for (const slug of TARGET_SLUGS) {
    const id = slugToId.get(slug);
    if (!id) abort(`Could not resolve anime_id for ${slug}.`);
    log(`  ${slug.padEnd(20)} -> ${id}`);
  }

  // ── Pre-flight 3: target anime have zero existing questions ──────────────
  section("Pre-flight 3: target anime must have zero existing questions");
  for (const slug of TARGET_SLUGS) {
    const animeId = slugToId.get(slug)!;
    const { count, error } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("anime_id", animeId);
    if (error) abort(`Count query failed for ${slug}: ${error.message}`);
    log(`  ${slug.padEnd(20)} existing rows=${count ?? 0}`);
    if ((count ?? 0) !== 0) {
      abort(
        `Refusing to seed: ${slug} already has ${count} questions in the database. ` +
          `This script is single-shot additive only. If you intended to re-seed, ` +
          `that requires a separate cleanup path with explicit FK handling.`,
      );
    }
  }

  // ── Pre-flight 4: capture baseline total ─────────────────────────────────
  section("Pre-flight 4: baseline total questions");
  const { count: baselineTotal, error: baselineErr } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });
  if (baselineErr) abort(`Baseline count failed: ${baselineErr.message}`);
  log(`  Baseline total questions: ${baselineTotal}`);

  // ── Build insert payload ─────────────────────────────────────────────────
  section("Build insert payload");
  const rows: InsertRow[] = [];
  for (const slug of TARGET_SLUGS) {
    const animeId = slugToId.get(slug)!;
    for (const q of loaded[slug]) {
      rows.push({
        anime_id: animeId,
        question_text: q.question_text,
        question_type: q.question_type,
        difficulty: q.difficulty,
        options: q.options,
        explanation: q.explanation,
        kid_safe: q.kid_safe,
      });
    }
  }
  if (rows.length !== EXPECTED_TOTAL_INSERT) {
    abort(`Built ${rows.length} rows; expected ${EXPECTED_TOTAL_INSERT}.`);
  }
  log(`  Built ${rows.length} rows for single atomic insert.`);

  // ── Single atomic insert ─────────────────────────────────────────────────
  section(`Insert ${rows.length} questions (single call)`);
  const { error: insertErr } = await supabase.from("questions").insert(rows);
  if (insertErr) abort(`Insert failed: ${insertErr.message}`);
  log("  OK insert returned no error.");

  // ── Post-flight 1: per-anime count == EXPECTED_PER_ANIME ─────────────────
  section("Post-flight 1: per-anime counts");
  for (const slug of TARGET_SLUGS) {
    const animeId = slugToId.get(slug)!;
    const { count, error } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("anime_id", animeId);
    if (error) abort(`Per-anime count failed for ${slug}: ${error.message}`);
    log(`  ${slug.padEnd(20)} after=${count} (expected ${EXPECTED_PER_ANIME})`);
    if ((count ?? -1) !== EXPECTED_PER_ANIME) {
      abort(`${slug} has ${count} questions, expected ${EXPECTED_PER_ANIME}.`);
    }
  }

  // ── Post-flight 2: total grew by exactly EXPECTED_TOTAL_INSERT ───────────
  section("Post-flight 2: total delta");
  const { count: finalTotal, error: finalErr } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });
  if (finalErr) abort(`Final count failed: ${finalErr.message}`);
  const delta = (finalTotal ?? 0) - (baselineTotal ?? 0);
  log(`  Baseline: ${baselineTotal}`);
  log(`  Final:    ${finalTotal}`);
  log(`  Delta:    ${delta} (expected exactly ${EXPECTED_TOTAL_INSERT})`);
  if (delta !== EXPECTED_TOTAL_INSERT) {
    abort(
      `Total delta is ${delta}, expected exactly ${EXPECTED_TOTAL_INSERT}. ` +
        `Other rows in 'questions' were unexpectedly affected.`,
    );
  }

  // ── Post-flight 3: per-anime per-difficulty == EXPECTED_PER_DIFFICULTY ───
  section("Post-flight 3: per-difficulty breakdown");
  for (const slug of TARGET_SLUGS) {
    const animeId = slugToId.get(slug)!;
    for (const difficulty of DIFFICULTIES) {
      const { count, error } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("anime_id", animeId)
        .eq("difficulty", difficulty);
      if (error) {
        abort(`Difficulty count failed for ${slug}/${difficulty}: ${error.message}`);
      }
      const ok = (count ?? -1) === EXPECTED_PER_DIFFICULTY;
      log(
        `  ${slug.padEnd(20)} ${difficulty.padEnd(10)} count=${count} ${ok ? "OK" : "FAIL"}`,
      );
      if (!ok) {
        abort(
          `${slug}/${difficulty} count=${count}, expected ${EXPECTED_PER_DIFFICULTY}.`,
        );
      }
    }
  }

  section("Done");
  log(
    `  Inserted ${EXPECTED_TOTAL_INSERT} rows across ${TARGET_SLUGS.length} anime. ` +
      `Production total: ${baselineTotal} -> ${finalTotal}.`,
  );
};

main().catch((err) => {
  console.error("\n[FATAL] Seed-additive crashed:", err);
  process.exit(1);
});
