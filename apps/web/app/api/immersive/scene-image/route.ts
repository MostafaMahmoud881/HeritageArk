import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

const HF_TOKEN = process.env.HF_TOKEN || '';
const MODELS = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-xl-base-1.0',
  'runwayml/stable-diffusion-v1-5',
];
const CACHE_DIR = path.join(process.cwd(), 'public', 'generated-scenes');
const CACHE_INDEX = path.join(CACHE_DIR, 'index.json');

function log(label: string, data?: any) {
  const ts = new Date().toISOString();
  console.log(`[SCENE_IMG ${ts}] ${label}`, data !== undefined ? data : '');
}

async function readCacheIndex(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(CACHE_INDEX, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCacheIndex(index: Record<string, string>) {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_INDEX, JSON.stringify(index, null, 2));
}

async function callHF(model: string, prompt: string): Promise<ArrayBuffer | null> {
  if (!HF_TOKEN) {
    log('WARN HF_TOKEN not set — skipping HF call');
    return null;
  }
  const url = `https://api-inference.huggingface.co/models/${model}`;
  log(`HF request → ${model}`, { prompt: prompt.slice(0, 80) });
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: 'blurry, low quality, distorted, watermark',
          num_inference_steps: 20,
          guidance_scale: 7.5,
        },
      }),
      signal: AbortSignal.timeout(18_000),
    });
    log(`HF response status: ${res.status} model=${model}`);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      log(`HF error body: ${body.slice(0, 200)}`);
      return null;
    }
    const buffer = await res.arrayBuffer();
    log(`HF success model=${model}`, { sizeKB: (buffer.byteLength / 1024).toFixed(1) });
    return buffer;
  } catch (err: any) {
    log(`HF fetch error model=${model}: ${err.message}`);
    return null;
  }
}

async function tryUnsplash(query: string): Promise<string | null> {
  try {
    const url = `https://source.unsplash.com/800x450/?${encodeURIComponent(query)}`;
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5_000) });
    if (res.ok) {
      log('Unsplash fallback URL', res.url);
      return res.url;
    }
  } catch (err: any) {
    log(`Unsplash failed: ${err.message}`);
  }
  return null;
}

async function tryWikimedia(query: string): Promise<string | null> {
  try {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&origin=*`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(5_000) });
    const data = await res.json();
    const pages = data?.query?.search || [];
    if (pages.length > 0) {
      const title = pages[0].title;
      const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=800`;
      log('Wikimedia fallback URL', imageUrl);
      return imageUrl;
    }
  } catch (err: any) {
    log(`Wikimedia failed: ${err.message}`);
  }
  return null;
}

export async function POST(request: NextRequest) {
  const startMs = Date.now();
  let provider = 'unknown';
  let model = 'unknown';
  let fallbackUsed = false;
  let fallbackSource: string | undefined;
  let returnedUrl = '';

  try {
    const { sceneId, prompt, culture } = await request.json();

    if (!sceneId || !prompt) {
      return NextResponse.json({ error: 'Missing sceneId or prompt' }, { status: 400 });
    }

    log('── START ──', { sceneId, prompt: prompt.slice(0, 80), culture });

    // Check disk cache
    const cacheIndex = await readCacheIndex();
    if (cacheIndex[sceneId]) {
      log('Cache hit', { sceneId, url: cacheIndex[sceneId] });
      return NextResponse.json({
        url: cacheIndex[sceneId],
        source: 'cache',
        diagnostics: { provider: 'cache', model: 'cache', generationDurationMs: Date.now() - startMs, returnedImageUrl: cacheIndex[sceneId], fallbackUsed: false },
      });
    }

    const enhancedPrompt = `${prompt}, ${culture} historical scene, detailed illustration, warm colors, cultural heritage, high quality`;
    log('Enhanced prompt', enhancedPrompt.slice(0, 120));

    // Try HF models
    for (const m of MODELS) {
      const buffer = await callHF(m, enhancedPrompt);
      if (buffer) {
        await mkdir(CACHE_DIR, { recursive: true });
        const filename = `${sceneId}-${Date.now()}.jpg`;
        const filepath = path.join(CACHE_DIR, filename);
        await writeFile(filepath, Buffer.from(buffer));
        returnedUrl = `/generated-scenes/${filename}`;
        provider = 'huggingface';
        model = m;
        log('Saved HF image', { returnedUrl });
        break;
      }
    }

    // Fallback: Wikimedia
    if (!returnedUrl) {
      log('All HF models failed, trying Wikimedia');
      fallbackUsed = true;
      const wikiUrl = await tryWikimedia(`${culture} ${prompt.split(',')[0]}`);
      if (wikiUrl) {
        returnedUrl = wikiUrl;
        provider = 'wikimedia';
        model = 'wikimedia-commons';
        fallbackSource = 'wikimedia';
      }
    }

    // Fallback: Unsplash
    if (!returnedUrl) {
      log('Trying Unsplash fallback');
      const unsplashUrl = await tryUnsplash(`${culture} heritage`);
      if (unsplashUrl) {
        returnedUrl = unsplashUrl;
        provider = 'unsplash';
        model = 'unsplash';
        fallbackSource = 'unsplash';
      }
    }

    // Verify URL is not null/undefined/empty
    if (!returnedUrl || returnedUrl === '') {
      log('ERROR all sources failed — returning empty');
      return NextResponse.json({
        url: '',
        source: 'none',
        diagnostics: { provider: 'none', model: 'none', generationDurationMs: Date.now() - startMs, returnedImageUrl: '', fallbackUsed: true, fallbackSource: 'none', error: 'all sources failed' },
      });
    }

    // Persist to cache index
    cacheIndex[sceneId] = returnedUrl;
    await writeCacheIndex(cacheIndex);
    log('Cached URL to index', { sceneId, returnedUrl });

    const durationMs = Date.now() - startMs;
    log('── DONE ──', { sceneId, returnedUrl, provider, model, durationMs, fallbackUsed });

    return NextResponse.json({
      url: returnedUrl,
      source: provider,
      diagnostics: { provider, model, generationDurationMs: durationMs, returnedImageUrl: returnedUrl, fallbackUsed, fallbackSource },
    });
  } catch (err: any) {
    log('FATAL ERROR', err.message);
    return NextResponse.json({ error: err.message, url: '', source: 'error' }, { status: 500 });
  }
}
