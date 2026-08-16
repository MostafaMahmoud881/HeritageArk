import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '50')));

    const views = await prisma.reelView.findMany({
      where: { userId: user.id },
      include: {
        reel: {
          include: { creator: { select: { id: true, name: true, avatar: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const grouped: Record<string, typeof views> = {};
    for (const view of views) {
      const dateKey = view.createdAt.toISOString().split('T')[0]!;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(view);
    }

    const total = await prisma.reelView.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      data: grouped,
      total,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
