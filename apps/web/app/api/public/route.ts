import { NextRequest, NextResponse } from 'next/server';
import { HERITAGE_SITES } from '@/lib/heritage-sites';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  const data = HERITAGE_SITES.map((site) => ({
    id: site.id,
    name: site.name,
    culture: site.culture,
    cultureId: site.cultureId,
    emoji: site.emoji,
    description: site.description,
    period: site.period,
    type: site.type,
    coordinates: {
      lat: site.lat,
      lng: site.lng,
    },
  }));

  const response = NextResponse.json({
    data,
    meta: {
      total: data.length,
      locale,
      timestamp: new Date().toISOString(),
    },
  });

  response.headers.set('x-ratelimit-limit', '100');
  response.headers.set('x-ratelimit-remaining', '99');
  response.headers.set('x-ratelimit-reset', String(Math.floor(Date.now() / 1000) + 3600));

  return response;
}
