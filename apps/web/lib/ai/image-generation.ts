/**
 * HuggingFace Image Generation Service
 * 
 * SERVER-ONLY: This file uses Node.js modules (fs/promises, path).
 * Do NOT import this file from client components.
 * Use the API route at /api/ai/image instead.
 */

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// ─── Types ───────────────────────────────────────────────────────────

export interface ImageGenerationResult {
  url: string;
  alt: string;
  source: 'huggingface' | 'wikimedia' | 'unsplash' | 'placeholder';
  width?: number;
  height?: number;
}

interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
}

// ─── Logging ─────────────────────────────────────────────────────────

function log(level: string, label: string, data?: any) {
  const ts = new Date().toISOString();
  const prefix = `[IMG_GEN ${ts}] [${level}]`;
  if (data) {
    console.log(`${prefix} ${label}:`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${label}`);
  }
}

// ─── Configuration ───────────────────────────────────────────────────

const HF_TOKEN = process.env.HF_TOKEN || '';
const MODELS = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-xl-base-1.0',
  'runwayml/stable-diffusion-v1-5',
];

const GENERATED_DIR = path.join(process.cwd(), 'public', 'generated');

// ─── HF API Call ─────────────────────────────────────────────────────

async function callHuggingFace(
  model: string,
  params: GenerationRequest,
): Promise<ArrayBuffer | null> {
  if (!HF_TOKEN) {
    log('WARN', 'HF_TOKEN not configured, skipping HF call');
    return null;
  }

  const url = `https://api-inference.huggingface.co/models/${model}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${HF_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Enhance prompt for professional product/heritage photography
  const enhancedPrompt = `Professional heritage photography, museum quality, detailed texture, natural lighting, high resolution, cultural artifact, ${params.prompt}`;

  const body: Record<string, any> = {
    inputs: enhancedPrompt,
    parameters: {
      negative_prompt: params.negativePrompt || 'blurry, low quality, distorted, ugly, cartoon, anime, text, watermark, signature',
      num_inference_steps: 25,
      guidance_scale: 7.5,
    },
  };

  if (params.width && params.height) {
    body.parameters.width = params.width;
    body.parameters.height = params.height;
  }

  log('INFO', `Calling HF model: ${model}`, { prompt: enhancedPrompt.slice(0, 100) });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      log('WARN', `HF API error [${response.status}] for ${model}`, errorText.slice(0, 300));
      
      if (response.status === 401 || response.status === 403) {
        log('ERROR', 'HF authentication failed - check HF_TOKEN');
        return null;
      }
      if (response.status === 503) {
        log('WARN', `Model ${model} is loading, try next model`);
        return null;
      }
      if (response.status === 429) {
        log('WARN', 'Rate limited by HF API');
        return null;
      }
      return null;
    }

    const buffer = await response.arrayBuffer();
    log('INFO', `HF success for ${model}`, { size: `${(buffer.byteLength / 1024).toFixed(1)}KB` });
    return buffer;
  } catch (err: any) {
    log('ERROR', `HF network error for ${model}`, err.message);
    return null;
  }
}

// ─── Save Image Locally ──────────────────────────────────────────────

async function saveImage(buffer: ArrayBuffer, filename: string): Promise<string> {
  await mkdir(GENERATED_DIR, { recursive: true });
  const filepath = path.join(GENERATED_DIR, filename);
  await writeFile(filepath, Buffer.from(buffer));
  const publicPath = `/generated/${filename}`;
  log('INFO', `Saved image: ${publicPath}`);
  return publicPath;
}

// ─── Wikimedia Commons Fallback ──────────────────────────────────────

