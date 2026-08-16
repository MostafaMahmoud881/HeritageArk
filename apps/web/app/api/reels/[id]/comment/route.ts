import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const reel = await prisma.reel.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    const [data, total] = await Promise.all([
      prisma.reelComment.findMany({
        where: { reelId: params.id, parentId: null },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          replies: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reelComment.count({ where: { reelId: params.id } }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

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
      select: { id: true, creatorId: true, commentCount: true },
    });

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    const { text, parentId } = await request.json();
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (parentId) {
      const parentComment = await prisma.reelComment.findUnique({
        where: { id: parentId },
        select: { id: true, reelId: true },
      });
      if (!parentComment || parentComment.reelId !== params.id) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.reelComment.create({
        data: {
          text: text.trim(),
          userId: user.id,
          reelId: params.id,
          parentId: parentId || null,
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      await tx.reel.update({
        where: { id: params.id },
        data: { commentCount: { increment: 1 } },
      });

      return created;
    });

    if (reel.creatorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: reel.creatorId,
          type: 'reel_comment',
          title: `${user.name} commented on your reel`,
          message: text.trim().slice(0, 100),
          refId: params.id,
          refType: 'reel',
        },
      });
    }

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
