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
    if (!hasPermission(user.role as any, 'pages.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const page = await prisma.sitePage.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
        sections: { orderBy: { order: 'asc' } },
      },
    });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    return NextResponse.json({ data: page });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const page = await prisma.sitePage.findUnique({ where: { id: params.id } });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const body = await request.json();
    const updated = await prisma.sitePage.update({
      where: { id: params.id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        layout: body.layout,
        status: body.status,
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
        sections: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.delete'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const page = await prisma.sitePage.findUnique({ where: { id: params.id } });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    await prisma.sitePage.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
