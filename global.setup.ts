// global.setup.ts (project root — import path is ./fixtures)
import { test as setup } from './fixtures';
import { testData } from './fixtures/testData';

const AUTH_FILE = '.auth/user.json';

setup('authenticate standard user', async ({ context, loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login(testData.users.validUser);

  // Confirm we landed on the Inventory page (post-login) before saving state
  await inventoryPage.waitForReady();

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
