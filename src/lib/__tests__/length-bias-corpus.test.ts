import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  validateCorpus,
  type CorpusItem,
  type Allowlist,
} from "../content-validation";

/**
 * Corpus gate. On every commit this asserts the FULL question corpus
 * (240 JSON easy/medium/hard + 240 impossible-tier SQL) has no length
 * invariant violation outside the seeded allowlist, and that the allowlist
 * has no stale entries.
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

function loadAllowlist(): Allowlist {
  const p = join(ROOT, "src", "lib", "__tests__", "fixtures", "length-bias-allowlist.json");
  return JSON.parse(readFileSync(p, "utf-8")) as Allowlist;
}

describe("length-bias corpus gate", () => {
  const items = loadCorpus();
  const allowlist = loadAllowlist();
  const result = validateCorpus(items, allowlist);

  it("loads the full 480-question corpus", () => {
    expect(items.length).toBe(480);
  });

  it("has zero non-allowlisted length-invariant violations", () => {
    // If this fails: a new/edited question violates the symmetric length
    // invariant and is not in the allowlist. Fix the question (preferred) or,
    // with explicit PR justification, regenerate the allowlist via
    // `pnpm tsx scripts/audit-question-lengths.ts --emit-allowlist <path>`.
    expect(result.violations).toHaveLength(0);
  });

  it("has zero stale allowlist entries", () => {
    // If this fails: an allowlisted question was fixed/removed/retitled. Trim
    // the stale entry from the fixture (regenerate the allowlist).
    expect(result.unexpectedlyCompliant).toHaveLength(0);
  });
});
