/**
 * Sign-in navigation diagnostic against production.
 *
 * Reproduces, in a real Chromium, the exact bug observed on prod: email
 * sign-in at https://anime-trivia-iota.vercel.app/auth succeeds
 * (cookie set, AuthContext picks up the user, badge renders) but the page
 * fails to navigate to /browse. Manual URL entry works afterwards.
 *
 * This script does NOT use the e2e helpers. It mirrors what a real user does:
 *   - opens a fresh browser context (no storageState)
 *   - goes to /auth
 *   - clicks the "Already have an account? Sign In" link
 *   - fills email + password
 *   - clicks the submit <button type="submit">Sign In</button>
 *   - captures a 10s timeline of navigation, network, and console events
 *   - reports the final URL
 *
 * Run with:  pnpm tsx scripts/verify-prod-signin-nav.ts
 */

import { chromium, type Request, type Response, type ConsoleMessage } from "@playwright/test";

const PROD = "https://anime-trivia-iota.vercel.app";
const EMAIL = "e2e-junior@otakuquiz.test";
const PASSWORD = "E2ETestPass123!";
const POST_SUBMIT_WATCH_MS = 10_000;

interface TimelineEvent {
  t: number;
  kind: string;
  detail: string;
}

async function main() {
  console.log(`[signin-nav-diag] PROD=${PROD}`);
  console.log(`[signin-nav-diag] Launching Chromium (headless)`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timeline: TimelineEvent[] = [];
  const start = Date.now();
  const now = () => Date.now() - start;
  const push = (kind: string, detail: string) =>
    timeline.push({ t: now(), kind, detail });

  page.on("console", (msg: ConsoleMessage) => {
    push(`console.${msg.type()}`, msg.text());
  });
  page.on("pageerror", (err) => {
    push("pageerror", err.message);
  });
  page.on("request", (req: Request) => {
    const rt = req.resourceType();
    if (rt === "image" || rt === "stylesheet" || rt === "font" || rt === "media") {
      return;
    }
    push(">>REQ", `${req.method()} ${rt} ${req.url()}`);
  });
  page.on("response", async (res: Response) => {
    const req = res.request();
    const rt = req.resourceType();
    if (rt === "image" || rt === "stylesheet" || rt === "font" || rt === "media") {
      return;
    }
    const loc = res.headers()["location"];
    const scHeaders = (await res.headersArray()).filter(
      (h) => h.name.toLowerCase() === "set-cookie"
    );
    const scSummary = scHeaders
      .map((h) => {
        const name = h.value.split("=")[0];
        return name;
      })
      .join(",");
    const extras: string[] = [];
    if (loc) extras.push(`loc=${loc}`);
    if (scSummary) extras.push(`set-cookie=${scSummary}`);
    push(
      "<<RES",
      `${res.status()} ${req.method()} ${rt} ${res.url()}${extras.length ? " " + extras.join(" ") : ""}`
    );
  });
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      push("framenavigated", frame.url());
    }
  });
  page.on("domcontentloaded", () => push("domcontentloaded", page.url()));
  page.on("load", () => push("load", page.url()));

  push("script", `goto ${PROD}/auth`);
  console.log(`[signin-nav-diag] goto ${PROD}/auth`);
  await page.goto(`${PROD}/auth`, { waitUntil: "domcontentloaded" });

  push("script", `clicking "Already have an account? Sign In" footer link`);
  console.log(`[signin-nav-diag] switching to sign-in mode`);
  await page
    .getByText("Already have an account?")
    .getByRole("button", { name: "Sign In", exact: true })
    .click();

  await page
    .getByRole("heading", { name: "Welcome Back!" })
    .waitFor({ timeout: 5_000 });
  push("script", `sign-in form visible`);

  console.log(`[signin-nav-diag] filling credentials`);
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);

  // Mirror a real user's submit: click the <button type="submit">Sign In</button>
  // inside the form, not press("Enter") on the password field (which is what
  // the existing e2e helper does and may sidestep the bug).
  const submitBtn = page.locator('form button[type="submit"]');
  const submitBtnText = await submitBtn.textContent();
  push(
    "script",
    `submit button found: text=${JSON.stringify(submitBtnText?.trim())}`
  );

  const submitAt = now();
  push("ACTION", `>>> clicking real submit button`);
  console.log(`[signin-nav-diag] clicking submit button at +${submitAt}ms`);
  await submitBtn.click();

  console.log(`[signin-nav-diag] watching for ${POST_SUBMIT_WATCH_MS}ms`);
  await page.waitForTimeout(POST_SUBMIT_WATCH_MS);

  const finalUrl = page.url();
  push("FINAL", `url=${finalUrl}`);

  timeline.sort((a, b) => a.t - b.t);

  console.log(`\n========== TIMELINE (submit fired at +${submitAt}ms) ==========\n`);
  for (const ev of timeline) {
    const tag = ev.t >= submitAt ? "*" : " ";
    console.log(`${tag}[${String(ev.t).padStart(6, " ")}ms] ${ev.kind}: ${ev.detail}`);
  }

  const cookies = await context.cookies();
  console.log(`\n========== COOKIES (${cookies.length}) ==========`);
  for (const c of cookies) {
    console.log(
      `  - ${c.name} (domain=${c.domain}, path=${c.path}, len=${c.value.length}, httpOnly=${c.httpOnly}, secure=${c.secure})`
    );
  }

  console.log(`\n========== VERDICT ==========`);
  console.log(`submit fired at:        +${submitAt}ms`);
  console.log(`final url:              ${finalUrl}`);
  console.log(`expected final url:     ${PROD}/browse`);
  console.log(`navigated to /browse?:  ${finalUrl.includes("/browse")}`);

  await browser.close();

  if (!finalUrl.includes("/browse")) {
    console.log(`\n[signin-nav-diag] BUG REPRODUCED — sign-in did not navigate.`);
    process.exit(2);
  }
  console.log(`\n[signin-nav-diag] No bug observed — sign-in navigated as expected.`);
}

main().catch((e) => {
  console.error("[signin-nav-diag] FAILED:", e);
  process.exit(1);
});
