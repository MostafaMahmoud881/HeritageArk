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

    const [
      totalUsers,
      totalArticles,
      activeToday,
      totalViews,
      usersYesterday,
      articlesYesterday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.article.count(),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.auditLog.count({ where: { action: 'VIEW' } }),
      prisma.user.count({
        where: {
          createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.article.count({
        where: {
          createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const calcChange = (curr: number, prev: number): string => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const pct = ((curr - prev) / prev) * 100;
      return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
    };

    return NextResponse.json({
      totalUsers,
      totalArticles,
      activeToday,
      totalViews,
      usersChange: calcChange(totalUsers, usersYesterday),
      articlesChange: calcChange(totalArticles, articlesYesterday),
      activeChange: calcChange(activeToday, 0),
      viewsChange: calcChange(totalViews, 0),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
