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
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const menu = await prisma.navMenu.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });

    return NextResponse.json({ data: menu });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const menu = await prisma.navMenu.findUnique({ where: { id: params.id } });
    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });

    const body = await request.json();
    const updated = await prisma.navMenu.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: body.slug,
        location: body.location,
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'navigation.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const menu = await prisma.navMenu.findUnique({ where: { id: params.id } });
    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });

    await prisma.navMenu.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete menu' }, { status: 500 });
  }
}
