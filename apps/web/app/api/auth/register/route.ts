import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateAccessToken, generateRefreshToken, hashToken } from '@/lib/auth-server';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';
import { RATE_LIMIT, MIN_PASSWORD_LENGTH } from '@/lib/constants';

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length > 0) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'development-secret-do-not-use-in-production';
})();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const rateKey = `auth:register:${ip}`;

    const { allowed } = await checkRateLimit(rateKey, RATE_LIMIT.AUTH_REGISTER_MAX, RATE_LIMIT.AUTH_REGISTER_WINDOW_MS);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await incrementRateLimit(rateKey);
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = jwt.sign({ userId: 'pending', purpose: 'verify-email' }, JWT_SECRET, { expiresIn: '24h' });
    const user = await prisma.user.create({
      data: { name, email, passwordHash, verificationToken },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Verification URL: ${request.headers.get('host')}/api/auth/verify-email?token=${verificationToken}`);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const hashedRefresh = hashToken(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    });

    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser, accessToken, refreshToken, verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
