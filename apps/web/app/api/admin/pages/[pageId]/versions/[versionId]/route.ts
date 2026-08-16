import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string; versionId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const version = await prisma.pageVersion.findFirst({
      where: { id: params.versionId, pageId: params.pageId },
    });
    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

    return NextResponse.json({ data: version });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch version' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string; versionId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const version = await prisma.pageVersion.findFirst({
      where: { id: params.versionId, pageId: params.pageId },
    });
    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

    const sectionsData = JSON.parse(version.data);
    await prisma.pageSection.deleteMany({ where: { pageId: params.pageId } });

    for (const section of sectionsData) {
      await prisma.pageSection.create({
        data: {
          pageId: params.pageId,
          type: section.type,
          title: section.title,
          content: section.content,
          settings: section.settings,
          order: section.order,
          isVisible: section.isVisible,
          cssClass: section.cssClass,
        },
      });
    }

    const page = await prisma.sitePage.findUnique({
      where: { id: params.pageId },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ data: page });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 });
  }
}
