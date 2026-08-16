import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'permissions.manage'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const permissions = await prisma.permission.findMany({
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ data: permissions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}
