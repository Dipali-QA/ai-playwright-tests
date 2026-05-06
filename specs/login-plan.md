# Login Feature Test Plan — Swag Labs (saucedemo.com)

## Application Overview

The Login feature is the entry point for the Swag Labs (saucedemo.com) demo e-commerce application. It provides a username/password form against a fixed list of pre-defined accounts, all sharing the password `secret_sauce`. Authentication is client-side only — no real backend. The base URL is https://www.saucedemo.com. All tests live under `tests/login/` and run under the `login-tests` Playwright project, which sets `storageState: undefined` to guarantee a fresh, unauthenticated browser for every test (CLAUDE.md Rule C5).

## Test Scenarios

### 1. Login

**Seed:** `tests/seed.spec.ts`

#### 1.1. Page objects required — LoginPage and InventoryPage

**File:** `tests/login/login-page-objects.spec.ts`

**Steps:**
  1. REFERENCE ONLY — not an executable test. Documents the two page objects the Generator must create before writing any test.
    - expect: LoginPage (pages/LoginPage.ts): path = '/', waitForReady() asserts loginButton is visible. Locators: usernameField = getByPlaceholder('Username'), passwordField = getByPlaceholder('Password'), loginButton = getByRole('button', { name: 'Login' }), errorMessage = locator('[data-test="error"]') (role-based fallback not available for the dynamic error container), errorDismissButton = locator('[data-test="error"] button') — the × close icon inside the error container, infoPanel = locator('.login_credentials') or getByText('Accepted usernames'), infoPanelUsernames = locator('#login_credentials'), infoPanelPassword = locator('#login_password').
    - expect: InventoryPage (pages/InventoryPage.ts): path = '/inventory.html', waitForReady() asserts heading is visible. Locators: heading = getByRole('heading', { name: 'Products' }). This page object is used only to assert post-login success — no inventory-feature tests belong here.
  2. Register both page objects as fixtures in fixtures/index.ts: loginPage (LoginPage) and inventoryPage (InventoryPage).
    - expect: Both fixtures are exported from fixtures/index.ts so test files can destructure them without importing page classes directly (CLAUDE.md Rule 2).

#### 1.2. Standard user logs in successfully

**File:** `tests/login/login-valid-credentials.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/' (baseURL = https://www.saucedemo.com).
    - expect: The login page is displayed and loginPage.loginButton is visible, confirming waitForReady() passed.
  2. Call loginPage.login(testData.users.validUser) — fills usernameField with testData.users.validUser.username, fills passwordField with testData.users.validUser.password, then clicks loginButton.
  3. Assert that inventoryPage.heading is visible.
    - expect: The heading with the text 'Products' is visible on the page, confirming the user has been redirected to /inventory.html (FR-LOGIN-09). Tags: @smoke @critical.

#### 1.3. Login page renders all required UI elements

**File:** `tests/login/login-ui-elements.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads without errors.
  2. Assert loginPage.usernameField is visible.
    - expect: The username input field (placeholder 'Username') is present and visible (FR-LOGIN-01).
  3. Assert loginPage.passwordField is visible.
    - expect: The password input field (placeholder 'Password') is present and visible (FR-LOGIN-01).
  4. Assert loginPage.loginButton is visible and has accessible name 'Login'.
    - expect: The Login button is present and visible (FR-LOGIN-01). Tags: @smoke.

#### 1.4. Info panel lists accepted usernames and shared password

**File:** `tests/login/login-info-panel.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Assert loginPage.infoPanelUsernames is visible and contains the text 'standard_user'.
    - expect: The info panel includes the standard_user entry.
  3. Assert the info panel also contains 'locked_out_user', 'problem_user', 'performance_glitch_user', 'error_user', and 'visual_user' — use expect.soft() for each independent username assertion.
    - expect: All 6 pre-defined usernames are listed in the info panel (FR-LOGIN-02). Any missing username is reported without stopping the test.
  4. Assert loginPage.infoPanelPassword is visible and contains the text 'secret_sauce'.
    - expect: The shared password is displayed in the info panel (FR-LOGIN-02). Tags: @smoke.

#### 1.5. Password field masks entered characters

**File:** `tests/login/login-password-masking.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Assert that loginPage.passwordField has the attribute type equal to 'password'.
    - expect: The password input has type='password', meaning the browser will mask the entered characters (FR-LOGIN-03). Tags: @smoke.

