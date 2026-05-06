// types/index.ts

export interface User {
  username: string;
  password: string;
  role:     'standard' | 'locked' | 'admin' | 'readonly' | string;
}

export interface InvalidCredential {
  username: string;
  password: string;
}

export interface InventoryProduct {
  name:  string;
  price: number;
}

export interface InventoryData {
  expectedProducts:      InventoryProduct[];
  expectedNamesAZ:       string[];
  expectedNamesZA:       string[];
  expectedPricesLowHigh: number[];
  expectedPricesHighLow: number[];
}

export interface TestData {
  users: {
    validUser:  User;
    lockedUser: User;
    [key: string]: User;
  };
  invalidCredentials: {
    wrongPassword:  InvalidCredential;
    wrongUsername:  InvalidCredential;
    emptyUsername:  InvalidCredential;
    emptyPassword:  InvalidCredential;
    sqlInjection:   InvalidCredential;
    exceededLength: InvalidCredential;
  };
  errorMessages: Record<string, string>;
  inventory:     InventoryData;
}
