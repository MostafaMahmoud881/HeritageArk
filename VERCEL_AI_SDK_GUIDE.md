# Vercel AI SDK Integration Guide
## Image Generation + Video / Reel Creation

> **Scope**: Add Vercel AI SDK capabilities to `HeritageVerse` while preserving the existing HuggingFace image pipeline and the `lib/ai/providers.ts` video abstraction.
> **Current baseline**: Image generation uses HuggingFace Inference (`lib/ai/image-generation.ts`). Video generation has only an abstract provider interface (`lib/ai/providers.ts`) with no concrete implementations. No Vercel AI SDK packages are installed yet.

---

## 1. Current Architecture Analysis

| Layer | Current Implementation | Gap |
|-------|------------------------|-----|
| **Image Generation** | HuggingFace Inference API (`HF_TOKEN`) with Wikimedia/Unsplash fallbacks | Single provider; no structured output schema; no streaming |
| **Video Generation** | Abstract `BaseAIProvider` with interfaces only | No concrete providers, no API routes, no client hooks |
| **LLM** | Custom `AIProviderManager` (OpenAI, Groq, Gemini, OpenRouter, Ollama, local) | Works but doesn't leverage Vercel AI SDK streaming / tool use |
| **Secrets** | `.env.development`, `.env.staging`, `.env.production` in `apps/web/` | Need to verify no keys leak to client bundles |

**Key files to evolve**:
- `apps/web/lib/ai/image-generation.ts` — current HF image service (server-only)
- `apps/web/app/api/ai/image/route.ts` — current image API route
- `apps/web/lib/ai/providers.ts` — video provider abstraction
- `apps/web/lib/ai/index.ts` — barrel exports

---

## 2. Install Dependencies

```bash
cd apps/web

# Core Vercel AI SDK
pnpm add ai

# Provider packages (choose based on your accounts)
pnpm add @ai-sdk/openai        # DALL-E 3 / GPT-4o for images
pnpm add @ai-sdk/google        # Imagen 3 / Gemini
pnpm add @ai-sdk/stability     # Stable Diffusion via Stability AI
# Optional: for tool calling / structured output
pnpm add @ai-sdk/anthropic
```

> **Note**: Video generation is **not** yet a first-class primitive in the Vercel AI SDK core. For reels/video you will extend the existing `BaseAIProvider` pattern with direct API clients (Runway, Pika, Luma) and optionally use Vercel AI SDK for the prompt-refinement step.

---

## 3. Secure Environment Configuration

### 3.1 `.env` Variables (Server-Only)

Add to **`apps/web/.env.development`**, **`.env.staging`**, and **`.env.production`**:

```env
# Vercel AI SDK / Image Providers
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
STABILITY_API_KEY=...

# Video / Reel Providers (extend existing)
RUNWAYML_API_KEY=...
PIKA_API_KEY=...
LUMA_API_KEY=...

# App URL for provider referrers
APP_URL=http://localhost:3001
```

### 3.2 Lock Secrets to Server-Side

1. **Never import AI SDK or provider clients in `'use client'` files.** All generation must go through Next.js API routes (`app/api/ai/...`).

2. **Verify `.env` files are gitignored:**

```bash
cd /Users/mostafamahmoud/Downloads/HeritageVerse\ copy\ 4
git check-ignore apps/web/.env.development apps/web/.env.staging apps/web/.env.production
```

3. **Verify no secrets in client bundle:**

```bash
cd apps/web
grep -r "OPENAI_API_KEY\|RUNWAYML_API_KEY\|PIKA_API_KEY" src/ app/ components/ lib/ --include="*.tsx" --include="*.ts" | grep -v "route.ts" | grep -v "node_modules"
```

4. **Create a server-only config loader:**

```typescript
// apps/web/lib/ai/vercel-config.ts
export const VERCEL_AI_CONFIG = {
  openaiKey: process.env.OPENAI_API_KEY || '',
  googleKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  stabilityKey: process.env.STABILITY_API_KEY || '',
  runwayKey: process.env.RUNWAYML_API_KEY || '',
  pikaKey: process.env.PIKA_API_KEY || '',
  lumaKey: process.env.LUMA_API_KEY || '',
  appUrl: process.env.APP_URL || 'http://localhost:3001',
} as const;

export function hasVercelImageProvider(): boolean {
  return !!VERCEL_AI_CONFIG.openaiKey || !!VERCEL_AI_CONFIG.googleKey || !!VERCEL_AI_CONFIG.stabilityKey;
}

export function hasVideoProvider(): boolean {
  return !!VERCEL_AI_CONFIG.runwayKey || !!VERCEL_AI_CONFIG.pikaKey || !!VERCEL_AI_CONFIG.lumaKey;
}
```

