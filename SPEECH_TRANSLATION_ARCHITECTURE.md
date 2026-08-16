# HeritageArk AI Chat — Enhanced Architecture
## Language Identification, Adaptive Learning, Collaborative Dictionary, and Low-Latency Speech Translation

---

## 1. System Overview

The HeritageArk AI chat currently supports text-based multilingual conversation with basic translation. This design extends the existing infrastructure with three production-grade modules:

- **Module A:** Language Identification & Adaptive Learning
- **Module B:** Collaborative Linguistic Knowledge Base
- **Module C:** Low-Latency Bidirectional Speech-to-Speech Translation

All modules integrate with the existing Next.js API layer, Prisma database, and AI provider abstraction (`lib/ai/ai-provider-manager.ts`).

---

## 2. Technical Stack Recommendation

### 2.1 Core Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 + React 18 + WebRTC | Existing stack; WebRTC for browser microphone access |
| **Backend** | Next.js API Routes + WebSocket server | Extends existing API layer |
| **Database** | PostgreSQL via Prisma | Already in use; add new models for dictionary and speech jobs |
| **Cache** | Redis (Upstash) | Session state, hot dictionary entries, rate limiting |
| **Queue** | BullMQ / Vercel KV | Async transcription and translation jobs |
| **Edge Runtime** | Vercel Edge Middleware | Lightweight language detection, CSRF, rate limiting |

### 2.2 Speech & Language Models

| Function | Recommended Model | Fallback | Notes |
|----------|-----------------|----------|-------|
| **ASR** | `whisper-1` (OpenAI) | Google Cloud STT v2 | Best multilingual accuracy; supports 99+ languages including endangered languages |
| **NMT** | `gpt-4o-mini` (OpenAI) + custom dictionary injection | Llama 3.1 8B via Groq | Low latency; dictionary terms injected via system prompt |
| **TTS** | `eleven_multilingual_v2` (ElevenLabs) | Google Cloud TTS WaveNet | Natural multilingual voices; supports Arabic, French, Kurdish script |
| **Lang ID** | `langid` Python library (fastText) | OpenAI GPT-4o-mini classification | Sub-10ms detection on server; LLM fallback for edge cases |
| **Dictionary ranking** | PostgreSQL full-text search + Redis sorted sets | — | Rapid retrieval with ranking by confidence and recency |

