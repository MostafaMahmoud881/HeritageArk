export interface FallbackConfig {
  icon: string;
  illustration: string;
  modelPlaceholder: boolean;
  characterPlaceholder: boolean;
}

const FALLBACK_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>`;

let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { isOnline = true; });
  window.addEventListener('offline', () => { isOnline = false; });
}

export function getFallbackIcon(category?: string): string {
  const icons: Record<string, string> = {
    globe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    museum: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    default: FALLBACK_ICON,
  };
  const key = category || 'default';
  return (icons as Record<string, string>)[key] || FALLBACK_ICON;
}

export function getFallbackIllustration(type: string): string {
  return `/assets/illustrations/fallback-${type}.svg`;
}

export function getFallbackModelPlaceholder(): string {
  return '/assets/models/placeholder.glb';
}

export function getFallbackCharacterImage(characterId: string): string {
  return `/assets/characters/fallback-portrait.svg`;
}

export function isExternalAvailable(): boolean {
  return isOnline;
}

export function isAssetAvailable(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  if (url.startsWith('http') && !isOnline) return false;
  return true;
}

export function getSafeUrl(url: string | undefined | null, fallback: string): string {
  if (!url || !isAssetAvailable(url)) return fallback;
  return url;
}
