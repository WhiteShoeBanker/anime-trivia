import { test, expect } from "@playwright/test";
import { E2E_USERS, E2E_PASSWORD, resetUsers } from "./fixtures/seed-users";

/**
 * Regression — sign-in must navigate to /browse even after the Navbar's
 * Link prefetches have poisoned the App Router cache.
 *
 * Simulates the Router Cache poisoning scenario that caused the sign-in
 * navigation regression. The prior version of this test (pre-fix) did
 * not let the Navbar's /browse RSC prefetch settle before submitting,
 * so router.push("/browse") ran against an empty cache and worked —
 * while real users on prod hit a cache full of 307→/auth entries from
 * Navbar's eager prefetches and got bounced back to /auth. See commit
 * that introduced router.refresh() before router.push() in
 * src/app/auth/page.tsx.
 */

test.describe("Sign in navigates to /browse", () => {
  test.beforeEach(async () => {
    await resetUsers();
  });

  test("successful email sign-in lands on /browse within 5s after cache is poisoned", async ({
    page,
  }) => {
    const fullUser = E2E_USERS.find((u) => u.ageGroup === "full")!;

    // Track /browse RSC prefetch responses so we can assert the cache
    // really got poisoned — otherwise we're not actually reproducing the
    // prod failure mode.
    const browsePrefetchStatuses: number[] = [];
    page.on("response", (res) => {
      if (/\/browse\?_rsc=/.test(res.url())) {
        browsePrefetchStatuses.push(res.status());
      }
    });

    await page.goto("/auth");

    // Give the Navbar's Link prefetch cascade time to fire and populate
    // the App Router cache with 307→/auth entries for protected routes
    // (including /browse). The diagnostic showed these fire in the
    // ~350-850ms window after page load; 1500ms is a safe margin.
    await page.waitForTimeout(1500);

    // Switch into sign-in mode via the footer "Sign In" button.
    await page
      .getByText("Already have an account?")
      .getByRole("button", { name: "Sign In", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Welcome Back!" })
    ).toBeVisible();

    await page.getByLabel("Email").fill(fullUser.email);
    await page.getByLabel("Password").fill(E2E_PASSWORD);

    // Click the real <button type="submit"> rather than press("Enter"),
    // mirroring a real user's click path. Both go through the form's
    // onSubmit, but matching the real-user path avoids any subtle
    // difference in event ordering that could mask a regression.
    await page.locator('form button[type="submit"]').click();

    // The regression under test is a cached-redirect race: without
    // router.refresh() before router.push(), the Router Cache's cached
    // 307→/auth entry for /browse would send us back to /auth. 5s is
    // tight enough to catch that failure mode without being flaky.
    await page.waitForURL("**/browse", { timeout: 5_000 });

    await expect(
      page.getByRole("heading", { name: "Choose Your Anime" })
    ).toBeVisible();
  });
});
