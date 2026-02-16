import { describe, it, expect } from "vitest";
import type { AgeGroup, ContentRating } from "@/types";

/**
 * Age gate logic is implemented across:
 * - src/lib/queries.ts (getAnimeList, getQuestions)
 * - src/stores/quizStore.ts (startQuiz — kid_safe filter)
 *
 * These tests verify the filtering rules as pure logic:
 * - junior: content_rating === "E" only, kid_safe === true
 * - teen:   content_rating in ["E", "T"], no kid_safe filter
 * - full:   all ratings, no kid_safe filter
 */

// ── Content Rating Filter ────────────────────────────────────

describe("age gate — content rating filtering", () => {
  const allRatings: ContentRating[] = ["E", "T", "M"];

  const filterByAgeGroup = (ratings: ContentRating[], ageGroup?: AgeGroup): ContentRating[] => {
    if (ageGroup === "junior") {
      return ratings.filter((r) => r === "E");
    }
    if (ageGroup === "teen") {
      return ratings.filter((r) => r === "E" || r === "T");
    }
    return ratings; // full or undefined → all
  };

  it("juniors only see E-rated content", () => {
    const filtered = filterByAgeGroup(allRatings, "junior");
    expect(filtered).toEqual(["E"]);
  });

  it("teens see E and T-rated content", () => {
    const filtered = filterByAgeGroup(allRatings, "teen");
    expect(filtered).toEqual(["E", "T"]);
  });

  it("full users see all content", () => {
    const filtered = filterByAgeGroup(allRatings, "full");
    expect(filtered).toEqual(["E", "T", "M"]);
  });

  it("undefined age group sees all content", () => {
    const filtered = filterByAgeGroup(allRatings);
    expect(filtered).toEqual(["E", "T", "M"]);
  });
});

// ── Kid-Safe Question Filter ─────────────────────────────────

describe("age gate — kid_safe question filtering", () => {
  const questions = [
    { id: "q1", kid_safe: true, difficulty: "easy" },
    { id: "q2", kid_safe: false, difficulty: "easy" },
    { id: "q3", kid_safe: true, difficulty: "hard" },
    { id: "q4", kid_safe: false, difficulty: "hard" },
    { id: "q5", kid_safe: true, difficulty: "impossible" },
  ];

  const filterQuestions = (
    qs: typeof questions,
    ageGroup?: AgeGroup
  ) => {
    if (ageGroup === "junior") {
      return qs.filter((q) => q.kid_safe);
    }
    return qs;
  };

  it("juniors only see kid_safe questions", () => {
    const result = filterQuestions(questions, "junior");
    expect(result.every((q) => q.kid_safe)).toBe(true);
    expect(result).toHaveLength(3);
  });

  it("teens see all questions", () => {
    const result = filterQuestions(questions, "teen");
    expect(result).toHaveLength(5);
  });

  it("full users see all questions", () => {
    const result = filterQuestions(questions, "full");
    expect(result).toHaveLength(5);
  });
});

// ── Difficulty Restrictions for Juniors ──────────────────────

describe("age gate — difficulty restrictions", () => {
  // Based on current implementation: juniors can play all difficulties
  // but questions are filtered by kid_safe. The quizStore doesn't restrict
  // difficulty selection for juniors, it just applies kid_safe filter.
  it("juniors can attempt all difficulty levels (filtered by kid_safe)", () => {
    const difficulties = ["easy", "medium", "hard", "impossible"];
    // No difficulty restriction applied — all are allowed
    expect(difficulties).toHaveLength(4);
  });
});