### 2.3 Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  CSRF / WAF │  │ Rate Limiter │  │ Locale Redirect  │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ /api/ai/chat│  │/api/ai/stt │  │/api/ai/tts       │   │
│  │             │  │            │  │                  │   │
│  │ Module A    │  │ Module C   │  │ Module C         │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │/api/dict/*  │  │/api/ai/    │  │ WebSocket /      │   │
│  │             │  │translate   │  │ streaming proxy  │   │
│  │ Module B    │  │            │  │                  │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ PostgreSQL  │  │    Redis    │  │   S3 / R2        │   │
│  │ (Prisma)    │  │ (Upstash)   │  │ (audio blobs)    │   │
│  │             │  │             │  │                  │   │
│  │ Dictionary  │  │ Hot cache   │  │ TTS cache        │   │
│  │ User stats  │  │ Sessions    │  │ Temp audio       │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Module A: Language Identification and Adaptive Learning

### 3.1 Architecture

```
User Input (text/audio)
        │
        ▼
┌─────────────────────┐
│   Language Router   │
│  ┌───────────────┐  │
│  │ Script Detector│ │
│  │ Arabic: \u0600│ │
│  │ Tifinagh: \u2D│ │
│  │ Latin keywords │ │
│  └───────────────┘  │
│          │           │
│     fastText model   │
│     (fastText CLI)   │
│          │           │
│          ▼           │
│  LanguageDetected    │
│  + Confidence Score  │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│  Adaptive Learning  │
│   ┌─────────────┐   │
│   │ Session Model│  │
│   │ CEFR level   │   │
│   │ Vocabulary   │   │
│   │ Weak spots   │   │
│   └─────────────┘   │
│          │           │
│   LLM prompt inject  │
│   + dictionary hints  │
│          │           │
│          ▼           │
│  Pedagogical response │
│  + next-step quiz     │
└─────────────────────┘
```

### 3.2 Data Schema

```prisma
model LanguageDetection {
  id          String   @id @default(cuid())
  sessionId   String
  text        String   @db.Text
  detectedLang String  // ISO 639-3: ara, eng, fra, nub, amz, kur, smi
  confidence  Float
  method      String   // 'script' | 'fasttext' | 'llm'
  userId      String?
  createdAt   DateTime @default(now())

  @@index([sessionId])
  @@index([detectedLang])
}

model UserLanguageProfile {
  id           String   @id @default(cuid())
  userId       String
  language     String   // ISO 639-3
  cefrLevel    String   // A1-C2
  vocabularySize Int
  weakTopics   String[] // JSON array
  lastPracticed DateTime @default(now())
  streak       Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([userId, language])
}
```

### 3.3 Adaptive Learning Logic

```typescript
// apps/web/lib/ai/adaptive-learning.ts
interface LearningContext {
  userId: string;
  detectedLang: string;
  cefrLevel: string;
  weakTopics: string[];
  sessionMessageCount: number;
}

export function buildAdaptiveSystemPrompt(ctx: LearningContext): string {
  const base = `You are HeritageArk AI, an expert in world heritage and languages.`;

  if (ctx.detectedLang === 'ara') {
    return `${base}
The user is communicating in Arabic. Respond in Arabic.
Their estimated level: ${ctx.cefrLevel}.
Focus practice on: ${ctx.weakTopics.join(', ') || 'general vocabulary'}.
Include one short vocabulary quiz at the end if session length > 4 messages.`;
  }

  if (ctx.detectedLang === 'nub' || ctx.detectedLang === 'amz') {
    return `${base}
The user is communicating in ${ctx.detectedLang === 'nub' ? 'Nubian (Nobiin)' : 'Amazigh (Tamazight)'}.
Prioritize: endangered language preservation, everyday phrases, cultural context.
Include pronunciation guidance using IPA notation.`;
  }

  return base;
}
```

### 3.4 Integration Points

| Component | Change |
|-----------|--------|
| `app/api/ai/chat/route.ts` | Add `LanguageRouter` before LLM call; inject adaptive system prompt |
| `components/Chat/ChatUI.tsx` | Display detected language badge; show CEFR level |
| `lib/ai/llm.ts` | Add `detectLanguage()` result to chat API response |

---

## 4. Module B: Collaborative Linguistic Knowledge Base

### 4.1 Data Schema

```prisma
model DictionaryEntry {
  id              String   @id @default(cuid())
  term            String   // The word/phrase
  language        String   // ISO 639-3: eng, ara, fra, nub, amz, kur, smi
  partOfSpeech    String?  // noun, verb, adjective, idiom, proverb
  definition      String   @db.Text
  exampleSentence String?  @db.Text
  exampleTranslation String? @db.Text
  culturalNote    String?  @db.Text
  pronunciation   String?  // IPA
  romanization    String?  // For non-Latin scripts
  confidence      Float    @default(0.5) // 0-1, from consensus algorithm
  sourceCount     Int      @default(1) // Number of contributing users
  verified        Boolean  @default(false)
  status          String   @default("pending") // pending | approved | rejected
  createdBy       String
  reviewedBy      String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([term, language])
  @@index([language, confidence])
  @@index([status])
}

model DictionaryContribution {
  id            String   @id @default(cuid())
  entryId       String
  userId        String
  contributionType String // 'definition' | 'example' | 'pronunciation' | 'cultural_note'
  previousValue String?
  newValue      String   @db.Text
  confidence    Float    // User's self-assessed confidence (0-1)
  accepted      Boolean  @default(false)
  createdAt     DateTime @default(now())

  @@index([entryId])
  @@index([userId])
}

model DictionaryVote {
  id        String   @id @default(cuid())
  entryId   String
  userId    String
  vote      String   // 'up' | 'down' | 'skip'
  createdAt DateTime @default(now())

  @@unique([entryId, userId])
}
```

### 4.2 Consensus Algorithm

```
Entry Confidence = (
  (verified_weight × verified_count) +
  (upvote_weight × upvotes) -
  (downvote_weight × downvotes) +
  (expert_weight × expert_approvals)
) / total_possible_score

Where:
- verified_weight = 1.0 (linguist/expert approval)
- upvote_weight = 0.1 per community upvote
- downvote_weight = 0.2 per community downvote
- expert_weight = 0.5 per linguist/expert approval
- Minimum 3 contributions before auto-promotion to "approved"
```

### 4.3 API Routes

```
GET    /api/dictionary/search?q=water&lang=nub
POST   /api/dictionary/contribute
GET    /api/dictionary/entries/:id
POST   /api/dictionary/entries/:id/vote
GET    /api/dictionary/trending?lang=nub
```

### 4.4 Rapid Retrieval Strategy

```typescript
// apps/web/lib/dictionary/cache.ts
import { redis } from '@/lib/redis';

const DICTIONARY_CACHE_PREFIX = 'dict:';
const CACHE_TTL = 60 * 60; // 1 hour

export async function getCachedEntry(lang: string, term: string) {
  const key = `${DICTIONARY_CACHE_PREFIX}${lang}:${term.toLowerCase()}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached as string);

  const entry = await prisma.dictionaryEntry.findFirst({
    where: {
      language: lang,
      term: { equals: term, mode: 'insensitive' },
      status: 'approved',
      confidence: { gte: 0.6 },
    },
    orderBy: { confidence: 'desc' },
  });

  if (entry) {
    await redis.setex(key, CACHE_TTL, JSON.stringify(entry));
  }
  return entry;
}
```

---

## 5. Module C: Low-Latency Bidirectional Speech-to-Speech Translation

### 5.1 Pipeline Architecture

```
Tourist (Browser)                        Local (Browser/App)
     │                                          │
     │  1. Audio capture (WebRTC)               │
     │  2. Opus codec @ 16kHz                   │
     │  3. Chunked frames (250ms)               │
     │                                          │
     ├────────────── WebSocket ────────────────┤
     │                                          │
     │  4. Server receives audio blob           │
     │  5. Queue for ASR (Whisper)              │
     │  6. Stream transcript as it generates    │
     │  7. Translate via NMT                    │
     │  8. Stream TTS chunks back               │
     │                                          │
     │  9. Play translated audio                │
     │                                          │
```

### 5.2 Latency Budget

| Stage | Target | Technology |
|-------|--------|------------|
| Audio capture | 0ms | WebRTC getUserMedia |
| Network transit | <50ms | WebSocket over HTTP/2 |
| ASR (first token) | <200ms | Whisper Turbo / Fast Whisper |
| NMT (first token) | <100ms | GPT-4o-mini streaming |
| TTS (first audio) | <150ms | ElevenLabs streaming |
| **Total target** | **<500ms** | E2E from speech stop to audio play |

### 5.3 WebSocket Handler

```typescript
// apps/web/app/api/ai/speech/route.ts
import { NextResponse } from 'next/server';
import { webSocket } from 'next/server';

export const runtime = 'nodejs';
export const preferredRegion = ['iad1', 'fra1']; // Low-latency regions

export async function GET(request: NextRequest) {
  // Upgrade to WebSocket
  const upgradeHeader = request.headers.get('upgrade');
  if (upgradeHeader !== 'websocket') {
    return NextResponse.json({ error: 'WebSocket required' }, { status: 426 });
  }
  // ... WebSocket handling
}

interface SpeechSession {
  sessionId: string;
  sourceLang: string;
  targetLang: string;
  role: 'tourist' | 'local';
  abortController: AbortController;
}

async function handleAudioChunk(
  session: SpeechSession,
  audioBuffer: ArrayBuffer,
) {
  // 1. Transcribe with Whisper (streaming)
  const transcript = await transcribeStreaming(audioBuffer, session.sourceLang);

  // 2. Translate with streaming NMT
  const translation = await translateStreaming(transcript, session.sourceLang, session.targetLang);

  // 3. Synthesize speech with streaming TTS
  const audioChunks = await synthesizeStreaming(translation, session.targetLang);

  // 4. Send audio chunks back via WebSocket
  for await (const chunk of audioChunks) {
    session.ws.send(JSON.stringify({ type: 'audio', data: chunk }));
  }
}
```

### 5.4 Client-Side Implementation

```typescript
// apps/web/lib/hooks/useSpeechTranslation.ts
export function useSpeechTranslation() {
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startSession = async (sourceLang: string, targetLang: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        sampleSize: 16,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    mediaStreamRef.current = stream;
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/api/ai/speech`);
    wsRef.current = ws;

    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'init',
        sourceLang,
        targetLang,
        role: 'tourist',
      }));
    };

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const float32 = new Float32Array(inputData);
      const int16 = float32ToInt16(float32);
      ws.send(int16.buffer);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'audio') {
        playAudioChunk(new Uint8Array(data.data));
      }
    };
  };

  return { startSession, stopSession: () => wsRef.current?.close() };
}
```

---

## 6. Integration Strategy

### 6.1 Phase 1: Language Identification (Week 1-2)

**Files to modify:**
- `apps/web/lib/ai/llm.ts` — Add `detectLanguage()` enhancement with fastText fallback
- `apps/web/app/api/ai/chat/route.ts` — Inject detected language into system prompt
- `apps/web/components/Chat/ChatUI.tsx` — Add language badge display

**New files:**
- `apps/web/lib/ai/language-detector.ts` — FastText wrapper + script-based detection

```typescript
// apps/web/lib/ai/language-detector.ts
export interface LanguageDetection {
  lang: string;      // ISO 639-3
  confidence: number;
  method: 'script' | 'fasttext' | 'llm';
}

export async function detectLanguage(text: string): Promise<LanguageDetection> {
  // 1. Script-based detection (instant)
  const scriptResult = detectByScript(text);
  if (scriptResult.confidence > 0.9) return scriptResult;

  // 2. FastText model (sub-10ms)
  const fastTextResult = await detectByFastText(text);
  if (fastTextResult.confidence > 0.7) return fastTextResult;

  // 3. LLM fallback
  return detectByLLM(text);
}
```

### 6.2 Phase 2: Collaborative Dictionary (Week 2-4)

**New Prisma models:** `DictionaryEntry`, `DictionaryContribution`, `DictionaryVote`

**New API routes:**
- `app/api/dictionary/search/route.ts`
- `app/api/dictionary/contribute/route.ts`
- `app/api/dictionary/entries/[id]/vote/route.ts`
- `app/api/dictionary/trending/route.ts`

**New UI components:**
- `components/Chat/DictionaryPanel.tsx` — Inline dictionary lookup in chat
- `components/Dictionary/ContributionForm.tsx` — Submit new terms

**Integration points:**
- Chat AI injects approved dictionary terms into system prompt for NMT
- Translation API (`/api/ai/translate`) adds dictionary definitions to response

### 6.3 Phase 3: Speech-to-Speech Translation (Week 4-6)

**New infrastructure:**
- WebSocket server in Next.js (`app/api/ai/speech/route.ts`)
- Redis session store for active speech sessions
- BullMQ queue for ASR/NMT/TTS jobs

**New API routes:**
- `app/api/ai/speech/route.ts` — WebSocket endpoint
- `app/api/ai/stt/route.ts` — Standalone speech-to-text
- `app/api/ai/tts/route.ts` — Text-to-speech

**New hooks:**
- `lib/hooks/useSpeechTranslation.ts`
- `lib/hooks/useWebSocket.ts`

**Integration points:**
- Chat UI adds microphone button (existing `handleVoiceInput`)
- Language detection result auto-selects target language for translation
- Session state stored in Redis for cross-tab continuity

### 6.4 Backward Compatibility

All changes are additive. Existing text chat functionality remains unchanged:

```
/api/ai/chat          ← unchanged for text-only users
/api/ai/translate     ← extended with dictionary injection
/api/ai/speech        ← NEW WebSocket endpoint
/api/dictionary/*     ← NEW endpoints
```

Frontend components use feature flags:

```typescript
const SPEECH_ENABLED = process.env.NEXT_PUBLIC_SPEECH_TRANSLATION === 'true';
const DICTIONARY_ENABLED = process.env.NEXT_PUBLIC_DICTIONARY === 'true';
```

---

## 7. Security and Performance Considerations

### 7.1 Security

| Concern | Mitigation |
|---------|-----------|
| WebSocket auth | Require valid JWT in WebSocket handshake query param |
| Audio blob storage | Ephemeral S3 presigned URLs with 5-minute TTL |
| Dictionary spam | Rate limiting per user; require minimum reputation to contribute |
| ASR/NMT cost abuse | Per-session credit limits in Redis |
| Language spoofing | Server-side validation; ignore client-reported language |

### 7.2 Performance

| Target | Solution |
|--------|----------|
| <500ms E2E speech latency | WebSocket streaming; parallel ASR + NMT pipeline |
| Dictionary lookup <10ms | Redis hot cache + PostgreSQL full-text search fallback |
| 1000 concurrent speech sessions | BullMQ horizontal scaling; separate worker processes |
| Chat UI responsiveness | Debounced dictionary lookup; skeleton loading states |

---

## 8. Monitoring and Observability

```typescript
// Key metrics to track
const SPEECH_METRICS = {
  asrFirstTokenLatency: 'histogram',    // Target: <200ms
  nmtFirstTokenLatency: 'histogram',    // Target: <100ms
  ttsFirstAudioLatency: 'histogram',    // Target: <150ms
  e2eSpeechLatency: 'histogram',        // Target: <500ms
  dictionaryHitRate: 'gauge',           // Target: >80%
  languageDetectionAccuracy: 'gauge',   // Target: >95%
  speechSessionDuration: 'histogram',
};

// Logging format
interface SpeechLog {
  sessionId: string;
  stage: 'asr' | 'nmt' | 'tts';
  latencyMs: number;
  langPair: string;
  userId?: string;
}
```

---

## 9. Implementation Checklist

### Module A: Language Identification & Adaptive Learning
- [ ] Create `lib/ai/language-detector.ts` with script + fastText + LLM fallback
- [ ] Add `UserLanguageProfile` Prisma model
- [ ] Update `/api/ai/chat` to inject adaptive system prompt
- [ ] Add language badge to `ChatUI.tsx`
- [ ] Add vocabulary quiz modal component

### Module B: Collaborative Dictionary
- [ ] Create Prisma models: `DictionaryEntry`, `DictionaryContribution`, `DictionaryVote`
- [ ] Create `lib/dictionary/cache.ts` with Redis caching
- [ ] Create API routes: `/api/dictionary/search`, `/contribute`, `/:id/vote`, `/trending`
- [ ] Create `components/Chat/DictionaryPanel.tsx`
- [ ] Implement consensus algorithm in `lib/dictionary/consensus.ts`
- [ ] Add dictionary injection to NMT system prompt

### Module C: Speech-to-Speech Translation
- [ ] Set up Redis session store for WebSocket sessions
- [ ] Create `app/api/ai/speech/route.ts` WebSocket handler
- [ ] Create `lib/stt/whisper-stream.ts` for streaming ASR
- [ ] Create `lib/tts/eleven-stream.ts` for streaming TTS
- [ ] Create `lib/hooks/useSpeechTranslation.ts`
- [ ] Add microphone button to `ChatUI.tsx`
- [ ] Implement latency monitoring

### Infrastructure
- [ ] Enable Upstash Redis in Vercel
- [ ] Set environment variables: `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `UPSTASH_REDIS_URL`
- [ ] Add `NEXT_PUBLIC_SPEECH_TRANSLATION` and `NEXT_PUBLIC_DICTIONARY` feature flags

---

## 10. Cost Estimates

| Service | Monthly Cost (1000 MAU) | Notes |
|---------|------------------------|-------|
| OpenAI Whisper API | ~$50 | 1000 sessions × 5 min audio |
| OpenAI GPT-4o-mini | ~$30 | Chat + translation |
| ElevenLabs TTS | ~$80 | 1000 sessions × 5 min audio |
| Upstash Redis | ~$10 | 250K messages |
| Vercel Pro | Included | Existing plan |
| **Total** | **~$170/month** | Scale-ready |

---

*Document generated: 2026-08-15*
*For: HeritageVerse — Preserve. Explore. Revive.*
