import { describe, it, expect } from "vitest";
import { getLeagueXpMultiplier, getCurrentWeekStart, getPromotionRequirements } from "./league-xp";

// ── getLeagueXpMultiplier (Diminishing Returns) ────────────

describe("getLeagueXpMultiplier", () => {
  it("returns 1.0 (100%) for first play", () => {
    expect(getLeagueXpMultiplier(1)).toBe(1.0);
  });

  it("returns 0.75 (75%) for second play", () => {
    expect(getLeagueXpMultiplier(2)).toBe(0.75);
  });

  it("returns 0.5 (50%) for third play", () => {
    expect(getLeagueXpMultiplier(3)).toBe(0.5);
  });

  it("returns 0.25 (25%) for fourth play", () => {
    expect(getLeagueXpMultiplier(4)).toBe(0.25);
  });

  it("returns 0.1 (10%) for fifth and beyond", () => {
    expect(getLeagueXpMultiplier(5)).toBe(0.1);
    expect(getLeagueXpMultiplier(10)).toBe(0.1);
    expect(getLeagueXpMultiplier(100)).toBe(0.1);
  });

  it("returns 1.0 for playCount <= 1 (including 0)", () => {
    expect(getLeagueXpMultiplier(0)).toBe(1.0);
    expect(getLeagueXpMultiplier(-1)).toBe(1.0);
  });
});

// ── getCurrentWeekStart ─────────────────────────────────────

describe("getCurrentWeekStart", () => {
  it("returns a date string in YYYY-MM-DD format", () => {
    const weekStart = getCurrentWeekStart();
    expect(weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a Monday", () => {
    const weekStart = getCurrentWeekStart();
    const date = new Date(weekStart + "T00:00:00Z");
    // getUTCDay() → 1 = Monday
    expect(date.getUTCDay()).toBe(1);
  });
});

// ── getPromotionRequirements (Breadth Gates) ─────────────────

describe("getPromotionRequirements", () => {
  it("tier 1 → no requirements (entry tier)", () => {
    const req = getPromotionRequirements(1);
    expect(req.minAnime).toBe(0);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(0);
  });

  it("tier 2 → requires 2+ anime", () => {
    const req = getPromotionRequirements(2);
    expect(req.minAnime).toBe(2);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(0);
  });

  it("tier 3 → requires 3+ anime", () => {
    const req = getPromotionRequirements(3);
    expect(req.minAnime).toBe(3);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(0);
  });

  it("tier 4 → requires 5+ anime + hard difficulty", () => {
    const req = getPromotionRequirements(4);
    expect(req.minAnime).toBe(5);
    expect(req.requiresHard).toBe(true);
    expect(req.requiresImpossible).toBe(0);
  });

  it("tier 5 → requires 6+ anime + 2 impossible", () => {
    const req = getPromotionRequirements(5);
    expect(req.minAnime).toBe(6);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(2);
  });

  it("tier 6 → no additional requirements (top tier)", () => {
    const req = getPromotionRequirements(6);
    expect(req.minAnime).toBe(0);
    expect(req.requiresHard).toBe(false);
    expect(req.requiresImpossible).toBe(0);
  });
});
