import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  const uptime = Math.floor(
    (Date.now() - (Number(process.env.START_TIME) || Date.now())) / 1000
  );
  const version = process.env.npm_package_version || '1.0.0';

  try {
    getDB();
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime,
      version,
    });
  } catch {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime,
        version,
      },
      { status: 503 }
    );
  }
}
