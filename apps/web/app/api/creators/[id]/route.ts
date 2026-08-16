import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const [creator, reelCount, followerCount, followingCount, recentReels] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.id },
        select: { id: true, name: true, email: true, avatar: true, bio: true, createdAt: true },
      }),
      prisma.reel.count({ where: { creatorId: params.id, status: 'published' } }),
      prisma.follow.count({ where: { followingId: params.id } }),
      prisma.follow.count({ where: { followerId: params.id } }),
      prisma.reel.findMany({
        where: { creatorId: params.id, status: 'published' },
        include: { _count: { select: { likes: true, comments: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...creator,
        reelCount,
        followerCount,
        followingCount,
        recentReels,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch creator' }, { status: 500 });
  }
}