---

## 4. Image Generation with Vercel AI SDK

### 4.1 Create the Vercel AI Image Service

```typescript
// apps/web/lib/ai/vercel-image.ts
/**
 * Vercel AI SDK Image Generation Service
 * SERVER-ONLY: Uses 'ai' package and provider SDKs.
 */

import { generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { stability } from '@ai-sdk/stability';
import { VERCEL_AI_CONFIG, hasVercelImageProvider } from './vercel-config';

export interface VercelImageResult {
  url: string;
  alt: string;
  provider: 'openai' | 'google' | 'stability';
  revisedPrompt?: string;
}

type ImageProvider = 'openai' | 'google' | 'stability' | 'auto';

function getProviderModel(provider: ImageProvider) {
  switch (provider) {
    case 'openai':
      return openai.image('dall-e-3');
    case 'google':
      return google.image('imagen-3.0-generate-002');
    case 'stability':
      return stability.image('stable-diffusion-xl');
    default:
      if (VERCEL_AI_CONFIG.openaiKey) return openai.image('dall-e-3');
      if (VERCEL_AI_CONFIG.googleKey) return google.image('imagen-3.0-generate-002');
      if (VERCEL_AI_CONFIG.stabilityKey) return stability.image('stable-diffusion-xl');
      throw new Error('No image provider configured');
  }
}

export async function generateVercelImage(
  prompt: string,
  options?: {
    provider?: ImageProvider;
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    n?: number;
    negativePrompt?: string;
  },
): Promise<VercelImageResult> {
  if (!hasVercelImageProvider()) {
    throw new Error('No Vercel AI image provider configured. Set OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or STABILITY_API_KEY.');
  }

  const provider = options?.provider || 'auto';
  const model = getProviderModel(provider);

  // Enhance prompt for heritage context
  const heritagePrompt = `Professional heritage photography, museum quality, ${prompt}`;

  const result = await generateImage({
    model,
    prompt: heritagePrompt,
    size: options?.size || '1024x1024',
    n: options?.n || 1,
    // Provider-specific options
    ...(provider === 'openai' && {
      quality: options?.quality || 'standard',
    }),
  });

  const image = result.images[0];
  return {
    url: image.url,
    alt: prompt,
    provider: provider === 'auto' ? 'openai' : provider,
    revisedPrompt: result.providerMetadata?.openai?.revisedPrompt,
  };
}

export async function verifyVercelImageConnection() {
  const results: Record<string, { available: boolean; error?: string }> = {};

  if (VERCEL_AI_CONFIG.openaiKey) {
    try {
      await generateImage({
        model: openai.image('dall-e-3'),
        prompt: 'test',
        n: 1,
        size: '1024x1024',
      });
      results.openai = { available: true };
    } catch (e: any) {
      results.openai = { available: false, error: e.message };
    }
  }

  if (VERCEL_AI_CONFIG.googleKey) {
    try {
      await generateImage({
        model: google.image('imagen-3.0-generate-002'),
        prompt: 'test',
        n: 1,
      });
      results.google = { available: true };
    } catch (e: any) {
      results.google = { available: false, error: e.message };
    }
  }

  if (VERCEL_AI_CONFIG.stabilityKey) {
    try {
      await generateImage({
        model: stability.image('stable-diffusion-xl'),
        prompt: 'test',
        n: 1,
      });
      results.stability = { available: true };
    } catch (e: any) {
      results.stability = { available: false, error: e.message };
    }
  }

  return results;
}
```

### 4.2 Update the Image API Route

Add a new endpoint or extend the existing `/api/ai/image` to support Vercel AI SDK alongside HuggingFace:

