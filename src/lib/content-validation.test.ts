import { describe, it, expect } from "vitest";
import {
  validateQuestion,
  validateCorpus,
  allowlistKey,
  type QuestionInput,
  type Allowlist,
} from "./content-validation";

// All fixtures here are SYNTHETIC — never the real corpus. The corpus is
// exercised only by src/lib/__tests__/length-bias-corpus.test.ts.

const q = (
  correct: string,
  distractors: string[],
  text = "Synthetic question?"
): QuestionInput => ({
  question_text: text,
  options: [
    { text: correct, isCorrect: true },
    ...distractors.map((t) => ({ text: t, isCorrect: false })),
  ],
});

describe("validateQuestion — compliant cases return null", () => {
  it("correct strictly in the middle of the length range", () => {
    // correct=8, distractors=4,8(max? no) ... correct between min and max
    expect(
      validateQuestion(q("12345678", ["1234", "123456789012", "123456"]), "naruto", "easy")
    ).toBeNull();
  });

  it("correct tied for longest is compliant (tie at max allowed)", () => {
    // correct len 6, a distractor also len 6 (the max) → correct <= max(distractor)
    expect(
      validateQuestion(q("AAAAAA", ["BBBBBB", "CC", "DDD"]), "naruto", "easy")
    ).toBeNull();
  });

  it("correct tied for shortest is compliant (tie at min allowed)", () => {
    // correct len 2, a distractor also len 2 (the min)
    expect(
      validateQuestion(q("AA", ["BB", "CCCCCC", "DDD"]), "naruto", "easy")
    ).toBeNull();
  });

  it("all four options identical length → null", () => {
    expect(
      validateQuestion(q("AAAA", ["BBBB", "CCCC", "DDDD"]), "death-note", "hard")
    ).toBeNull();
  });

  it("trims whitespace before measuring (padded correct is still tied)", () => {
    // raw "  AAAA  " is 8 chars; trimmed 4 — equal to distractors → compliant
    expect(
      validateQuestion(q("  AAAA  ", ["BBBB", "CCCC", "DDDD"]), "naruto", "easy")
    ).toBeNull();
  });

  it("Unicode macron counted as code points, not bytes (compliant tie)", () => {
    // "Shōnen" = 6 code points (ō is one U+014D); 7 UTF-8 bytes.
    // Byte-counting would flag strictly-longest; code-point counting → tie → null.
    expect(
      validateQuestion(q("Shōnen", ["Naruto", "Sasuke", "Sakura"]), "naruto", "medium")
    ).toBeNull();
  });
});

describe("validateQuestion — violations", () => {
  it("strictly-longest: correct longer than every distractor", () => {
    const v = validateQuestion(
      q("This correct answer is clearly the longest", ["Short", "Tiny", "Brief"]),
      "demon-slayer",
      "hard"
    );
    expect(v).not.toBeNull();
    expect(v!.kind).toBe("strictly-longest");
    expect(v!.anime).toBe("demon-slayer");
    expect(v!.tier).toBe("hard");
    expect(v!.correct).toBe("This correct answer is clearly the longest");
    expect(v!.distractors).toEqual(["Short", "Tiny", "Brief"]);
  });

  it("strictly-shortest: correct shorter than every distractor", () => {
    const v = validateQuestion(
      q("Nine", ["Seven", "Eight", "Thirteen"]),
      "attack-on-titan",
      "impossible"
    );
    expect(v).not.toBeNull();
    expect(v!.kind).toBe("strictly-shortest");
    expect(v!.questionText).toBe("Synthetic question?");
  });

  it("Unicode: macron correct that is genuinely longest still flags", () => {
    const v = validateQuestion(
      q("Bessatsu Shōnen Magazine", ["Weekly Shōnen Jump", "X", "Y"]),
      "attack-on-titan",
      "impossible"
    );
    expect(v).not.toBeNull();
    expect(v!.kind).toBe("strictly-longest");
  });

  it("single-character options edge case behaves correctly", () => {
    // correct "A" (1) shorter than distractors "BB"(2) "CC"(2) "DD"(2) → strictly-shortest
    const v = validateQuestion(q("A", ["BB", "CC", "DD"]), "one-piece", "easy");
    expect(v!.kind).toBe("strictly-shortest");
    // correct "ZZZ" (3) longer than "A","B","C" (1) → strictly-longest
    expect(
      validateQuestion(q("ZZZ", ["A", "B", "C"]), "one-piece", "easy")!.kind
    ).toBe("strictly-longest");
  });
});

