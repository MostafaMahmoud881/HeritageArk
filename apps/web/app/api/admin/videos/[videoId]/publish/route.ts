import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'video.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const video = await prisma.video.findUnique({ where: { id: params.videoId } });
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    const body = await request.json();
    const updateData: any = {};

    if (body.scheduledAt) {
      updateData.status = 'scheduled';
      updateData.scheduledAt = new Date(body.scheduledAt);
    } else {
      updateData.status = 'published';
      updateData.scheduledAt = null;
    }

    const updated = await prisma.video.update({
      where: { id: params.videoId },
      data: updateData,
      include: { creator: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to publish video' }, { status: 500 });
  }
}
