// POST /api/reels/subtitles
// Body: { description, duration, sourceLanguage, targetLanguages }
// Returns: { tracks: SubtitleTrack[] }

import { NextResponse } from 'next/server';
import { generateSubtitles } from '@/lib/ai/subtitles';

export async function POST(request: Request) {
  try {
    const { description, duration, sourceLanguage, targetLanguages } = await request.json();
    if (!description || !duration) {
      return NextResponse.json({ error: 'Description and duration required' }, { status: 400 });
    }

    const tracks = await generateSubtitles(
      description,
      duration,
      sourceLanguage || 'en',
      targetLanguages || ['en', 'ar', 'fr', 'it']
    );

    return NextResponse.json({ tracks });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
