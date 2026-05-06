# QA Automation — Project Instructions for Claude Code

**CLAUDE.md version:** 3.0 — E2E functional only
**Last updated:** 2026-04-30

This file is read by Claude in every session. It defines the rules for a
Playwright + TypeScript test framework using the Page Object Model.

**Scope:** functional and end-to-end testing only. Visual regression,
accessibility, and API testing are deliberately out of scope. If you need
those later, treat them as separate frameworks rather than extending this one.

---

## Framework overview

| | |
|---|---|
| **Test framework** | Playwright |
| **Language** | TypeScript (strict mode) |
| **Pattern** | Page Object Model (POM) |
| **Scope** | Functional + E2E only |
| **Default browser** | Chromium |

---

## Sub-documents — load before acting

- Setting up a new project → read `docs/SCAFFOLD.md` first, then proceed
- Starting a feature / running agents → read `docs/AGENTS.md` first, then proceed

---

## Commands

- `npm test` — run full suite
- `npm run test:headed` — run with a visible browser
- `npm run test:ui` — Playwright UI mode
- `npm run test:debug` — run in debug mode (Playwright Inspector)
- `npm run test:smoke` — run only tests tagged `@smoke`
- `npm run test:regression` — run only tests tagged `@regression`
- `npm run test:critical` — run only tests tagged `@critical`
- `npm run test:login` — run only the `login-tests` project (no saved session, per Rule C5)
- `npm run report` — open the HTML report from `reports/html`
- `npm run report:allure` — generate Allure HTML report from `reports/allure-results` and open it (requires Java 11+)
- `npm run lint` — run ESLint
- `npm run typecheck` — run `tsc --noEmit`
- Single file: `npx playwright test tests/login/login.spec.ts`
- Single test by title: `npx playwright test tests/login/login.spec.ts -g "wrong password"`
- Single browser project: `npx playwright test --project=chromium`
- Against a different environment: `BASE_URL=https://staging.app.com npx playwright test`

---

## Folder structure (canonical — do not deviate)

```
project-name/
├── CLAUDE.md                  ← this file (identical across all projects)
├── README.md                  ← human quick-start guide
├── .env                       ← real credentials, local only (gitignored)
├── .env.example               ← committed template with placeholder values
├── .gitignore
├── eslint.config.mjs          ← Playwright flat config lint rules
├── package.json
├── tsconfig.json
├── playwright.config.ts       ← lives at project root so `npx playwright test` auto-discovers it
├── global.setup.ts            ← logs in once, saves session to .auth/
├── docs/
│   ├── SCAFFOLD.md            ← project setup instructions (read once per new project)
│   ├── AGENTS.md              ← feature workflow + agent rules (read per feature)
│   └── [feature]-*.md/pdf/docx ← per-feature SRS / PRD / spec files
├── config/
│   └── env.ts                 ← reads process.env, exports typed config
├── types/
│   └── index.ts               ← shared TypeScript types (User, TestData, etc.)
├── pages/
│   ├── BasePage.ts            ← every page extends this
│   └── [Feature]Page.ts
├── fixtures/
│   ├── index.ts               ← custom `test` export with all POM fixtures
│   └── testData.ts            ← all test data + invalid credentials
├── utils/                     ← pure helpers, no Playwright page state
│   ├── dataGenerators.ts      ← Faker wrappers for emails, names, etc.
│   └── dateHelpers.ts
├── tests/
│   ├── seed.spec.ts           ← Planner bootstrap + style reference — never modify
│   └── [feature]/
│       └── [scenario].spec.ts
├── specs/                     ← Planner agent output, one .md per feature
├── reports/                   ← HTML/JUnit/Allure reports, screenshots (gitignored)
│   ├── allure-results/        ← raw JSON written by allure-playwright reporter
│   └── allure-report/         ← generated Allure HTML report
├── .auth/                     ← saved storageState sessions (gitignored)
└── .github/workflows/
    ├── playwright.yml         ← full regression on merge to main
    └── pr-check.yml           ← smoke-only run on every PR
```

---

## Credentials and authentication — hard rules

### Rule C1 — All credential reads go through `fixtures/testData.ts`

Never hardcode any email, password, username, or token in a test file or
page class. Every credential read in the codebase must import from
`fixtures/testData.ts` — that file is the single gateway, with values
sourced from `process.env` at runtime.

The full template lives in `docs/SCAFFOLD.md`.

### Rule C2 — Valid credentials come from environment variables

