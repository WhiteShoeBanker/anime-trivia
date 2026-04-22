import { describe, it, expect } from "vitest";
import {
  EnvValidationError,
  validateHttpsUrl,
  validateSupabaseJwt,
  parseAdminEmails,
} from "./validators";

const FILE = "src/lib/env/test.ts";

describe("validateHttpsUrl", () => {
  it("returns the trimmed value for a valid https URL", () => {
    expect(validateHttpsUrl("FOO_URL", "https://example.com", FILE)).toBe(
      "https://example.com"
    );
  });

  it("trims surrounding whitespace before validating", () => {
    expect(validateHttpsUrl("FOO_URL", "  https://example.com  ", FILE)).toBe(
      "https://example.com"
    );
  });

  it("throws EnvValidationError when undefined", () => {
    expect(() => validateHttpsUrl("FOO_URL", undefined, FILE)).toThrow(
      EnvValidationError
    );
  });

  it("throws when empty string", () => {
    expect(() => validateHttpsUrl("FOO_URL", "", FILE)).toThrow(
      /FOO_URL is missing or empty/
    );
  });

  it("throws when whitespace only", () => {
    expect(() => validateHttpsUrl("FOO_URL", "   ", FILE)).toThrow(
      /FOO_URL is missing or empty/
    );
  });

  it("throws when scheme is http (not https)", () => {
    expect(() =>
      validateHttpsUrl("FOO_URL", "http://example.com", FILE)
    ).toThrow(/not a valid https URL/);
  });

  it("throws when scheme is missing", () => {
    expect(() => validateHttpsUrl("FOO_URL", "example.com", FILE)).toThrow(
      /not a valid https URL/
    );
  });

  it("error message names the var, expected format, and read-in file", () => {
    try {
      validateHttpsUrl("NEXT_PUBLIC_SUPABASE_URL", undefined, FILE);
    } catch (e) {
      const msg = (e as Error).message;
      expect(msg).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(msg).toContain("https://");
      expect(msg).toContain(FILE);
    }
  });
});

describe("validateSupabaseJwt", () => {
  it("returns the trimmed value for a valid-looking JWT", () => {
    expect(validateSupabaseJwt("FOO_KEY", "eyJabc.def.ghi", FILE)).toBe(
      "eyJabc.def.ghi"
    );
  });

  it("throws when undefined", () => {
    expect(() => validateSupabaseJwt("FOO_KEY", undefined, FILE)).toThrow(
      /FOO_KEY is missing or empty/
    );
  });

  it("throws when empty", () => {
    expect(() => validateSupabaseJwt("FOO_KEY", "", FILE)).toThrow(
      EnvValidationError
    );
  });

  it("throws when value does not start with 'eyJ'", () => {
    expect(() => validateSupabaseJwt("FOO_KEY", "abcdef", FILE)).toThrow(
      /does not look like a Supabase JWT/
    );
  });

  it("error message names the var and read-in file", () => {
    try {
      validateSupabaseJwt("SUPABASE_SERVICE_ROLE_KEY", "nope", FILE);
    } catch (e) {
      const msg = (e as Error).message;
      expect(msg).toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(msg).toContain(FILE);
    }
  });
});

describe("parseAdminEmails", () => {
  it("returns empty arrays when undefined (admin disabled)", () => {
    expect(parseAdminEmails(undefined)).toEqual({ emails: [], malformed: [] });
  });

  it("returns empty arrays when empty string", () => {
    expect(parseAdminEmails("")).toEqual({ emails: [], malformed: [] });
  });

  it("returns empty arrays when whitespace only", () => {
    expect(parseAdminEmails("   ")).toEqual({ emails: [], malformed: [] });
  });

  it("parses a single email", () => {
    expect(parseAdminEmails("alice@example.com")).toEqual({
      emails: ["alice@example.com"],
      malformed: [],
    });
  });

  it("parses multiple comma-separated emails", () => {
    expect(parseAdminEmails("alice@example.com,bob@example.com")).toEqual({
      emails: ["alice@example.com", "bob@example.com"],
      malformed: [],
    });
  });

  it("tolerates whitespace around entries", () => {
    expect(
      parseAdminEmails("  alice@example.com ,  bob@example.com  ")
    ).toEqual({
      emails: ["alice@example.com", "bob@example.com"],
      malformed: [],
    });
  });

  it("lowercases emails so allowlist matching is case-insensitive", () => {
    expect(parseAdminEmails("Alice@Example.COM")).toEqual({
      emails: ["alice@example.com"],
      malformed: [],
    });
  });

  it("drops blank entries from trailing/double commas", () => {
    expect(parseAdminEmails("alice@example.com,,")).toEqual({
      emails: ["alice@example.com"],
      malformed: [],
    });
  });

  it("reports malformed entries separately without dropping valid ones", () => {
    expect(
      parseAdminEmails("alice@example.com, not-an-email, bob@example.com")
    ).toEqual({
      emails: ["alice@example.com", "bob@example.com"],
      malformed: ["not-an-email"],
    });
  });

  it("reports a malformed-only input as no admins, all malformed", () => {
    expect(parseAdminEmails("garbage")).toEqual({
      emails: [],
      malformed: ["garbage"],
    });
  });
});
