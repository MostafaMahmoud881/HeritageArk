import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);

    const reel = await prisma.reel.findUnique({
      where: { id: params.id },
      select: { id: true, viewCount: true },
    });

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.reel.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
      });

      if (user) {
        await tx.reelView.upsert({
          where: {
            userId_reelId: { userId: user.id, reelId: params.id },
          },
          create: { userId: user.id, reelId: params.id },
          update: { createdAt: new Date() },
        });
      }
    });

    return NextResponse.json({ viewCount: reel.viewCount + 1 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
