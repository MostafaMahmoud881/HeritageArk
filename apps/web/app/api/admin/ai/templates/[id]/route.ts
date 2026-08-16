import { NextResponse, NextRequest } from 'next/server';
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
    if (!hasPermission(user.role as any, 'content.create' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const template = await prisma.promptTemplate.findUnique({
      where: { id: params.id },
      include: { creator: { select: { id: true, name: true, email: true } } },
    });
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    return NextResponse.json({ data: template });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'content.create' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const template = await prisma.promptTemplate.findUnique({ where: { id: params.id } });
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    const isOwner = template.creatorId === user.id;
    const isAdmin = hasPermission(user.role as any, 'settings.edit' as any);
    if (!isOwner && !isAdmin)
      return NextResponse.json({ error: 'Forbidden: not the owner' }, { status: 403 });

    const body = await request.json();
    const updated = await prisma.promptTemplate.update({
      where: { id: params.id },
      data: {
        name: body.name ?? template.name,
        description: body.description ?? template.description,
        prompt: body.prompt ?? template.prompt,
        type: body.type ?? template.type,
        style: body.style ?? template.style,
        duration: body.duration ?? template.duration,
        aspectRatio: body.aspectRatio ?? template.aspectRatio,
        quality: body.quality ?? template.quality,
        language: body.language ?? template.language,
        category: body.category ?? template.category,
        isPublic: body.isPublic ?? template.isPublic,
      },
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'content.create' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const template = await prisma.promptTemplate.findUnique({ where: { id: params.id } });
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    const isOwner = template.creatorId === user.id;
    const isAdmin = hasPermission(user.role as any, 'settings.edit' as any);
    if (!isOwner && !isAdmin)
      return NextResponse.json({ error: 'Forbidden: not the owner' }, { status: 403 });

    await prisma.promptTemplate.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