`.env` (local dev) and CI secrets (pipelines) are the only sources. Real
credentials never enter source control.

### Rule C3 — Invalid credentials stay hardcoded and use non-routable addresses

Invalid credentials are intentionally-wrong values designed to fail. They
are safe to commit. All invalid email addresses MUST use the `.invalid`
TLD (reserved by RFC 2606, guaranteed to never resolve). Never use
`@example.com`, `@test.com`, or any other TLD that could coincidentally
match a real registered account.

### Rule C4 — Locked / special-role accounts follow the same env pattern

Any additional user role (locked, premium, readonly, etc.) is added to
`testData.users` with the same `process.env.* || 'SET_IN_ENV_FILE'` pattern.

### Rule C5 — Login negative tests always use a fresh browser

Tests that verify wrong password, empty fields, locked accounts, and other
negative login flows must run without any saved authentication state.
In `playwright.config.ts` the `login-tests` project sets
`storageState: undefined` and matches paths under `tests/login/` only.

All login-related specs MUST live under `tests/login/`. Placing a login
test anywhere else causes it to inherit the default storageState and fail
unpredictably.

### Rule C6 — Claude never creates or modifies `.env`

Only `.env.example` is created or edited by Claude. If `.env` is missing
when tests run, stop and tell the user to create it from the template.
Never auto-populate `.env` — not even with placeholders.

### Rule C7 — Fallback values must be obviously fake

In `testData.ts`, fallbacks for `process.env.*` reads must be the literal
string `'SET_IN_ENV_FILE'` or a similar obvious sentinel. Never use
realistic-looking passwords as fallbacks — they hide missing configuration
and risk becoming accidental real credentials.

### Rule C8 — Never log credentials

No `console.log`, no `test.info().annotations`, no screenshots that
capture password fields, no error messages that echo the password back.

---

## POM rules — non-negotiable

### Rule 1 — Import from fixtures, not from `@playwright/test`

```typescript
// ✓ correct
import { test, expect } from '../../fixtures';

// ✗ wrong
import { test, expect } from '@playwright/test';
```

### Rule 2 — Use page objects as fixtures, never instantiate inline

```typescript
// ✓ correct
test('login test', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login(testData.users.validUser);
});

// ✗ wrong
test('login test', async ({ page }) => {
  const loginPage = new LoginPage(page);
});
```

### Rule 3 — All locators live in the page class

Every `getByRole`, `getByLabel`, `getByTestId`, `locator()` must be a
`readonly Locator` property on the page class. No locators in test files.

### Rule 4 — Locator preference order

1. `getByRole()` — most resilient, reflects accessibility tree
2. `getByLabel()` — for form fields with labels
3. `getByPlaceholder()` — for inputs without labels
4. `getByText()` — for non-interactive elements identified by visible text
5. `getByTestId()` — when roles/labels are not available or ambiguous;
   requires `data-testid` attribute added by the dev team. Prefer this
   over CSS for dynamic content.
6. `locator('css')` — last resort; only for stable, semantic CSS selectors

Never: `page.$()`, `page.$$()`, XPath, fragile CSS chains
(e.g. `div > div:nth-child(3) > span`).

**`data-testid` guidance:** use `data-testid` when (a) the element has no
meaningful role or label, (b) the visible text is dynamic or
internationalized, or (c) multiple similar elements need unambiguous
identification. Do NOT use `data-testid` as a shortcut when `getByRole()`
would work.

### Rule 5 — All page classes extend `BasePage`

Every page class extends `BasePage` and implements two abstract members
(see Rule 15 for the full contract).

### Rule 6 — Register every new page in `fixtures/index.ts`

### Rule 7 — No hardcoded waits

Never `page.waitForTimeout()`. Use auto-waiting, `waitForLoadState()`,
and locator-based assertions like `expect(locator).toBeVisible()`.

### Rule 8 — No hardcoded test data in test files

All data from `fixtures/testData.ts` or `utils/dataGenerators.ts`.

### Rule 9 — Group tests using `describe` blocks by feature

### Rule 10 — Every test must be fully independent

No ordering dependencies. No shared mutable state between tests. Use
`test.beforeEach` for any per-test setup that must run fresh.

### Rule 11 — Post-action landing pages must have their own page object

If a test asserts on state that appears *after* the feature under test
(e.g. a login test verifying the dashboard, a checkout test verifying
the confirmation page), the landing page gets its own page class and
fixture — even if only one or two locators are used from it.

