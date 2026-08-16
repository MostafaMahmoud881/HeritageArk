import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const page = await prisma.sitePage.findUnique({ where: { id: params.pageId } });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const versions = await prisma.pageVersion.findMany({
      where: { pageId: params.pageId },
      orderBy: { version: 'desc' },
    });

    return NextResponse.json({ data: versions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const page = await prisma.sitePage.findUnique({
      where: { id: params.pageId },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const body = await request.json();
    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId: params.pageId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (lastVersion?.version ?? 0) + 1;
    const snapshot = JSON.stringify(page.sections);

    const version = await prisma.pageVersion.create({
      data: {
        pageId: params.pageId,
        version: nextVersion,
        data: snapshot,
        authorId: user.id,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ data: version }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 });
  }
}
