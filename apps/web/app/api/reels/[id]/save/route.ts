import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

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
      select: { id: true, saveCount: true },
    });

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    const existing = await prisma.reelSave.findUnique({
      where: { userId_reelId: { userId: user.id, reelId: params.id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.reelSave.delete({
          where: { userId_reelId: { userId: user.id, reelId: params.id } },
        }),
        prisma.reel.update({
          where: { id: params.id },
          data: { saveCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({ saved: false, saveCount: Math.max(0, reel.saveCount - 1) });
    }

    await prisma.$transaction([
      prisma.reelSave.create({
        data: { userId: user.id, reelId: params.id },
      }),
      prisma.reel.update({
        where: { id: params.id },
        data: { saveCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ saved: true, saveCount: reel.saveCount + 1 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle save' }, { status: 500 });
  }
}
