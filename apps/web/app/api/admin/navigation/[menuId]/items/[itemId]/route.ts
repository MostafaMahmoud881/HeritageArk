import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';
import { validateUrl } from '@/lib/url-validator';

export async function PUT(
  request: NextRequest,
  { params }: { params: { menuId: string; itemId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const item = await prisma.navMenuItem.findFirst({
      where: { id: params.itemId, menuId: params.menuId },
    });
    if (!item) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });

    const body = await request.json();
    const updated = await prisma.navMenuItem.update({
      where: { id: params.itemId },
      data: {
        label: body.label,
        url: validateUrl(body.url),
        parentId: body.parentId,
        type: body.type,
        order: body.order,
        icon: body.icon,
        target: body.target,
        isActive: body.isActive,
        cssClass: body.cssClass,
        megaMenuColumns: body.megaMenuColumns,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { menuId: string; itemId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const item = await prisma.navMenuItem.findFirst({
      where: { id: params.itemId, menuId: params.menuId },
    });
    if (!item) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });

    await prisma.navMenuItem.delete({ where: { id: params.itemId } });
    return NextResponse.json({ data: { id: params.itemId, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { menuId: string; itemId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        await prisma.navMenuItem.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
    }

    const items = await prisma.navMenuItem.findMany({
      where: { menuId: params.menuId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
  }
}