```typescript
// apps/web/app/api/ai/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  generateImage as generateHFImage,
  verifyHFConnection,
  generateArtifactImage,
  generateStoryImage,
  generateCharacterPortrait,
  generateDocumentaryPoster,
  generateReelThumbnail,
} from '@/lib/ai/image-generation';
import { generateVercelImage, verifyVercelImageConnection } from '@/lib/ai/vercel-image';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, provider, ...params } = body;

    if (!type) {
      return NextResponse.json({ error: 'Missing required field: type' }, { status: 400 });
    }

    // Route Vercel AI SDK requests
    if (provider === 'vercel' || provider === 'openai' || provider === 'google') {
      let result;
      switch (type) {
        case 'artifact':
          result = await generateVercelImage(
            `${params.name}, ${params.culture} artifact from ${params.period}, ${params.location}, ${params.description}, museum quality`,
            { provider: provider === 'vercel' ? 'auto' : provider, size: '1024x1024', quality: 'hd' }
          );
          break;
        case 'story':
          result = await generateVercelImage(
            `${params.sceneDescription}, ${params.culture} historical scene, illustrated storybook style`,
            { provider: provider === 'vercel' ? 'auto' : provider }
          );
          break;
        case 'character':
          result = await generateVercelImage(
            `Portrait of ${params.characterName}, ${params.culture} character from ${params.era}, traditional clothing, historical painting style`,
            { provider: provider === 'vercel' ? 'auto' : provider }
          );
          break;
        case 'custom':
          result = await generateVercelImage(params.prompt, {
            provider: provider === 'vercel' ? 'auto' : provider,
            negativePrompt: params.negativePrompt,
          });
          break;
        default:
          return NextResponse.json({ error: `Unknown generation type for Vercel provider: ${type}` }, { status: 400 });
      }
      return NextResponse.json({ success: true, result, source: 'vercel-ai-sdk' });
    }

    // Existing HuggingFace flow
    console.log(`[IMAGE_API] Generating ${type} image via HuggingFace`, { params });
    let result;
    switch (type) {
      case 'artifact':
        result = await generateArtifactImage(params.name, params.culture, params.period, params.location, params.description);
        break;
      case 'story':
        result = await generateStoryImage(params.storyName, params.sceneDescription, params.culture);
        break;
      case 'character':
        result = await generateCharacterPortrait(params.characterName, params.culture, params.era);
        break;
      case 'documentary':
        result = await generateDocumentaryPoster(params.title, params.culture, params.period);
        break;
      case 'reel':
        result = await generateReelThumbnail(params.title, params.culture);
        break;
      case 'custom':
        result = await generateHFImage(params.prompt, {
          filename: params.filename,
          negativePrompt: params.negativePrompt,
          width: params.width,
          height: params.height,
          alt: params.alt,
        });
        break;
      default:
        return NextResponse.json({ error: `Unknown generation type: ${type}` }, { status: 400 });
    }
    return NextResponse.json({ success: true, result, source: 'huggingface' });
  } catch (err: any) {
    console.error('[IMAGE_API] Generation failed:', err);
    return NextResponse.json({ error: err.message || 'Image generation failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'verify') {
    const hfStatus = await verifyHFConnection();
    const vercelStatus = await verifyVercelImageConnection();
    return NextResponse.json({ huggingface: hfStatus, vercel: vercelStatus });
  }

  const hfTokenSet = !!process.env.HF_TOKEN;
  const vercelSet = hasVercelImageProvider();
  return NextResponse.json({
    service: 'image-generation',
    providers: {
      huggingface: { configured: hfTokenSet },
      vercel: { configured: vercelSet },
    },
    status: hfTokenSet || vercelSet ? 'ready' : 'unconfigured',
    fallbacks: ['wikimedia-commons', 'unsplash'],
  });
}
```

### 4.3 Client-Side Hook (Optional Update)

Extend `use-generated-image.ts` to support the new provider parameter, or keep it generic and let components pass the full API URL with query params.

---

## 5. Video / Reel Creation Workflow

### 5.1 Extend Existing Provider Pattern

The `lib/ai/providers.ts` already defines the correct abstraction. Implement concrete providers:

