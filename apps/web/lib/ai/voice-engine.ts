/**
 * Voice Engine — Multi-provider TTS abstraction
 * 
 * Provider chain:
 * 1. HuggingFace TTS (facebook/mms-tts or espnet/kan-bayashi)
 * 2. Kokoro TTS (via API)
 * 3. Piper TTS (via API)
 * 4. Browser Speech API (final fallback)
 * 
 * Features:
 * - Automatic language detection
 * - Audio caching (server-side)
 * - Scene-level narration
 * - Background preloading
 * - Teacher Mode (sentence highlighting)
 */

// ─── Language Detection ─────────────────────────────────────────────

export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'ber' | 'it' | 'es' | 'de' | 'pt' | 'zh' | 'ja' | 'ko' | 'ru';

const LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  arabic: 'ar',
  english: 'en',
  french: 'fr',
  amazigh: 'ber',
  italian: 'it',
  spanish: 'es',
  german: 'de',
  portuguese: 'pt',
  chinese: 'zh',
  japanese: 'ja',
  korean: 'ko',
  russian: 'ru',
};

export function detectLanguage(text: string): SupportedLanguage {
  // Arabic script
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  // Tifinagh script
  if (/[\u2D30-\u2D7F]/.test(text)) return 'ber';
  // French-specific words
  if (/\b(bonjour|salut|merci|s'il vous plaît|français|paris|monsieur|madame)\b/i.test(text)) return 'fr';
  // Amazigh words
  if (/\b(azul|tanemmirt|akal|tamazight|tifinagh)\b/i.test(text)) return 'ber';
  // Italian
  if (/\b(ciao|buongiorno|grazie|italiano|roma)\b/i.test(text)) return 'it';
  // Spanish
  if (/\b(hola|gracias|español|madrid|barcelona)\b/i.test(text)) return 'es';
  // German
  if (/\b(guten tag|hallo|danke|deutsch|berlin)\b/i.test(text)) return 'de';
  // Default to English
  return 'en';
}

export function getLanguageCode(language: SupportedLanguage): string {
  const codes: Record<SupportedLanguage, string> = {
    ar: 'ar-SA',
    en: 'en-US',
    fr: 'fr-FR',
    ber: 'en-US', // Amazigh fallback to English TTS
    it: 'it-IT',
    es: 'es-ES',
    de: 'de-DE',
    pt: 'pt-PT',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    ru: 'ru-RU',
  };
  return codes[language] || 'en-US';
}

// ─── Voice Provider Types ───────────────────────────────────────────

export type VoiceProvider = 'huggingface' | 'kokoro' | 'piper' | 'elevenlabs' | 'browser';

export interface VoiceResult {
  url: string;
  provider: VoiceProvider;
  durationMs: number;
  cached: boolean;
  language: SupportedLanguage;
  voiceName: string;
}

export interface VoiceDiagnostics {
  provider: VoiceProvider;
  generationTimeMs: number;
  cacheHit: boolean;
  language: SupportedLanguage;
  voiceName: string;
  textLength: number;
  audioUrl: string;
}

// ─── Sentence Splitting for Teacher Mode ────────────────────────────

export function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation, keeping the punctuation
  const raw = text.match(/[^.!?]+[.!?]+/g) || [text];
  return raw.map(s => s.trim()).filter(Boolean);
}

// ─── Voice Provider API ─────────────────────────────────────────────

export async function generateSpeech(
  text: string,
  language?: SupportedLanguage,
): Promise<VoiceResult> {
  const lang = language || detectLanguage(text);
  const startMs = Date.now();

  // Try server-side TTS API (HuggingFace → Kokoro → Piper → ElevenLabs)
  try {
    const res = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: lang }),
    });

    if (res.ok) {
      const data = await res.json();
      const durationMs = Date.now() - startMs;
      return {
        url: data.url,
        provider: data.provider || 'huggingface',
        durationMs: data.durationMs || durationMs,
        cached: data.cached || false,
        language: lang,
        voiceName: data.voiceName || `${data.provider || 'hf'}-${lang}`,
      };
    }
  } catch {
    // Fall through to browser TTS
  }

  // Final fallback: Browser Speech API (client-side only)
  return {
    url: '',
    provider: 'browser',
    durationMs: 0,
    cached: false,
    language: lang,
    voiceName: `browser-${lang}`,
  };
}

// ─── Client-side Browser Speech API ─────────────────────────────────

export function speakWithBrowser(
  text: string,
  language: SupportedLanguage,
  options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onSentence?: (sentence: string, index: number) => void;
  },
): { pause: () => void; resume: () => void; stop: () => void; isPlaying: () => boolean } {
  const sentences = splitIntoSentences(text);
  let currentIndex = 0;
  let paused = false;
  let stopped = false;

  const speakNext = () => {
    if (stopped || currentIndex >= sentences.length) {
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentences[currentIndex]);
    utterance.lang = getLanguageCode(language || 'en');
    utterance.rate = options?.rate ?? 0.9;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 1;

    // Find matching voice
    const voices = speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(language));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => {
      options?.onSentence?.(sentences[currentIndex] ?? '', currentIndex);
    };

    utterance.onend = () => {
      if (!paused && !stopped) {
        currentIndex++;
        speakNext();
      }
    };

    speechSynthesis.speak(utterance);
  };

  speakNext();

  return {
    pause: () => { paused = true; speechSynthesis.pause(); },
    resume: () => { paused = false; speechSynthesis.resume(); },
    stop: () => { stopped = true; speechSynthesis.cancel(); options?.onEnd?.(); },
    isPlaying: () => speechSynthesis.speaking,
  };
}