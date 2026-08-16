import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'content.create' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const templates = await prisma.promptTemplate.findMany({
      where: {
        OR: [
          { isPublic: true },
          { creatorId: user.id },
        ],
      },
      include: { creator: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: templates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'content.create' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const template = await prisma.promptTemplate.create({
      data: {
        name: body.name,
        description: body.description,
        prompt: body.prompt,
        type: body.type || 'text-to-video',
        style: body.style,
        duration: body.duration || 5,
        aspectRatio: body.aspectRatio || '16:9',
        quality: body.quality || 'standard',
        language: body.language || 'en',
        category: body.category,
        isPublic: body.isPublic ?? true,
        creatorId: user.id,
      },
    });
    return NextResponse.json({ data: template }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
