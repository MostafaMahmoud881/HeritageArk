import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { getIllustrations, getModels, getCharacters } from '@/lib/assets/asset-manager';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const category = searchParams.get('category');

  let data: Record<string, unknown> = {};

  if (!type || type === 'all') {
    data = {
      illustrations: await getIllustrations(),
      models: await getModels(),
      characters: await getCharacters(),
    };
  } else if (type === 'illustrations') {
    let illustrations = await getIllustrations();
    if (category) {
      illustrations = illustrations.filter(i => i.category === category);
    }
    data = { illustrations };
  } else if (type === 'models') {
    data = { models: await getModels() };
  } else if (type === 'characters') {
    let characters = await getCharacters();
    if (category) {
      characters = characters.filter(c => c.tags.includes(category) || c.culture === category);
    }
    data = { characters };
  }

  return NextResponse.json({ data });
}
