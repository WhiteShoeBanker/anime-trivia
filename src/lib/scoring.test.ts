import { describe, it, expect } from "vitest";
import { calculateQuestionXP, getRank, calculateMaxScore } from "./scoring";

// ── calculateQuestionXP ──────────────────────────────────────

describe("calculateQuestionXP", () => {
  it("returns correct base XP for easy (10)", () => {
    // streak = 0 → multiplier 1.0, timeMs > 5000 → no time bonus
    expect(calculateQuestionXP("easy", 0, 6000, 30000)).toBe(10);
  });

  it("returns correct base XP for medium (25)", () => {
    expect(calculateQuestionXP("medium", 0, 6000, 20000)).toBe(25);
  });

  it("returns correct base XP for hard (50)", () => {
    expect(calculateQuestionXP("hard", 0, 6000, 15000)).toBe(50);
  });

  it("returns correct base XP for impossible (100)", () => {
    // impossible time bonus threshold is 3000ms, so 4000ms = no bonus
    expect(calculateQuestionXP("impossible", 0, 4000, 5000)).toBe(100);
  });

  // Streak multiplier tests
  it("applies streak multiplier correctly (streak=5 → 1.5x)", () => {
    // 25 * 1.5 * 1.0 = 37.5 → 38
    expect(calculateQuestionXP("medium", 5, 6000, 20000)).toBe(38);
  });

  it("caps streak multiplier at 2.0 (streak=10+)", () => {
    // 25 * 2.0 * 1.0 = 50
    expect(calculateQuestionXP("medium", 10, 6000, 20000)).toBe(50);
    // streak=15 should also cap at 2.0
    expect(calculateQuestionXP("medium", 15, 6000, 20000)).toBe(50);
  });

  it("applies time bonus (1.5x) when timeMs < 5000 for non-impossible", () => {
    // 10 * 1.0 * 1.5 = 15
    expect(calculateQuestionXP("easy", 0, 4000, 30000)).toBe(15);
  });

  it("applies time bonus with impossible threshold (3000ms)", () => {
    // impossible: time bonus threshold = 3000ms
    // 100 * 1.0 * 1.5 = 150
    expect(calculateQuestionXP("impossible", 0, 2000, 5000)).toBe(150);
    // At exactly 3000ms → no bonus (not <3000)
    expect(calculateQuestionXP("impossible", 0, 3000, 5000)).toBe(100);
  });

  it("combines streak and time bonus", () => {
    // hard: 50 * 1.3 (streak=3) * 1.5 (fast) = 97.5 → 98
    expect(calculateQuestionXP("hard", 3, 4000, 15000)).toBe(98);
  });
});

// ── getRank ─────────────────────────────────────────────────

describe("getRank", () => {
  it("returns Genin for 0 XP", () => {
    const rank = getRank(0);
    expect(rank.name).toBe("Genin");
    expect(rank.minXP).toBe(0);
    expect(rank.nextRankXP).toBe(500);
  });

  it("returns Genin for 499 XP", () => {
    const rank = getRank(499);
    expect(rank.name).toBe("Genin");
    expect(rank.nextRankXP).toBe(500);
  });

  it("returns Chunin for 500 XP", () => {
    const rank = getRank(500);
    expect(rank.name).toBe("Chunin");
    expect(rank.minXP).toBe(500);
    expect(rank.nextRankXP).toBe(2000);
  });

  it("returns Jonin for 2000 XP", () => {
    const rank = getRank(2000);
    expect(rank.name).toBe("Jonin");
    expect(rank.minXP).toBe(2000);
    expect(rank.nextRankXP).toBe(5000);
  });

  it("returns ANBU for 5000 XP", () => {
    const rank = getRank(5000);
    expect(rank.name).toBe("ANBU");
    expect(rank.nextRankXP).toBe(10000);
  });

  it("returns Kage for 10000 XP", () => {
    const rank = getRank(10000);
    expect(rank.name).toBe("Kage");
    expect(rank.nextRankXP).toBe(25000);
  });

  it("returns Hokage for 25000 XP", () => {
    const rank = getRank(25000);
    expect(rank.name).toBe("Hokage");
    expect(rank.nextRankXP).toBeNull();
    expect(rank.progress).toBe(100);
  });

  it("calculates progress percentage correctly", () => {
    // Chunin: 500–2000, at 1250 → (1250 - 500) / (2000 - 500) * 100 = 50%
    const rank = getRank(1250);
    expect(rank.name).toBe("Chunin");
    expect(rank.progress).toBe(50);
  });

  it("caps progress at 100", () => {
    const rank = getRank(50000);
    expect(rank.name).toBe("Hokage");
    expect(rank.progress).toBe(100);
  });
});

// ── calculateMaxScore ────────────────────────────────────────

describe("calculateMaxScore", () => {
  it("calculates max score for 10 easy questions with increasing streak", () => {
    const max = calculateMaxScore("easy", 10);
    // Each question: base 10, timeMs=1000 < 5000 → 1.5x time bonus
    // streak 0: 10*1.0*1.5=15, streak 1: 10*1.1*1.5=17, ...
    expect(max).toBeGreaterThan(0);
    // First question: 10 * 1.0 * 1.5 = 15
    const first = calculateQuestionXP("easy", 0, 1000, 30000);
    expect(first).toBe(15);
  });

  it("calculates max score for 10 hard questions", () => {
    const max = calculateMaxScore("hard", 10);
    expect(max).toBeGreaterThan(0);
    // Should be greater than easy max
    const easyMax = calculateMaxScore("easy", 10);
    expect(max).toBeGreaterThan(easyMax);
  });
});
