import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    let layout = await prisma.homepageLayout.findFirst();
    if (!layout) {
      layout = await prisma.homepageLayout.create({
        data: { sections: '[]' },
      });
    }

    return NextResponse.json({
      data: {
        ...layout,
        sections: JSON.parse(layout.sections),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch homepage layout' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'pages.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    let layout = await prisma.homepageLayout.findFirst();
    if (!layout) {
      layout = await prisma.homepageLayout.create({ data: { sections: '[]' } });
    }

    const updated = await prisma.homepageLayout.update({
      where: { id: layout.id },
      data: {
        sections: JSON.stringify(body.sections || []),
      },
    });

    return NextResponse.json({
      data: {
        ...updated,
        sections: JSON.parse(updated.sections),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update homepage layout' }, { status: 500 });
  }
}
