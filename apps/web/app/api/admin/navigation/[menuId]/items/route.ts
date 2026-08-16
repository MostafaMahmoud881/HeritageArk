import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';
import { validateUrl } from '@/lib/url-validator';

export async function GET(
  request: NextRequest,
  { params }: { params: { menuId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const menu = await prisma.navMenu.findUnique({ where: { id: params.menuId } });
    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });

    const items = await prisma.navMenuItem.findMany({
      where: { menuId: params.menuId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { menuId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const menu = await prisma.navMenu.findUnique({ where: { id: params.menuId } });
    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });

    const body = await request.json();
    const item = await prisma.navMenuItem.create({
      data: {
        menuId: params.menuId,
        label: body.label,
        url: validateUrl(body.url),
        parentId: body.parentId || null,
        type: body.type || 'link',
        order: body.order ?? 0,
        icon: body.icon,
        target: body.target || '_self',
        isActive: body.isActive ?? true,
        cssClass: body.cssClass,
        megaMenuColumns: body.megaMenuColumns,
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
