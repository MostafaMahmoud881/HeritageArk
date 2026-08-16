import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const limit = 20;

    if (user) {
      const [watchHistory, likedTags, viewedIds] = await Promise.all([
        prisma.reelView.findMany({
          where: { userId: user.id },
          include: { reel: { select: { culturalTags: true, creatorId: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.reelLike.findMany({
          where: { userId: user.id },
          include: { reel: { select: { culturalTags: true } } },
          take: 30,
        }),
        prisma.reelView.findMany({
          where: { userId: user.id },
          select: { reelId: true },
        }),
      ]);

      const tagScores = new Map<string, number>();
      for (const view of watchHistory) {
        for (const tag of view.reel.culturalTags) {
          tagScores.set(tag, (tagScores.get(tag) || 0) + 1);
        }
      }
      for (const like of likedTags) {
        for (const tag of like.reel.culturalTags) {
          tagScores.set(tag, (tagScores.get(tag) || 0) + 3);
        }
      }

      const preferredTags = Array.from(tagScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);

      const viewedSet = new Set(viewedIds.map(v => v.reelId));

      const candidates = await prisma.reel.findMany({
        where: {
          status: 'published',
          id: { notIn: Array.from(viewedSet) },
          ...(preferredTags.length > 0 ? { culturalTags: { hasSome: preferredTags } } : {}),
        },
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          _count: { select: { likes: true, comments: true } },
        },
        take: 100,
        orderBy: [{ likeCount: 'desc' }, { createdAt: 'desc' }],
      });

      const scored = candidates.map(reel => {
        let score = 0;
        score += reel._count.likes * 2;
        score += reel._count.comments * 3;
        score += reel.shareCount * 2;
        for (const tag of reel.culturalTags) {
          score += tagScores.get(tag) || 0;
        }
        return { ...reel, relevanceScore: score };
      });

      scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
      return NextResponse.json({ data: scored.slice(0, limit) });
    }

    const reels = await prisma.reel.findMany({
      where: { status: 'published' },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    const scored = reels.map(reel => ({
      ...reel,
      relevanceScore: reel._count.likes * 2 + reel._count.comments * 3 + reel.shareCount * 2,
    }));

    return NextResponse.json({ data: scored });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
