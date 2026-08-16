import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { roleId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'permissions.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const role = await prisma.role.findUnique({
      where: { id: params.roleId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

    return NextResponse.json({ data: role });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { roleId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'permissions.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const role = await prisma.role.findUnique({ where: { id: params.roleId } });
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

    const body = await request.json();
    const updated = await prisma.role.update({
      where: { id: params.roleId },
      data: {
        name: body.name,
        label: body.label,
        level: body.level,
        description: body.description,
      },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roleId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'permissions.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const role = await prisma.role.findUnique({ where: { id: params.roleId } });
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    if (role.isSystem)
      return NextResponse.json({ error: 'Cannot delete system role' }, { status: 400 });

    await prisma.role.delete({ where: { id: params.roleId } });
    return NextResponse.json({ data: { id: params.roleId, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
