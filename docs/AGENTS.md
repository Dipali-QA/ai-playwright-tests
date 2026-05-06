# AGENTS.md — Feature Workflow & Agent Rules

Read this file at the start of every feature workflow. Keep it in context
for the full Planner → Generator → Healer cycle.

This document covers **workflow only**. All `playwright.config.ts`,
project arrays, reporter, and template content live in `docs/SCAFFOLD.md`
— this file links to them rather than duplicating.

---

## Testability prerequisites — confirm at Step 1 before any automation begins

Before writing a single test case, confirm the following with the
dev/product team. These are **testability gaps** that must be closed by
the application, not worked around by the test framework.

### OTP (SMS / Email / WhatsApp)

Playwright controls browsers; it cannot read SMS or WhatsApp messages
directly. Automation requires one of the following on non-prod:

1. **Static OTP for test users** — designated test accounts always
   receive a fixed value (e.g. `123456`). Preferred.
2. **Test API endpoint** — an internal endpoint returns the latest OTP
   for a test user; the test calls it and reads the code.
3. **OTP disabled for test users** — specific accounts skip OTP entirely.
4. **Email OTP read via IMAP / Gmail API** — acceptable fallback; slower.

If none exist, raise as a testability gap. Do not attempt to read real
SMS or WhatsApp messages — it is not a valid automation pattern.

### CAPTCHA

CAPTCHA exists specifically to stop automation. Do not attempt to solve
it. The application must:

1. Disable CAPTCHA entirely in non-prod environments, OR
2. Use official test keys (Google reCAPTCHA test site key, hCaptcha test
   key, Cloudflare Turnstile test key) in non-prod, OR
3. Whitelist test IPs / user agents.

If CAPTCHA is active in the test environment with no bypass, stop and
raise as a testability gap. Never use third-party CAPTCHA-solving
services (2Captcha, Anti-Captcha, etc.) — they are a code smell, often
violate terms of service, and are not a valid automation pattern.

### MFA

If the application uses MFA beyond username + password, confirm that
designated test accounts can either:

1. Have MFA disabled, OR
2. Use TOTP with a known seed the test framework can compute codes from.

### Summary

List any unresolved items above as explicit clarifying questions at the
Step 1 gate. Never invent a workaround in the test framework.

---

## Feature workflow — seven steps with gates

When the user provides an SRS / PRD / feature spec, or asks you to test
a feature with no written spec, follow these steps in order. **You MUST
stop at each GATE and wait for explicit user confirmation before
continuing.**

### Step 1 — Understand the requirements  `[GATE]`

If `docs/[feature]-*` exists, read it fully. Supported formats:

- `.md` / `.txt` — read directly
- `.pdf` — read directly (Claude handles natively)
- `.docx` — read directly; if formatting is lost, ask the user to
  confirm key sections

If the file format is not readable, stop and ask the user to export it
as `.md` or `.pdf` before proceeding.

Identify:

- User roles involved
- Happy path flows
- Negative flows (wrong input, unauthorized, missing data)
- Boundary and edge cases
- Validation rules (field formats, lengths, required fields, error messages)
- Preconditions and postconditions
- Any credentials or roles needed
- **Testability prerequisites** (OTP, CAPTCHA, MFA — see section above)

Then list **clarifying questions** — ambiguities, missing error
messages, undefined roles, unclear validation thresholds, unresolved
testability gaps. Do not guess answers.

**GATE:** Present understanding + questions. Wait for user confirmation
and answers before continuing.

### Step 2 — Run the Planner agent  `[GATE]`

**Path A — SRS exists:** run the Planner with `tests/seed.spec.ts` +
`docs/[feature]-*` in context. Save output to `specs/[feature]-plan.md`.

**Path B — No SRS:** run the Planner with only `tests/seed.spec.ts` and
instruct it to explore the live URL from `tests/seed.spec.ts` to discover
flows. Save to `specs/[feature]-plan.md`.

**GATE:** Present the generated plan to the user for review. Wait for
approval before continuing. This gate is mandatory on Path B and
strongly recommended on Path A.

### Step 3 — Run the Generator agent  `[GATE]`

Run the Generator with `specs/[feature]-plan.md` + `tests/seed.spec.ts`.
Save tests to `tests/[feature]/`. Follow all POM rules in `CLAUDE.md`.

