// Pure validation helpers for environment variables.
// No side effects, no env reads — safe to unit test in isolation.
// Errors include the var name, expected format, and the file the value is read in
// so missing/malformed config surfaces a clear, actionable message.

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvValidationError";
  }
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateHttpsUrl = (
  name: string,
  value: string | undefined,
  readIn: string
): string => {
  if (value === undefined || value.trim() === "") {
    throw new EnvValidationError(
      `${name} is missing or empty. Expected format: https://yourproject.supabase.co. Read in ${readIn}.`
    );
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith("https://")) {
    throw new EnvValidationError(
      `${name} is not a valid https URL (must start with "https://"). Got: "${trimmed}". Expected format: https://yourproject.supabase.co. Read in ${readIn}.`
    );
  }
  try {
    new URL(trimmed);
  } catch {
    throw new EnvValidationError(
      `${name} is not a parseable URL. Got: "${trimmed}". Expected format: https://yourproject.supabase.co. Read in ${readIn}.`
    );
  }
  return trimmed;
};

export const validateSupabaseJwt = (
  name: string,
  value: string | undefined,
  readIn: string
): string => {
  if (value === undefined || value.trim() === "") {
    throw new EnvValidationError(
      `${name} is missing or empty. Expected a Supabase JWT (starts with "eyJ"). Read in ${readIn}.`
    );
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith("eyJ")) {
    throw new EnvValidationError(
      `${name} does not look like a Supabase JWT (must start with "eyJ"). Read in ${readIn}.`
    );
  }
  return trimmed;
};

export interface AdminEmailsResult {
  emails: string[];
  malformed: string[];
}

// Parse ADMIN_EMAILS into a normalized list. Whitespace tolerated, blank
// entries dropped, malformed entries reported separately so the caller can
// log them without failing the whole list. An undefined or empty input is a
// valid deploy state ("no admin access") and returns empty arrays.
export const parseAdminEmails = (value: string | undefined): AdminEmailsResult => {
  if (value === undefined || value.trim() === "") {
    return { emails: [], malformed: [] };
  }

  const emails: string[] = [];
  const malformed: string[] = [];

  for (const raw of value.split(",")) {
    const entry = raw.trim();
    if (entry === "") continue;
    if (EMAIL_SHAPE.test(entry)) {
      emails.push(entry.toLowerCase());
    } else {
      malformed.push(entry);
    }
  }

  return { emails, malformed };
};
