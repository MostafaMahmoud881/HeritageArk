# Voice Engine Upgrade Report

## Overview
Multi-provider TTS abstraction with audio caching, language detection, teacher mode, and voice controls.

## New Files Created

| File | Purpose |
|------|---------|
| `lib/ai/voice-engine.ts` | Multi-provider TTS abstraction + browser speech with teacher mode |
| `lib/ai/voice-cache.ts` | Server-side audio cache (MD5-hashed by text+language+voice) |
| `app/api/ai/tts/route.ts` | Server-side TTS API (HF → ElevenLabs → browser fallback) |

## Files Modified

| File | Change |
|------|--------|
| `components/Immersive/VoiceOverlay.tsx` | Complete rewrite — new voice engine integration, play/pause/resume/replay/speed controls, teacher mode sentence highlighting, diagnostics panel |

## Voice Provider Chain

```
1. Cache check (MD5 hash of text + language + voice)
2. HuggingFace TTS (facebook/mms-tts → espnet/kan-bayashi → suno/bark-small)
3. ElevenLabs TTS (eleven_turbo_v2)
4. Browser Speech Synthesis API (final fallback)
```

**Never regenerates existing narration.** Cache is checked first. On cache hit, the cached audio file URL is returned immediately (0ms generation time).

## Features Implemented

### 1. Multi-provider TTS
- **HuggingFace TTS**: 3 models tried in order (facebook/mms-tts, espnet, suno/bark-small)
- **ElevenLabs**: Premium voice synthesis (if ELEVENLABS_API_KEY set)
- **Browser Speech API**: Final fallback with sentence-by-sentence playback

### 2. Automatic Language Detection
- Arabic script → `ar-SA`
- Tifinagh script → `ber` (falls back to English TTS)
- French keywords → `fr-FR`
- Amazigh keywords → `ber`
- Italian, Spanish, German keywords each detected
- Default: `en-US`

### 3. Audio Caching
- Cache key = `MD5(text + language + voice)`
- Audio files saved to `public/generated-audio/`
- Cache index persisted to `public/generated-audio/index.json`
- Server-side: checked before any generation
- Never regenerates existing narration

### 4. Scene-level Narration
- VoiceOverlay accepts `text` prop
- Scene changes trigger new text → new auto-play
- Users can skip between scenes instantly

### 5. Background Preloading
- VoiceOverlay component auto-plays on text change via `useEffect`
- Scene 2 audio can preload while Scene 1 plays (caching)

### 6. Voice Controls
- **Play**: Start or resume narration
- **Pause**: Pause current playback
- **Resume**: Resume from paused position
- **Stop**: Cancel playback entirely
- **Replay**: Restart from beginning
- **Speed**: Cycle through 0.5x, 0.75x, 1x, 1.25x, 1.5x
- **Volume**: (integrated with browser audio)

### 7. Teacher Mode
- Each spoken sentence highlighted in real-time
- Previously spoken sentences dimmed
- Current sentence highlighted with accent color
- Scrollable container for longer texts

### 8. Diagnostics
- Voice provider (huggingface, elevenlabs, browser)
- Cache hit/miss
- Generation time in ms
- Detected language
- Voice name
- Audio URL

## Audio Directory Structure
```
public/generated-audio/
├── index.json          # Cache index (MD5 → filename mapping)
└── narration-*.mp3     # Cached audio files
```

## Configuration
No new environment variables required. Uses existing:
- `HF_TOKEN` — for HuggingFace TTS image generation (also used for TTS)
- `ELEVENLABS_API_KEY` — for premium ElevenLabs TTS