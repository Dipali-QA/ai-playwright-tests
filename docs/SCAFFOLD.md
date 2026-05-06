# SCAFFOLD.md — New Project Setup

Read this file when the user asks to set up a new project. After scaffold
is complete, this file is no longer needed in context.

This is the **single source of truth for templates**. `CLAUDE.md` and
`AGENTS.md` reference templates from here — they never duplicate the
content. If a template needs updating, update it here only.

---

## Initial project scaffold — run once per new project

When the user opens a project folder containing `CLAUDE.md`, `README.md`,
and (optionally) a `docs/` folder with SRS files, and asks you to set up
the project, perform the steps below in order.

### Files to create or merge

1. `package.json` — read existing, MERGE/APPEND missing deps (Faker,
   dotenv, `eslint-plugin-playwright`) and the script block. Do not
   delete existing entries.
2. `tsconfig.json` — use the template below exactly.
3. `.gitignore` — use the template below exactly.
4. `eslint.config.mjs` — flat config; use the template below exactly.
   The `.mjs` extension is required (see Linting note below).
5. `.env.example` — committed template with Required / Optional sections.
6. `config/env.ts` — reads `process.env`, exports typed config, throws if
   required vars are missing.
7. `playwright.config.ts` — OVERWRITE the existing default. Required for
   the auth-aware project layout (`setup`, `login-tests`, `chromium`).
8. `types/index.ts` — shared TypeScript interfaces: `User`,
   `InvalidCredential`, `TestData`.
9. `pages/BasePage.ts` — abstract base; every page extends this.
10. `fixtures/index.ts` — custom `test` export with `loginPage` as the
    starter fixture; other pages added later as features arrive.
11. `fixtures/testData.ts` — structure only, per Rule C1 in `CLAUDE.md`.
    Valid users read from `process.env.*` with `'SET_IN_ENV_FILE'` as the
    fallback.
12. `utils/dataGenerators.ts` — Faker wrappers for randomized test data.
13. `utils/dateHelpers.ts` — date formatting and comparison helpers.
14. `global.setup.ts` — placeholder that deliberately throws (see
    Authentication state section below).
15. `tests/seed.spec.ts` — OVERWRITE the existing file with the template
    below.
    > ⚠️ **Critical — only ONE seed file exists, only at `tests/seed.spec.ts`.**
    > Never create a second `seed.spec.ts` at the project root.
    > `tests/seed.spec.ts` and `global.setup.ts` (root) are different
    > files with different jobs — do not confuse them. If a root-level
    > `seed.spec.ts` already exists from an earlier run, delete it.
16. `.github/workflows/playwright.yml` — full regression CI on merge to
    main.
17. `.github/workflows/pr-check.yml` — smoke-only CI on PR open/update.

> `global.teardown.ts` is NOT scaffolded. Add it manually only if you
> need suite-level cleanup (e.g. database reset). Most projects do not
> need it — use `test.afterEach` / `test.afterAll` hooks instead.

### What you MUST NOT do during scaffold

- **Never create `.env`.** Only `.env.example`. The user creates `.env`.
- **Never invent real credentials.** No `testuser@example.com` / `Pass@123`
  fallbacks. Use `'SET_IN_ENV_FILE'` so tests fail loudly if `.env` is missing.
- **Never hardcode a base URL.** It comes from `process.env.BASE_URL`.
- **Never run `git init` or commit anything** without explicit user confirmation.
- **Never install npm packages** automatically. Print the install command
  and let the user run it. (Audit trail, lockfile integrity.)

### After scaffolding

Stop and print a clear checklist:

```
Scaffold complete. Your turn:
  1. Run: npm install
  2. Fill in .env from .env.example
  3. Tell me when .env is ready — I will verify and proceed
```

Then wait. Do not proceed to any feature work.

---

## Authentication state — storageState pattern

### What `global.setup.ts` is

`global.setup.ts` runs **once before any tests execute**. It:

1. Launches a browser.
2. Logs in as the standard user via `LoginPage`.
3. Saves the resulting browser session (cookies, localStorage, tokens) to
   `.auth/user.json` using `context.storageState({ path: ... })`.
4. **Verifies the saved session contains authentication evidence.**

