import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'reels.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const entries = await prisma.reelStudio.findMany({
      include: {
        reel: {
          include: {
            creator: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: entries });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reel studio entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'reels.create'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const entry = await prisma.reelStudio.upsert({
      where: { reelId: body.reelId },
      update: {
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        customThumbnailUrl: body.customThumbnailUrl,
        autoSubtitleGenerated: body.autoSubtitleGenerated,
        subtitleUrl: body.subtitleUrl,
        subtitleTracks: body.subtitleTracks ? JSON.stringify(body.subtitleTracks) : null,
        hashtags: body.hashtags || [],
        trendingAudioId: body.trendingAudioId,
        trendingAudio: body.trendingAudio,
      },
      create: {
        reelId: body.reelId,
        status: body.status || 'draft',
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        customThumbnailUrl: body.customThumbnailUrl,
        autoSubtitleGenerated: body.autoSubtitleGenerated ?? false,
        subtitleUrl: body.subtitleUrl,
        subtitleTracks: body.subtitleTracks ? JSON.stringify(body.subtitleTracks) : null,
        hashtags: body.hashtags || [],
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

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reel studio entry' }, { status: 500 });
  }
}
