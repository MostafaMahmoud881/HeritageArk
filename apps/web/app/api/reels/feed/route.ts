import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get('cursor');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const take = limit + 1;

    const cursorCondition = cursor ? { id: { lt: cursor } } : {};

    if (user) {
      const followedIds = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      });
      const followedIdSet = new Set(followedIds.map(f => f.followingId));

      const [followingReels, trendingReels] = await Promise.all([
        followedIdSet.size > 0
          ? prisma.reel.findMany({
              where: { creatorId: { in: Array.from(followedIdSet) }, status: 'published', ...cursorCondition },
              include: { creator: { select: { id: true, name: true, avatar: true } } },
              orderBy: { createdAt: 'desc' },
              take,
            })
          : Promise.resolve([]),
        prisma.reel.findMany({
          where: {
            status: 'published',
            creatorId: followedIdSet.size > 0 ? { notIn: Array.from(followedIdSet) } : undefined,
            ...cursorCondition,
          },
          orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }, { createdAt: 'desc' }],
          take,
        }),
      ]);

      const seen = new Set<string>();
      const merged: { id: string }[] = [];
      for (const reel of [...followingReels, ...trendingReels]) {
        if (!seen.has(reel.id)) {
          seen.add(reel.id);
          merged.push(reel);
        }
      }

      const data = merged.slice(0, limit);
      const last = data[data.length - 1];
      const nextCursor = data.length === limit && last ? last.id : null;
      return NextResponse.json({ data, nextCursor });
    }

    const reels = await prisma.reel.findMany({
      where: { status: 'published', ...cursorCondition },
      include: { creator: { select: { id: true, name: true, avatar: true } } },
      orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }, { createdAt: 'desc' }],
      take,
    });

    const data = reels.slice(0, limit);
    const last = data[data.length - 1];
    const nextCursor = data.length === limit && last ? last.id : null;
    return NextResponse.json({ data, nextCursor });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
