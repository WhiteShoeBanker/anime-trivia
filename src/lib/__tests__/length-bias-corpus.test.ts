import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import {
  validateCorpus,
  type CorpusItem,
  type Allowlist,
} from "../content-validation";

/**
 * Corpus gate. On every commit this asserts the FULL question corpus
 * (240 JSON easy/medium/hard + 240 impossible-tier SQL) has no length
 * invariant violation — strictly, with no allowlist (Track B closed at
 * T_final; the burn-down allowlist fixture was removed).
 *
 * The loader is duplicated from scripts/audit-question-lengths.ts on purpose:
 * the validator stays pure (no fs), so there is no shared fs module. The
 * regex/parse here MUST stay in lockstep with that script.
 */

const ROOT = process.cwd();
const QDIR = join(ROOT, "src", "data", "questions");
const MIGDIR = join(ROOT, "supabase", "migrations");
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
  difficulty: string;
  options: RawOption[];
}

function loadCorpus(): CorpusItem[] {
  const items: CorpusItem[] = [];

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

// Track B closed at T_final: the burn-down allowlist was removed and the gate
// now runs strict. validateCorpus still accepts an allowlist (kept for any
// future propose-then-apply track); here we pass an empty one.
const EMPTY_ALLOWLIST: Allowlist = { version: 1, generatedAt: "", entries: [] };

describe("length-bias corpus gate", () => {
  const items = loadCorpus();
  const result = validateCorpus(items, EMPTY_ALLOWLIST);

  it("loads the full 480-question corpus", () => {
    expect(items.length).toBe(480);
  });

  it("has zero length-invariant violations (strict — no allowlist)", () => {
    // If this fails: a new/edited question violates the symmetric length
    // invariant. Fix the question — there is no allowlist to fall back on.
    expect(result.violations).toHaveLength(0);
  });

  it("the length-bias allowlist fixture is gone (removed at T_final)", () => {
    const p = join(ROOT, "src", "lib", "__tests__", "fixtures", "length-bias-allowlist.json");
    expect(existsSync(p)).toBe(false);
  });
});