#### 1.6. Empty username submit shows username-required error

**File:** `tests/login/login-empty-username.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Call loginPage.submitWithCredentials(testData.invalidCredentials.emptyUsername) — fills usernameField with '' (empty string), fills passwordField with 'secret_sauce', then clicks loginButton.
  3. Assert loginPage.errorMessage has text equal to testData.errorMessages.usernameRequired ('Epic sadface: Username is required').
    - expect: The exact error message 'Epic sadface: Username is required' is displayed (FR-LOGIN-05). The user remains on the login page. Tags: @regression.

#### 1.7. Username provided, empty password submit shows password-required error

**File:** `tests/login/login-empty-password.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Call loginPage.submitWithCredentials(testData.invalidCredentials.emptyPassword) — fills usernameField with 'standard_user', fills passwordField with '' (empty string), then clicks loginButton.
  3. Assert loginPage.errorMessage has text equal to testData.errorMessages.passwordRequired ('Epic sadface: Password is required').
    - expect: The exact error message 'Epic sadface: Password is required' is displayed (FR-LOGIN-06). The user remains on the login page. Tags: @regression.

#### 1.8. Both fields empty — username-required error wins

**File:** `tests/login/login-both-fields-empty.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Call loginPage.submitEmptyForm() — leaves both fields empty and clicks loginButton.
  3. Assert loginPage.errorMessage has text equal to testData.errorMessages.usernameRequired ('Epic sadface: Username is required').
    - expect: Validation runs username-first; even with both fields empty the username-required error fires first (FR-LOGIN-05 SRS precedence). The user remains on the login page. Tags: @regression.

#### 1.9. Wrong username (valid format) shows credential-mismatch error

**File:** `tests/login/login-wrong-username.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Call loginPage.submitWithCredentials(testData.invalidCredentials.wrongUsername) — fills usernameField with 'notexist-qa', fills passwordField with 'secret_sauce', then clicks loginButton.
  3. Assert loginPage.errorMessage has text equal to testData.errorMessages.credentialsMismatch ('Epic sadface: Username and password do not match any user in this service').
    - expect: The exact credential-mismatch error message is displayed (FR-LOGIN-07). The user remains on the login page. Tags: @regression.

#### 1.10. Valid username with wrong password shows credential-mismatch error