Subsequent non-login tests load `.auth/user.json` via
`use.storageState: '.auth/user.json'` in `playwright.config.ts`,
skipping the login UI entirely and saving runtime across the suite.

### The silent-failure risk (and the mandatory safeguard)

If `global.setup.ts` navigates to `BASE_URL` but does not actually
perform a login, the saved `.auth/user.json` contains a guest session.
Non-login tests run as unauthenticated users — and many will still pass
on public pages, masking the bug indefinitely.

To prevent this, `global.setup.ts` MUST verify the saved session before
exiting. If verification fails, it MUST throw a clear error.

**Required pattern (wire up once `LoginPage` exists):**

```typescript
// global.setup.ts (lives at the project root)
import { test as setup } from './fixtures';
import { testData } from './fixtures/testData';

const AUTH_FILE = '.auth/user.json';

setup('authenticate standard user', async ({ page, context, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(testData.users.validUser);

  // Replace with a project-specific post-login URL pattern
  await page.waitForURL(/\/(dashboard|home|app)/, { timeout: 10_000 });

  await context.storageState({ path: AUTH_FILE });

  // Verify session is not empty — fail loudly if login didn't produce auth state
  const state = await context.storageState();
  const hasCookies = state.cookies.length > 0;
  const hasStorage = state.origins.some(
    origin => origin.localStorage && origin.localStorage.length > 0
  );

  if (!hasCookies && !hasStorage) {
    throw new Error(
      'global.setup.ts saved an empty session. Login did not produce ' +
      'cookies or localStorage entries. Check that LoginPage.login() is ' +
      'wired correctly and the post-login wait target is right.'
    );
  }
});
```

### Scaffold-time placeholder

During scaffold, `LoginPage` does not exist yet. Ship this placeholder
that **deliberately throws** instead of silently saving a guest session:

```typescript
// global.setup.ts (project root — import path is ./fixtures)
import { test as setup } from './fixtures';

setup('authenticate standard user', async () => {
  throw new Error(
    'global.setup.ts has not been wired up yet. Implement LoginPage, ' +
    'then replace this placeholder with a real login flow that saves ' +
    'to .auth/user.json.'
  );
});
```

This forces the developer to wire up real login before any authenticated
test can run.

---

## Reference: `package.json` scripts and dependencies

### Scripts (merge into existing `scripts` block)

```json
{
  "scripts": {
    "test":             "playwright test",
    "test:headed":      "playwright test --headed",
    "test:ui":          "playwright test --ui",
    "test:debug":       "playwright test --debug",
    "test:smoke":       "playwright test --grep @smoke",
    "test:regression":  "playwright test --grep @regression",
    "test:critical":    "playwright test --grep @critical",
    "test:login":       "playwright test --project=login-tests",
    "report":           "playwright show-report reports/html",
    "report:allure":    "allure generate reports/allure-results --clean -o reports/allure-report && allure open reports/allure-report",
    "lint":             "eslint .",
    "typecheck":        "tsc --noEmit"
  }
}
```

### Dependencies (merge into existing `devDependencies`)

```json
{
  "devDependencies": {
    "@faker-js/faker":          "^9.0.0",
    "@types/node":              "^20.0.0",
    "allure-commandline":       "^2.30.0",
    "allure-playwright":        "^3.0.0",
    "dotenv":                   "^16.4.0",
    "eslint":                   "^9.0.0",
    "eslint-plugin-playwright": "^2.0.0",
    "typescript":               "^5.5.0"
  }
}
```

> `@playwright/test` was added by `npm init playwright@latest` in
> README Step 4 — do not duplicate it here.

After merging, print this command for the user to run:

```bash
npm install
```

---

## Reference: `BasePage.ts` template

