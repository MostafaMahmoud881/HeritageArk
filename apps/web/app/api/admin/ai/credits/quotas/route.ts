import { NextResponse, NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

const DEFAULT_QUOTAS = {
  super_admin: { videoCredits: 1000, imageCredits: 1000, subtitleCredits: 1000, translationCredits: 1000, voiceCredits: 1000 },
  admin: { videoCredits: 500, imageCredits: 500, subtitleCredits: 500, translationCredits: 500, voiceCredits: 500 },
  editor: { videoCredits: 200, imageCredits: 200, subtitleCredits: 200, translationCredits: 200, voiceCredits: 200 },
  moderator: { videoCredits: 100, imageCredits: 100, subtitleCredits: 100, translationCredits: 100, voiceCredits: 100 },
  creator: { videoCredits: 100, imageCredits: 100, subtitleCredits: 100, translationCredits: 100, voiceCredits: 100 },
  researcher: { videoCredits: 50, imageCredits: 50, subtitleCredits: 50, translationCredits: 50, voiceCredits: 50 },
  translator: { videoCredits: 0, imageCredits: 0, subtitleCredits: 50, translationCredits: 100, voiceCredits: 0 },
  photographer: { videoCredits: 0, imageCredits: 100, subtitleCredits: 0, translationCredits: 0, voiceCredits: 0 },
  volunteer: { videoCredits: 10, imageCredits: 10, subtitleCredits: 10, translationCredits: 10, voiceCredits: 10 },
  member: { videoCredits: 5, imageCredits: 5, subtitleCredits: 5, translationCredits: 5, voiceCredits: 5 },
} as const;

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.view' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ data: DEFAULT_QUOTAS });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotas' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    return NextResponse.json({ data: body, message: 'Quotas updated (not persisted)' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quotas' }, { status: 500 });
  }
}
