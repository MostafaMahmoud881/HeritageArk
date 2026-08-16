import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const branding = await prisma.branding.findFirst();
    const theme = await prisma.siteTheme.findFirst({ where: { isActive: true } });
    return NextResponse.json({
      branding: branding
        ? {
            siteName: branding.siteName,
            logoUrl: branding.logoUrl,
            logoDarkUrl: branding.logoDarkUrl,
            faviconUrl: branding.faviconUrl,
            tagline: branding.tagline,
          }
        : { siteName: 'HeritageArk', logoUrl: null, logoDarkUrl: null, faviconUrl: null, tagline: null },
      theme: theme
        ? {
            id: theme.id,
            name: theme.name,
            primaryColor: theme.primaryColor,
            secondaryColor: theme.secondaryColor,
            accentColor: theme.accentColor,
            goldColor: theme.goldColor,
            bgColor: theme.bgColor,
            textColor: theme.textColor,
            mutedColor: theme.mutedColor,
            borderColor: theme.borderColor,
            successColor: theme.successColor,
            dangerColor: theme.dangerColor,
            infoColor: theme.infoColor,
            warningColor: theme.warningColor,
            whiteColor: theme.whiteColor,
            headingFont: theme.headingFont,
            bodyFont: theme.bodyFont,
            customCss: theme.customCss,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ branding: { siteName: 'HeritageArk', logoUrl: null, logoDarkUrl: null, faviconUrl: null, tagline: null }, theme: null });
  }
}
