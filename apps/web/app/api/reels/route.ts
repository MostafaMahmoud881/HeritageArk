import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { audit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') || 'published';
    const language = searchParams.get('language');
    const culturalTags = searchParams.get('culturalTags');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const where: Record<string, unknown> = { status };
    if (language) where.language = language;
    if (culturalTags) where.culturalTags = { hasSome: culturalTags.split(',') };

    const [data, total] = await Promise.all([
      prisma.reel.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          _count: { select: { likes: true, comments: true, saves: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reel.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reels' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.videoUrl) {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 });
    }

    const reel = await prisma.reel.create({
      data: {
        title: body.title || '',
        description: body.description || '',
        videoUrl: body.videoUrl,
        thumbnailUrl: body.thumbnailUrl,
        duration: body.duration,
        status: body.status || 'published',
        language: body.language,
        culturalTags: body.culturalTags || [],
        creatorId: user.id,
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
      },
    });

    await audit.reelCreate(user.id, reel.id);

    return NextResponse.json({ data: reel }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reel' }, { status: 500 });
  }
}
