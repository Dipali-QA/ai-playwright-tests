# Inventory Feature Test Plan — Swag Labs (saucedemo.com)

## Application Overview

The Inventory (Products) feature is the post-login landing page of the Swag Labs (saucedemo.com) demo e-commerce application, served at `/inventory.html`. It displays a fixed catalog of six Sauce Labs branded products as cards (image, name, description, price), supports sorting by name and price, exposes per-product Add-to-cart / Remove toggle buttons, surfaces a cart icon with a numeric badge, and provides entry points to the Product Detail Page (PDP) and the side navigation menu. All cart state is held in the browser (FR-SESS-01); tests must reset state between cases to remain independent (CLAUDE.md Rule 10). All inventory tests run under the `chromium` Playwright project, which uses the saved `.auth/user.json` storageState produced by `global.setup.ts`.

## Test Scenarios

### 1. Inventory

**Seed:** `tests/seed.spec.ts`

#### 1.1. Page objects required — InventoryPage, ProductDetailPage, CartPage

**File:** `tests/inventory/inventory-page-objects.spec.ts`

**Steps:**
  1. REFERENCE ONLY — not an executable test. Documents the three page objects the Generator must create or extend before writing any inventory test.
    - expect: InventoryPage (pages/InventoryPage.ts) — EXTEND the existing class (do not replace its `path = '/inventory.html'` or its `waitForReady()` which asserts `heading` is visible). Add locators: heading = getByText('Products', { exact: true }) (already present), productCards = locator('[data-test="inventory-item"]') (no role-based equivalent — generic `<div>` cards), productNames = locator('[data-test="inventory-item-name"]'), productDescriptions = locator('[data-test="inventory-item-desc"]'), productPrices = locator('[data-test="inventory-item-price"]'), productImages = locator('.inventory_item_img img'), sortDropdown = getByRole('combobox') (the only `<select>` on the page; falls back to locator('[data-test="product-sort-container"]') if ambiguous), cartIcon = locator('[data-test="shopping-cart-link"]'), cartBadge = locator('[data-test="shopping-cart-badge"]'), burgerMenuButton = getByRole('button', { name: 'Open Menu' }), sideMenu = locator('.bm-menu-wrap'), resetAppStateLink = getByRole('link', { name: 'Reset App State' }), closeMenuButton = getByRole('button', { name: 'Close Menu' }).
    - expect: InventoryPage methods — selectSort(option: 'az' | 'za' | 'lohi' | 'hilo'): selects the matching option value on the dropdown (`'az' | 'za' | 'lohi' | 'hilo'`); getProductNames(): Promise<string[]> returns all visible product names in display order; getProductPrices(): Promise<number[]> returns numeric prices parsed from the `$N.NN` text in display order; addProductToCart(name): clicks the Add-to-cart button scoped to the card matching `name`; removeProductFromCart(name): clicks the Remove button scoped to the card matching `name`; clickProductName(name): clicks the product name link; clickProductImage(name): clicks the image link inside the matching card; openCart(): clicks `cartIcon`; getCartBadgeCount(): Promise<number> returns the numeric badge count, or 0 when the badge is hidden; openBurgerMenu(): clicks `burgerMenuButton` and waits for `sideMenu` to be visible; resetAppState(): opens the burger menu, clicks `resetAppStateLink`, then closes the menu — used in `beforeEach` to guarantee a clean cart for every test (CLAUDE.md Rule 10). Page methods perform actions only and never assert (CLAUDE.md Rule 12).
    - expect: ProductDetailPage (pages/ProductDetailPage.ts): the page is reached only via FR-INV-06 navigation, so override `goto()` to throw — direct URL navigation is not part of this feature. waitForReady() asserts `backToProductsButton` is visible. Locators: backToProductsButton = getByRole('button', { name: 'Back to products' }), productName = locator('[data-test="inventory-details-name"]'), productPrice = locator('[data-test="inventory-details-price"]').
    - expect: CartPage (pages/CartPage.ts): path = '/cart.html', waitForReady() asserts `heading` is visible. Locators: heading = getByText('Your Cart', { exact: true }). This page object is used only to assert post-click navigation from the cart icon (FR-CART-01) — full cart coverage belongs to a separate cart feature plan.
  2. Register all three page objects as fixtures in fixtures/index.ts: inventoryPage (InventoryPage — already registered, ensure the extended class is exported), productDetailPage (ProductDetailPage), cartPage (CartPage).
    - expect: All fixtures are exported from fixtures/index.ts so test files can destructure them without importing page classes directly (CLAUDE.md Rule 2).
  3. Extend fixtures/testData.ts with `testData.inventory`:
    - expect: testData.inventory.expectedProducts: an array of six { name: string; price: number } entries matching SRS Appendix B in alphabetical-by-name order — { 'Sauce Labs Backpack': 29.99 }, { 'Sauce Labs Bike Light': 9.99 }, { 'Sauce Labs Bolt T-Shirt': 15.99 }, { 'Sauce Labs Fleece Jacket': 49.99 }, { 'Sauce Labs Onesie': 7.99 }, { 'Test.allTheThings() T-Shirt (Red)': 15.99 }. testData.inventory.expectedNamesAZ: names sorted A→Z. testData.inventory.expectedNamesZA: names sorted Z→A. testData.inventory.expectedPricesLowHigh: prices sorted low→high. testData.inventory.expectedPricesHighLow: prices sorted high→low. Centralising the catalog here keeps assertions DRY across cart and checkout features later (CLAUDE.md Rule 8).

