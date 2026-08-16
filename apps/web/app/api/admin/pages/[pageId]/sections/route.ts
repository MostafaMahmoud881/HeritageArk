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

    const sections = await prisma.pageSection.findMany({
      where: { pageId: params.pageId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ data: sections });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
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

    const page = await prisma.sitePage.findUnique({ where: { id: params.pageId } });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const body = await request.json();
    const section = await prisma.pageSection.create({
      data: {
        pageId: params.pageId,
        type: body.type,
        title: body.title,
        content: body.content ? JSON.stringify(body.content) : null,
        settings: body.settings ? JSON.stringify(body.settings) : null,
        order: body.order ?? 0,
        isVisible: body.isVisible ?? true,
        cssClass: body.cssClass,
      },
    });

    return NextResponse.json({ data: section }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { pageId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    if (body.sections && Array.isArray(body.sections)) {
      for (let i = 0; i < body.sections.length; i++) {
        const sectionId = body.sections[i];
        if (typeof sectionId === 'string') {
          await prisma.pageSection.update({
            where: { id: sectionId },
            data: { order: i },
          });
        }
      }
    }

    const sections = await prisma.pageSection.findMany({
      where: { pageId: params.pageId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ data: sections });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 });
  }
}