**File:** `tests/login/login-wrong-password.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Call loginPage.submitWithCredentials(testData.invalidCredentials.wrongPassword) — fills usernameField with 'standard_user', fills passwordField with 'WrongPass@999', then clicks loginButton.
  3. Assert loginPage.errorMessage has text equal to testData.errorMessages.credentialsMismatch ('Epic sadface: Username and password do not match any user in this service').
    - expect: The exact credential-mismatch error message is displayed (FR-LOGIN-07). The user remains on the login page. Tags: @regression.

#### 1.11. SQL-injection-style input shows credential-mismatch error (no special handling)

**File:** `tests/login/login-sql-injection.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Call loginPage.submitWithCredentials(testData.invalidCredentials.sqlInjection) — fills usernameField with the SQL injection string (\' OR 1=1 --), fills passwordField with the same SQL injection string, then clicks loginButton.
  3. Assert loginPage.errorMessage has text equal to testData.errorMessages.credentialsMismatch ('Epic sadface: Username and password do not match any user in this service').
    - expect: The app treats SQL-injection strings as plain invalid credentials and returns the standard mismatch message. No special SQL handling, no redirect, no crash (FR-LOGIN-07). Tags: @regression.

#### 1.12. Excessively long input shows credential-mismatch error

**File:** `tests/login/login-exceeded-length.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Call loginPage.submitWithCredentials(testData.invalidCredentials.exceededLength) — fills usernameField with a 256-character string of 'a', fills passwordField with 'secret_sauce', then clicks loginButton.
  3. Assert loginPage.errorMessage has text equal to testData.errorMessages.credentialsMismatch ('Epic sadface: Username and password do not match any user in this service').
    - expect: The app gracefully handles an excessively long username and returns the standard mismatch message without error or crash (FR-LOGIN-07). Tags: @regression.

#### 1.13. Locked-out user with correct password shows locked-out error

**File:** `tests/login/login-locked-user.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Call loginPage.login(testData.users.lockedUser) — fills usernameField with testData.users.lockedUser.username (locked_out_user from env), fills passwordField with testData.users.lockedUser.password (secret_sauce from env), then clicks loginButton.
  3. Assert loginPage.errorMessage has text equal to testData.errorMessages.userLockedOut ('Epic sadface: Sorry, this user has been locked out.').
    - expect: The exact locked-out error message is displayed (FR-LOGIN-08). The user is NOT redirected to the inventory page; they remain on the login page. Tags: @regression.

#### 1.14. Error message can be dismissed using the X icon

**File:** `tests/login/login-error-dismissal.spec.ts`

**Steps:**
  1. Call loginPage.goto() to navigate to '/'.
    - expect: The login page loads.
  2. Call loginPage.submitWithCredentials(testData.invalidCredentials.wrongPassword) to trigger an error message — fills usernameField with 'standard_user', fills passwordField with 'WrongPass@999', then clicks loginButton.
  3. Assert loginPage.errorMessage is visible, confirming the error banner is showing.
    - expect: The error banner is visible before attempting dismissal.
  4. Call loginPage.dismissError() — clicks the × (errorDismissButton) inside the error container.
  5. Assert loginPage.errorMessage is not visible (toBeHidden or not.toBeVisible).
    - expect: The error banner is hidden after clicking the × button (FR-LOGIN-10). The user remains on the login page. Tags: @regression.

#### 1.15. Direct navigation to /inventory.html while unauthenticated redirects to login

**File:** `tests/login/login-auth-redirect-inventory.spec.ts`

**Steps:**
  1. Start from a fresh, unauthenticated browser (no cookies, no storageState). Navigate directly to https://www.saucedemo.com/inventory.html using page.goto('/inventory.html').
  2. Assert that the current page URL ends with '/' or equals the baseURL (https://www.saucedemo.com), i.e. the browser has been redirected to the login page.
  3. Assert loginPage.loginButton is visible to confirm the login page was rendered.
    - expect: Direct navigation to a protected internal page (/inventory.html) while unauthenticated redirects the user to the login page (FR-LOGIN-11). Tags: @regression.

#### 1.16. Direct navigation to /cart.html while unauthenticated redirects to login

**File:** `tests/login/login-auth-redirect-cart.spec.ts`

**Steps:**
  1. Start from a fresh, unauthenticated browser. Navigate directly to https://www.saucedemo.com/cart.html using page.goto('/cart.html').
  2. Assert that the current page URL does not contain '/cart.html' and that loginPage.loginButton is visible.
    - expect: Direct navigation to /cart.html while unauthenticated redirects the user to the login page (FR-LOGIN-11). Tags: @regression.

#### 1.17. Direct navigation to /checkout-step-one.html while unauthenticated redirects to login

**File:** `tests/login/login-auth-redirect-checkout.spec.ts`

**Steps:**
  1. Start from a fresh, unauthenticated browser. Navigate directly to https://www.saucedemo.com/checkout-step-one.html using page.goto('/checkout-step-one.html').
  2. Assert that the current page URL does not contain '/checkout-step-one.html' and that loginPage.loginButton is visible.
    - expect: Direct navigation to /checkout-step-one.html while unauthenticated redirects the user to the login page (FR-LOGIN-11). Tags: @regression.
