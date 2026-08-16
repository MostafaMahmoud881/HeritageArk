import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

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
    if (!body.permissionIds || !Array.isArray(body.permissionIds)) {
      return NextResponse.json({ error: 'permissionIds array is required' }, { status: 400 });
    }

    await prisma.rolePermission.deleteMany({ where: { roleId: params.roleId } });

    if (body.permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: body.permissionIds.map((permissionId: string) => ({
          roleId: params.roleId,
          permissionId,
        })),
      });
    }

    const roleWithPermissions = await prisma.role.findUnique({
      where: { id: params.roleId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    return NextResponse.json({ data: roleWithPermissions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}
