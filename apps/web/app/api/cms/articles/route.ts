import { NextResponse } from 'next/server';
import { getArticles, createArticle } from '@/lib/db';

export async function GET() {
  const articles = getArticles();
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const article = createArticle({
      title: body.title,
      content: body.content || '',
      excerpt: body.excerpt || body.title,
      category: body.category || 'General',
      status: body.status || 'draft',
      author: body.author || 'Anonymous',
      tags: body.tags || [],
      image: body.image,
      scheduledDate: body.scheduledDate,
    });
    return NextResponse.json(article, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
