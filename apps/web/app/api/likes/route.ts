import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const refId = searchParams.get('refId');

  if (!refId) {
    return NextResponse.json({ error: 'refId is required' }, { status: 400 });
  }

  const count = await prisma.like.count({ where: { refId } });

  const user = await getAuthUser(request);
  let userLiked = false;
  if (user) {
    const existing = await prisma.like.findFirst({
      where: { refId, userId: user.id },
    });
    userLiked = !!existing;
  }

  return NextResponse.json({ count, userLiked });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { refId, refType } = await request.json();

    if (!refId || !refType) {
      return NextResponse.json(
        { error: 'refId and refType are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.like.findFirst({
      where: { refId, userId: user.id },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { refId } });
      return NextResponse.json({
        liked: false,
        count,
      });
    }

    await prisma.like.create({
      data: {
        refId,
        refType,
        userId: user.id,
      },
    });

    const count = await prisma.like.count({ where: { refId } });
    return NextResponse.json({
      liked: true,
      count,
    });
  } catch (error) {
    console.error('[LIKES_API] Toggle failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
