// GET /api/cron/trending - Called by cron job every hour
// Calculates trending scores for all recent reels
// Requires CRON_SECRET header for security

import { NextResponse } from 'next/server';
import { calculateTrendingScores } from '@/lib/ai/recommendations';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await calculateTrendingScores();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate trending' }, { status: 500 });
  }
}
