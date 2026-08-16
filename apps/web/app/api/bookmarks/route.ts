import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const refType = searchParams.get('refType');

  const where: Record<string, unknown> = { userId: user.id };
  if (refType) where.refType = refType;

  const bookmarks = await prisma.bookmark.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: bookmarks, total: bookmarks.length });
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

    const existing = await prisma.bookmark.findFirst({
      where: { refId, userId: user.id },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.bookmark.create({
      data: {
        refId,
        refType,
        userId: user.id,
      },
    });

    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error('[BOOKMARKS_API] Toggle failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const bookmark = await prisma.bookmark.findFirst({
    where: { id, userId: user.id },
  });

  if (!bookmark) {
    return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
  }

  await prisma.bookmark.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
