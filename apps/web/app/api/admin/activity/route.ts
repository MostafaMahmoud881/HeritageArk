import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@heritageverse/auth';
import type { Role } from '@heritageverse/auth';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || !hasRole(user.role as Role, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    const items = logs.map((log: { user: { name: string } | null; action: string; createdAt: Date }) => ({
      user: log.user?.name || 'Unknown',
      action: log.action,
      date: formatRelativeTime(log.createdAt),
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}