#### 1.2. Inventory page displays all six products after login

**File:** `tests/inventory/inventory-products-displayed.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach to start each test with an empty cart.
  2. Call inventoryPage.goto() to navigate to '/inventory.html' (the saved auth storageState lands the user post-login).
    - expect: The inventory page loads and inventoryPage.heading ('Products') is visible, confirming waitForReady() passed (FR-INV-01).
  3. Assert inventoryPage.productCards has count equal to 6.
    - expect: Exactly six product cards are rendered, matching the fixed catalog (FR-INV-01, SRS Appendix B). Tags: @smoke.

#### 1.3. Each product card displays image, name, description and price

**File:** `tests/inventory/inventory-product-card-content.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto().
  3. Iterate over each entry in testData.inventory.expectedProducts and, for each product, scope to the matching card via inventoryPage.productCards.filter({ hasText: product.name }) and assert (using expect.soft so all six are reported in one run — CLAUDE.md Rule 14):
    - expect: The card's product image (`.inventory_item_img img`) is visible.
    - expect: The card's name text equals product.name.
    - expect: The card's description text is non-empty (the SRS doesn't fix description content, only that one is shown — FR-INV-02).
    - expect: The card's price text equals `$${product.price.toFixed(2)}`.
  4. After the loop, allow expect.soft to surface any failures.
    - expect: Every card shows image, name, description and price (FR-INV-02). Tags: @regression.

#### 1.4. Default sort is Name A–Z

**File:** `tests/inventory/inventory-default-sort.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto() — do NOT change the sort dropdown.
  3. Call inventoryPage.getProductNames() and assert the returned array deep-equals testData.inventory.expectedNamesAZ.
    - expect: The inventory page loads with the default sort applied as Name (A to Z) (observed live behaviour for FR-INV-04 / FR-INV-05). Tags: @regression.

#### 1.5. Sorting by Name (Z to A) re-orders products correctly

**File:** `tests/inventory/inventory-sort-name-za.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto().
  3. Call inventoryPage.selectSort('za').
  4. Call inventoryPage.getProductNames() and assert the returned array deep-equals testData.inventory.expectedNamesZA.
    - expect: All six product names are listed in reverse alphabetical order (FR-INV-04, FR-INV-05). Tags: @regression.

#### 1.6. Sorting by Price (low to high) re-orders products correctly

**File:** `tests/inventory/inventory-sort-price-low-high.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto().
  3. Call inventoryPage.selectSort('lohi').
  4. Call inventoryPage.getProductPrices() and assert the returned array deep-equals testData.inventory.expectedPricesLowHigh.
    - expect: All six product prices are listed in ascending order (FR-INV-04, FR-INV-05). Tags: @regression.

#### 1.7. Sorting by Price (high to low) re-orders products correctly

**File:** `tests/inventory/inventory-sort-price-high-low.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto().
  3. Call inventoryPage.selectSort('hilo').
  4. Call inventoryPage.getProductPrices() and assert the returned array deep-equals testData.inventory.expectedPricesHighLow.
    - expect: All six product prices are listed in descending order (FR-INV-04, FR-INV-05). Tags: @regression.

#### 1.8. Adding a product toggles the button to Remove and updates the cart badge to 1

