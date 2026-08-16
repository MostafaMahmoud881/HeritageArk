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
    if (!hasPermission(user.role as any, 'video.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: { creator: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    return NextResponse.json({ data: video });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'video.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const video = await prisma.video.findUnique({ where: { id: params.id } });
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    const body = await request.json();
    const updated = await prisma.video.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        videoUrl: body.videoUrl,
        thumbnailUrl: body.thumbnailUrl,
        duration: body.duration,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        tags: body.tags,
        language: body.language,
        category: body.category,
        license: body.license,
        allowComments: body.allowComments,
        allowDownloads: body.allowDownloads,
        subtitlesUrl: body.subtitlesUrl,
        subtitles: body.subtitles,
        translations: body.translations,
      },
      include: { creator: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'video.delete'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const video = await prisma.video.findUnique({ where: { id: params.id } });
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    await prisma.video.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
