import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const articles = await prisma.newsArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({
      data: articles.map((a) => ({
        _id: a.id,
        id: a.id,
        title: a.title,
        slug: a.id,
        excerpt: a.summary,
        content: a.content,
        source: a.source ?? 'HeritageArk',
        sourceUrl: a.sourceUrl ?? '#',
        categories: a.category ? [a.category] : [],
        tags: a.category ? [a.category] : [],
        publishedAt: (a.publishedAt ?? a.createdAt).toISOString(),
        status: 'published',
        author: a.author ?? null,
        img: a.image ?? null,
        image: a.image ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
