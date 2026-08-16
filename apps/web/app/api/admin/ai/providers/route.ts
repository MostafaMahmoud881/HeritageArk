import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const providers = await prisma.aIProvider.findMany({
      include: { apiKeys: { select: { id: true, keyLabel: true, isActive: true, lastUsedAt: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ data: providers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const provider = await prisma.aIProvider.create({ data: body });
    return NextResponse.json({ data: provider }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}