**File:** `tests/inventory/inventory-add-to-cart.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach so the cart starts empty.
  2. Call inventoryPage.goto().
  3. Call inventoryPage.addProductToCart('Sauce Labs Backpack').
  4. Within the Backpack card, assert the Remove button is visible AND the Add-to-cart button is NOT visible.
    - expect: The Add-to-cart button has been replaced by a Remove button on the same card (FR-INV-03, FR-INV-10).
  5. Assert inventoryPage.cartBadge has text equal to '1'.
    - expect: The cart badge displays '1' immediately after adding (FR-INV-07, FR-INV-10). Tags: @smoke @critical.

#### 1.9. Removing a product toggles the button back to Add and hides the cart badge

**File:** `tests/inventory/inventory-remove-from-cart.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto().
  3. Call inventoryPage.addProductToCart('Sauce Labs Bike Light') to seed the cart.
  4. Assert inventoryPage.cartBadge has text equal to '1' (sanity check that the seed step worked).
  5. Call inventoryPage.removeProductFromCart('Sauce Labs Bike Light').
  6. Within the Bike Light card, assert the Add-to-cart button is visible AND the Remove button is NOT visible.
    - expect: The Remove button has been replaced by an Add-to-cart button on the same card (FR-INV-03, FR-INV-10).
  7. Assert inventoryPage.cartBadge is hidden (toBeHidden).
    - expect: The cart badge is no longer rendered when the cart is empty (FR-INV-08). Tags: @regression.

#### 1.10. Adding multiple products updates the cart badge to the correct total

**File:** `tests/inventory/inventory-multiple-items-badge.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto().
  3. Call inventoryPage.addProductToCart('Sauce Labs Backpack').
  4. Call inventoryPage.addProductToCart('Sauce Labs Bike Light').
  5. Call inventoryPage.addProductToCart('Sauce Labs Onesie').
  6. Assert inventoryPage.cartBadge has text equal to '3'.
    - expect: The cart badge accurately reflects the cumulative count of items added (FR-INV-07, FR-INV-10). Tags: @regression.

#### 1.11. Cart badge is hidden when the cart is empty on initial load

**File:** `tests/inventory/inventory-empty-cart-no-badge.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach to guarantee an empty cart.
  2. Call inventoryPage.goto().
  3. Assert inventoryPage.cartBadge is hidden (toBeHidden).
    - expect: When the cart contains zero items, no numeric badge is rendered next to the cart icon (FR-INV-08). Tags: @regression.

#### 1.12. Clicking a product name navigates to the Product Detail page

**File:** `tests/inventory/inventory-product-name-navigates-pdp.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto().
  3. Call inventoryPage.clickProductName('Sauce Labs Backpack').
  4. Call productDetailPage.waitForReady().
  5. Assert productDetailPage.productName has text equal to 'Sauce Labs Backpack'.
    - expect: The browser navigates to the PDP for the clicked product, and the PDP renders the matching product name (FR-INV-06). Tags: @regression.

#### 1.13. Clicking a product image navigates to the Product Detail page

**File:** `tests/inventory/inventory-product-image-navigates-pdp.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto().
  3. Call inventoryPage.clickProductImage('Sauce Labs Fleece Jacket').
  4. Call productDetailPage.waitForReady().
  5. Assert productDetailPage.productName has text equal to 'Sauce Labs Fleece Jacket'.
    - expect: Clicking the product image navigates to the PDP for the same product (FR-INV-06 — image OR name as separate entry points). Tags: @regression.

#### 1.14. Cart icon navigates to the Cart page

**File:** `tests/inventory/inventory-cart-icon-navigates.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach.
  2. Call inventoryPage.goto().
  3. Call inventoryPage.openCart() — clicks the cart icon in the page header.
  4. Call cartPage.waitForReady().
  5. Assert the current page URL ends with '/cart.html'.
    - expect: Clicking the cart icon navigates the user to the Cart page (FR-CART-01). Tags: @smoke.

#### 1.15. Burger icon opens the side navigation panel

**File:** `tests/inventory/inventory-burger-menu-opens.spec.ts`

**Steps:**
  1. Call inventoryPage.resetAppState() in test.beforeEach (this also closes the menu after reset, leaving a clean state).
  2. Call inventoryPage.goto().
  3. Assert inventoryPage.sideMenu is hidden initially (sanity check).
  4. Call inventoryPage.openBurgerMenu().
  5. Assert inventoryPage.resetAppStateLink is visible (a stable item inside the panel proves the panel is open).
    - expect: Clicking the burger icon opens the side navigation panel (FR-INV-09). Full coverage of the panel's individual options (All Items, About, Logout, Reset App State — FR-NAV-02..06) is out of scope for this plan and belongs to a dedicated nav-menu feature plan. Tags: @regression.
