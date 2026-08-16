'use client';

/**
 * Puter.js Integration — Client-side AI features
 * 
 * Wires Puter.js into the existing HeritageArk AI systems:
 * - DALL-E image generation (fallback when HF fails)
 * - AI Chat (additional provider)
 * - Text-to-Speech (additional provider)
 * - Image captioning
 * - Video generation
 * 
 * All functions check if Puter is loaded before calling.
 * Falls back gracefully to existing providers.
 */

import {
  puterTxt2img,
  puterChat,
  puterTxt2speech,
  puterImg2txt,
  puterTxt2vid,
  puterSpeech2txt,
  puterSpeech2speech,
  isPuterAvailable,
} from './puter';

export {
  isPuterAvailable,
  puterTxt2img,
  puterChat,
  puterTxt2speech,
  puterImg2txt,
  puterTxt2vid,
  puterSpeech2txt,
  puterSpeech2speech,
};

/**
 * Generate an image using Puter (DALL-E via Puter.js).
 * Returns a data URL or blob URL.
 */
export async function generateImageWithPuter(
  prompt: string,
): Promise<string | null> {
  if (!isPuterAvailable()) return null;
  try {
    const result = await puterTxt2img(prompt, false);
    return result;
  } catch {
    return null;
  }
}

/**
 * Get an AI chat response via Puter.
 */
export async function chatWithPuter(
  message: string,
  systemPrompt?: string,
): Promise<string | null> {
  if (!isPuterAvailable()) return null;
  try {
    const fullMessage = systemPrompt
      ? `${systemPrompt}\n\nUser: ${message}`
      : message;
    return await puterChat(fullMessage);
  } catch {
    return null;
  }
}