import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';
import { audit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(user.role as any, 'reels.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.videoUrl) {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 });
    }

    const reel = await prisma.reel.create({
      data: {
        title: body.title || '',
        description: body.description || null,
        videoUrl: body.videoUrl,
        thumbnailUrl: body.thumbnailUrl || null,
        duration: body.duration || 0,
        status: body.status || 'draft',
        language: body.language || 'en',
        creatorId: user.id,
      },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await audit.reelCreate(user.id, reel.id);

    return NextResponse.json({ data: reel }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create reel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