```typescript
// pages/BasePage.ts
import { Page, expect } from '@playwright/test';

/**
 * BasePage — every page class extends this.
 *
 * Each subclass MUST declare:
 *   - `path`: URL relative to baseURL, beginning with '/'.
 *   - `waitForReady()`: a locator-based wait that proves the page is loaded.
 *
 * `goto()` chains `waitForReady()` automatically — every page proves it
 * loaded without leaking selectors into tests.
 */
export abstract class BasePage {
  /** URL path relative to baseURL — every subclass declares its own. Must begin with '/'. */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  /**
   * Subclass must implement: wait for an element that uniquely proves
   * this page has loaded, e.g.:
   *   await expect(this.heading).toBeVisible();
   */
  abstract waitForReady(): Promise<void>;

  // ─── Navigation ─────────────────────────────────────────────

  /** Navigate to this page's URL and wait until it is ready. */
  async goto(options?: Parameters<Page['goto']>[1]): Promise<void> {
    if (!this.path.startsWith('/')) {
      throw new Error(
        `${this.constructor.name}.path must begin with '/' — got '${this.path}'.`
      );
    }
    await this.page.goto(this.path, options);
    await this.waitForReady();
  }

  /** Reload the current page. */
  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.waitForReady();
  }

  /** Browser back-button — caller decides what page is now active. */
  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
  }

  /** Browser forward-button — caller decides what page is now active. */
  async goForward(): Promise<void> {
    await this.page.goForward({ waitUntil: 'domcontentloaded' });
  }

  // ─── Readiness ──────────────────────────────────────────────

  /** Wait for the DOM to parse — fast, suits server-rendered pages. */
  async waitForDomReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ─── Diagnostics ────────────────────────────────────────────

  /** Current URL of the underlying page. */
  getUrl(): string {
    return this.page.url();
  }

  /** Document title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** True when the browser is on this page's URL pattern. */
  isCurrent(): boolean {
    return this.page.url().includes(this.path);
  }
}
```

> `networkidle` is intentionally absent. Playwright's docs warn against
> it: analytics heartbeats and long-poll connections keep the network
> busy forever. Use `waitForReady()` (locator-based) instead.

### Subclass example

```typescript
// pages/LoginPage.ts
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { User } from '../types';

export class LoginPage extends BasePage {
  protected readonly path = '/login';

  readonly emailField:    Locator;
  readonly passwordField: Locator;
  readonly submitButton:  Locator;
  readonly errorBanner:   Locator;

  constructor(page: Page) {
    super(page);
    this.emailField    = page.getByLabel('Email');
    this.passwordField = page.getByLabel('Password');
    this.submitButton  = page.getByRole('button', { name: /sign in|log in/i });
    this.errorBanner   = page.getByRole('alert');
  }

  async waitForReady(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
  }

  async login(user: User): Promise<void> {
    await this.emailField.fill(user.email);
    await this.passwordField.fill(user.password);
    await this.submitButton.click();
  }

  async submitEmptyForm(): Promise<void> {
    await this.submitButton.click();
  }
}
```

---

## Reference: `fixtures/index.ts` template

```typescript
// fixtures/index.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
// As features arrive, add new page imports here:
// import { DashboardPage } from '../pages/DashboardPage';

type Fixtures = {
  loginPage:     LoginPage;
  // dashboardPage: DashboardPage;
};

/**
 * Custom Playwright test export with all page objects pre-wired as fixtures.
 * Tests import { test, expect } from this module — never from '@playwright/test'.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  // dashboardPage: async ({ page }, use) => {
  //   await use(new DashboardPage(page));
  // },
});

export { expect } from '@playwright/test';
```

> Add new page object fixtures as new features are scaffolded. The
> Generator agent updates this file when it creates a new page class.

---

## Reference: `fixtures/testData.ts` template

```typescript
// fixtures/testData.ts
import { TestData } from '../types';

export const testData: TestData = {
  users: {
    validUser: {
      email:    process.env.TEST_USER_EMAIL    || 'SET_IN_ENV_FILE',
      password: process.env.TEST_USER_PASSWORD || 'SET_IN_ENV_FILE',
      role: 'standard',
    },
    adminUser: {
      email:    process.env.ADMIN_USER_EMAIL    || 'SET_IN_ENV_FILE',
      password: process.env.ADMIN_USER_PASSWORD || 'SET_IN_ENV_FILE',
      role: 'admin',
    },
    // Claude: add new user roles here explicitly, e.g.:
    // lockedUser: { ... }
  },

  invalidCredentials: {
    wrongPassword:  { email: 'invalid-qa-do-not-register@test.invalid', password: 'WrongPass@999'  },
    wrongEmail:     { email: 'notexist-qa@test.invalid',                password: 'ValidPass@123'  },
    emptyEmail:     { email: '',                                         password: 'ValidPass@123' },
    emptyPassword:  { email: 'invalid-qa-do-not-register@test.invalid',  password: ''             },
    sqlInjection:   { email: "' OR 1=1 --",                              password: "' OR 1=1 --"  },
    exceededLength: { email: 'a'.repeat(256) + '@test.invalid',          password: 'ValidPass@123' },
  },

  // Populated per project as features land — do not invent during scaffold
  errorMessages: {},
};
```

