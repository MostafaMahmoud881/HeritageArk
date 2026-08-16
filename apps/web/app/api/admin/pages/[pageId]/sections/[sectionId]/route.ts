import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { pageId: string; sectionId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const section = await prisma.pageSection.findFirst({
      where: { id: params.sectionId, pageId: params.pageId },
    });
    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

    const body = await request.json();
    const updated = await prisma.pageSection.update({
      where: { id: params.sectionId },
      data: {
        type: body.type,
        title: body.title,
        content: body.content ? JSON.stringify(body.content) : body.content,
        settings: body.settings ? JSON.stringify(body.settings) : body.settings,
        order: body.order,
        isVisible: body.isVisible,
        cssClass: body.cssClass,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pageId: string; sectionId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.delete'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const section = await prisma.pageSection.findFirst({
      where: { id: params.sectionId, pageId: params.pageId },
    });
    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

    await prisma.pageSection.delete({ where: { id: params.sectionId } });
    return NextResponse.json({ data: { id: params.sectionId, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
