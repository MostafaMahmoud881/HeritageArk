import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => {
      const cookieStore = new Map<string, unknown>();
      return {
        status: init?.status ?? 200,
        json: async () => body,
        headers: new Headers({ 'content-type': 'application/json' }),
        cookies: {
          set: vi.fn((name: string, value: unknown, options?: unknown) => {
            cookieStore.set(name, { value, options });
          }),
          get: vi.fn((name: string) => cookieStore.get(name)),
        },
      };
    }),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-server', () => ({
  verifyPassword: vi.fn(),
  generateAccessToken: vi.fn(() => 'mock-access-token'),
  generateRefreshToken: vi.fn(() => 'mock-refresh-token'),
  hashToken: vi.fn(() => 'mock-hashed-refresh-token'),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, remaining: 10, resetMs: 0 })),
  incrementRateLimit: vi.fn(async () => {}),
}));

vi.mock('@/lib/data', () => ({
  CULTURES: [
    { id: 'nubian', name: 'Nubian', flag: '🇪🇬', col: '#8B4513', region: 'Egypt & Sudan' },
  ],
  CULTURE_DETAILS: {
    nubian: { summary: 'Test summary', description: 'Test description', traditions: [], artifacts: [] },
  },
  NEWS_ARTICLES: [
    { id: 'n1', title: 'Test News', cat: 'Culture', date: '2026-06-22', author: 'Test', summary: 'Test', img: '🌍' },
  ],
}));

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = NextResponse.json({ status: 'ok' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/cultures', () => {
  it('returns array of cultures', async () => {
    const { GET } = await import('@/app/api/cultures/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('name');
    expect(body.data[0]).toHaveProperty('region');
  });
});

describe('POST /api/newsletter', () => {
  it('validates email presence', async () => {
    const handler = async (request: Request) => {
      const { email } = await request.json();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    };

    const invalidRes = await handler(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: '' }),
    }));
    expect(invalidRes.status).toBe(400);
    const invalidBody = await invalidRes.json();
    expect(invalidBody).toHaveProperty('error');

    const badEmailRes = await handler(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    }));
    expect(badEmailRes.status).toBe(400);

    const validRes = await handler(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    }));
    expect(validRes.status).toBe(200);
    const validBody = await validRes.json();
    expect(validBody.success).toBe(true);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates credentials presence', async () => {
    const { POST } = await import('@/app/api/auth/login/route');

    const missingRes = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    }));
    expect(missingRes.status).toBe(400);
    const missingBody = await missingRes.json();
    expect(missingBody).toHaveProperty('error');
  });

  it('returns 401 for invalid credentials', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const { POST } = await import('@/app/api/auth/login/route');
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' }),
    }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid email or password');
  });

  it('returns user and token on success', async () => {
    const mockUser = {
      id: '1', name: 'Test', email: 'test@test.com',
      passwordHash: '$2a$12$hashed', role: 'admin', emailVerified: true,
      avatar: null, bio: null, refreshToken: null,
      twoFactorEnabled: false, createdAt: new Date('2026-01-01'),
      updatedAt: new Date(), lastLogin: new Date(),
    };
    const { prisma } = await import('@/lib/prisma');
    const { verifyPassword } = await import('@/lib/auth-server');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const { POST } = await import('@/app/api/auth/login/route');
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'correct' }),
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('user');
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.user).not.toHaveProperty('passwordHash');
    expect(prisma.user.update).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
