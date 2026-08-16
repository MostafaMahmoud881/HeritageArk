import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'reels.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const entry = await prisma.reelStudio.findUnique({
      where: { id: params.id },
      include: {
        reel: {
          include: {
            creator: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });
    if (!entry) return NextResponse.json({ error: 'Reel studio entry not found' }, { status: 404 });

    return NextResponse.json({ data: entry });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reel studio entry' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'reels.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const entry = await prisma.reelStudio.findUnique({ where: { id: params.id } });
    if (!entry) return NextResponse.json({ error: 'Reel studio entry not found' }, { status: 404 });

    const body = await request.json();
    const updated = await prisma.reelStudio.update({
      where: { id: params.id },
      data: {
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        customThumbnailUrl: body.customThumbnailUrl,
        autoSubtitleGenerated: body.autoSubtitleGenerated,
        subtitleUrl: body.subtitleUrl,
        subtitleTracks: body.subtitleTracks ? JSON.stringify(body.subtitleTracks) : null,
        hashtags: body.hashtags,
        trendingAudioId: body.trendingAudioId,
        trendingAudio: body.trendingAudio,
      },
      include: {
        reel: {
          include: {
            creator: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update reel studio entry' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'reels.delete'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const entry = await prisma.reelStudio.findUnique({ where: { id: params.id } });
    if (!entry) return NextResponse.json({ error: 'Reel studio entry not found' }, { status: 404 });

    await prisma.reelStudio.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete reel studio entry' }, { status: 500 });
  }
}
