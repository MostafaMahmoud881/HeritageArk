/**
 * Server-only URL validation utilities.
 * Do NOT import this file from client components.
 */

const ALLOWED_URL_PROTOCOLS = ['https:'];
const ALLOWED_URL_HOSTS = [
  'cdn.heritageverse.dev',
  'upload.wikimedia.org',
  'images.unsplash.com',
  'source.unsplash.com',
  'api.heritageverse.org',
];

export function validateUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
      return null;
    }
    if (!ALLOWED_URL_HOSTS.includes(parsed.hostname)) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

export function sanitizeQuery(query: string): string {
  return query.replace(/[^\w\s-]/g, '').slice(0, 200);
}
