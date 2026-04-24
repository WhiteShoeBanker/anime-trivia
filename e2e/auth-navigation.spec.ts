import { test, expect } from "@playwright/test";
import { E2E_USERS, resetUsers } from "./fixtures/seed-users";
import { submitSignInForm } from "./fixtures/auth-helpers";

/**
 * Regression — sign-in must navigate to /browse.
 *
 * During the Phase B audit we observed a production bug where a successful
 * email sign-in left the user stuck on /auth: auth succeeded but
 * router.push("/browse") produced no navigation. The middleware cookie
 * propagation fix (Fix 1 + Fix 2) resolved it as a side effect — no
 * explicit router change was shipped. This test pins the correct behavior
 * so that a future change to the auth handler, router, or middleware
 * cannot silently re-break it.
 */

test.describe("Sign in navigates to /browse", () => {
  test.beforeEach(async () => {
    await resetUsers();
  });

  test("successful email sign-in lands on /browse within 5s", async ({
    page,
  }) => {
    const fullUser = E2E_USERS.find((u) => u.ageGroup === "full")!;

    await submitSignInForm(page, fullUser.email);

    // The regression under test is a slow/absent client-side navigation
    // after the auth RPC succeeds. A 5s ceiling is tight enough to catch
    // "push silently no-ops" without being flaky on a warm dev server.
    await page.waitForURL("**/browse", { timeout: 5_000 });

    // Confirm we actually rendered /browse and didn't just land on a URL
    // that happens to match (e.g. an error boundary or a junior-gated
    // redirect). "Choose Your Anime" is the h1 of BrowseContent.
    await expect(
      page.getByRole("heading", { name: "Choose Your Anime" })
    ).toBeVisible();
  });
});
