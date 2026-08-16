import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

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

    const updated = await prisma.sitePage.update({
      where: { id: params.pageId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });

    await prisma.studioActivity.create({
      data: {
        userId: user.id,
        action: 'publish',
        entity: 'page',
        entityId: params.pageId,
        details: JSON.stringify({ title: page.title }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to publish page' }, { status: 500 });
  }
}
