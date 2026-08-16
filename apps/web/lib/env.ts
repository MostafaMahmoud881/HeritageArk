const isProduction = process.env.NODE_ENV === 'production';
const isClient = typeof window !== 'undefined';

function required(name: string, fallback?: string): string {
  const val = process.env[name] ?? fallback ?? '';
  if (!val && isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',

  APP_URL: isClient
    ? window.location.origin
    : optional('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),

  API_URL: required('NEXT_PUBLIC_API_URL', 'http://localhost:4000/api/v1'),

  MAPBOX_TOKEN: optional('NEXT_PUBLIC_MAPBOX_TOKEN', ''),

  GA_ID: optional('NEXT_PUBLIC_GA_ID', ''),

  SENTRY_DSN: optional('NEXT_PUBLIC_SENTRY_DSN', ''),

  JWT_SECRET: required('JWT_SECRET', 'development-secret-do-not-use-in-production'),
} as const;

export type Env = typeof env;
