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

    const provider = await prisma.aIProvider.findUnique({
      where: { id: params.providerId },
      include: { apiKeys: { select: { id: true, keyLabel: true, isActive: true, lastUsedAt: true } } },
    });
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

    return NextResponse.json({ data: provider });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch provider' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { providerId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.aIProvider.findUnique({ where: { id: params.providerId } });
    if (!existing) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

    const body = await request.json();
    const provider = await prisma.aIProvider.update({
      where: { id: params.providerId },
      data: {
        enabled: body.enabled ?? existing.enabled,
        isDefault: body.isDefault ?? existing.isDefault,
        monthlyLimit: body.monthlyLimit ?? existing.monthlyLimit,
        dailyLimit: body.dailyLimit ?? existing.dailyLimit,
        maxConcurrentJobs: body.maxConcurrentJobs ?? existing.maxConcurrentJobs,
        cooldownSeconds: body.cooldownSeconds ?? existing.cooldownSeconds,
      },
    });
    return NextResponse.json({ data: provider });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { providerId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.aIProvider.findUnique({ where: { id: params.providerId } });
    if (!existing) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

    await prisma.aIProvider.delete({ where: { id: params.providerId } });
    return NextResponse.json({ data: { id: params.providerId, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
  }
}
