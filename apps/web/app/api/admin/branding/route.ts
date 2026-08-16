import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';
import { validateUrl } from '@/lib/url-validator';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'branding.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    let branding = await prisma.branding.findFirst();
    if (!branding) {
      branding = await prisma.branding.create({ data: {} });
    }

    return NextResponse.json({ data: branding });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch branding' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'branding.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    let branding = await prisma.branding.findFirst();
    if (!branding) {
      branding = await prisma.branding.create({ data: {} });
    }

    const updated = await prisma.branding.update({
      where: { id: branding.id },
      data: {
        logoUrl: validateUrl(body.logoUrl),
        logoDarkUrl: validateUrl(body.logoDarkUrl),
        faviconUrl: validateUrl(body.faviconUrl),
        appIconUrl: validateUrl(body.appIconUrl),
        splashScreenUrl: validateUrl(body.splashScreenUrl),
        watermarkUrl: validateUrl(body.watermarkUrl),
        ogImageUrl: validateUrl(body.ogImageUrl),
        ogTitle: body.ogTitle,
        ogDescription: body.ogDescription,
        twitterHandle: body.twitterHandle,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
        siteName: body.siteName,
        tagline: body.tagline,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update branding' }, { status: 500 });
  }
}
