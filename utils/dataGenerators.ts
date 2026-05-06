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
