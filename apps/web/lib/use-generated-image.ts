'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GeneratedImage {
  url: string;
  alt: string;
  source: string;
  loading: boolean;
  error?: string;
}

/**
 * React hook to asynchronously generate or fetch an image URL.
 * Falls back gracefully: generated image → placeholder URL.
 */
export function useGeneratedImage(
  generateFn: () => Promise<string>,
  deps: any[],
  placeholderUrl?: string,
): GeneratedImage {
  const [url, setUrl] = useState<string>('');
  const [source, setSource] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [alt, setAlt] = useState<string>('');

  const generate = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const resultUrl = await generateFn();
      if (resultUrl) {
        setUrl(resultUrl);
        setSource('generated');
      } else if (placeholderUrl) {
        setUrl(placeholderUrl);
        setSource('placeholder');
      }
    } catch (err: any) {
      console.warn('[useGeneratedImage] Generation failed:', err);
      setError(err.message);
      if (placeholderUrl) {
        setUrl(placeholderUrl);
        setSource('placeholder');
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    generate();
  }, [generate]);

  return { url, alt, source, loading, error };
}

/**
 * Build a semantic image URL for an artifact based on its metadata.
 * Uses a consistent hash so the same artifact always gets the same URL.
 */
export function getArtifactPlaceholderUrl(
  name: string,
  culture: string,
): string {
  const baseUrl = `/api/assets/artifact-image?name=${encodeURIComponent(name)}&culture=${encodeURIComponent(culture)}`;
  return baseUrl;
}

/**
 * Static placeholder generator using UI Avatars-style approach
 * but for heritage artifacts - generates a consistent colored SVG.
 */
export function getHeritagePlaceholderSvg(
  name: string,
  culture: string,
): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  const color1 = `hsl(${hue}, 40%, 60%)`;
  const color2 = `hsl(${(hue + 30) % 360}, 40%, 40%)`;
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1}" />
          <stop offset="100%" style="stop-color:${color2}" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#bg)" />
      <text x="200" y="180" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="80" font-family="serif">${initials}</text>
      <text x="200" y="240" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="24" font-family="serif">${culture}</text>
    </svg>`,
  )}`;
}