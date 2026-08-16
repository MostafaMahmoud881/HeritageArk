/**
 * Voice Cache — Audio file caching layer
 * 
 * Generates narration audio once, saves to disk, reuses on future requests.
 * Cache key = hash of (text + language + voice)
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(process.cwd(), 'public', 'generated-audio');
const CACHE_INDEX_PATH = path.join(CACHE_DIR, 'index.json');

interface CacheIndex {
  [hash: string]: {
    filename: string;
    textPreview: string;
    language: string;
    voice: string;
    createdAt: number;
    durationMs: number;
  };
}

let cacheIndex: CacheIndex | null = null;

async function loadIndex(): Promise<CacheIndex> {
  if (cacheIndex) return cacheIndex;
  try {
    const raw = await readFile(CACHE_INDEX_PATH, 'utf-8');
    cacheIndex = JSON.parse(raw);
  } catch {
    cacheIndex = {};
  }
  return cacheIndex!;
}

async function saveIndex(): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_INDEX_PATH, JSON.stringify(cacheIndex || {}, null, 2));
}

export function getCacheKey(text: string, language: string, voice: string): string {
  return crypto.createHash('md5').update(`${text}|${language}|${voice}`).digest('hex');
}

export async function getCachedAudio(
  text: string,
  language: string,
  voice: string,
): Promise<{ url: string; durationMs: number } | null> {
  const index = await loadIndex();
  const key = getCacheKey(text, language, voice);
  const entry = index[key];
  if (!entry) return null;

  const filePath = path.join(CACHE_DIR, entry.filename);
  try {
    await readFile(filePath);
    return { url: `/generated-audio/${entry.filename}`, durationMs: entry.durationMs };
  } catch {
    // File missing, remove from index
    delete index[key];
    await saveIndex();
    return null;
  }
}

export async function saveCachedAudio(
  text: string,
  language: string,
  voice: string,
  audioBuffer: Buffer,
  durationMs: number,
): Promise<string> {
  const index = await loadIndex();
  const key = getCacheKey(text, language, voice);
  const filename = `narration-${key}.mp3`;
  const filePath = path.join(CACHE_DIR, filename);

  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(filePath, audioBuffer);

  index[key] = {
    filename,
    textPreview: text.slice(0, 60),
    language,
    voice,
    createdAt: Date.now(),
    durationMs,
  };

  await saveIndex();
  return `/generated-audio/${filename}`;
}

export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalSizeBytes: number;
  languages: Record<string, number>;
}> {
  const index = await loadIndex();
  const entries = Object.values(index);
  const languages: Record<string, number> = {};

  for (const entry of entries) {
    languages[entry.language] = (languages[entry.language] || 0) + 1;
  }

  return {
    totalEntries: entries.length,
    totalSizeBytes: 0, // would need to sum file sizes
    languages,
  };
}