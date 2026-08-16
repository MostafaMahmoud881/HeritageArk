import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'video.create' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const isAdmin = hasPermission(user.role as any, 'settings.edit' as any);

    const where = isAdmin ? {} : { job: { creatorId: user.id } };

    const [history, total] = await Promise.all([
      prisma.generationHistory.findMany({
        where,
        skip,
        take: limit,
        include: { job: { select: { id: true, creatorId: true, status: true, outputUrl: true, thumbnailUrl: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.generationHistory.count({ where }),
    ]);

    return NextResponse.json({
      data: history,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch generation history' }, { status: 500 });
  }
}
