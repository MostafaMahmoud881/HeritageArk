import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q')?.trim() || '';
  const lang = searchParams.get('lang') || 'en';
  const mode = searchParams.get('mode') || '';
  const source = searchParams.get('source') || '';
  const target = searchParams.get('target') || '';

  if (mode === 'languages') {
    const langs = await prisma.dictionaryEntry.findMany({
      select: { language: true },
      distinct: ['language'],
      orderBy: { language: 'asc' },
    });
    return NextResponse.json({ data: langs.map(l => l.language) });
  }

  if (mode === 'suggest') {
    if (!q || q.length < 2) return NextResponse.json({ data: [] });
    const entries = await prisma.dictionaryEntry.findMany({
      where: {
        language: lang,
        word: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, word: true, pronunciation: true, partOfSpeech: true },
      take: 10,
    });
    return NextResponse.json({ data: entries });
  }

  if (mode === 'lookup') {
    if (!q) return NextResponse.json({ data: null, error: 'Query required' });
    const entry = await prisma.dictionaryEntry.findFirst({
      where: {
        language: lang,
        word: { equals: q, mode: 'insensitive' },
      },
      include: {
        translations: {
          include: { target: { select: { word: true, language: true, pronunciation: true } } },
        },
        examples: true,
        synonyms: {
          include: { related: { select: { word: true, language: true, pronunciation: true } } },
        },
        antonyms: {
          include: { entry: { select: { word: true, language: true, pronunciation: true } } },
        },
      },
    });
    if (!entry) return NextResponse.json({ data: null });
    return NextResponse.json({
      data: {
        ...entry,
        translations: entry.translations.map(t => ({
          id: t.id,
          word: t.target.word,
          language: t.target.language,
          notes: t.notes,
        })),
        synonyms: entry.synonyms.map(r => ({
          id: r.id,
          type: r.type,
          word: r.related.word,
          language: r.related.language,
          pronunciation: r.related.pronunciation,
        })),
        antonyms: entry.antonyms.map(r => ({
          id: r.id,
          type: r.type,
          word: r.entry.word,
          language: r.entry.language,
          pronunciation: r.entry.pronunciation,
        })),
      },
    });
  }

  if (mode === 'translate' && source && target && q) {
    const sourceEntry = await prisma.dictionaryEntry.findFirst({
      where: { language: source, word: { equals: q, mode: 'insensitive' } },
      include: {
        translations: {
          where: { target: { language: target } },
          include: { target: { select: { word: true, pronunciation: true } } },
        },
      },
    });
    if (!sourceEntry) return NextResponse.json({ data: null });
    return NextResponse.json({
      data: {
        source: { word: sourceEntry.word, language: sourceEntry.language, pronunciation: sourceEntry.pronunciation },
        translations: sourceEntry.translations.map(t => ({
          word: t.target.word,
          pronunciation: t.target.pronunciation,
          notes: t.notes,
        })),
      },
    });
  }

  const entries = await prisma.dictionaryEntry.findMany({
    where: { language: lang },
    orderBy: { word: 'asc' },
    take: 50,
    skip: Math.max(0, (parseInt(searchParams.get('page') || '1') - 1) * 50),
  });

  const total = await prisma.dictionaryEntry.count({ where: { language: lang } });

  return NextResponse.json({ data: entries, total, language: lang });
}
