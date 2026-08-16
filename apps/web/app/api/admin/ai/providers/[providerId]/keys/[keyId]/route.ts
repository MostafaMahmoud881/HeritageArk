import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { providerId: string; keyId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.aIProviderKey.findFirst({
      where: { id: params.keyId, providerId: params.providerId },
    });
    if (!existing) return NextResponse.json({ error: 'Key not found' }, { status: 404 });

    const body = await request.json();
    const key = await prisma.aIProviderKey.update({
      where: { id: params.keyId },
      data: {
        keyLabel: body.keyLabel ?? existing.keyLabel,
        isActive: body.isActive ?? existing.isActive,
      },
    });
    return NextResponse.json({ data: key });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update key' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { providerId: string; keyId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.aIProviderKey.findFirst({
      where: { id: params.keyId, providerId: params.providerId },
    });
    if (!existing) return NextResponse.json({ error: 'Key not found' }, { status: 404 });

    await prisma.aIProviderKey.delete({ where: { id: params.keyId } });
    return NextResponse.json({ data: { id: params.keyId, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
  }
}
