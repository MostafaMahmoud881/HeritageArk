import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { providerId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const provider = await prisma.aIProvider.findUnique({ where: { id: params.providerId } });
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

    const keys = await prisma.aIProviderKey.findMany({
      where: { providerId: params.providerId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: keys });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { providerId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const provider = await prisma.aIProvider.findUnique({ where: { id: params.providerId } });
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

    const body = await request.json();
    const { keyLabel, keyValue } = body;

    if (!keyValue) {
      return NextResponse.json({ error: 'keyValue is required' }, { status: 400 });
    }

    const masked = keyValue.length > 8
      ? keyValue.slice(0, 4) + '••••' + keyValue.slice(-4)
      : '••••' + keyValue.slice(-4);

    const key = await prisma.aIProviderKey.create({
      data: {
        providerId: params.providerId,
        keyLabel: keyLabel || 'Default',
        keyValue: masked,
      },
    });
    return NextResponse.json({ data: key }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create key' }, { status: 500 });
  }
}
