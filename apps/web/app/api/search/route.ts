import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

const TRENDING_LIMIT = 10;
const SUGGESTION_LIMIT = 8;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q')?.trim() || '';
  const type = searchParams.get('type') || 'all';
  const locale = searchParams.get('locale') || 'en';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const language = searchParams.get('language') || '';
  const country = searchParams.get('country') || '';
  const culture = searchParams.get('culture') || '';
  const era = searchParams.get('era') || '';
  const mode = searchParams.get('mode') || ''; // suggestions, autocomplete, trending

  const user = await getAuthUser(request);
  const userId = user?.id;
  const skip = (page - 1) * limit;

  if (mode === 'trending') {
    const trending = await prisma.trendingSearch.findMany({
      orderBy: { count: 'desc' },
      take: TRENDING_LIMIT,
    });
    return NextResponse.json({ data: trending.map(t => ({ query: t.query, count: t.count })) });
  }

  if (mode === 'suggestions' || mode === 'autocomplete') {
    if (!q || q.length < 1) {
      const trending = await prisma.trendingSearch.findMany({
        orderBy: { count: 'desc' },
        take: SUGGESTION_LIMIT,
      });
      return NextResponse.json({ data: trending.map(t => t.query) });
    }

    const [trendingMatches, dbMatches] = await Promise.all([
      prisma.trendingSearch.findMany({
        where: { query: { contains: q, mode: 'insensitive' } },
        orderBy: { count: 'desc' },
        take: SUGGESTION_LIMIT,
      }),
      Promise.all([
        prisma.article.findMany({
          where: { title: { contains: q, mode: 'insensitive' }, status: 'published' },
          select: { title: true },
          take: 3,
        }),
        prisma.culture.findMany({
          where: { name: { contains: q, mode: 'insensitive' } },
          select: { name: true },
          take: 3,
        }),
        prisma.reel.findMany({
          where: { title: { contains: q, mode: 'insensitive' }, status: 'published' },
          select: { title: true },
          take: 3,
        }),
      ]),
    ]);

    const suggestions = [
      ...trendingMatches.map(t => t.query),
      ...dbMatches.flat().map(m => Object.values(m)[0] as string),
    ].filter(Boolean).slice(0, SUGGESTION_LIMIT);

    return NextResponse.json({ data: suggestions });
  }

  if (!q) {
    const trending = await prisma.trendingSearch.findMany({
      orderBy: { count: 'desc' },
      take: TRENDING_LIMIT,
    });
    return NextResponse.json({ data: [], trending: trending.map(t => t.query) });
  }

  const results: Array<{
    id: string; type: string; title: string; description: string; url: string; image: string | undefined;
    subtitle?: string; score: number; metadata?: Record<string, unknown>;
  }> = [];
  type SearchItem = (typeof results)[number];
  const seen = new Set<string>();

  const addResult = (item: SearchItem) => {
    const key = `${item.type}:${item.id}`;
    if (!seen.has(key)) { seen.add(key); results.push(item); }
  };

  const searchFields = { contains: q, mode: 'insensitive' as const };

  if (type === 'all' || type === 'articles') {
    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        OR: [{ title: searchFields }, { content: { contains: q, mode: 'insensitive' } }, { excerpt: searchFields }],
      },
      select: { id: true, title: true, excerpt: true, slug: true, image: true, category: true },
      take: limit,
    });
    for (const a of articles) {
      addResult({ id: a.id, type: 'article', title: a.title, description: a.excerpt || a.category, url: `/news/${a.slug}`, image: a.image ?? undefined, subtitle: a.category, score: 0.9 });
    }
  }

  if (type === 'all' || type === 'reels') {
    const reels = await prisma.reel.findMany({
      where: {
        status: 'published',
        OR: [{ title: searchFields }, { description: { contains: q, mode: 'insensitive' } }],
      },
      select: { id: true, title: true, description: true, thumbnailUrl: true, culturalTags: true },
      take: limit,
    });
    for (const r of reels) {
      addResult({ id: r.id, type: 'reel', title: r.title, description: r.description || '', url: `/reels/${r.id}`, image: r.thumbnailUrl ?? undefined, subtitle: r.culturalTags?.join(', '), score: 0.85 });
    }
  }

  if (type === 'all' || type === 'cultures') {
    const cultures = await prisma.culture.findMany({
      where: { OR: [{ name: searchFields }, { region: searchFields }, { summary: { contains: q, mode: 'insensitive' } }] },
      select: { id: true, name: true, summary: true, flag: true, region: true },
      take: limit,
    });
    for (const c of cultures) {
      addResult({ id: c.id, type: 'culture', title: c.name, description: c.summary || c.region, url: `/cultures/${c.id}`, image: undefined, subtitle: c.region, score: 0.95, metadata: { flag: c.flag } });
    }
  }

  if (type === 'all' || type === 'users') {
    const users = await prisma.user.findMany({
      where: { OR: [{ name: searchFields }, { email: searchFields }, { bio: { contains: q, mode: 'insensitive' } }] },
      select: { id: true, name: true, bio: true, avatar: true, role: true },
      take: limit,
    });
    for (const u of users) {
      addResult({ id: u.id, type: 'user', title: u.name, description: u.bio || u.role, url: `/creators/${u.id}`, image: u.avatar ?? undefined, subtitle: u.role, score: 0.7 });
    }
  }

  if (type === 'all' || type === 'media') {
    const media = await prisma.mediaItem.findMany({
      where: { OR: [{ name: searchFields }, { alt: searchFields }] },
      select: { id: true, name: true, alt: true, type: true, thumbnailUrl: true, url: true },
      take: limit,
    });
    for (const m of media) {
      addResult({ id: m.id, type: 'media', title: m.name, description: m.alt || m.type, url: m.url, image: m.thumbnailUrl ?? undefined, subtitle: m.type, score: 0.6 });
    }
  }

  if (type === 'all' || type === 'news') {
    const news = await prisma.newsArticle.findMany({
      where: { OR: [{ title: searchFields }, { summary: { contains: q, mode: 'insensitive' } }] },
      select: { id: true, title: true, summary: true, category: true, image: true },
      take: limit,
    });
    for (const n of news) {
      addResult({ id: n.id, type: 'news', title: n.title, description: n.summary ?? '', url: `/news/${n.id}`, image: n.image ?? undefined, subtitle: n.category ?? undefined, score: 0.8 });
    }
  }

  if (type === 'all' || type === 'events') {
    const events = await prisma.event.findMany({
      where: { OR: [{ title: searchFields }, { description: { contains: q, mode: 'insensitive' } }, { location: searchFields }] },
      select: { id: true, title: true, description: true, location: true, image: true, date: true },
      take: limit,
    });
    for (const e of events) {
      addResult({ id: e.id, type: 'event', title: e.title, description: e.description || e.location || '', url: '#', image: e.image ?? undefined, subtitle: e.location || undefined, score: 0.75, metadata: { date: e.date.toISOString() } });
    }
  }

  const total = results.length;
  const paged = results.slice(skip, skip + limit);

  if (userId && q) {
    await prisma.searchQuery.create({ data: { query: q, userId, results: total, filters: JSON.stringify({ type, language, country, culture, era }) } });
    await prisma.searchHistory.upsert({
      where: { userId_query: { userId, query: q } } as any,
      create: { userId, query: q, filters: JSON.stringify({ type, language, country, culture, era }) },
      update: { createdAt: new Date() },
    }).catch(() => {});
    await prisma.trendingSearch.upsert({
      where: { query: q },
      create: { query: q, count: 1, language: locale },
      update: { count: { increment: 1 } },
    }).catch(() => {});
  }

  const trending = await prisma.trendingSearch.findMany({
    orderBy: { count: 'desc' },
    take: TRENDING_LIMIT,
  });

  const history = userId ? await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  }) : [];

  return NextResponse.json({
    data: paged,
    total,
    page,
    limit,
    trending: trending.map(t => t.query),
    history: history.map(h => ({ query: h.query, filters: h.filters })),
  });
}
