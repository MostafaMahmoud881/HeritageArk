import { NextResponse } from 'next/server';

const LANGUAGES = [
  { id: 1, name: 'Arabic', speakers: '372M', status: 'active', articles: 2856 },
  { id: 2, name: 'French', speakers: '310M', status: 'active', articles: 2104 },
  { id: 3, name: 'Spanish', speakers: '485M', status: 'active', articles: 1892 },
  { id: 4, name: 'Turkish', speakers: '84M', status: 'active', articles: 1247 },
  { id: 5, name: 'Swahili', speakers: '150M', status: 'active', articles: 876 },
  { id: 6, name: 'Amharic', speakers: '57M', status: 'inactive', articles: 0 },
  { id: 7, name: 'Berber', speakers: '30M', status: 'inactive', articles: 0 },
  { id: 8, name: 'Hausa', speakers: '72M', status: 'inactive', articles: 0 },
];

export async function GET() {
  return NextResponse.json(LANGUAGES);
}
