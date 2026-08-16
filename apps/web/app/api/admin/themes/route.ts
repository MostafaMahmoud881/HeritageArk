import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'theme.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const themes = await prisma.siteTheme.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ data: themes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'theme.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const theme = await prisma.siteTheme.create({
      data: {
        name: body.name || 'Untitled Theme',
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        goldColor: body.goldColor,
        bgColor: body.bgColor,
        textColor: body.textColor,
        mutedColor: body.mutedColor,
        borderColor: body.borderColor,
        successColor: body.successColor,
        dangerColor: body.dangerColor,
        infoColor: body.infoColor,
        warningColor: body.warningColor,
        whiteColor: body.whiteColor,
        headingFont: body.headingFont,
        bodyFont: body.bodyFont,
        baseFontSize: body.baseFontSize,
        headingWeight: body.headingWeight,
        spacing: body.spacing,
        borderRadius: body.borderRadius,
        containerWidth: body.containerWidth,
        customCss: body.customCss,
        animationSpeed: body.animationSpeed,
        cardShadow: body.cardShadow,
        accentGlow: body.accentGlow,
      },
    });

    return NextResponse.json({ data: theme }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}
