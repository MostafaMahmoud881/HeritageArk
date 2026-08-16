import { NextResponse } from 'next/server';
import { getMediaItems } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ data: getMediaItems() });
}
