/**
 * Track B — question length-bias audit CLI.
 *
 * Loads the full corpus (8 src/data/questions/*.json + the impossible tier from
 * supabase/migrations/008{a,b,c,d,f}) and runs the symmetric length invariant
 * from src/lib/content-validation.ts.
 *
 * Modes:
 *   --summary (default)        corpus + violation stats (investigation §2/§3 shape)
 *   --detail                   every violation, options annotated, sorted anime→tier
 *   --emit-allowlist <path>    write the full violation set as the allowlist JSON
 *   --suggestions              T2+ minimal-edit aid (stub in T1)
 *
 * Run: pnpm tsx scripts/audit-question-lengths.ts <mode>
 */
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  validateQuestion,
  allowlistKey,
  type CorpusItem,
  type Violation,
  type Allowlist,
} from "../src/lib/content-validation";

const ROOT = join(__dirname, "..");
const QDIR = join(ROOT, "src", "data", "questions");
const MIGDIR = join(ROOT, "supabase", "migrations");
// 008e is a count-update only (no questions). run_impossible_questions.sql and
// catch_up_everything.sql re-INSERT 008a–f content — excluded to avoid double-count.
const SQL_IMPOSSIBLE = [
  "008a_impossible_aot_dn.sql",
  "008b_impossible_ds_dbz.sql",
  "008c_impossible_jjk_mha.sql",
  "008d_impossible_naruto_op.sql",
  "008f_impossible_extras.sql",
];

interface RawOption {
  text: string;
  isCorrect: boolean;
}
interface RawQuestion {
  question_text: string;
  question_type: string;
  difficulty: string;
  options: RawOption[];
}

/**
 * Load the full corpus as CorpusItems. Kept deliberately small and duplicated
 * in the corpus integration test (no shared fs module — the validator stays
 * pure). Any change here must be mirrored there.
 */