```typescript
// apps/web/lib/ai/video/runway-provider.ts
import { BaseAIProvider } from '../providers';
import type { VideoGenerationParams, VideoGenerationResult, ProviderCapabilities } from '../providers';
import { VERCEL_AI_CONFIG } from '../vercel-config';

export const RUNWAY_CAPABILITIES: ProviderCapabilities = {
  maxDuration: 10,
  aspectRatios: ['16:9', '9:16', '1:1'],
  qualities: ['standard', 'high'],
  supportsImageToVideo: true,
  supportsStoryToVideo: false,
  supportsStylePresets: true,
  stylePresets: ['cinematic', 'documentary', 'animation', 'realistic'],
};

export class RunwayProvider extends BaseAIProvider {
  name = 'Runway ML';
  slug = 'runway';
  capabilities = RUNWAY_CAPABILITIES;

  async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    const apiKey = VERCEL_AI_CONFIG.runwayKey;
    if (!apiKey) throw new Error('RUNWAYML_API_KEY not configured');

    const response = await fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: params.style === 'animation' ? 'gen3a_turbo' : 'gen3a',
        prompt: params.prompt,
        duration: Math.min(params.duration, this.capabilities.maxDuration),
        aspectRatio: params.aspectRatio,
        imageUrl: params.imageUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Runway API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      providerJobId: data.id,
      status: 'queued',
      estimatedDuration: data.estimatedDuration || 60,
    };
  }

  async getJobStatus(jobId: string): Promise<any> {
    const apiKey = VERCEL_AI_CONFIG.runwayKey;
    const res = await fetch(`https://api.runwayml.com/v1/generate/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error('Failed to fetch job status');
    return res.json();
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    const res = await fetch('https://api.runwayml.com/v1/health', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.ok;
  }
}
```

Create similar providers for Pika and Luma.

### 5.2 Create Video API Route

```typescript
// apps/web/app/api/ai/video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllProviders, getProvider, registerProvider } from '@/lib/ai/providers';
import { RunwayProvider } from '@/lib/ai/video/runway-provider';
// import { PikaProvider } from '@/lib/ai/video/pika-provider';

// Register providers on module load
if (!getProvider('runway')) {
  registerProvider(new RunwayProvider());
}
// if (!getProvider('pika')) { registerProvider(new PikaProvider()); }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider: providerSlug, ...params } = body;

    const provider = providerSlug ? getProvider(providerSlug) : getAllProviders()[0];
    if (!provider) {
      return NextResponse.json({ error: 'No video provider available' }, { status: 503 });
    }

    console.log(`[VIDEO_API] Generating video via ${provider.name}`, { params });
    const result = await provider.generateVideo(params);

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('[VIDEO_API] Generation failed:', err);
    return NextResponse.json({ error: err.message || 'Video generation failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const providerSlug = searchParams.get('provider');
  const jobId = searchParams.get('jobId');

  if (action === 'status' && providerSlug && jobId) {
    const provider = getProvider(providerSlug);
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    const status = await provider.getJobStatus(jobId);
    return NextResponse.json(status);
  }

  const providers = getAllProviders().map(p => ({
    slug: p.slug,
    name: p.name,
    capabilities: p.capabilities,
  }));

  return NextResponse.json({
    service: 'video-generation',
    providers,
    status: providers.length > 0 ? 'ready' : 'unconfigured',
  });
}
```

### 5.3 Polling Hook for Video Status

```typescript
// apps/web/lib/ai/use-video-generation.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface VideoJob {
  providerJobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  thumbnailUrl?: string;
  progress: number;
  errorMessage?: string;
}

