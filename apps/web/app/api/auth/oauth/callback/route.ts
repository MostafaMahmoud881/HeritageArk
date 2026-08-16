import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/auth/login?error=oauth_denied', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_code', request.url));
    }

    const provider = state || 'google';

    const response = await fetch(new URL('/api/auth/oauth', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, code, redirectUri: request.url }),
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
    }

    const data = await response.json();

    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('oauth_success', 'true');
    const res = NextResponse.redirect(redirectUrl);

    res.headers.set('Set-Cookie', `access_token=${data.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`);

    return res;
  } catch {
    return NextResponse.redirect(new URL('/auth/login?error=oauth_error', request.url));
  }
}
