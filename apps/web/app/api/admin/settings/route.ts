import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    let settings = await prisma.siteSetting.findFirst();
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: {} });
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    let settings = await prisma.siteSetting.findFirst();
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: {} });
    }

    const updated = await prisma.siteSetting.update({
      where: { id: settings.id },
      data: {
        siteName: body.siteName ?? undefined,
        siteDescription: body.siteDescription ?? undefined,
        logoUrl: body.logoUrl ?? undefined,
        faviconUrl: body.faviconUrl ?? undefined,
        activeLocales: body.activeLocales ?? undefined,
        twoFactorRequired: body.twoFactorRequired ?? undefined,
        oauthProviders: body.oauthProviders ?? undefined,
        registrationMode: body.registrationMode ?? undefined,
        maxUploadSize: body.maxUploadSize ?? undefined,
        allowedImageFormats: body.allowedImageFormats ?? undefined,
        allowedDocumentFormats: body.allowedDocumentFormats ?? undefined,
        compressionQuality: body.compressionQuality ?? undefined,
        notificationSettings: body.notificationSettings ?? undefined,
        smtpHost: body.smtpHost ?? undefined,
        smtpPort: body.smtpPort ?? undefined,
        smtpUsername: body.smtpUsername ?? undefined,
        smtpPassword: body.smtpPassword ?? undefined,
        fromAddress: body.fromAddress ?? undefined,
        maintenanceMode: typeof body.maintenanceMode === 'boolean' ? body.maintenanceMode : undefined,
        maintenanceMessage: body.maintenanceMessage !== undefined ? body.maintenanceMessage : undefined,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
