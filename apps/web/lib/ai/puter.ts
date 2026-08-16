/**
 * Puter.js AI Integration
 * 
 * Safe wrapper around Puter.js SDK (loaded via CDN).
 * All functions check if Puter is available before calling.
 * Falls back gracefully if Puter is not loaded.
 */

declare global {
  interface Window {
    puter?: any;
  }
}

function log(label: string, data?: any) {
  console.log(`[PUTER] ${label}`, data !== undefined ? data : '');
}

export function isPuterAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.puter?.ai;
}

// ─── Chat ───────────────────────────────────────────────────────────

export async function puterChat(
  message: string,
  model: string = 'gpt-4o-mini',
): Promise<string | null> {
  if (!isPuterAvailable()) return null;
  try {
    log('chat', { message: message.slice(0, 80), model });
    const result = await window.puter.ai.chat(message, { model });
    const text = result?.message?.content?.[0]?.text || result?.text || result || null;
    log('chat response', { text: String(text).slice(0, 100) });
    return text;
  } catch (err: any) {
    log('chat error', err.message);
    return null;
  }
}

// ─── Text to Image (DALL-E via Puter) ───────────────────────────────

export async function puterTxt2img(
  prompt: string,
  download?: boolean,
): Promise<string | null> {
  if (!isPuterAvailable()) return null;
  try {
    log('txt2img', { prompt: prompt.slice(0, 80) });
    const result = await window.puter.ai.txt2img(prompt, download ?? true);
    // Puter returns an HTMLImageElement or Blob URL
    if (typeof result === 'string') return result;
    if (result?.src) return result.src;
    if (result?.url) return result.url;
    if (result instanceof Blob) return URL.createObjectURL(result);
    log('txt2img result type', typeof result);
    return null;
  } catch (err: any) {
    log('txt2img error', err.message);
    return null;
  }
}

// ─── Image to Text (caption/OCR) ────────────────────────────────────

export async function puterImg2txt(imageUrl: string): Promise<string | null> {
  if (!isPuterAvailable()) return null;
  try {
    log('img2txt', { imageUrl: imageUrl.slice(0, 80) });
    const result = await window.puter.ai.img2txt(imageUrl);
    const text = result?.text || result?.description || result || null;
    return text;
  } catch (err: any) {
    log('img2txt error', err.message);
    return null;
  }
}

// ─── Text to Speech ─────────────────────────────────────────────────

export async function puterTxt2speech(text: string, voice?: string): Promise<string | null> {
  if (!isPuterAvailable()) return null;
  try {
    log('txt2speech', { textLen: text.length });
    const result = await window.puter.ai.txt2speech(text);
    // Result is an Audio element or Blob URL
    if (typeof result === 'string') return result;
    if (result?.src) return result.src;
    if (result instanceof Blob) return URL.createObjectURL(result);
    return null;
  } catch (err: any) {
    log('txt2speech error', err.message);
    return null;
  }
}

// ─── Speech to Speech (voice conversion) ────────────────────────────

export async function puterSpeech2speech(
  audioUrl: string,
  options?: { voice?: string; model?: string; output_format?: string },
): Promise<string | null> {
  if (!isPuterAvailable()) return null;
  try {
    log('speech2speech', { audioUrl: audioUrl.slice(0, 60), options });
    const result = await window.puter.ai.speech2speech(audioUrl, {
      voice: options?.voice || '21m00Tcm4TlvDq8ikWAM',
      model: options?.model || 'eleven_multilingual_sts_v2',
      output_format: options?.output_format || 'mp3_44100_128',
    });
    if (typeof result === 'string') return result;
    if (result?.src) return result.src;
    if (result instanceof Blob) return URL.createObjectURL(result);
    return null;
  } catch (err: any) {
    log('speech2speech error', err.message);
    return null;
  }
}

// ─── Text to Video ──────────────────────────────────────────────────

export async function puterTxt2vid(
  prompt: string,
  download?: boolean,
): Promise<string | null> {
  if (!isPuterAvailable()) return null;
  try {
    log('txt2vid', { prompt: prompt.slice(0, 80) });
    const result = await window.puter.ai.txt2vid(prompt, download ?? true);
    // Result is a video element or URL
    if (typeof result === 'string') return result;
    if (result?.src) return result.src;
    if (result?.url) return result.url;
    if (result instanceof Blob) return URL.createObjectURL(result);
    return null;
  } catch (err: any) {
    log('txt2vid error', err.message);
    return null;
  }
}

// ─── Speech to Text (transcription) ─────────────────────────────────

export async function puterSpeech2txt(audioUrl: string): Promise<string | null> {
  if (!isPuterAvailable()) return null;
  try {
    log('speech2txt', { audioUrl: audioUrl.slice(0, 60) });
    const result = await window.puter.ai.speech2txt(audioUrl);
    const text = result?.text || result?.transcript || result || null;
    return text;
  } catch (err: any) {
    log('speech2txt error', err.message);
    return null;
  }
}