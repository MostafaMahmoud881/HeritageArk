import { NextResponse } from 'next/server';
import { CULTURES, CULTURE_DETAILS } from '@/lib/data';

export async function GET() {
  const data = CULTURES.map((c) => ({
    _id: c.id,
    name: c.name,
    slug: c.id,
    region: c.region,
    summary: CULTURE_DETAILS[c.id]?.summary || '',
    description: CULTURE_DETAILS[c.id]?.description || '',
    thumbnail: { url: '', alt: c.name },
    featured: true,
    status: 'published',
    traditions: CULTURE_DETAILS[c.id]?.traditions || [],
    artifacts: CULTURE_DETAILS[c.id]?.artifacts || [],
    flag: c.flag,
    col: c.col,
  }));
  return NextResponse.json({ data });
}
