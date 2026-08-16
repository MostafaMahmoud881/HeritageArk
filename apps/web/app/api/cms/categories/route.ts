import { NextResponse } from 'next/server';
import { getCategories, addCategory, deleteCategory } from '@/lib/db';

const CATEGORY_COLORS: Record<string, string> = {
  History: 'bg-blue-500/20 text-blue-600',
  Crafts: 'bg-accent/20 text-accent',
  Languages: 'bg-green-500/20 text-green-600',
  Fashion: 'bg-purple-500/20 text-purple-600',
  Architecture: 'bg-orange-500/20 text-orange-600',
  Art: 'bg-pink-500/20 text-pink-600',
  Stories: 'bg-indigo-500/20 text-indigo-600',
  Music: 'bg-yellow-500/20 text-yellow-600',
  Food: 'bg-red-500/20 text-red-600',
  Rituals: 'bg-teal-500/20 text-teal-600',
};

function enrichCategories() {
  const cats = getCategories();
  const allArticles: any[] = [];
  return cats.map((name, i) => ({
    id: i + 1,
    name,
    count: allArticles.filter((a: any) => a.category === name).length,
    color: CATEGORY_COLORS[name] || 'bg-gray-500/20 text-gray-600',
  }));
}

export async function GET() {
  return NextResponse.json(enrichCategories());
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    addCategory(name);
    return NextResponse.json(enrichCategories());
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { name } = await request.json();
    deleteCategory(name);
    return NextResponse.json(enrichCategories());
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
