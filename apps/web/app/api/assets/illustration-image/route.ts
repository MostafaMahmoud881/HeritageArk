import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

const HF_TOKEN = process.env.HF_TOKEN || '';
const MODELS = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-xl-base-1.0',
  'runwayml/stable-diffusion-v1-5',
];
const CACHE_DIR = path.join(process.cwd(), 'public', 'generated-illustrations');
const CACHE_INDEX = path.join(CACHE_DIR, 'index.json');

async function readCacheIndex(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await readFile(CACHE_INDEX, 'utf-8'));
  } catch {
    return {};
  }
}

async function writeCacheIndex(index: Record<string, string>) {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_INDEX, JSON.stringify(index, null, 2));
}

async function callHF(model: string, prompt: string): Promise<ArrayBuffer | null> {
  if (!HF_TOKEN) return null;
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: 'blurry, low quality, distorted, watermark, text',
          num_inference_steps: 20,
          guidance_scale: 7.5,
        },
      }),
      signal: AbortSignal.timeout(18_000),
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

async function tryFallback(query: string): Promise<string | null> {
  try {
    const wiki = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&origin=*`, { signal: AbortSignal.timeout(5_000) });
    const data = await wiki.json();
    const title = data?.query?.search?.[0]?.title;
    if (title) return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=800`;
  } catch {}
  try {
    const unsplash = `https://source.unsplash.com/800x450/?${encodeURIComponent(query)}`;
    const res = await fetch(unsplash, { method: 'HEAD', signal: AbortSignal.timeout(5_000) });
    if (res.ok) return res.url;
  } catch {}
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('id') || `${searchParams.get('title') || ''}-${searchParams.get('culture') || ''}`;
  const title = searchParams.get('title') || 'Heritage scene';
  const culture = searchParams.get('culture') || 'Heritage';
  const prompt = searchParams.get('prompt') || `${title}, ${culture} heritage illustration, detailed, warm light, high quality`;

  if (!key) {
    return NextResponse.json({ error: 'Missing id or title/culture' }, { status: 400 });
  }

  const cacheIndex = await readCacheIndex();
  if (cacheIndex[key]) {
    return NextResponse.json({ url: cacheIndex[key], source: 'cache' });
  }

  const enhanced = `${prompt}, historical illustration, cultural heritage, no text, no watermark`;
  let returnedUrl = '';
  let source = 'none';

  for (const model of MODELS) {
    const buffer = await callHF(model, enhanced);
    if (buffer) {
      await mkdir(CACHE_DIR, { recursive: true });
      const filename = `${key}-${Date.now()}.jpg`;
      await writeFile(path.join(CACHE_DIR, filename), Buffer.from(buffer));
      returnedUrl = `/generated-illustrations/${filename}`;
      source = 'huggingface';
      break;
    }
  }

  if (!returnedUrl) {
    returnedUrl = (await tryFallback(`${culture} ${title}`)) || '';
    source = returnedUrl.includes('wikimedia') ? 'wikimedia' : returnedUrl ? 'unsplash' : 'none';
  }

  if (!returnedUrl) {
    return NextResponse.json({ url: '', source: 'none' }, { status: 500 });
  }

  cacheIndex[key] = returnedUrl;
  await writeCacheIndex(cacheIndex);
  return NextResponse.json({ url: returnedUrl, source });
}
