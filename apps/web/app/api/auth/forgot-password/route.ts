import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-do-not-use-in-production';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = jwt.sign({ userId: user.id, purpose: 'reset-password' }, JWT_SECRET, { expiresIn: '1h' });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
