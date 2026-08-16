import { NextResponse } from 'next/server';
import { translateText, getPronunciation, detectLanguage } from '@/lib/ai/llm';

export async function POST(request: Request) {
  try {
    const { text, sourceLang, targetLang } = await request.json();
    if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });
    if (!targetLang) return NextResponse.json({ error: 'targetLang is required' }, { status: 400 });

    const resolvedSource = sourceLang === 'auto' || !sourceLang ? detectLanguage(text) : sourceLang;

    const translation = await translateText(text, resolvedSource, targetLang);
    const pronunciation = await getPronunciation(translation, targetLang);

    return NextResponse.json({ translation, pronunciation, sourceLang: resolvedSource });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
