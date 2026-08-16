import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'video.create' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const job = await prisma.aIGenerationJob.findUnique({
      where: { id: params.jobId },
      include: { provider: { select: { id: true, name: true, slug: true } } },
    });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const isOwner = job.creatorId === user.id;
    const isAdmin = hasPermission(user.role as any, 'settings.edit' as any);
    if (!isOwner && !isAdmin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ data: job });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'video.create' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const job = await prisma.aIGenerationJob.findUnique({ where: { id: params.jobId } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const isOwner = job.creatorId === user.id;
    const isAdmin = hasPermission(user.role as any, 'settings.edit' as any);
    if (!isOwner && !isAdmin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (job.status !== 'queued' && job.status !== 'processing') {
      return NextResponse.json({ error: 'Can only cancel queued or processing jobs' }, { status: 400 });
    }

    const updated = await prisma.aIGenerationJob.update({
      where: { id: params.jobId },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 });
  }
}
