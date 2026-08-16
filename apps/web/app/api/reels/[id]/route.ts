import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { audit } from '@/lib/audit';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const reel = await prisma.reel.findUnique({
      where: { id: params.id },
      include: {
        creator: { select: { id: true, name: true, avatar: true, bio: true } },
        _count: { select: { likes: true, comments: true, saves: true, views: true } },
      },
    });

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    return NextResponse.json({ data: reel });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reel' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.reel.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    if (existing.creatorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const reel = await prisma.reel.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        thumbnailUrl: body.thumbnailUrl,
        language: body.language,
        culturalTags: body.culturalTags,
        status: body.status,
      },
    });

    await audit.reelUpdate(user.id, params.id);

    return NextResponse.json({ data: reel });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update reel' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.reel.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    if (existing.creatorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.reelLike.deleteMany({ where: { reelId: params.id } }),
      prisma.reelComment.deleteMany({ where: { reelId: params.id } }),
      prisma.reelSave.deleteMany({ where: { reelId: params.id } }),
      prisma.reelView.deleteMany({ where: { reelId: params.id } }),
      prisma.reel.delete({ where: { id: params.id } }),
    ]);

    await audit.reelDelete(user.id, params.id);

    return NextResponse.json({ message: 'Reel deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete reel' }, { status: 500 });
  }
}