Tests must not reach into the landing page with raw `page.locator(...)`,
`page.getByRole(...)`, or any other inline selector. The post-action
assertion uses a locator exposed by the landing page's page object.

```typescript
// ✓ correct — DashboardPage owns the selector
test('valid user logs in @smoke', async ({ loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.login(testData.users.validUser);
  await expect(dashboardPage.welcomeBanner).toBeVisible();
});

// ✗ wrong — inline selector for the post-login page
test('valid user logs in @smoke', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login(testData.users.validUser);
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

This means feature scope for planning/generation is never just the
feature's own page — it includes every page the tests must assert against.

### Rule 12 — Error handling: let Playwright handle it

Page methods perform actions; they do NOT assert and they do NOT wrap
actions in try/catch. Let errors bubble up so Playwright's auto-wait,
screenshots, and traces do their job.

```typescript
// ✓ correct — action only, no assertion, no try/catch
async login(user: User): Promise<void> {
  await this.usernameField.fill(user.email);
  await this.passwordField.fill(user.password);
  await this.submitButton.click();
}

// ✗ wrong — swallows real errors with a meaningless message
async login(user: User): Promise<void> {
  try {
    await this.usernameField.fill(user.email);
    await this.submitButton.click();
  } catch (e) {
    console.log('Login failed');
  }
}
```

Screenshots and traces are configured once in `playwright.config.ts`
(`screenshot: 'only-on-failure'`, `trace: 'retain-on-failure'`) — never
take screenshots manually inside page methods.

**The only exception — genuinely optional actions.** Use an `isVisible()`
check, not try/catch:

```typescript
async dismissCookieBannerIfPresent(): Promise<void> {
  if (await this.cookieBanner.isVisible()) {
    await this.acceptCookiesButton.click();
  }
}
```

### Rule 13 — Test tagging

Every test must carry at least one tag from this taxonomy:

- `@smoke` — critical happy-path tests that must pass on every PR. Fast.
- `@regression` — broader functional coverage; runs nightly or pre-release.
- `@critical` — business-critical flows (checkout, payment, auth). A single
  failure blocks release.
- `@slow` — tests known to take > 30s; may be excluded from fast pipelines.
- `@flaky` — quarantined flaky tests. Excluded from CI via
  `--grep-invert @flaky`. Must have an open ticket.

A test can carry multiple tags (e.g. `@smoke @critical`). Every test MUST
have at least one of `@smoke` or `@regression`.

Run selectively with `--grep`:

```bash
npx playwright test --grep @smoke
npx playwright test --grep "@critical|@smoke"
npx playwright test --grep-invert @flaky
```

### Rule 14 — Soft assertions for multi-validation tests

Use `expect.soft()` when a test must verify multiple independent
conditions and you want all failures reported in a single run. Canonical
use case: form validation.

```typescript
test('login form shows all validation errors on empty submit @regression',
  async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitEmptyForm();

    await expect.soft(loginPage.emailError).toHaveText('Email is required');
    await expect.soft(loginPage.passwordError).toHaveText('Password is required');
    await expect.soft(loginPage.submitButton).toBeDisabled();
  }
);
```

Use `expect.soft()` only when assertions are genuinely independent. Do
NOT use it to mask a broken test. Hard `expect()` remains correct for
sequential flow assertions where later steps depend on earlier ones.

### Rule 15a — File-location invariants

Two files are easy to confuse and must never be duplicated:

| File | Location | Purpose |
|---|---|---|
| `tests/seed.spec.ts` | inside `tests/` | Planner bootstrap test — Playwright runs it via the test runner |
| `global.setup.ts` | project **root** | Auth setup — runs once before authenticated projects via the `setup` project |

**Never create a `seed.spec.ts` at the project root.** If you find one,
delete it. The fact that `global.setup.ts` lives at the root is not a
reason for `seed.spec.ts` to live there too.

Login specs follow Rule C5: they live ONLY under `tests/login/` and run
in the `login-tests` project (no auth state). The `chromium` project
explicitly excludes that folder via `testIgnore` — see the canonical
`playwright.config.ts` in `docs/SCAFFOLD.md`.

`tests/seed.spec.ts` is **never excluded** from the `chromium` project.
The Planner agent runs it there to bootstrap into the authenticated app
(storageState turns `page.goto('/')` into a post-login landing). Treat
the seed as a stable, generic foundation — never modify it per feature.

### Rule 15 — BasePage contract

Every page class extends `BasePage` and must implement two abstract members:

1. `protected abstract readonly path: string` — the URL path relative to
   `baseURL`. Must begin with `/`.
2. `abstract waitForReady(): Promise<void>` — waits for an element that
   uniquely proves this page has loaded
   (e.g. `await expect(this.heading).toBeVisible()`).

`BasePage.goto()` calls `waitForReady()` automatically after navigation,
so every page proves it loaded without leaking selectors into tests.

For pages reachable only indirectly (modals, dialogs), override `goto()`
to throw — the page is entered through a parent flow, not a direct URL.

The full `BasePage.ts` template lives in `docs/SCAFFOLD.md`.

---

## Config and environment

- Base URL and credentials follow Rules C1–C8 — never hardcoded
- To run against a specific environment:
  `BASE_URL=https://staging.app.com npx playwright test`