export function useVideoGeneration(jobId: string | null, providerSlug: string, pollInterval = 3000) {
  const [job, setJob] = useState<VideoJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!jobId || !providerSlug) return;
    try {
      const res = await fetch(`/api/ai/video?action=status&provider=${providerSlug}&jobId=${jobId}`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setJob(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [jobId, providerSlug]);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
      if (job?.status === 'completed' || job?.status === 'failed') {
        clearInterval(interval);
        setLoading(false);
      }
    }, pollInterval);
    return () => clearInterval(interval);
  }, [jobId, pollInterval, fetchStatus, job?.status]);

  return { job, loading, error, refetch: fetchStatus };
}
```

---

## 6. Security Checklist

| Check | Command / Action |
|-------|------------------|
| **No client-side imports of AI SDK** | `grep -r "from 'ai'\|from \"@ai-sdk/" src/ app/ components/ --include="*.tsx"` — should return **zero** results |
| **No keys in `.env` committed** | `git ls-files | grep "\.env"` — should return nothing |
| **API routes are server-only** | Verify no `'use client'` directive in `app/api/**/route.ts` |
| **Keys scoped by environment** | `.env.production` uses production keys; `.env.development` uses dev/test keys |
| **Input validation** | Validate `prompt`, `duration`, `aspectRatio` in every API route before calling provider |
| **Rate limiting** | Consider adding Vercel Edge Middleware or Upstash rate limits to `/api/ai/image` and `/api/ai/video` |
| **Abort controller / timeouts** | Wrap provider calls with `AbortController` and 30-60s timeouts |
| **Cost guardrails** | Reject `duration > 10` for video; limit `n > 4` for images; add daily quota if needed |

---

## 7. Migration Strategy (HuggingFace → Vercel AI SDK)

### Phase A: Parallel Run (Safe)
1. Install Vercel AI SDK and provider packages.
2. Add `provider` field to `/api/ai/image` requests (default to existing HF behavior).
3. Add `action=verify` to confirm both connections work.

### Phase B: Opt-in Vercel Providers
1. Update client components to pass `provider: 'openai'` or `provider: 'google'` for higher-quality results.
2. Use Vercel AI SDK for new features (reels, story images) while keeping HuggingFace for artifact placeholders.

### Phase C: Full Migration (Optional)
1. Deprecate `HF_TOKEN` once Vercel providers are stable.
2. Remove `lib/ai/image-generation.ts` and Wikimedia/Unsplash fallbacks if no longer needed.

---

## 8. Implementation Checklist

- [ ] `pnpm add ai @ai-sdk/openai @ai-sdk/google @ai-sdk/stability` in `apps/web`
- [ ] Add `VERCEL_AI_CONFIG` in `lib/ai/vercel-config.ts`
- [ ] Create `lib/ai/vercel-image.ts` with `generateVercelImage` and `verifyVercelImageConnection`
- [ ] Update `app/api/ai/image/route.ts` to accept `provider` param and route to Vercel SDK
- [ ] Create `lib/ai/video/runway-provider.ts` extending `BaseAIProvider`
- [ ] Create `app/api/ai/video/route.ts` with provider registry
- [ ] Create `lib/ai/use-video-generation.ts` polling hook
- [ ] Add `.env` keys to `.env.development`, `.env.staging`, `.env.production` (never commit)
- [ ] Run `grep` checks to confirm no secrets in client bundle
- [ ] Test image generation via `POST /api/ai/image` with `{ type: 'custom', provider: 'openai', prompt: '...' }`
- [ ] Test video generation via `POST /api/ai/video` with `{ provider: 'runway', prompt: '...', duration: 5 }`
- [ ] Verify `GET /api/ai/image?action=verify` returns both HF and Vercel status

---

## 9. Notes on the Provided Vercel Link

The link `https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2F%3Fmodal%3Dadd-credit-card` appears to be a malformed or incomplete Vercel dashboard URL (it is missing the actual project path after `/d/`). It does not contain actionable project configuration details.

**Action**: Use the Vercel Dashboard manually:
1. Open `https://vercel.com/[your-org]/[your-project]/settings/environment-variables`
2. Add the keys listed in Section 3.1.
3. If you need billing/credit-card details, complete that in the Vercel dashboard under **Settings → Billing**.

---

## 10. Summary

| Feature | Current State | After Integration |
|---------|--------------|-------------------|
| **Image Generation** | HuggingFace only | HuggingFace + Vercel AI SDK (OpenAI DALL-E / Google Imagen / Stability) |
| **Video / Reels** | Abstract interface only | Concrete providers (Runway, Pika, Luma) via existing `BaseAIProvider` pattern |
| **Secrets** | `.env` files in `apps/web/` | Same files + new keys, all server-only |
| **Client Hooks** | `useGeneratedImage` | Add `useVideoGeneration` |
| **API Routes** | `/api/ai/image` | Add `/api/ai/video`, extend image route with `provider` selector |

This guide preserves your existing heritage-image fallback chain while adding Vercel AI SDK as a first-class, high-quality option.
