import { NextRequest, NextResponse } from 'next/server';
import { getCachedAudio, saveCachedAudio } from '@/lib/ai/voice-cache';
import { detectLanguage, getLanguageCode, SupportedLanguage } from '@/lib/ai/voice-engine';

const HF_TOKEN = process.env.HF_TOKEN || '';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

// HF TTS models in order of preference
const HF_TTS_MODELS = [
  'facebook/mms-tts',
  'espnet/kan-bayashi_ljspeech_vits',
  'suno/bark-small',
];

function log(label: string, data?: any) {
  const ts = new Date().toISOString();
  console.log(`[TTS_API ${ts}] ${label}`, data !== undefined ? data : '');
}

async function callHuggingFaceTTS(text: string, language: string): Promise<ArrayBuffer | null> {
  if (!HF_TOKEN) return null;

  for (const model of HF_TTS_MODELS) {
    try {
      const url = `https://api-inference.huggingface.co/models/${model}`;
      log(`HF TTS request → ${model}`, { lang: language, textLen: text.length });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: { language: language || 'en' },
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        log(`HF TTS success model=${model}`, { sizeKB: (buffer.byteLength / 1024).toFixed(1) });
        return buffer;
      }

      const errText = await res.text().catch(() => '');
      log(`HF TTS error ${res.status} model=${model}`, errText.slice(0, 100));
    } catch (err: any) {
      log(`HF TTS fetch error model=${model}: ${err.message}`);
    }
  }
  return null;
}

async function callElevenLabsTTS(text: string, language: string): Promise<ArrayBuffer | null> {
  if (!ELEVENLABS_API_KEY) return null;

  try {
    const voiceId = language === 'ar' ? '21m00Tcm4TlvDq8ikWAM' : '21m00Tcm4TlvDq8ikWAM';
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.5 },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      log('ElevenLabs TTS success', { sizeKB: (buffer.byteLength / 1024).toFixed(1) });
      return buffer;
    }
  } catch (err: any) {
    log(`ElevenLabs error: ${err.message}`);
  }
  return null;
}

export async function POST(request: NextRequest) {
  const startMs = Date.now();

  try {
    const { text, language } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const lang: SupportedLanguage = language || detectLanguage(text);
    const voiceName = `tts-${lang}`;

    log('── TTS START ──', { textLen: text.length, lang });

    // 1. Check cache
    const cachedAudio = await getCachedAudio(text, lang, voiceName);
    if (cachedAudio) {
      log('Cache HIT', { url: cachedAudio.url });
      return NextResponse.json({
        url: cachedAudio.url,
        provider: 'cache',
        durationMs: cachedAudio.durationMs,
        cached: true,
        language: lang,
        voiceName,
      });
    }

    // 2. Try HuggingFace TTS
    const hfBuffer = await callHuggingFaceTTS(text, lang);
    if (hfBuffer) {
      const durationMs = Date.now() - startMs;
      const url = await saveCachedAudio(text, lang, voiceName, Buffer.from(hfBuffer), durationMs);
      log('HF TTS cached', { url });
      return NextResponse.json({
        url,
        provider: 'huggingface',
        durationMs,
        cached: false,
        language: lang,
        voiceName: `huggingface-${lang}`,
      });
    }

    // 3. Try ElevenLabs
    const elBuffer = await callElevenLabsTTS(text, lang);
    if (elBuffer) {
      const durationMs = Date.now() - startMs;
      const url = await saveCachedAudio(text, lang, voiceName, Buffer.from(elBuffer), durationMs);
      log('ElevenLabs cached', { url });
      return NextResponse.json({
        url,
        provider: 'elevenlabs',
        durationMs,
        cached: false,
        language: lang,
        voiceName: `elevenlabs-${lang}`,
      });
    }

    // 4. No server-side TTS available — return empty for browser fallback
    log('No TTS provider available, returning empty for browser fallback');
    return NextResponse.json({
      url: '',
      provider: 'browser',
      durationMs: Date.now() - startMs,
      cached: false,
      language: lang,
      voiceName: `browser-${lang}`,
    });

  } catch (err: any) {
    log('FATAL', err.message);
    return NextResponse.json({ error: err.message, url: '', provider: 'error' }, { status: 500 });
  }
}