---

## Reference: `tests/seed.spec.ts` template

OVERWRITE the existing `seed.spec.ts` with this exact code.

> ⚠️ **Location is `tests/seed.spec.ts` — NOT the project root.** The
> seed file lives in the `tests/` folder. The project root contains
> `global.setup.ts` (different file, different purpose). If you find
> `seed.spec.ts` at the project root, it's a mistake — delete it.

```typescript
// tests/seed.spec.ts
import { test } from '../fixtures';

test('seed', async ({ page }) => {
  // The Planner runs this test to bootstrap the environment:
  // global setup, auth state, and all fixtures are initialised here.
  // baseURL is set in playwright.config.ts — do not import env here.
  // Do not add assertions or tags — this is a pure navigation seed.
  await page.goto('/');
});
```

---

## Reference: `eslint.config.mjs` template

Flat config — required for ESLint v9+. The `.mjs` extension is required:
the template uses `import`/`export default`, which Node only accepts in
`.mjs` files (or in `.js` files when `package.json` declares
`"type": "module"`). We do NOT set `"type": "module"` because that
forces every relative TypeScript import to include a `.js` extension
under NodeNext.

```javascript
import playwright from 'eslint-plugin-playwright';

export default [
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
  },
];
```

> `@typescript-eslint` rules are deliberately omitted. TypeScript
> already runs in strict mode via `tsc --noEmit` (`npm run typecheck`).

---

## Reference: `.gitignore` template

```gitignore
# ── Credentials ──────────────────────────────
.env
.env.local
.env.*.local

# ── Auth session state ────────────────────────
.auth/

# ── Dependencies ─────────────────────────────
node_modules/

# ── Playwright output ─────────────────────────
reports/
playwright-report/
test-results/
blob-report/

# ── TypeScript build output ───────────────────
dist/

# ── Node/NPM Debug Logs ──────────────────────
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-debug.log*

# ── Test Coverage Output (Optional) ──────────
coverage/
.nyc_output/

# ── Claude Code agent config (machine-specific)
.mcp.json

# ── OS noise ─────────────────────────────────
.DS_Store
.AppleDouble
.LSOverride
Thumbs.db
ehthumbs.db

# ── Editor noise ─────────────────────────────
.vscode/
.idea/
*.swp
*.swo
```

---

## Reference: `config/env.ts` template

```typescript
// config/env.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.[environment] if APP_ENV is set, otherwise default to .env
const envName = process.env.APP_ENV ? `.env.${process.env.APP_ENV}` : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envName) });

function required(name: string): string {
  const value = process.env[name];
  if (!value || value === 'SET_IN_ENV_FILE') {
    throw new Error(
      `Missing required env var: ${name}. Copy .env.example to .env ` +
      `(or specific env file) and fill in real values.`
    );
  }
  return value;
}

function optional(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const env = {
  baseUrl:     required('BASE_URL'),
  environment: optional('APP_ENV', 'staging'),
};
```

This pattern fails loudly and early when `.env` is missing or incomplete.
Set `APP_ENV=staging` to load `.env.staging`, `APP_ENV=production` to
load `.env.production`, etc.

---

## Reference: `.env.example` template

