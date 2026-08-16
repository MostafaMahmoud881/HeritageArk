import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reel = await prisma.reel.findUnique({
      where: { id: params.id },
      select: { id: true, creatorId: true, likeCount: true },
    });

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    const existing = await prisma.reelLike.findUnique({
      where: { userId_reelId: { userId: user.id, reelId: params.id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.reelLike.delete({
          where: { userId_reelId: { userId: user.id, reelId: params.id } },
        }),
        prisma.reel.update({
          where: { id: params.id },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({ liked: false, likeCount: Math.max(0, reel.likeCount - 1) });
    }

    await prisma.$transaction([
      prisma.reelLike.create({
        data: { userId: user.id, reelId: params.id },
      }),
      prisma.reel.update({
        where: { id: params.id },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    if (reel.creatorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: reel.creatorId,
          type: 'reel_like',
          title: `${user.name} liked your reel`,
          refId: params.id,
          refType: 'reel',
        },
      });
    }

    return NextResponse.json({ liked: true, likeCount: reel.likeCount + 1 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
