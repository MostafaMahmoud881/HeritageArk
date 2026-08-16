import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const menus = await prisma.navMenu.findMany({
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: menus });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menus' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const menu = await prisma.navMenu.create({
      data: {
        name: body.name,
        slug: body.slug,
        location: body.location || 'header',
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ data: menu }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
  }
}
