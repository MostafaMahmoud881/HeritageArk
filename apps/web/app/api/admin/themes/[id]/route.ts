import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'theme.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const theme = await prisma.siteTheme.findUnique({ where: { id: params.id } });
    if (!theme) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });

    return NextResponse.json({ data: theme });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'theme.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const theme = await prisma.siteTheme.findUnique({ where: { id: params.id } });
    if (!theme) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });

    const body = await request.json();
    const updated = await prisma.siteTheme.update({
      where: { id: params.id },
      data: {
        name: body.name,
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

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'theme.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const theme = await prisma.siteTheme.findUnique({ where: { id: params.id } });
    if (!theme) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    if (theme.isSystem)
      return NextResponse.json({ error: 'Cannot delete system theme' }, { status: 400 });

    await prisma.siteTheme.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'theme.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const theme = await prisma.siteTheme.findUnique({ where: { id: params.id } });
    if (!theme) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });

    const body = await request.json();
    if (body.activate) {
      await prisma.siteTheme.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      await prisma.siteTheme.update({
        where: { id: params.id },
        data: { isActive: true },
      });
    }

    const updated = await prisma.siteTheme.findUnique({ where: { id: params.id } });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to activate theme' }, { status: 500 });
  }
}
