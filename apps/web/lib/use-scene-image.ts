'use client';

import { useState, useEffect, useRef } from 'react';
import { generateImageWithPuter } from './ai/puter-integration';

export type ImageStatus =
  | 'idle'
  | 'generating'
  | 'downloading'
  | 'cached'
  | 'fallback'
  | 'error';

export interface SceneImageDiagnostics {
  provider: string;
  model: string;
  generationDurationMs: number;
  returnedImageUrl: string;
  fallbackUsed: boolean;
  fallbackSource?: string;
  error?: string;
}

export interface SceneImageResult {
  imageUrl: string;
  status: ImageStatus;
  statusLabel: string;
  diagnostics: SceneImageDiagnostics | null;
}

const TIMEOUT_MS = 20_000;

// In-memory cache: sceneId → imageUrl
const imageCache = new Map<string, string>();

function getFallbackUrl(prompt: string, culture: string): string {
  const keywords = encodeURIComponent(`${culture} heritage`);
  return `https://source.unsplash.com/800x450/?${keywords}`;
}

function getCulturePlaceholder(culture: string): string {
  const emoji =
    culture.toLowerCase().includes('egypt') ? '🏛️' :
    culture.toLowerCase().includes('amazigh') ? 'ⵣ' :
    culture.toLowerCase().includes('roman') ? '⚔️' : '🌍';
  const hue = culture.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue},40%,30%)"/>
      <stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360},40%,20%)"/>
    </linearGradient></defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <text x="400" y="200" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="80" font-family="serif">${emoji}</text>
    <text x="400" y="270" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="28" font-family="serif">${culture}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function useSceneImage(
  sceneId: string,
  backgroundPrompt: string,
  culture: string,
  existingImageUrl?: string,
): SceneImageResult {
  const [imageUrl, setImageUrl] = useState<string>(existingImageUrl || imageCache.get(sceneId) || '');
  const [status, setStatus] = useState<ImageStatus>(
    existingImageUrl || imageCache.has(sceneId) ? 'cached' : 'idle',
  );
  const [diagnostics, setDiagnostics] = useState<SceneImageDiagnostics | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Already have a URL — skip generation
    if (existingImageUrl) {
      console.log(`[SCENE_IMAGE] sceneId=${sceneId} using existingImageUrl:`, existingImageUrl);
      setImageUrl(existingImageUrl);
      setStatus('cached');
      return;
    }

    const cached = imageCache.get(sceneId);
    if (cached) {
      console.log(`[SCENE_IMAGE] sceneId=${sceneId} cache hit:`, cached);
      setImageUrl(cached);
      setStatus('cached');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    async function generate() {
      const startMs = Date.now();
      console.log(`[SCENE_IMAGE] ── START ── sceneId=${sceneId}`);
      console.log(`[SCENE_IMAGE] prompt: "${backgroundPrompt}"`);

      setStatus('generating');

      // 20-second timeout via race
      const timeoutId = setTimeout(() => {
        console.warn(`[SCENE_IMAGE] TIMEOUT after ${TIMEOUT_MS}ms for sceneId=${sceneId}`);
        controller.abort();
      }, TIMEOUT_MS);

      let resultUrl = '';
      let provider = 'huggingface';
      let model = 'FLUX.1-schnell';
      let fallbackUsed = false;
      let fallbackSource: string | undefined;
      let genError: string | undefined;

      try {
        console.log(`[SCENE_IMAGE] Sending HF request for sceneId=${sceneId}`);
        setStatus('downloading');

        const res = await fetch('/api/immersive/scene-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneId,
            prompt: backgroundPrompt,
            culture,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          console.log(`[SCENE_IMAGE] API response for sceneId=${sceneId}:`, data);

          const url: string = data?.url ?? '';
          const source: string = data?.source ?? 'unknown';
          const diag = data?.diagnostics;

          console.log(`[SCENE_IMAGE] imageUrl=${url || '(empty)'} source=${source}`);

          if (url && url !== '') {
            resultUrl = url;
            provider = source;
            model = diag?.model ?? source;
            fallbackUsed = source !== 'huggingface' && source !== 'cache';
            fallbackSource = fallbackUsed ? source : undefined;
          } else {
            console.warn(`[SCENE_IMAGE] imageUrl is null/undefined/empty for sceneId=${sceneId}`);
          }
        } else {
          const errText = await res.text().catch(() => '');
          console.error(`[SCENE_IMAGE] API error ${res.status} for sceneId=${sceneId}:`, errText);
          genError = `API ${res.status}`;
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          genError = 'timeout';
          console.warn(`[SCENE_IMAGE] Request aborted (timeout) for sceneId=${sceneId}`);
        } else {
          genError = err.message;
          console.error(`[SCENE_IMAGE] Fetch error for sceneId=${sceneId}:`, err.message);
        }
      }

      // Fallback chain if no URL
      if (!resultUrl) {
        console.warn(`[SCENE_IMAGE] Generation failed, trying Unsplash fallback for sceneId=${sceneId}`);
        setStatus('fallback');
        fallbackUsed = true;

        try {
          const unsplashUrl = getFallbackUrl(backgroundPrompt, culture);
          const probe = await fetch(unsplashUrl, { method: 'HEAD' }).catch(() => null);
          if (probe?.ok) {
            resultUrl = unsplashUrl;
            fallbackSource = 'unsplash';
            provider = 'unsplash';
            console.log(`[SCENE_IMAGE] Unsplash fallback URL:`, resultUrl);
          }
        } catch {
          // ignore
        }
      }

      // Final fallback: culture placeholder SVG
      if (!resultUrl) {
        console.warn(`[SCENE_IMAGE] Using culture placeholder SVG for sceneId=${sceneId}`);
        resultUrl = getCulturePlaceholder(culture);
        fallbackSource = 'placeholder';
        provider = 'placeholder';
      }

      const durationMs = Date.now() - startMs;

      const diag: SceneImageDiagnostics = {
        provider,
        model,
        generationDurationMs: durationMs,
        returnedImageUrl: resultUrl,
        fallbackUsed,
        fallbackSource,
        error: genError,
      };

      console.log(`[SCENE_IMAGE] ── DONE ── sceneId=${sceneId}`, diag);

      imageCache.set(sceneId, resultUrl);
      setImageUrl(resultUrl);
      setDiagnostics(diag);
      setStatus(fallbackUsed ? 'fallback' : 'cached');
    }

    generate();

    return () => {
      abortRef.current?.abort();
    };
  }, [sceneId, backgroundPrompt, culture, existingImageUrl]);

  const statusLabel =
    status === 'generating' ? 'Generating image...' :
    status === 'downloading' ? 'Downloading image...' :
    status === 'fallback' ? 'Using fallback image...' :
    status === 'cached' ? '' :
    status === 'error' ? 'Image unavailable' : '';

  return { imageUrl, status, statusLabel, diagnostics };
}
