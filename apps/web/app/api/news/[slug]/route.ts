import { NextResponse } from 'next/server';
import { NEWS_ARTICLES } from '@/lib/data';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const a = NEWS_ARTICLES.find((x) => x.id === params.slug);
  if (!a) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    data: {
      _id: a.id,
      title: a.title,
      slug: a.id,
      excerpt: a.summary,
      content: a.summary,
      source: 'HeritageArk',
      sourceUrl: '#',
      categories: [a.cat],
      tags: [a.cat],
      publishedAt: new Date(a.date).toISOString(),
      status: 'published',
      author: a.author,
      img: a.img,
    },
  });
}
