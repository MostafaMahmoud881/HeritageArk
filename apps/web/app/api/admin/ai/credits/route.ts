import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const [balances, total] = await Promise.all([
      prisma.creditBalance.findMany({
        skip,
        take: limit,
        include: { user: { select: { id: true, email: true, name: true, role: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.creditBalance.count(),
    ]);

    return NextResponse.json({ data: balances, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch credit balances' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { userId, videoCredits, imageCredits, subtitleCredits, translationCredits, voiceCredits } = body;

    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const balance = await prisma.creditBalance.upsert({
      where: { userId },
      create: {
        userId,
        videoCredits: videoCredits ?? 0,
        imageCredits: imageCredits ?? 0,
        subtitleCredits: subtitleCredits ?? 0,
        translationCredits: translationCredits ?? 0,
        voiceCredits: voiceCredits ?? 0,
      },
      update: {
        videoCredits: { increment: videoCredits ?? 0 },
        imageCredits: { increment: imageCredits ?? 0 },
        subtitleCredits: { increment: subtitleCredits ?? 0 },
        translationCredits: { increment: translationCredits ?? 0 },
        voiceCredits: { increment: voiceCredits ?? 0 },
      },
    });

    if (videoCredits) {
      await prisma.creditTransaction.create({
        data: {
          balanceId: balance.id,
          type: 'grant',
          creditType: 'video',
          amount: videoCredits,
          description: 'Admin grant',
        },
      });
    }
    if (imageCredits) {
      await prisma.creditTransaction.create({
        data: {
          balanceId: balance.id,
          type: 'grant',
          creditType: 'image',
          amount: imageCredits,
          description: 'Admin grant',
        },
      });
    }
    if (subtitleCredits) {
      await prisma.creditTransaction.create({
        data: {
          balanceId: balance.id,
          type: 'grant',
          creditType: 'subtitle',
          amount: subtitleCredits,
          description: 'Admin grant',
        },
      });
    }
    if (translationCredits) {
      await prisma.creditTransaction.create({
        data: {
          balanceId: balance.id,
          type: 'grant',
          creditType: 'translation',
          amount: translationCredits,
          description: 'Admin grant',
        },
      });
    }
    if (voiceCredits) {
      await prisma.creditTransaction.create({
        data: {
          balanceId: balance.id,
          type: 'grant',
          creditType: 'voice',
          amount: voiceCredits,
          description: 'Admin grant',
        },
      });
    }

    return NextResponse.json({ data: balance }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update credit balance' }, { status: 500 });
  }
}
