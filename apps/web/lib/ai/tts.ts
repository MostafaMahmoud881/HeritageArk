'use client';

// ─── Voice Registry ───────────────────────────────────────────────────────────
// Cached after first load so we don't call getVoices() on every utterance
let _voices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined') return [];
  if (_voices.length) return _voices;
  _voices = window.speechSynthesis.getVoices();
  return _voices;
}

// Trigger voice load (Chrome loads them async)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    _voices = window.speechSynthesis.getVoices();
  };
}

// ─── Voice Selection ──────────────────────────────────────────────────────────
// Priority list of high-quality English voices (natural-sounding)
const PREFERRED_EN_VOICES = [
  'Samantha',       // macOS/iOS — best quality
  'Karen',          // macOS Australian
  'Daniel',         // macOS British
  'Google US English',
  'Google UK English Female',
  'Microsoft Aria Online',
  'Microsoft Jenny Online',
  'Alex',           // macOS
];

const LANG_BCP47: Record<string, string> = {
  'en': 'en-US',
  'ar': 'ar-SA',
  'fr': 'fr-FR',
  'it': 'it-IT',
  'es': 'es-ES',
  'de': 'de-DE',
  'pt': 'pt-PT',
  'zh': 'zh-CN',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'ru': 'ru-RU',
  'ber': 'en-US', // Amazigh — fallback to English
};

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices.length) return null;

  const bcp = LANG_BCP47[lang] ?? `${lang}-`;

  // 1. Exact preferred name match (English only)
  if (lang === 'en') {
    for (const name of PREFERRED_EN_VOICES) {
      const v = voices.find(v => v.name.includes(name));
      if (v) return v;
    }
  }

  // 2. Exact locale match (e.g. en-US)
  const exact = voices.find(v => v.lang === bcp);
  if (exact) return exact;

  // 3. Partial locale match (e.g. en-*)
  const partial = voices.find(v => v.lang.startsWith(bcp.slice(0, 2)));
  if (partial) return partial;

  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SpeakOptions {
  rate?: number;   // 0.5 – 2.0, default 1.0
  pitch?: number;  // 0 – 2, default 1
  volume?: number; // 0 – 1, default 1
  voiceName?: string; // override voice by name
}

let _currentUtterance: SpeechSynthesisUtterance | null = null;

export async function speakText(text: string, language = 'en', options: SpeakOptions = {}): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Stop anything currently playing
  window.speechSynthesis.cancel();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);

    // Voice selection
    if (options.voiceName) {
      const voices = loadVoices();
      const named = voices.find(v => v.name === options.voiceName);
      if (named) utterance.voice = named;
    } else {
      const best = pickVoice(language);
      if (best) utterance.voice = best;
    }

    utterance.lang = LANG_BCP47[language] ?? 'en-US';
    utterance.rate = options.rate ?? 1.0;      // 1.0 = natural speed (was 0.9 before — too slow)
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    utterance.onend = () => { _currentUtterance = null; resolve(); };
    utterance.onerror = () => { _currentUtterance = null; resolve(); };

    _currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    _currentUtterance = null;
  }
}

export function pauseSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

// ─── Voice Picker Data ────────────────────────────────────────────────────────

export interface VoiceOption {
  name: string;
  lang: string;
  localService: boolean;
}

export function getAvailableVoices(lang = 'en'): VoiceOption[] {
  const voices = loadVoices();
  const bcp = LANG_BCP47[lang] ?? lang;
  return voices
    .filter(v => v.lang.startsWith(bcp.slice(0, 2)))
    .map(v => ({ name: v.name, lang: v.lang, localService: v.localService }));
}

export function getAllVoices(): VoiceOption[] {
  return loadVoices().map(v => ({ name: v.name, lang: v.lang, localService: v.localService }));
}
