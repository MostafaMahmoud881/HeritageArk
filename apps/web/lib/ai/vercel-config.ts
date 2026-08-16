/**
 * Server-only Vercel AI configuration loader.
 * Do NOT import this from client components.
 */

export const VERCEL_AI_CONFIG = {
  vercelKey: process.env.VERCEL_API_KEY || '',
  openaiKey: process.env.OPENAI_API_KEY || '',
  googleKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  stabilityKey: process.env.STABILITY_API_KEY || '',
  runwayKey: process.env.RUNWAYML_API_KEY || '',
  pikaKey: process.env.PIKA_API_KEY || '',
  lumaKey: process.env.LUMA_API_KEY || '',
  appUrl: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
} as const;

export function hasVercelImageProvider(): boolean {
  return !!VERCEL_AI_CONFIG.openaiKey || !!VERCEL_AI_CONFIG.googleKey || !!VERCEL_AI_CONFIG.stabilityKey;
}

export function hasVideoProvider(): boolean {
  return !!VERCEL_AI_CONFIG.runwayKey || !!VERCEL_AI_CONFIG.pikaKey || !!VERCEL_AI_CONFIG.lumaKey;
}