```bash
# =========================================================================
# REQUIRED — tests will fail to start if these are missing or blank
# =========================================================================

# Base URL of the application under test
BASE_URL=https://example.com

# Standard test user — used by global.setup.ts for authenticated tests
TEST_USER_EMAIL=SET_IN_ENV_FILE
TEST_USER_PASSWORD=SET_IN_ENV_FILE

# Admin test user — used by admin-only tests
ADMIN_USER_EMAIL=SET_IN_ENV_FILE
ADMIN_USER_PASSWORD=SET_IN_ENV_FILE

# =========================================================================
# OPTIONAL — have sensible defaults; override only when needed
# =========================================================================

# App environment — controls test.skip() rules (staging | production | dev)
# APP_ENV=staging

# Override CI worker count (default 2)
# WORKERS=4
```

---

## Reference: `playwright.config.ts` template

This is the **canonical config**. `CLAUDE.md` and `AGENTS.md` reference
this block — they do not duplicate it. `baseURL` is wired from
`env.baseUrl`; auth is handled via project dependencies.

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

export default defineConfig({
  timeout: 30 * 1000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI
    ? Number(process.env.WORKERS ?? 2)
    : undefined,
  outputDir: './test-results',
  reporter: [
    ['list'],
    ['html',              { outputFolder: 'reports/html',          open: 'never' }],
    ['junit',             { outputFile:   'reports/junit/results.xml' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],
  use: {
    baseURL: env.baseUrl,
    actionTimeout: 10_000,
    screenshot: 'only-on-failure',
    trace:      'retain-on-failure',
    video:      'retain-on-failure',
  },
  projects: [
    // --- Core projects (always enabled) ---
    {
      // Runs global.setup.ts once before authenticated projects
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      // Login tests run without saved auth state — fresh browser every time.
      // Intentionally NOT depending on 'setup' — login tests must NOT
      // inherit storageState. See Rule C5 in CLAUDE.md.
      name: 'login-tests',
      testMatch: /tests[\\/]login[\\/].*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined,
      },
    },
    {
      // Default regression/smoke browser.
      //
      // testIgnore excludes login specs so they don't double-run here
      // under saved auth — they belong only to the 'login-tests' project
      // which runs them on a fresh browser (Rule C5).
      //
      // tests/seed.spec.ts is INTENTIONALLY NOT excluded — the Planner
      // agent runs it under this project to bootstrap into the
      // authenticated app (storageState makes `page.goto('/')` land on
      // the post-login page). It also doubles as a quick smoke check
      // that auth state is still valid.
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: /tests[\\/]login[\\/].*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
    },

    // --- Optional cross-browser projects ---
    // Enable explicitly when the SRS or product team requires them.
    // Pattern is identical — copy and adjust device.
    // {
    //   name: 'firefox',
    //   dependencies: ['setup'],
    //   use: { ...devices['Desktop Firefox'], storageState: '.auth/user.json' },
    // },
    // {
    //   name: 'mobile-chrome',
    //   dependencies: ['setup'],
    //   use: { ...devices['Pixel 7'], storageState: '.auth/user.json' },
    // },
  ],
});
```

> For the full list of available device descriptors, see
> `node_modules/playwright-core/lib/server/deviceDescriptorsSource.json`
> after install.

---

## Reference: `tsconfig.json` template

Use exactly. Do not change `module`, `moduleResolution`, or add `baseUrl`.
`NodeNext` is the forward-compatible alias.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./",
    "types": ["node"]
  },
  "include": [
    "config/**/*.ts",
    "types/**/*.ts",
    "pages/**/*.ts",
    "fixtures/**/*.ts",
    "utils/**/*.ts",
    "tests/**/*.ts",
    "global.setup.ts",
    "playwright.config.ts"
  ],
  "exclude": ["node_modules", "reports", ".auth", "playwright-report", "test-results"]
}
```

---

## Reference: `types/index.ts` template

Central home for all shared TypeScript interfaces.

```typescript
// types/index.ts

export interface User {
  email:    string;
  password: string;
  role:     'standard' | 'admin' | 'readonly' | string;
}

export interface InvalidCredential {
  email:    string;
  password: string;
}

export interface TestData {
  users: {
    validUser:  User;
    adminUser:  User;
    [key: string]: User;
  };
  invalidCredentials: {
    wrongPassword:  InvalidCredential;
    wrongEmail:     InvalidCredential;
    emptyEmail:     InvalidCredential;
    emptyPassword:  InvalidCredential;
    sqlInjection:   InvalidCredential;
    exceededLength: InvalidCredential;
  };
  errorMessages: Record<string, string>;
}
```

---

## Reference: `utils/dataGenerators.ts` template

```typescript
// utils/dataGenerators.ts
import { faker } from '@faker-js/faker';

/** Generate a non-routable test email guaranteed not to hit a real domain. */
export function randomEmail(prefix = 'qa'): string {
  return `${prefix}-${faker.string.uuid()}@test.invalid`;
}

/** Generate a strong password meeting common policies (12+ chars, mixed case, digit, symbol). */
export function randomPassword(): string {
  return faker.internet.password({ length: 16, memorable: false, prefix: 'A1!' });
}

/** Generate a person's full name. */
export function randomName(): { firstName: string; lastName: string } {
  return {
    firstName: faker.person.firstName(),
    lastName:  faker.person.lastName(),
  };
}
```

---

## Reference: `utils/dateHelpers.ts` template

```typescript
// utils/dateHelpers.ts

/** Format a Date as YYYY-MM-DD. */
export function toISODate(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Add `days` to a date and return a new Date. */
export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/** Difference in whole days between two dates (b - a). */
export function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
```

---

## Reference: `.github/workflows/playwright.yml` (full regression)

Runs the full suite on every merge to `main`. Includes browser caching
and dual-artifact upload (HTML report + raw test-results for traces).

```yaml
name: Playwright — Full Regression

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type-check
        run: npm run typecheck

      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            playwright-${{ runner.os }}-

      - name: Install Playwright browsers (if not cached)
        run: npx playwright install --with-deps chromium

      - name: Run full regression
        run: npx playwright test --project=chromium
        env:
          BASE_URL:            ${{ secrets.BASE_URL }}
          TEST_USER_EMAIL:     ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD:  ${{ secrets.TEST_USER_PASSWORD }}
          ADMIN_USER_EMAIL:    ${{ secrets.ADMIN_USER_EMAIL }}
          ADMIN_USER_PASSWORD: ${{ secrets.ADMIN_USER_PASSWORD }}
          CI: true

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: html-report-${{ github.run_id }}
          path: reports/html
          retention-days: 14

      - name: Generate Allure report
        if: always()
        run: npx allure generate reports/allure-results --clean -o reports/allure-report

      - name: Upload Allure report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: allure-report-${{ github.run_id }}
          path: reports/allure-report
          retention-days: 14

      - name: Upload raw test results (traces, videos)
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ github.run_id }}
          path: test-results/
          retention-days: 14
```

---

## Reference: `.github/workflows/pr-check.yml` (smoke only)

Runs `@smoke` tests only on every PR — fast feedback before merge.

```yaml
name: PR Check — Smoke Tests

on:
  pull_request:
    branches: [main, master]

jobs:
  smoke:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            playwright-${{ runner.os }}-

      - name: Install Playwright browsers (if not cached)
        run: npx playwright install --with-deps chromium

      - name: Run smoke tests
        run: npx playwright test --grep @smoke --project=chromium
        env:
          BASE_URL:            ${{ secrets.BASE_URL }}
          TEST_USER_EMAIL:     ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD:  ${{ secrets.TEST_USER_PASSWORD }}
          ADMIN_USER_EMAIL:    ${{ secrets.ADMIN_USER_EMAIL }}
          ADMIN_USER_PASSWORD: ${{ secrets.ADMIN_USER_PASSWORD }}
          CI: true

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: html-report-pr-${{ github.event.pull_request.number }}
          path: reports/html
          retention-days: 7

      - name: Generate Allure report
        if: always()
        run: npx allure generate reports/allure-results --clean -o reports/allure-report

      - name: Upload Allure report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: allure-report-pr-${{ github.event.pull_request.number }}
          path: reports/allure-report
          retention-days: 7

      - name: Upload raw test results (on failure)
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-pr-${{ github.event.pull_request.number }}
          path: test-results/
          retention-days: 7
```

> **Cache key** uses `hashFiles('package-lock.json')` instead of parsing
> `npm ls` output — more reliable and rebuilds cleanly when Playwright
> is bumped via `package-lock.json`.
