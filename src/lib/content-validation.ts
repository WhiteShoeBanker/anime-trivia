/**
 * Length-bias content guardrail (Track B).
 *
 * Pure functions only — NO fs/path imports. Corpus I/O lives in the consumers
 * (scripts/audit-question-lengths.ts and the corpus integration test).
 *
 * Invariant enforced on every multiple-choice question:
 *
 *   min(distractor.length) <= correct.length <= max(distractor.length)
 *
 * Length = `[...str.trim()].length` (trimmed Unicode code-point count — matches
 * the Track B investigation methodology, NOT UTF-8 byte length). A correct
 * answer that ties a distractor at either extreme is compliant; only a *strict*
 * extremum is a violation. This neutralizes the "longest answer is always
 * correct" tell that makes the game trivially pattern-solvable.
 */
import { createHash } from "node:crypto";

export type ViolationKind = "strictly-longest" | "strictly-shortest";

export interface QuestionInput {
  question_text: string;
  options: { text: string; isCorrect: boolean }[];
}

export interface Violation {
  anime: string;
  tier: string;
  questionText: string;
  correct: string;
  distractors: string[];
  kind: ViolationKind;
}

export interface AllowlistEntry {
  key: string;
  anime: string;
  tier: string;
  questionTextPrefix: string;
  kind: ViolationKind;
}

export interface Allowlist {
  version: number;
  generatedAt: string;
  entries: AllowlistEntry[];
}

export interface CorpusItem {
  anime: string;
  tier: string;
  question: QuestionInput;
}

/** Trimmed Unicode code-point length (the canonical length metric). */
const qlen = (s: string): number => [...s.trim()].length;

/**
 * Apply the symmetric length invariant to a single question.
 * Returns `null` when compliant, or when the question is not assessable
 * (not exactly one correct option, or zero distractors).
 */
export function validateQuestion(
  q: QuestionInput,
  anime: string,
  tier: string
): Violation | null {
  const correctOpts = q.options.filter((o) => o.isCorrect);
  const distractorOpts = q.options.filter((o) => !o.isCorrect);
  if (correctOpts.length !== 1 || distractorOpts.length === 0) return null;

  const correct = correctOpts[0].text;
  const distractors = distractorOpts.map((o) => o.text);
  const cLen = qlen(correct);
  const dLens = distractors.map(qlen);
  const maxD = Math.max(...dLens);
  const minD = Math.min(...dLens);

  let kind: ViolationKind | null = null;
  if (cLen > maxD) kind = "strictly-longest";
  else if (cLen < minD) kind = "strictly-shortest";
  if (kind === null) return null;

  return {
    anime,
    tier,
    questionText: q.question_text,
    correct,
    distractors,
    kind,
  };
}

/**
 * Stable allowlist key: SHA-256 of `anime|tier|questionText`, first 16 hex
 * chars. Stable while question_text is unchanged; any text edit invalidates
 * the entry by design (changed text == effectively a new question).
 */
export function allowlistKey(v: {
  anime: string;
  tier: string;
  questionText: string;
}): string {
  return createHash("sha256")
    .update(`${v.anime}|${v.tier}|${v.questionText}`)
    .digest("hex")
    .slice(0, 16);
}

/**
 * Run the invariant across a corpus, subtract allowlisted violations, and
 * surface stale allowlist entries.
 *
 * @returns `violations` — residual (non-allowlisted) violations; should be
 *          empty on a guarded corpus.
 *          `unexpectedlyCompliant` — allowlist entries with no corresponding
 *          current violation (the question was fixed/removed → stale entry).
 */
export function validateCorpus(
  items: CorpusItem[],
  allowlist: Allowlist
): { violations: Violation[]; unexpectedlyCompliant: AllowlistEntry[] } {
  const allViolations: Violation[] = [];
  for (const item of items) {
    const v = validateQuestion(item.question, item.anime, item.tier);
    if (v) allViolations.push(v);
  }

  const allowedKeys = new Set(allowlist.entries.map((e) => e.key));
  const currentKeys = new Set(allViolations.map((v) => allowlistKey(v)));

  const violations = allViolations.filter(
    (v) => !allowedKeys.has(allowlistKey(v))
  );
  const unexpectedlyCompliant = allowlist.entries.filter(
    (e) => !currentKeys.has(e.key)
  );

  return { violations, unexpectedlyCompliant };
}
