import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { creatorId } = await request.json();

    if (!creatorId || typeof creatorId !== 'string') {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
    }

    if (creatorId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: creatorId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: creatorId,
          },
        },
      });

      return NextResponse.json({ following: false });
    }

    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: creatorId,
      },
    });

    await prisma.notification.create({
      data: {
        userId: creatorId,
        type: 'follow',
        title: `${user.name} started following you`,
        refId: user.id,
        refType: 'user',
      },
    });

    return NextResponse.json({ following: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}
