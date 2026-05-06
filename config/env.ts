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
