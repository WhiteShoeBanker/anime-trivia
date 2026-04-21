/**
 * Shared predicate for "is this user's profile complete enough to browse?"
 *
 * Both middleware and the OAuth callback need the same rule. Keeping it in
 * one place prevents them from drifting and stacking special-case conditions.
 *
 * Rule:
 * - null age_group → user has not passed the age gate; send to completion.
 * - no profile row → trigger hasn't fired or row was removed; treat as
 *   unverified (safer default than passing them through).
 * - query error   → fail open so a transient Supabase failure doesn't trap
 *   authenticated users in a redirect loop.
 */
export interface ProfileCompletenessRow {
  age_group: string | null;
}

export const profileNeedsCompletion = (
  profile: ProfileCompletenessRow | null,
  hadError: boolean
): boolean => {
  if (hadError) return false;
  if (!profile) return true;
  return profile.age_group === null || profile.age_group === undefined;
};
