/**
 * Vercel AI SDK Image Generation Service
 *
 * SERVER-ONLY: Uses 'ai' package and provider SDKs.
 * Do NOT import this file from client components.
 */

import { generateImage, NoImageGeneratedError } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { VERCEL_AI_CONFIG, hasVercelImageProvider } from './vercel-config';

export interface VercelImageResult {
  url: string;
  alt: string;
  provider: 'openai' | 'google';
  revisedPrompt?: string;
}

type ImageProvider = 'openai' | 'google' | 'auto';

function getProviderModel(provider: ImageProvider) {
  switch (provider) {
    case 'openai':
      return openai.imageModel('dall-e-3');
    case 'google':
      return google.imageModel('imagen-3.0-generate-002');
    default:
      if (VERCEL_AI_CONFIG.openaiKey) return openai.imageModel('dall-e-3');
      if (VERCEL_AI_CONFIG.googleKey) return google.imageModel('imagen-3.0-generate-002');
      throw new Error('No image provider configured');
  }
}

function extractImageUrl(file: { base64?: string; url?: string; mediaType?: string }): string {
  if (typeof file.url === 'string' && file.url) return file.url;
  if (typeof file.base64 === 'string' && file.base64) {
    const mediaType = file.mediaType || 'image/png';
    return `data:${mediaType};base64,${file.base64}`;
  }
  throw new Error('Generated file has no usable URL or base64 data');
}

export async function generateVercelImage(
  prompt: string,
  options?: {
    provider?: ImageProvider;
    size?: `${number}x${number}`;
    n?: number;
    negativePrompt?: string;
  },
): Promise<VercelImageResult> {
  if (!hasVercelImageProvider()) {
    throw new Error('No Vercel AI image provider configured. Set OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.');
  }

  const provider = options?.provider || 'auto';
  const model = getProviderModel(provider);

  const heritagePrompt = `Professional heritage photography, museum quality, detailed texture, natural lighting, ${prompt}`;

  try {
    const result = await generateImage({
      model,
      prompt: heritagePrompt,
      n: options?.n || 1,
      size: options?.size || '1024x1024',
    });

    const image = result.image;
    if (!image) {
      throw new Error('Image generation returned no images. Try a different prompt.');
    }

    const url = extractImageUrl(image as { base64?: string; url?: string; mediaType?: string });

    const resolvedProvider = provider === 'auto'
      ? (VERCEL_AI_CONFIG.openaiKey ? 'openai' : 'google')
      : provider;

    return {
      url,
      alt: prompt,
      provider: resolvedProvider,
    };
  } catch (err) {
    if (err instanceof NoImageGeneratedError) {
      throw new Error('Image generation returned no images. Try a different prompt.');
    }
    if (err instanceof Error) throw err;
    throw new Error(String(err));
  }
}

export async function verifyVercelImageConnection() {
  const results: Record<string, { available: boolean; error?: string }> = {};

  if (VERCEL_AI_CONFIG.openaiKey) {
    try {
      await generateImage({
        model: openai.imageModel('dall-e-3'),
        prompt: 'test',
        n: 1,
        size: '1024x1024',
      });
      results.openai = { available: true };
    } catch (e) {
      results.openai = { available: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  if (VERCEL_AI_CONFIG.googleKey) {
    try {
      await generateImage({
        model: google.imageModel('imagen-3.0-generate-002'),
        prompt: 'test',
        n: 1,
      });
      results.google = { available: true };
    } catch (e) {
      results.google = { available: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return results;
}
