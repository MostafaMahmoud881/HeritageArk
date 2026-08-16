import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const creator = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const [data, total] = await Promise.all([
      prisma.reel.findMany({
        where: { creatorId: params.id, status: 'published' },
        include: {
          _count: { select: { likes: true, comments: true, saves: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reel.count({ where: { creatorId: params.id, status: 'published' } }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reels' }, { status: 500 });
  }
}
