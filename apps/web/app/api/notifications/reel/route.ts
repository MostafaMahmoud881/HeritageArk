// Record a reel notification
// POST /api/notifications/reel
// Body: { type: 'like'|'comment'|'follow', reelId, actorId }

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { type, reelId, actorId } = await request.json();
    if (!type || !actorId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Get the reel creator
    const reel = await prisma.reel.findUnique({
      where: { id: reelId },
      select: { creatorId: true, title: true },
    });

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    // Don't notify if actor is the creator
    if (reel.creatorId === actorId) {
      return NextResponse.json({ skipped: true });
    }

    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { name: true },
    });

    const notificationMessages: Record<string, { title: string; message: string }> = {
      like: { title: 'New Like', message: `${actor?.name || 'Someone'} liked your reel "${reel.title}"` },
      comment: { title: 'New Comment', message: `${actor?.name || 'Someone'} commented on "${reel.title}"` },
      follow: { title: 'New Follower', message: `${actor?.name || 'Someone'} started following you` },
    };

    const msg = notificationMessages[type] || { title: 'New Activity', message: 'Someone interacted with your content' };

    await prisma.notification.create({
      data: {
        userId: reel.creatorId,
        type: `reel_${type}`,
        title: msg.title,
        message: msg.message,
        refId: reelId,
        refType: 'reel',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
