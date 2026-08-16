import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-do-not-use-in-production';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 });
    }

    let payload: { userId: string; purpose: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string; purpose: string };
    } catch {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    if (payload.purpose !== 'verify-email') {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a verification link has been sent' });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' });
    }

    const verificationToken = jwt.sign({ userId: user.id, purpose: 'verify-email' }, JWT_SECRET, { expiresIn: '24h' });

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Resend verification URL: ${request.headers.get('host')}/api/auth/verify-email?token=${verificationToken}`);
    }

    return NextResponse.json({ message: 'If that email exists, a verification link has been sent' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
