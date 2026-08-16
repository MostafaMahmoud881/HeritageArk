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

// ─── POST: Generate an image ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, provider, ...params } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 },
      );
    }

    console.log(`[IMAGE_API] Generating ${type} image`, { params, provider });

    let result;

    if (provider === 'openai' || provider === 'google' || provider === 'vercel') {
      const vercelProvider = provider === 'vercel' ? 'auto' : provider;
      switch (type) {
        case 'artifact':
          result = await generateVercelImage(
            `${params.name}, ${params.culture} artifact from ${params.period}, ${params.location}, ${params.description}, museum quality`,
            { provider: vercelProvider, size: '1024x1024' }
          );
          break;
        case 'story':
          result = await generateVercelImage(
            `${params.sceneDescription}, ${params.culture} historical scene, illustrated storybook style`,
            { provider: vercelProvider }
          );
          break;
        case 'character':
          result = await generateVercelImage(
            `Portrait of ${params.characterName}, ${params.culture} character from ${params.era}, traditional clothing, historical painting style`,
            { provider: vercelProvider }
          );
          break;
        case 'custom':
          result = await generateVercelImage(params.prompt, {
            provider: vercelProvider,
            size: params.width && params.height ? `${params.width}x${params.height}` : undefined,
          });
          break;
        default:
          return NextResponse.json(
            { error: `Unknown generation type for Vercel provider: ${type}` },
            { status: 400 },
          );
      }
      return NextResponse.json({ success: true, result, source: 'vercel-ai-sdk' });
    }

    // Default: HuggingFace flow
    console.log(`[IMAGE_API] Generating ${type} image via HuggingFace`, { params });
    switch (type) {
      case 'artifact':
        result = await generateArtifactImage(
          params.name,
          params.culture,
          params.period,
          params.location,
          params.description,
        );
        break;

      case 'story':
        result = await generateStoryImage(
          params.storyName,
          params.sceneDescription,
          params.culture,
        );
        break;

      case 'character':
        result = await generateCharacterPortrait(
          params.characterName,
          params.culture,
          params.era,
        );
        break;

      case 'documentary':
        result = await generateDocumentaryPoster(
          params.title,
          params.culture,
          params.period,
        );
        break;

      case 'reel':
        result = await generateReelThumbnail(
          params.title,
          params.culture,
        );
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
        return NextResponse.json(
          { error: `Unknown generation type: ${type}` },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      result,
      source: 'huggingface',
    });
  } catch (err) {
    console.error('[IMAGE_API] Generation failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Image generation failed' },
      { status: 500 },
    );
  }
}

// ─── GET: Check connection status ────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'verify') {
    const hfStatus = await verifyHFConnection();
    const vercelStatus = await verifyVercelImageConnection();
    return NextResponse.json({ huggingface: hfStatus, vercel: vercelStatus });
  }

  const hfTokenSet = !!process.env.HF_TOKEN;
  const vercelSet = !!process.env.OPENAI_API_KEY || !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
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