import playwright from 'eslint-plugin-playwright';

export default [
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
  },
];
