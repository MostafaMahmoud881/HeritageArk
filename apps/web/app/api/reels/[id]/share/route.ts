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
      select: { id: true, shareCount: true },
    });

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    await prisma.reel.update({
      where: { id: params.id },
      data: { shareCount: { increment: 1 } },
    });

    const origin = request.headers.get('origin') || `${request.url}`;
    const shareUrl = `${origin}/reels/${params.id}`;

    if (user) {
      await prisma.reelView.upsert({
        where: {
          userId_reelId: { userId: user.id, reelId: params.id },
        },
        create: { userId: user.id, reelId: params.id },
        update: {},
      }).catch(() => {});
    }

    return NextResponse.json({ shareUrl, shareCount: reel.shareCount + 1 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record share' }, { status: 500 });
  }
}
