# Playwright Automation Framework

Quick-start guide for setting up and running this framework on a new project.
All deep rules and templates live in `CLAUDE.md`, `docs/SCAFFOLD.md`, and
`docs/AGENTS.md`. This file tells **you** — the human — when to do what.

**Scope:** functional and end-to-end testing only. No visual regression,
accessibility, or API testing.

**Tested against:** Node.js v20 LTS · `@playwright/test` ^1.50 ·
TypeScript ^5.5 · ESLint ^9. Newer versions usually work; downgrade only
if your CI image forces you to.

---

## Part 1 — One-time project setup (you do this, before opening Claude)

### Step 1 — Create the project folder

```
your-project/
├── CLAUDE.md              ← copy from this template repo
├── README.md              ← copy from this template repo
├── docs/
│   ├── SCAFFOLD.md        ← copy from this template repo
│   ├── AGENTS.md          ← copy from this template repo
│   └── [feature].md/pdf/docx  ← your SRS / PRD files (optional — skip if none yet)
```

> No SRS yet? That's fine. Create the empty `docs/` folder with only
> `SCAFFOLD.md` and `AGENTS.md`. Tell Claude there's no SRS when starting
> the feature workflow.

### Step 2 — Verify Node.js is installed

```bash
node -v
```

Requires v18 or higher (v20 LTS recommended). If not installed,
download from [nodejs.org](https://nodejs.org).

### Step 3 — Verify npm is installed

```bash
npm -v
```

Comes bundled with Node.js. v9 or higher.

### Step 4 — Initialise Playwright project

```bash
npm init playwright@latest
```

Interactive setup. Answer as follows:

| Question | Answer |
|---|---|
| TypeScript or JavaScript? | **TypeScript** |
| Where to put tests? | **tests** |
| Add GitHub Actions workflow? | **No** (Claude creates custom ones) |
| Install Playwright browsers? | **No** (done in next step) |

Creates `package.json`, `playwright.config.ts`, `tests/` folder, and
example files. The exact prompt wording can vary across Playwright
versions — pick the equivalent answer.

> After this step, delete the generated example files — they are not needed:
> ```bash
> rm -rf tests/example.spec.ts tests-examples/
> ```

### Step 5 — Install browser binaries

```bash
npx playwright install --with-deps chromium
```

Installs Chromium plus OS-level dependencies. The default scaffold runs
Chromium only — keep the install scoped to match. Add `firefox` / `webkit`
later if your project enables them in `playwright.config.ts`.

### Step 6 — Initialise Playwright agents

```bash
npx playwright init-agents --loop=claude
```

Creates the agent definitions Claude Code uses for the feature workflow:

- `.claude/` — Planner, Generator, and Healer agent files
- `.mcp.json` — wires up the `playwright-test` MCP server (machine-specific, gitignored)
- `tests/seed.spec.ts` — Planner bootstrap file

> Claude will overwrite `tests/seed.spec.ts` in Step 8 with a
> fixtures-aware version. That's expected — don't be surprised.

### Step 7 — Open Claude Code (or Cowork)

Point Claude Code at your project folder. When prompted, **approve the
`playwright-test` MCP server**.

> If you skip approval, MCP tools will appear in agent plans but will
> silently fail when called. This is the #1 source of "agents seem stuck"
> reports.

---

## Part 2 — Project scaffold (Claude does this)

### Step 8 — Ask Claude to set up the project

Tell Claude:
> "Set up the project"

Claude reads `docs/SCAFFOLD.md` and:

- Creates the remaining files: `fixtures/`, `pages/BasePage.ts`,
  `config/`, `types/`, `utils/`, `global.setup.ts`, CI workflows,
  and all reference templates
- **MERGES** `package.json` — adds missing deps (Faker, dotenv,
  ESLint + Playwright plugin) without deleting existing entries
- **OVERWRITES** `playwright.config.ts` — replaces the default with the
  auth-aware custom template (login-tests project, storageState wiring)
- **OVERWRITES** `tests/seed.spec.ts` — replaces with the fixtures-wired
  version that the Planner needs

### Step 9 — Install all dependencies

```bash
npm install
```

Installs the additional packages Claude added — Faker, dotenv,
`eslint-plugin-playwright`. (TypeScript and `@playwright/test` were
already added in Step 4.)

### Step 10 — Fill in `.env`

```bash
cp .env.example .env
```

Open `.env` and replace every `SET_IN_ENV_FILE` placeholder with real
credentials and your app's base URL.

### Step 11 — Tell Claude `.env` is ready

Tell Claude:
> ".env is ready"

Claude verifies the file is present and waits for your next instruction.

### Step 11.5 — Commit the scaffold

Tell Claude:
> "Initialise git and commit the scaffold"

Claude runs `git init` + `git add .` + the first commit after you
confirm. (Skip this step if your project already has a git repo.)

---

## Part 3 — Feature workflow (repeat for every new feature)

### Step 12 — Confirm testability prerequisites with your dev team

Before starting any feature, check with the dev team:

| Concern | Question to ask |
|---|---|
| OTP | Is there a static OTP or test API for non-prod accounts? |
| CAPTCHA | Is CAPTCHA disabled or using test keys in staging? |
| MFA | Can test accounts have MFA disabled or use a known TOTP seed? |

> Do this for **every new feature** — not just once at setup. A new
> feature may introduce OTP or CAPTCHA that earlier features didn't have.

### Step 13 — Start the feature workflow

Tell Claude:
> "Start the [feature name] feature workflow"

Claude follows the seven-step workflow from `docs/AGENTS.md`:

| Step | What happens | Gate |
|---|---|---|
| 1 | Claude reads requirements, lists clarifying questions | ✋ You answer questions |
| 2 | Planner runs, produces `specs/[feature]-plan.md` | ✋ You review and approve the plan |
| 3 | Generator creates page objects + tests | ✋ You review generated files |
| 4 | Tests execute | ✋ On failure — you decide whether to heal |
| 5 | Healer fixes failures (max 3 attempts per test) | ✋ If capped, you decide |
| 6 | HTML + JUnit + Allure reports generated | — |

### Step 14 — After the first feature (login): wire up `global.setup.ts`

> ⚠️ **CRITICAL — easily missed.** Once `LoginPage` exists after the
> login feature workflow, tell Claude:
>
> > "Wire up global.setup.ts with the real login flow"
>
> Until you do this, every authenticated test runs as a guest user. The
> scaffold ships a placeholder that throws on purpose to surface this —
> if you see *"global.setup.ts has not been wired up yet"* in test
> output, this is the step you skipped.

From this point, all future features get authentication state for free —
no UI login on every test run.

---

## Part 4 — Day-to-day commands

```bash
npm test                          # run full suite
npm run test:smoke                # smoke tests only
npm run test:regression           # regression suite
npm run test:critical             # critical-path suite
npm run test:login                # login tests (no saved session)
npm run test:headed               # visible browser
npm run test:ui                   # Playwright UI mode
npm run test:debug                # Playwright Inspector
npm run report                    # open HTML report
npm run report:allure             # generate + open Allure report (requires Java 11+)
npm run lint                      # ESLint
npm run typecheck                 # tsc --noEmit
npx playwright test --grep @smoke # run by tag
BASE_URL=https://staging.app.com npx playwright test  # run against staging
```

See `CLAUDE.md` for the complete command reference.

> **Allure note:** the test run always writes raw results to
> `reports/allure-results/`. To view the Allure HTML report locally you
> need **Java 11+** installed (`brew install openjdk` on macOS,
> `sudo apt install default-jre` on Ubuntu). The CI workflows already
> have Java pre-installed and upload `reports/allure-report` as an
> artifact. `npm run report:allure` regenerates and serves the report
> on a local port; press Ctrl+C to stop the server when finished.

---

## Part 5 — Git checkpoints

Claude suggests a commit at each milestone — you confirm before anything
is committed. Suggested checkpoints:

| Milestone | Commit message |
|---|---|
| After scaffold | `initial scaffold` |
| After first feature passes | `add login tests` |
| After healing fixes | `fix login selector` |
| After new page object | `add CheckoutPage` |

To push to GitHub for the first time:

1. Create a new repository at github.com (do NOT initialise with README).
2. Copy the remote URL.
3. Tell Claude: *"Add the remote `<your-url>` and push to GitHub"*

Claude will run `git remote add origin <url>` + `git push -u origin main`
after you confirm.

---

## Troubleshooting

**Tests fail with "global.setup.ts has not been wired up yet"**
You skipped Step 14. Tell Claude *"Wire up global.setup.ts with the real
login flow"* once `LoginPage` exists.

**Tests fail with "Missing required env var: BASE_URL"**
You skipped Step 10. Run `cp .env.example .env` and fill in the values.

**Agent runs hang or tools "fail silently"**
You skipped MCP approval in Step 7. Re-open Claude Code and approve the
`playwright-test` MCP server when prompted.

**`.mcp.json` keeps appearing as a git change**
It's machine-specific (paths to your local Claude config) and is in
`.gitignore` from scaffold. If it's still showing, `git rm --cached
.mcp.json` once and commit.

**`npx playwright install` fails on Linux/CI**
Always use `--with-deps` so OS-level libraries (libnss, libxkbcommon)
get installed. Without it, browsers won't launch on most CI images.

**Login tests pass locally but fail in CI**
You almost certainly placed a login spec outside `tests/login/`. The
`login-tests` project only matches that path (Rule C5); anything else
inherits saved auth state and breaks unpredictably.

**Tests time out on a known-slow page**
Don't add `page.waitForTimeout()` (Rule 7). Instead, override the page's
`waitForReady()` with the right locator-based wait, or pass a longer
timeout into `page.goto({ timeout: 60_000 })`.

---

## File reference

| File | Purpose | Read by |
|---|---|---|
| `CLAUDE.md` | POM rules, credential rules, code style — always active | Claude (every session) |
| `README.md` | This file — human quick-start guide | You |
| `docs/SCAFFOLD.md` | Project setup templates and instructions | Claude (new project only) |
| `docs/AGENTS.md` | Feature workflow, agent rules, retry policy | Claude (per feature) |
| `docs/[feature].md/pdf/docx` | Your SRS / PRD / spec | Claude (per feature) |
| `playwright.config.ts` | Browser projects, retries, reporters, auth wiring | Playwright |
| `tsconfig.json` | TypeScript strict-mode compiler options | tsc |
| `eslint.config.mjs` | Playwright anti-pattern lint rules | ESLint |
| `.env` / `.env.example` | Real credentials (gitignored) / committed template | Tests |
| `fixtures/testData.ts` | Single gateway for credential reads (Rule C1) | Tests |
| `fixtures/index.ts` | Custom `test` export with all POM fixtures | Tests |
| `pages/BasePage.ts` | Base class every page object extends | Page objects |
| `tests/seed.spec.ts` | Planner bootstrap + style reference (do not modify) | Claude + Planner |
| `specs/` | Planner output — human-readable test plans | Claude + You |
| `.auth/` | Saved storageState sessions (gitignored) | Playwright |
| `.github/workflows/playwright.yml` | Full regression on merge to main | GitHub Actions |
| `.github/workflows/pr-check.yml` | Smoke tests on every PR | GitHub Actions |
| `.mcp.json` | Local Claude Code MCP config (gitignored, machine-specific) | Claude Code |
