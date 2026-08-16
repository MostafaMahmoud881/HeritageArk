import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { importFromExternalSource } from '@/lib/assets/asset-manager';
import { importFromIconScout } from '@/lib/assets/icon-registry';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { source, type, url, query, category, tags } = body;

    if (!source) {
      return NextResponse.json({ error: 'Source is required (sketchfab, smithsonian, poly-pizza, iconscout)' }, { status: 400 });
    }

    if (source === 'iconscout' && type === 'icon') {
      const icons = await importFromIconScout(query || '');
      return NextResponse.json({ success: true, data: icons });
    }

    const result = await importFromExternalSource({ source, type, url, query, category, tags });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Import failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.asset }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
