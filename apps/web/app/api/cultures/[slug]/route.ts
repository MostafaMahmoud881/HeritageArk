import { NextResponse } from 'next/server';
import { CULTURES, CULTURE_DETAILS } from '@/lib/data';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const c = CULTURES.find((x) => x.id === params.slug);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const detail = CULTURE_DETAILS[params.slug];
  return NextResponse.json({
    data: {
      _id: c.id,
      name: c.name,
      slug: c.id,
      region: c.region,
      summary: detail?.summary || '',
      description: detail?.description || '',
      thumbnail: { url: '', alt: c.name },
      featured: true,
      status: 'published',
      traditions: detail?.traditions || [],
      artifacts: detail?.artifacts || [],
      flag: c.flag,
      col: c.col,
    },
  });
}