**GATE:** List all generated files — page objects, test files, fixtures
registered — and wait for user confirmation before executing anything.

### Step 4 — Execute  `[GATE on failure]`

Run: `npx playwright test tests/[feature]/`

- **All tests pass** → proceed to Step 6 automatically.
- **Any test fails** → stop and report failures to the user. Wait for
  explicit confirmation before invoking the Healer. The user may
  already know the cause (app down, wrong env, known bug) and want to
  skip healing entirely.

### Step 5 — Heal failures  `[GATE after 3 failures per test]`

Invoke the Healer agent. **After 3 heal attempts on the same test,
STOP.** Do not keep looping. Mark the test as a likely real bug in the
plan file (`specs/[feature]-plan.md`) with the failure reason, and
report to the user. Healing > 3 attempts wastes tokens and usually
indicates a real defect, an incorrect selector strategy, or a misread
spec.

When healing:

- Never adjust the expected result or requirement to pass the test
- See Healer agent rules and Selector debugging sections below for full protocol

### Step 6 — Report

- Generate HTML report to `reports/html`
- Generate JUnit XML report to `reports/junit/results.xml` (for CI integration)
- Provide summary: total / pass / fail / skipped / heal-capped

---

## Playwright agent rules

### Planner agent

- Always include `tests/seed.spec.ts` in context — the Planner **runs**
  this file to bootstrap the environment (global setup, auth, fixtures).
  It also uses it as the style reference for all generated tests.
- Include `docs/[feature]-*` if it exists.
- If no SRS exists, instruct Planner to explore the live URL.
- Save plans to `specs/[feature]-plan.md`.
- Plans must cover positive, negative, edge, and boundary cases. Visual,
  accessibility, and API tests are out of scope for this framework.
- For any feature requiring login: include auth flow coverage.
- Plans must list every page the tests will interact with **or assert
  against** (including post-action landing pages — see POM Rule 11 in
  `CLAUDE.md`), so the Generator creates a page object for each one.
- Human review required before Generator runs (mandatory on Path B).

### Generator agent

- Include `specs/[feature]-plan.md` + `tests/seed.spec.ts` in context.
- `tests/seed.spec.ts` shows the Generator the correct import path,
  fixture usage, and code style — all generated tests must match it.
- Follow all POM rules in `CLAUDE.md`.
- Apply tags from CLAUDE.md Rule 13 to every generated test (`@smoke`
  or `@regression` minimum, plus `@critical` if applicable).
- Save to `tests/[feature]/[scenario].spec.ts`.
- Register every new page object in `fixtures/index.ts`.
- Run tests after generating and report failures.

### Healer agent

- Never change POM structure.
- Fix selectors in page classes, not test files.
- Re-run after each fix.
- **Cap: 3 attempts per test, then stop and escalate.**

---

## Selector debugging — when Healer hits the cap

When the Healer agent exhausts 3 attempts on a test, do not keep
guessing selectors. Use Playwright's built-in tools to find the correct
locator first, then apply it.

### Tools to use

**1. Playwright Inspector — interactive locator picker**

```bash
npx playwright test tests/[feature]/[file].spec.ts --debug
```

Pauses execution at each step and opens the Inspector. Use the "Pick
locator" button to click any element on the live page — Playwright
generates the recommended locator automatically. This is the fastest
path to a correct locator.

**2. Codegen — record interactions as locators**

```bash
npx playwright codegen https://your-app-url.com
```

Opens a browser where every click and fill generates the corresponding
Playwright locator in real time. Useful when you need to re-discover
multiple locators on a page.

**3. `page.pause()` — breakpoint inside a test**

Insert `await page.pause()` directly in the test or page method to
freeze execution at a specific point and open the Inspector mid-flow.
Remove before committing.

```typescript
async login(user: User): Promise<void> {
  await this.usernameField.fill(user.email);
  await this.page.pause(); // ← inspect the DOM here, then remove
  await this.passwordField.fill(user.password);
}
```

### Escalation rule

If debugging with the above tools still does not yield a stable
locator, the element likely has no stable, accessible attribute. At
this point:

1. Stop automation on this specific element.
2. Raise a `data-testid` request with the dev team (see Rule 4 in
   `CLAUDE.md`).
