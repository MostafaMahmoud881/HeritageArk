import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const culturalTags = searchParams.get('culturalTags');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '30')));

    const where: Record<string, unknown> = { status: 'published' };
    if (culturalTags) {
      where.culturalTags = { hasSome: culturalTags.split(',') };
    }

    const total = await prisma.reel.count({ where });
    if (total === 0) {
      return NextResponse.json({ data: [] });
    }

    const allReels = await prisma.reel.findMany({
      where,
      include: { creator: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const shuffled = [...allReels].sort(() => Math.random() - 0.5);
    const seenCreators = new Set<string>();
    const diverse: typeof shuffled = [];

    for (const reel of shuffled) {
      if (!seenCreators.has(reel.creatorId)) {
        seenCreators.add(reel.creatorId);
        diverse.push(reel);
      }
      if (diverse.length >= limit) break;
    }

    if (diverse.length < limit) {
      for (const reel of shuffled) {
        if (!diverse.some(r => r.id === reel.id)) {
          diverse.push(reel);
        }
        if (diverse.length >= limit) break;
      }
    }

    return NextResponse.json({ data: diverse });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch explore reels' }, { status: 500 });
  }
}
