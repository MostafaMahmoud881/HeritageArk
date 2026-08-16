import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const reels = await prisma.reel.findMany({
      where: { status: 'published' },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true, views: true } },
      },
    });

    const scored = reels.map(reel => {
      const recentLikes = reel._count.likes;
      const recentComments = reel._count.comments;
      const recentViews = reel._count.views;
      const shareWeight = reel.shareCount;

      const score =
        recentLikes * 3 +
        recentComments * 5 +
        shareWeight * 4 +
        recentViews * 1;

      return { ...reel, trendingScore: score };
    });

    scored.sort((a, b) => b.trendingScore - a.trendingScore);
    const data = scored.slice(0, 50);

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trending reels' }, { status: 500 });
  }
}