- `config/env.ts` must throw a clear error if required env vars are missing

### Environment-specific test skipping

Some tests must not run in certain environments (e.g. destructive flows
on production, tests that depend on staging-only data). Use `test.skip()`
with an explicit reason — never silently remove or comment out tests.

```typescript
import { env } from '../../config/env';

test('admin deletes user account @regression', async ({ adminPage }) => {
  test.skip(env.environment === 'production', 'Destructive — not safe on production');
  // ...
});
```

Always provide a reason string. Never use `test.skip()` to hide a flaky
test — quarantine it with `@flaky` instead (see retry policy in
`docs/AGENTS.md`).

---

## Linting

Playwright anti-pattern rules only — no style or formatting enforcement.
Style is left to each developer's editor.

`npm run lint` must pass before tests are considered complete and runs in
CI before test execution. Never disable a rule inline — fix the test.

The full `eslint.config.mjs` template lives in `docs/SCAFFOLD.md`.

---

## Security rules

- `.env` is never committed — enforced via `.gitignore`
- Never log credentials (Rule C8)
- Credential handling follows Rules C1–C8 in full

---

## Code style

Guidance only, not CI-enforced:

- TypeScript strict mode
- 2-space indentation
- Single quotes, semicolons required
- PascalCase for page classes, camelCase for test files
- Max line length: ~100 characters
- Test names: descriptive plain English

### Page method naming conventions

Page methods follow a verb-first pattern:

| Action type | Pattern | Example |
|---|---|---|
| Single action | `click[Target]()` | `clickLogin()` |
| Combined flow | `[action](data)` | `login(user)` |
| Wait | `waitFor[Condition]()` | `waitForReady()` |

Apply the same verb-first logic to all other actions: `fillEmail()`,
`selectCountry()`, `submitLoginForm()`, `getErrorMessage()`,
`dismissCookieBannerIfPresent()`.

Page methods do NOT assert (Rule 12). Never name a method `doLogin()`,
`performLogin()`, or `handleLogin()` — use `login(user)`.

### Test file naming conventions

Test files follow `[subject]-[scenario].spec.ts` in kebab-case:

- `login-valid-credentials.spec.ts`
- `checkout-payment.spec.ts`

`[subject]` = the feature or page under test. `[scenario]` = the flow
variant (omit if there's only one spec for that subject). Never name a
file `test1.spec.ts`, `misc.spec.ts`, or `temp.spec.ts`.

---

## Git — when to commit

After completing any of the following, **proactively suggest a commit**.
Do not commit automatically — always ask first.

| Milestone | Suggested commit message |
|---|---|
| Scaffold complete | `initial scaffold` |
| Feature tests all passing | `add [feature] tests` |
| Healer fixed a broken test | `fix [feature] selector` |
| New page object added | `add [Feature]Page` |
| Credentials or env vars updated | `update testData / env config` |
| CLAUDE.md or sub-docs updated | `update CLAUDE.md / SCAFFOLD.md / AGENTS.md` |

### Rules

1. **Never run `git init`, `git add`, or `git commit` without the user's
   explicit confirmation.** Always say: *"Ready to commit — shall I?"*
2. **Never commit `.env`, `.auth/`, `reports/`, `test-results/`, or
   `node_modules/`.** Verify before committing.
3. **Never `git push` unless the user explicitly asks** and has already
   set up a remote repository. Pushing requires `git remote add origin
   <url>` first.
4. If `git` is not initialised yet, run `git init` + `git add .` +
   initial commit in one step when the user confirms.
5. Write commit messages in plain English, lowercase, no period at the end.
