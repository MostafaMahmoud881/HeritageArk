import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findFirst();
    return NextResponse.json({
      maintenanceMode: settings?.maintenanceMode ?? false,
      maintenanceMessage: settings?.maintenanceMessage ?? null,
      siteName: settings?.siteName ?? 'HeritageArk',
      logoUrl: settings?.logoUrl ?? null,
      activeLocales: settings?.activeLocales ?? ['en', 'ar', 'fr'],
    });
  } catch {
    return NextResponse.json({ maintenanceMode: false, siteName: 'HeritageArk' });
  }
}
