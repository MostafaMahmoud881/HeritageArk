import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { lang: string } }) {
  const { lang } = params;
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

  const [entries, total] = await Promise.all([
    prisma.dictionaryEntry.findMany({
      where: { language: lang },
      orderBy: { word: 'asc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.dictionaryEntry.count({ where: { language: lang } }),
  ]);

  return NextResponse.json({ data: entries, total, page, limit, language: lang });
}