3. Mark the test as BLOCKED in `specs/[feature]-plan.md` with reason:
   `"No stable locator — data-testid requested from dev team"`.
4. Do not invent a fragile CSS chain just to make the test green.

---

## Retry and flakiness policy

Flakiness is a symptom, not something to paper over with retries.

### Configuration

`retries`, `workers`, `reporter`, and `screenshot/trace/video` are
defined once in `playwright.config.ts` — see the canonical template in
`docs/SCAFFOLD.md`. Do not re-define them per test.

### Rules

1. **Local: 0 retries.** Flaky tests must be visible during development.
   Silent retries train developers to ignore flakiness.
2. **CI: 1 retry maximum.** Catches genuine transient issues (network
   blips, runner contention) without masking real flakiness.
3. **Never set `retries: 3` or higher** — at that level, retries are
   hiding bugs.
4. **A test that passes only on retry is a flaky test.** Flaky tests
   MUST be investigated within the same sprint, not accepted as
   "usually works."
5. **Do NOT use `test.retry()` in individual tests** — only global config.
6. **Quarantine pattern for confirmed flaky tests:** tag with `@flaky`,
   exclude from CI via `--grep-invert @flaky`, and open a ticket. Do
   not leave `@flaky` tests in CI indefinitely.

---

## Browser matrix policy

Not every project needs every browser. Over-running multiplies CI cost
and flakiness without adding signal.

### Default policy

- **Chromium — required.** Runs on every PR.
- **Firefox — optional.** Include if the app is consumer-facing or the
  product team has confirmed Firefox usage.
- **WebKit (Safari) — optional.** Include if the app is consumer-facing,
  has iOS users, or is mission-critical on macOS/iOS.
- **Mobile viewports — feature-dependent.** Include only if the feature
  has specific responsive/mobile requirements in the SRS.

### Configuration

The default scaffold enables Chromium only. Cross-browser projects are
defined as commented blocks in the canonical `playwright.config.ts`
template (see `docs/SCAFFOLD.md`) — uncomment when explicitly required.

### Rules

1. Default scaffold enables **Chromium only**.
2. Additional browsers/devices are added explicitly when the SRS or
   product team requires them — never "just in case."
3. If Firefox/WebKit is enabled, tests must pass on all enabled
   browsers before merge.

---

## Reporting and logging

Reporters are configured once in `playwright.config.ts` (see
`docs/SCAFFOLD.md` for the canonical template):

- `list` — console output during local runs
- `html` — written to `reports/html`
- `junit` — written to `reports/junit/results.xml` (CI integration)

### Optional add-ons

- **Allure** — `allure-playwright` and `allure-commandline` are included in the
  default scaffold. Raw results are written to `reports/allure-results/` during
  every test run. To view the report locally, run `npm run report:allure`.
  **Prerequisite:** Java 11+ must be installed on the local machine (`brew install openjdk`
  on macOS, `sudo apt install default-jre` on Ubuntu). CI (`ubuntu-latest`) has Java
  pre-installed — no extra step needed. To view a CI report, download the
  `allure-report-*` artifact and open `index.html` in a browser.

### CI artifact rules

1. HTML report directory uploaded as a CI artifact on every run.
2. JUnit XML consumed by the CI system's native test reporter.
3. Screenshots, videos, and traces retained only on failure.
4. Retention: 14 days for main-branch runs, 7 days for PR runs.
   Configure in the workflow YAML.
5. Allure raw results (`reports/allure-results/`) are generated by the reporter during
   the test run. CI then runs `allure generate` and uploads the resulting HTML report
   (`reports/allure-report/`) as an artifact with the same retention as the HTML report.

### Logging rules

1. No `console.log` in test files or page classes. If diagnostic output
   is needed, use `test.info().annotations` or `test.step()`.
2. `test.step()` is encouraged for long flows — it produces structured
   sections in the HTML report.

```typescript
test('checkout flow @critical', async ({ cartPage, checkoutPage }) => {
  await test.step('proceed to checkout', async () => {
    await cartPage.clickCheckout();
  });
  await test.step('enter customer info', async () => {
    await checkoutPage.fillCustomerInfo(testData.customer);
  });
});
```