async function searchWikimedia(query: string): Promise<string | null> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.search || [];
    
    if (pages.length > 0) {
      const title = pages[0].title;
      const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=800`;
      log('INFO', 'Wikimedia fallback found', { title, imageUrl });
      return imageUrl;
    }
  } catch (err: any) {
    log('WARN', 'Wikimedia search failed', err.message);
  }
  return null;
}

// ─── Unsplash Fallback ───────────────────────────────────────────────

async function searchUnsplash(query: string): Promise<string | null> {
  try {
    const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (res.ok && res.url) {
      log('INFO', 'Unsplash fallback found', { url: res.url });
      return res.url;
    }
  } catch (err: any) {
    log('WARN', 'Unsplash search failed', err.message);
  }
  return null;
}

// ─── Generate Image (Main Entry Point) ───────────────────────────────

export async function generateImage(
  prompt: string,
  options?: {
    filename?: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    alt?: string;
  },
): Promise<ImageGenerationResult> {
  const alt = options?.alt || prompt;
  const filename = options?.filename || `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  log('INFO', 'generateImage called', { prompt: prompt.slice(0, 100), filename });

  for (const model of MODELS) {
    const buffer = await callHuggingFace(model, {
      prompt,
      negativePrompt: options?.negativePrompt,
      width: options?.width,
      height: options?.height,
    });

    if (buffer) {
      const url = await saveImage(buffer, filename);
      return { url, alt, source: 'huggingface' };
    }
  }

  log('WARN', 'All HF models failed, trying fallbacks');

  const wikimediaUrl = await searchWikimedia(prompt);
  if (wikimediaUrl) {
    return { url: wikimediaUrl, alt, source: 'wikimedia' };
  }

  const unsplashUrl = await searchUnsplash(prompt);
  if (unsplashUrl) {
    return { url: unsplashUrl, alt, source: 'unsplash' };
  }

  log('WARN', 'All generation methods failed, returning placeholder');
  return { url: '', alt, source: 'placeholder' };
}

// ─── Verify HF Connection ────────────────────────────────────────────

export async function verifyHFConnection(): Promise<{
  connected: boolean;
  message: string;
  models: string[];
}> {
  if (!HF_TOKEN) {
    return {
      connected: false,
      message: 'HF_TOKEN environment variable is not set. Add it to .env.development',
      models: [],
    };
  }

  const testUrl = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';
  const headers = { Authorization: `Bearer ${HF_TOKEN}` };

  try {
    const res = await fetch(testUrl, { method: 'HEAD', headers });

    if (res.status === 200 || res.status === 503) {
      return {
        connected: true,
        message: res.status === 503
          ? 'HF connected, model is loading (expected for cold start)'
          : 'HF connected successfully',
        models: MODELS,
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        connected: false,
        message: 'HF authentication failed. Check your HF_TOKEN is valid.',
        models: [],
      };
    }

    return { connected: true, message: `HF responded with status ${res.status}`, models: MODELS };
  } catch (err: any) {
    return { connected: false, message: `HF connection error: ${err.message}`, models: [] };
  }
}

// ─── Batch Generation Helpers ────────────────────────────────────────

export async function generateArtifactImage(
  name: string,
  culture: string,
  period: string,
  location: string,
  description: string,
): Promise<ImageGenerationResult> {
  const prompt = `${name}, ${culture} artifact from ${period}, ${location}, ${description}, museum quality photograph, detailed texture, natural lighting`;
  const filename = `artifact-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.jpg`;
  return generateImage(prompt, { filename, alt: `${name} - ${culture} artifact` });
}

export async function generateStoryImage(
  storyName: string,
  sceneDescription: string,
  culture: string,
): Promise<ImageGenerationResult> {
  const prompt = `${sceneDescription}, ${culture} historical scene, illustrated storybook style, warm colors, detailed characters, cultural heritage`;
  const filename = `story-${storyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.jpg`;
  return generateImage(prompt, { filename, alt: `${storyName} - ${sceneDescription}` });
}

export async function generateCharacterPortrait(
  characterName: string,
  culture: string,
  era: string,
): Promise<ImageGenerationResult> {
  const prompt = `Portrait of ${characterName}, a ${culture} character from ${era}, traditional clothing, detailed face, warm lighting, historical painting style`;
  const filename = `char-${characterName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.jpg`;
  return generateImage(prompt, { filename, alt: `${characterName} - ${culture} portrait` });
}

export async function generateDocumentaryPoster(
  title: string,
  culture: string,
  period: string,
): Promise<ImageGenerationResult> {
  const prompt = `Documentary poster for "${title}", ${culture} heritage, ${period}, cinematic composition, dramatic lighting, cultural symbols, professional film poster`;
  const filename = `doc-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.jpg`;
  return generateImage(prompt, { filename, alt: `${title} documentary poster` });
}

export async function generateReelThumbnail(
  title: string,
  culture: string,
): Promise<ImageGenerationResult> {
  const prompt = `Thumbnail for "${title}", ${culture} cultural heritage, vibrant colors, engaging composition, 9:16 vertical format, social media style`;
  const filename = `reel-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.jpg`;
  return generateImage(prompt, { filename, alt: `${title} reel thumbnail` });
}