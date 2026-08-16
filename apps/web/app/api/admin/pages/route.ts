import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const pages = await prisma.sitePage.findMany({
      include: { author: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: pages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.create'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const page = await prisma.sitePage.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        layout: body.layout || 'default',
        authorId: user.id,
      },
      include: { author: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    return NextResponse.json({ data: page }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
