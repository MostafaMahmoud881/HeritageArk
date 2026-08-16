import { NextResponse, NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

function getDefaultSettings() {
  return {
    emergencyShutdown: process.env.AI_EMERGENCY_SHUTDOWN === 'true' || false,
    budgetAlert: parseInt(process.env.AI_BUDGET_ALERT || '100', 10),
    rateLimit: parseInt(process.env.AI_RATE_LIMIT || '10', 10),
  };
}

let storedSettings = { ...getDefaultSettings() };

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.view' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ data: storedSettings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'settings.edit' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();

    storedSettings = {
      emergencyShutdown: body.emergencyShutdown ?? storedSettings.emergencyShutdown,
      budgetAlert: body.budgetAlert ?? storedSettings.budgetAlert,
      rateLimit: body.rateLimit ?? storedSettings.rateLimit,
    };

    return NextResponse.json({ data: storedSettings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