describe("allowlistKey", () => {
  const base = {
    anime: "demon-slayer",
    tier: "easy",
    questionText: "What is the name of the main character?",
  };

  it("is deterministic: same anime/tier/text → same key", () => {
    expect(allowlistKey(base)).toBe(allowlistKey({ ...base }));
  });

  it("is 16 lowercase hex chars", () => {
    expect(allowlistKey(base)).toMatch(/^[0-9a-f]{16}$/);
  });

  it("changes when anime differs", () => {
    expect(allowlistKey({ ...base, anime: "naruto" })).not.toBe(allowlistKey(base));
  });

  it("changes when tier differs", () => {
    expect(allowlistKey({ ...base, tier: "hard" })).not.toBe(allowlistKey(base));
  });

  it("changes when question text differs", () => {
    expect(allowlistKey({ ...base, questionText: "Different?" })).not.toBe(
      allowlistKey(base)
    );
  });
});

describe("validateCorpus", () => {
  const longestItem = {
    anime: "demon-slayer",
    tier: "hard",
    question: q("A very long correct answer indeed", ["a", "b", "c"], "Q-long?"),
  };
  const shortestItem = {
    anime: "one-piece",
    tier: "easy",
    question: q("No", ["Maybe", "Definitely", "Perhaps"], "Q-short?"),
  };
  const compliantItem = {
    anime: "naruto",
    tier: "medium",
    question: q("AAAA", ["BBBB", "CCCC", "DDDD"], "Q-ok?"),
  };

  const keyOf = (anime: string, tier: string, questionText: string) =>
    allowlistKey({ anime, tier, questionText });

  it("residual = all violations minus allowlisted; non-stale allowlist clean", () => {
    const allowlist: Allowlist = {
      version: 1,
      generatedAt: "2026-05-18T00:00:00.000Z",
      entries: [
        {
          key: keyOf("demon-slayer", "hard", "Q-long?"),
          anime: "demon-slayer",
          tier: "hard",
          questionTextPrefix: "Q-long?",
          kind: "strictly-longest",
        },
      ],
    };
    const res = validateCorpus(
      [longestItem, shortestItem, compliantItem],
      allowlist
    );
    // longest is allowlisted → only the shortest violation remains residual
    expect(res.violations).toHaveLength(1);
    expect(res.violations[0].kind).toBe("strictly-shortest");
    expect(res.violations[0].anime).toBe("one-piece");
    // the single allowlist entry still corresponds to a real violation
    expect(res.unexpectedlyCompliant).toHaveLength(0);
  });

  it("fully allowlisted corpus → zero residual violations", () => {
    const allowlist: Allowlist = {
      version: 1,
      generatedAt: "2026-05-18T00:00:00.000Z",
      entries: [
        {
          key: keyOf("demon-slayer", "hard", "Q-long?"),
          anime: "demon-slayer",
          tier: "hard",
          questionTextPrefix: "Q-long?",
          kind: "strictly-longest",
        },
        {
          key: keyOf("one-piece", "easy", "Q-short?"),
          anime: "one-piece",
          tier: "easy",
          questionTextPrefix: "Q-short?",
          kind: "strictly-shortest",
        },
      ],
    };
    const res = validateCorpus(
      [longestItem, shortestItem, compliantItem],
      allowlist
    );
    expect(res.violations).toHaveLength(0);
    expect(res.unexpectedlyCompliant).toHaveLength(0);
  });

  it("flags stale allowlist entry that no longer matches any violation", () => {
    const allowlist: Allowlist = {
      version: 1,
      generatedAt: "2026-05-18T00:00:00.000Z",
      entries: [
        {
          key: keyOf("demon-slayer", "hard", "Q-long?"),
          anime: "demon-slayer",
          tier: "hard",
          questionTextPrefix: "Q-long?",
          kind: "strictly-longest",
        },
        {
          key: keyOf("ghost-anime", "easy", "Question that was fixed?"),
          anime: "ghost-anime",
          tier: "easy",
          questionTextPrefix: "Question that was fixed?",
          kind: "strictly-shortest",
        },
      ],
    };
    // Only the longest+compliant items present (shortest "fixed"/removed)
    const res = validateCorpus([longestItem, compliantItem], allowlist);
    expect(res.violations).toHaveLength(0);
    expect(res.unexpectedlyCompliant).toHaveLength(1);
    expect(res.unexpectedlyCompliant[0].anime).toBe("ghost-anime");
  });
});
