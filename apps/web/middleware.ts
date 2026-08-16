import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateToken, validateToken } from '@/lib/csrf';

const locales = ['en', 'ar', 'fr', 'it', 'ber'];
const defaultLocale = 'en';

// ─── Rate Limiting (scalable to 100K+ users) ─────────────────────────
// Uses a sliding-window counter per IP + per route.
// In production, set REDIS_URL / UPSTASH_REDIS_URL to scale horizontally.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 200; // general API: 200 req/min/IP

const authRateLimitMap = new Map<string, number[]>();
const AUTH_RATE_LIMIT_MAX = 5; // auth: 5 req/min/IP (brute-force protection)
const AUTH_RATE_LIMIT_WINDOW = 60_000;

const uploadRateLimitMap = new Map<string, number[]>();
const UPLOAD_RATE_LIMIT_MAX = 20; // uploads: 20 req/min/IP
const UPLOAD_RATE_LIMIT_WINDOW = 60_000;

// Cleanup old entries periodically to prevent memory leak
const CLEANUP_INTERVAL = 5 * 60_000; // 5 min
let lastCleanup = Date.now();

function cleanupMaps() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - RATE_LIMIT_WINDOW;
  for (const map of [rateLimitMap, authRateLimitMap, uploadRateLimitMap]) {
    for (const [key, timestamps] of map.entries()) {
      const valid = timestamps.filter(t => t > cutoff);
      if (valid.length === 0) map.delete(key);
      else map.set(key, valid);
    }
  }
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

function isRateLimited(map: Map<string, number[]>, ip: string, max: number, windowMs: number): boolean {
  cleanupMaps();
  const now = Date.now();
  const cutoff = now - windowMs;
  let timestamps = map.get(ip) || [];
  timestamps = timestamps.filter(t => t > cutoff);
  if (timestamps.length >= max) return true;
  timestamps.push(now);
  map.set(ip, timestamps);
  return false;
}

// ─── Security Headers (hardened) ─────────────────────────────────────
function setSecurityHeaders(response: NextResponse) {
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.puter.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()'
  );
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
}

// ─── Bot / Malicious Request Detection ───────────────────────────────
function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const path = request.nextUrl.pathname;

  // Block common attack patterns
  const attackPatterns = [
    /\.\.\/|\.\.\\/,           // path traversal
    /(union\s+select|select\s+.*\s+from)/i, // SQL injection
    /<script|javascript:|onerror=|onload=/i, // XSS
    /\/etc\/passwd|\/etc\/shadow/, // file access
    /\.env|\.git|\.aws/,       // sensitive files
    /wp-admin|wp-login/,       // WordPress attacks
    /eval\(|exec\(|system\(/i, // code execution
  ];

  for (const pattern of attackPatterns) {
    if (pattern.test(path) || pattern.test(userAgent)) return true;
  }

  // Block requests with no user-agent (bots/scanners)
  if (!userAgent && path.startsWith('/api')) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIP(request);

  // Block suspicious/malicious requests
  if (isSuspiciousRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const response = NextResponse.next();
  setSecurityHeaders(response);

  if (pathname.startsWith('/api')) {
    // Route-specific rate limiting
    if (pathname.startsWith('/api/auth')) {
      if (isRateLimited(authRateLimitMap, ip, AUTH_RATE_LIMIT_MAX, AUTH_RATE_LIMIT_WINDOW)) {
        return NextResponse.json(
          { error: 'Too many attempts. Please wait a minute.', retryAfter: 60 },
          { status: 429 }
        );
      }
    } else if (pathname.startsWith('/api/upload') || pathname.startsWith('/api/media')) {
      if (isRateLimited(uploadRateLimitMap, ip, UPLOAD_RATE_LIMIT_MAX, UPLOAD_RATE_LIMIT_WINDOW)) {
        return NextResponse.json(
          { error: 'Upload limit reached. Please wait.', retryAfter: 60 },
          { status: 429 }
        );
      }
    } else if (isRateLimited(rateLimitMap, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: 60 },
        { status: 429 }
      );
    }

    // CSRF protection for state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const exemptPaths = ['/api/auth', '/api/newsletter', '/api/public'];
      const isExempt = exemptPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
      if (!isExempt) {
        const csrfToken = request.headers.get('x-csrf-token');
        const csrfCookie = request.cookies.get('csrf_token')?.value;
        if (!csrfToken || !csrfCookie || !validateToken(csrfToken, csrfCookie)) {
          return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
        }
      }
    }

    const existingToken = request.cookies.get('csrf_token')?.value;
    if (!existingToken) {
      response.cookies.set('csrf_token', generateToken(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  }

  const standalonePaths = ['/auth/forgot-password', '/auth/reset-password', '/auth/verify-email'];
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    standalonePaths.includes(pathname)
  ) {
    const existingToken = request.cookies.get('csrf_token')?.value;
    if (!existingToken) {
      response.cookies.set('csrf_token', generateToken(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
    return response;
  }

  // Maintenance mode
  const mlPrefix = (p: string) =>
    pathname === p ||
    pathname.startsWith(p + '/') ||
    locales.some(l => pathname === `/${l}${p}` || pathname.startsWith(`/${l}${p}/`));
  const maintenanceExempt =
    mlPrefix('/admin') ||
    mlPrefix('/auth') ||
    mlPrefix('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    mlPrefix('/maintenance') ||
    standalonePaths.some(p => mlPrefix(p));

  if (!maintenanceExempt && process.env.MAINTENANCE_CHECK !== 'off') {
    try {
      const settingsRes = await fetch(new URL('/api/public/settings', request.url), { cache: 'no-store' });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.maintenanceMode) {
          const ml = locales.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) || defaultLocale;
          const maintenanceUrl = new URL(`/${ml}/maintenance`, request.url);
          if (pathname !== `/${ml}/maintenance`) {
            const redirect = NextResponse.redirect(maintenanceUrl);
            setSecurityHeaders(redirect);
            return redirect;
          }
        }
      }
    } catch {
      // fail open
    }
  }

  const pathLocale = locales.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathLocale) {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    const acceptLanguage = request.headers.get('accept-language');
    const preferredLocale =
      cookieLocale ||
      acceptLanguage?.split(',')?.[0]?.split('-')?.[0] ||
      defaultLocale;
    const locale = locales.includes(preferredLocale as typeof locales[number])
      ? preferredLocale
      : defaultLocale;

    const redirect = NextResponse.redirect(
      new URL(
        `/${locale}${pathname === '/' ? '' : pathname}`,
        request.url
      )
    );
    setSecurityHeaders(redirect);

    const existingToken = request.cookies.get('csrf_token')?.value;
    if (!existingToken) {
      redirect.cookies.set('csrf_token', generateToken(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
    return redirect;
  }

  const existingToken = request.cookies.get('csrf_token')?.value;
  if (!existingToken) {
    response.cookies.set('csrf_token', generateToken(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next|images|fonts|favicon.ico|.*\\..*).*)'],
};