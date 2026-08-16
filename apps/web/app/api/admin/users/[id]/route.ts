import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@heritageverse/auth';
import type { Role } from '@heritageverse/auth';
import { hashPassword } from '@/lib/auth-server';
import { MIN_PASSWORD_LENGTH } from '@/lib/constants';

const VALID_ROLES: Role[] = ['super_admin', 'admin', 'editor', 'supervisor', 'researcher', 'creator', 'moderator', 'translator', 'photographer', 'volunteer', 'viewer', 'member'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await getAuthUser(request);
    if (!actor || !hasPermission(actor.role as Role, 'users.manage')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();

    if (typeof body.role === 'string' && VALID_ROLES.includes(body.role as Role)) {
      if (body.role === 'super_admin' && actor.role !== 'super_admin') {
        return NextResponse.json({ error: 'Only a Super Admin can assign the Super Admin role' }, { status: 403 });
      }
      if (actor.role === 'super_admin' && target.role === 'super_admin' && actor.id !== target.id) {
        return NextResponse.json({ error: 'Cannot modify another Super Admin' }, { status: 403 });
      }
      data.role = body.role;
    }

    if (typeof body.password === 'string' && body.password) {
      if (body.password.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
      }
      data.passwordHash = await hashPassword(body.password);
      data.refreshToken = null;
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true, lastLogin: true },
    });

    await prisma.studioActivity.create({
      data: { userId: actor.id, action: 'update', entity: 'user', entityId: updated.id, details: JSON.stringify({ changes: Object.keys(data) }) },
    }).catch(() => {});

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role as Role,
        status: updated.emailVerified ? 'verified' : 'unverified',
        lastLogin: updated.lastLogin?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await getAuthUser(request);
    if (!actor || !hasPermission(actor.role as Role, 'users.manage')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (actor.id === params.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (target.role === 'super_admin' && actor.role !== 'super_admin') {
      return NextResponse.json({ error: 'Cannot delete a Super Admin' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    await prisma.studioActivity.create({
      data: { userId: actor.id, action: 'delete', entity: 'user', entityId: params.id, details: JSON.stringify({ email: target.email }) },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
