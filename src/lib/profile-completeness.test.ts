import { describe, it, expect } from "vitest";
import { profileNeedsCompletion } from "./profile-completeness";

describe("profileNeedsCompletion — age-verification invariant", () => {
  it("redirects when age_group is null (fresh signup after the fix)", () => {
    expect(profileNeedsCompletion({ age_group: null }, false)).toBe(true);
  });

  it("redirects when the profile row is missing", () => {
    // Trigger hasn't fired yet, or row was deleted — treat as unverified
    expect(profileNeedsCompletion(null, false)).toBe(true);
  });

  it("passes a user whose age_group is 'full'", () => {
    expect(profileNeedsCompletion({ age_group: "full" }, false)).toBe(false);
  });

  it("passes a user whose age_group is 'teen'", () => {
    expect(profileNeedsCompletion({ age_group: "teen" }, false)).toBe(false);
  });

  it("passes a user whose age_group is 'junior'", () => {
    expect(profileNeedsCompletion({ age_group: "junior" }, false)).toBe(false);
  });

  it("fails open on a query error (don't trap users in a redirect loop)", () => {
    // null profile + error → fail open, let request through
    expect(profileNeedsCompletion(null, true)).toBe(false);
  });

  it("fails open on a query error even when profile looks incomplete", () => {
    // If the query errored, we cannot trust either field.
    expect(profileNeedsCompletion({ age_group: null }, true)).toBe(false);
  });

  it("treats undefined age_group the same as null", () => {
    // Defensive: Supabase .select can return undefined fields in edge cases
    expect(
      profileNeedsCompletion(
        { age_group: undefined as unknown as string | null },
        false
      )
    ).toBe(true);
  });

  it("does not treat the string 'null' as null (sanity check)", () => {
    // age_group is CHECKed to be in ('junior','teen','full'), but belt-and-
    // suspenders: a literal string is a completed profile.
    expect(profileNeedsCompletion({ age_group: "null" }, false)).toBe(false);
  });
});