export function loadCorpus(): CorpusItem[] {
  const items: CorpusItem[] = [];

  // 1. JSON corpus (easy/medium/hard) — anime = filename slug.
  for (const f of readdirSync(QDIR).filter((x) => x.endsWith(".json")).sort()) {
    const anime = f.replace(".json", "");
    const arr = JSON.parse(readFileSync(join(QDIR, f), "utf-8")) as RawQuestion[];
    for (const q of arr) {
      items.push({
        anime,
        tier: q.difficulty,
        question: { question_text: q.question_text, options: q.options },
      });
    }
  }

  // 2. Impossible tier — regex-parsed from migration SQL (unescape '' -> ').
  const blockRe =
    /INSERT INTO questions[\s\S]*?WHERE slug = '([^']+)'\),\s*'((?:[^']|'')*)',\s*'(multiple_choice|true_false|image_guess)',\s*'(easy|medium|hard|impossible)',\s*'(\[[\s\S]*?\])'::jsonb/g;
  for (const f of SQL_IMPOSSIBLE) {
    const sql = readFileSync(join(MIGDIR, f), "utf-8");
    let m: RegExpExecArray | null;
    while ((m = blockRe.exec(sql)) !== null) {
      const [, slug, qtextRaw, , difficulty, optsLit] = m;
      const options = JSON.parse(optsLit.replace(/''/g, "'")) as RawOption[];
      items.push({
        anime: slug,
        tier: difficulty,
        question: {
          question_text: qtextRaw.replace(/''/g, "'"),
          options,
        },
      });
    }
  }

  return items;
}

function collectViolations(items: CorpusItem[]): Violation[] {
  const out: Violation[] = [];
  for (const it of items) {
    const v = validateQuestion(it.question, it.anime, it.tier);
    if (v) out.push(v);
  }
  return out;
}

const qlen = (s: string): number => [...s.trim()].length;

function tally<T extends string>(rows: { [k in T]: string }[], key: T) {
  const m: Record<string, number> = {};
  for (const r of rows) m[r[key]] = (m[r[key]] || 0) + 1;
  return m;
}

function printSummary(items: CorpusItem[], violations: Violation[]): void {
  const json = items.filter((i) => i.tier !== "impossible").length;
  const imp = items.length - json;
  console.log("=== CORPUS ===");
  console.log(`Total questions: ${items.length}  (JSON ${json} + impossible ${imp})`);
  console.log(`Distinct anime : ${new Set(items.map((i) => i.anime)).size}`);
  console.log("\nPer-anime (all questions):");
  const byAnime = tally(items.map((i) => ({ anime: i.anime })), "anime");
  for (const [a, c] of Object.entries(byAnime).sort())
    console.log(`  ${a.padEnd(20)} ${c}`);
  console.log("\nPer-difficulty (all questions):");
  const byTier = tally(items.map((i) => ({ tier: i.tier })), "tier");
  for (const [d, c] of Object.entries(byTier).sort())
    console.log(`  ${d.padEnd(12)} ${c}`);

  console.log("\n=== VIOLATIONS (symmetric length invariant) ===");
  console.log(`Total violations: ${violations.length}`);
  const sl = violations.filter((v) => v.kind === "strictly-longest").length;
  const ss = violations.filter((v) => v.kind === "strictly-shortest").length;
  console.log(`  strictly-longest : ${sl}`);
  console.log(`  strictly-shortest: ${ss}`);

  console.log("\nPer-anime violations (longest / shortest / total):");
  const animes = [...new Set(violations.map((v) => v.anime))].sort();
  for (const a of animes) {
    const va = violations.filter((v) => v.anime === a);
    const l = va.filter((v) => v.kind === "strictly-longest").length;
    const s = va.filter((v) => v.kind === "strictly-shortest").length;
    console.log(`  ${a.padEnd(20)} ${String(l).padStart(3)} / ${String(s).padStart(3)} / ${va.length}`);
  }

  console.log("\nPer-difficulty violations (longest / shortest / total):");
  for (const d of ["easy", "medium", "hard", "impossible"]) {
    const vd = violations.filter((v) => v.tier === d);
    if (!vd.length) continue;
    const l = vd.filter((v) => v.kind === "strictly-longest").length;
    const s = vd.filter((v) => v.kind === "strictly-shortest").length;
    console.log(`  ${d.padEnd(12)} ${String(l).padStart(3)} / ${String(s).padStart(3)} / ${vd.length}`);
  }
}

function printDetail(violations: Violation[]): void {
  const sorted = [...violations].sort(
    (a, b) =>
      a.anime.localeCompare(b.anime) ||
      a.tier.localeCompare(b.tier) ||
      a.questionText.localeCompare(b.questionText)
  );
  for (const v of sorted) {
    console.log(`\n[${v.kind}] ${v.anime} / ${v.tier}`);
    console.log(`  Q: ${v.questionText}`);
    console.log(`     ✓CORRECT  [${String(qlen(v.correct)).padStart(3)}] ${v.correct}`);
    for (const d of v.distractors)
      console.log(`      distract [${String(qlen(d)).padStart(3)}] ${d}`);
  }
  console.log(`\n${sorted.length} violations.`);
}

function emitAllowlist(violations: Violation[], outPath: string): void {
  const entries = violations
    .map((v) => ({
      key: allowlistKey(v),
      anime: v.anime,
      tier: v.tier,
      questionTextPrefix: v.questionText.slice(0, 60),
      kind: v.kind,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  const allowlist: Allowlist = {
    version: 1,
    generatedAt: new Date().toISOString(),
    entries,
  };
  writeFileSync(outPath, JSON.stringify(allowlist, null, 2) + "\n");
  console.log(`Wrote ${entries.length} allowlist entries → ${outPath}`);
}

function printSuggestions(violations: Violation[]): void {
  // T1 stub. T2 batches will flesh out the minimal-edit heuristic.
  console.log(`TODO: T2 will exercise this (${violations.length} violations pending).`);
}

function main(): void {
  const argv = process.argv.slice(2);
  const mode = argv.find((a) => a.startsWith("--")) ?? "--summary";
  const items = loadCorpus();
  const violations = collectViolations(items);

  switch (mode) {
    case "--detail":
      printDetail(violations);
      break;
    case "--emit-allowlist": {
      const outPath = argv[argv.indexOf("--emit-allowlist") + 1];
      if (!outPath) {
        console.error("--emit-allowlist requires a path argument");
        process.exit(1);
      }
      emitAllowlist(violations, join(process.cwd(), outPath));
      break;
    }
    case "--suggestions":
      printSuggestions(violations);
      break;
    case "--summary":
    default:
      printSummary(items, violations);
      break;
  }
}

main();
