import { test, expect } from "@playwright/test";
import { E2E_USERS, getAdmin, resetUsers } from "./fixtures/seed-users";
import { signIn } from "./fixtures/auth-helpers";

/**
 * Bucket #4 — Daily quiz limit is server-authoritative.
 *
 * Pre-fix: the daily cap was enforced only in client-side localStorage
 * (and the localStorage hint is still rendered for UX), so a free user
 * could clear the key and play unlimited quizzes. The fix moved the gate
 * into the start_quiz RPC, which atomically increments daily_quiz_count
 * and refuses to start a new quiz once the cap is hit — including the
 * "Play Again" path that re-enters handleStartQuiz from the results screen.
 *
 * Strategy: pre-set daily_quiz_count to (limit - 1) so a single play
 * exhausts the cap. Then click Play Again and assert the limit screen.
 *
 * Source of truth for the limit: src/lib/admin-config.ts DEFAULTS,
 * possibly overridden by an admin_config row. We query both and prefer
 * the row when present, mirroring getConfig().
 */

const FREE_QUIZ_LIMIT_KEY = "free_quiz_limit";
const DEFAULT_FREE_QUIZ_LIMIT = 10;

async function getFreeQuizLimit(): Promise<number> {
  const admin = getAdmin();
  const { data } = await admin
    .from("admin_config")
    .select("value")
    .eq("key", FREE_QUIZ_LIMIT_KEY)
    .maybeSingle();
  // admin_config.value is jsonb. The DEFAULTS map stores plain numbers,
  // so callers of getConfig<number>("free_quiz_limit") get either a
  // primitive number or a JSON-parsed value that should also be a number.
  if (typeof data?.value === "number") return data.value;
  return DEFAULT_FREE_QUIZ_LIMIT;
}

async function getUserId(email: string): Promise<string> {
  const admin = getAdmin();
  const { data } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const id = data.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )?.id;
  if (!id) throw new Error(`User ${email} not seeded`);
  return id;
}

test.describe("Daily quiz limit is enforced server-side, including Play Again", () => {
  // Event-based waits make the loop fast, but a full quiz playthrough plus
  // sign-in, nav, and the server limit round-trip still needs more than the
  // default 30s budget. Give this spec a realistic ceiling.
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async () => {
    await resetUsers();
  });

  test("free user hits the cap and Play Again shows Daily Limit Reached", async ({
    page,
  }) => {
    const fullUser = E2E_USERS.find((u) => u.ageGroup === "full")!;
    const limit = await getFreeQuizLimit();

    // Pre-bump the count so one quiz reaches the cap exactly.
    const admin = getAdmin();
    const userId = await getUserId(fullUser.email);
    const { error: bumpError } = await admin
      .from("user_profiles")
      .update({
        daily_quiz_count: limit - 1,
        daily_quiz_reset: new Date().toISOString().slice(0, 10),
      })
      .eq("id", userId);
    if (bumpError) throw bumpError;

    await signIn(page, fullUser.email);

    // Naruto is E-rated so accessible to every age tier; safe choice.
    await page.goto("/quiz/naruto");
    await expect(
      page.getByRole("heading", { name: "Naruto" })
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Start Quiz" }).click();

    // Read the total question count off the progress bar once the first
    // question renders. The quiz is capped at 10 but may be shorter if
    // the anime/difficulty combo has fewer questions.
    const progressLocator = page
      .getByText(/\d+ of \d+ Questions/)
      .first();
    await expect(progressLocator).toBeVisible({ timeout: 15_000 });
    const firstProgress = await progressLocator.textContent();
    const totalMatch = firstProgress?.match(/\d+ of (\d+) Questions/);
    if (!totalMatch) {
      throw new Error(
        `Could not parse total question count from: ${firstProgress}`
      );
    }
    const totalQuestions = Number(totalMatch[1]);

    // Play through every question by tapping option A. The QuizCard
    // auto-confirms on selection and auto-advances after a ~2s reveal.
    // Rather than sleep a fixed 2.3s per question, wait for the progress
    // bar text to change to the next question number — this naturally
    // covers reveal + auto-advance without over-waiting.
    for (let i = 1; i <= totalQuestions; i++) {
      await expect(
        page.getByText(new RegExp(`^${i} of ${totalQuestions} Questions$`))
      ).toBeVisible({ timeout: 10_000 });

      await page.getByRole("radio", { name: /^Option A:/ }).first().click();
    }

    // After answering the last question, the Results screen should render.
    await expect(
      page.getByRole("button", { name: "Play Again" })
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Play Again" }).click();

    // Server gate should refuse the second start.
    await expect(page.getByText("Daily Limit Reached")).toBeVisible({
      timeout: 10_000,
    });
    // And we should NOT have transitioned into a new quiz.
    await expect(
      page.getByRole("radio", { name: /^Option A:/ })
    ).toHaveCount(0);
  });
});
