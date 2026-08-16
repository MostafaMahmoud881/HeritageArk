import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { getIconRegistry, getIconById, getIconsByCategory, replaceIcon, addIcon, resetRegistry } from '@/lib/assets/icon-registry';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  const category = searchParams.get('category');

  if (id) {
    const icon = getIconById(id);
    if (!icon) return NextResponse.json({ error: 'Icon not found' }, { status: 404 });
    return NextResponse.json({ data: icon });
  }

  if (category) {
    return NextResponse.json({ data: getIconsByCategory(category) });
  }

  return NextResponse.json({ data: getIconRegistry() });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Icon ID required' }, { status: 400 });
    }

    const updated = await replaceIcon(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Icon not found' }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const icon = await addIcon(body);
    return NextResponse.json({ data: icon }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  await resetRegistry();
  return NextResponse.json({ success: true });
}
