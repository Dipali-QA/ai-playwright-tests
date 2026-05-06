// fixtures/testData.ts
import { TestData, InventoryProduct } from '../types';

const expectedProducts: InventoryProduct[] = [
  { name: 'Sauce Labs Backpack',                price: 29.99 },
  { name: 'Sauce Labs Bike Light',              price:  9.99 },
  { name: 'Sauce Labs Bolt T-Shirt',            price: 15.99 },
  { name: 'Sauce Labs Fleece Jacket',           price: 49.99 },
  { name: 'Sauce Labs Onesie',                  price:  7.99 },
  { name: 'Test.allTheThings() T-Shirt (Red)',  price: 15.99 },
];

const expectedNamesAZ       = [...expectedProducts].sort((a, b) => a.name.localeCompare(b.name)).map(p => p.name);
const expectedNamesZA       = [...expectedNamesAZ].reverse();
const expectedPricesLowHigh = [...expectedProducts].map(p => p.price).sort((a, b) => a - b);
const expectedPricesHighLow = [...expectedPricesLowHigh].slice().reverse();

export const testData: TestData = {
  users: {
    validUser: {
      username: process.env.TEST_USER_USERNAME || 'SET_IN_ENV_FILE',
      password: process.env.TEST_USER_PASSWORD || 'SET_IN_ENV_FILE',
      role: 'standard',
    },
    lockedUser: {
      username: process.env.LOCKED_USER_USERNAME || 'SET_IN_ENV_FILE',
      password: process.env.LOCKED_USER_PASSWORD || 'SET_IN_ENV_FILE',
      role: 'locked',
    },
    // Claude: add new user roles here explicitly with the same env-var pattern.
  },

  invalidCredentials: {
    wrongPassword:  { username: 'standard_user',                          password: 'WrongPass@999' },
    wrongUsername:  { username: 'notexist-qa',                            password: 'secret_sauce'  },
    emptyUsername:  { username: '',                                       password: 'secret_sauce'  },
    emptyPassword:  { username: 'standard_user',                          password: ''              },
    sqlInjection:   { username: "' OR 1=1 --",                            password: "' OR 1=1 --"   },
    exceededLength: { username: 'a'.repeat(256),                          password: 'secret_sauce'  },
  },

  // Populated as features land — strings come from FR-LOGIN-* / FR-CHK-* in the SRS.
  errorMessages: {
    usernameRequired:    'Epic sadface: Username is required',
    passwordRequired:    'Epic sadface: Password is required',
    credentialsMismatch: 'Epic sadface: Username and password do not match any user in this service',
    userLockedOut:       'Epic sadface: Sorry, this user has been locked out.',
  },

  inventory: {
    expectedProducts,
    expectedNamesAZ,
    expectedNamesZA,
    expectedPricesLowHigh,
    expectedPricesHighLow,
  },
};
