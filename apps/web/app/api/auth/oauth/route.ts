import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const { provider, email, name } = await request.json();

    if (!provider || !email) {
      return NextResponse.json({ error: 'Provider and email required' }, { status: 400 });
    }

    if (!['google', 'microsoft', 'apple'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          passwordHash: '',
          oauthProvider: provider,
          emailVerified: true,
        },
      });
    } else if (!user.oauthProvider) {
      await prisma.user.update({
        where: { id: user.id },
        data: { oauthProvider: provider, emailVerified: true },
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser, accessToken, refreshToken });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
