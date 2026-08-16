export interface RateLimitStore {
  check(key: string, max: number, windowMs: number): Promise<{ allowed: boolean; remaining: number; resetMs: number }>;
  increment(key: string): Promise<void>;
  reset(key: string): Promise<void>;
}

const memoryStore = new Map<string, number[]>();

function cleanupStore(): void {
  const now = Date.now();
  for (const [key, timestamps] of memoryStore.entries()) {
    const valid = timestamps.filter(t => t > now);
    if (valid.length === 0) {
      memoryStore.delete(key);
    } else if (valid.length !== timestamps.length) {
      memoryStore.set(key, valid);
    }
  }
}

const MemoryRateLimitStore: RateLimitStore = {
  async check(key: string, max: number, windowMs: number) {
    cleanupStore();
    const now = Date.now();
    const cutoff = now - windowMs;
    const timestamps = (memoryStore.get(key) || []).filter(t => t > cutoff);
    return {
      allowed: timestamps.length < max,
      remaining: Math.max(0, max - timestamps.length),
      resetMs: timestamps.length > 0 && timestamps[0] ? Math.max(0, windowMs - (now - timestamps[0])) : 0,
    };
  },
  async increment(key: string) {
    const now = Date.now();
    const timestamps = memoryStore.get(key) || [];
    timestamps.push(now);
    memoryStore.set(key, timestamps);
  },
  async reset(key: string) {
    memoryStore.delete(key);
  },
};

let activeStore: RateLimitStore = MemoryRateLimitStore;

export function setRateLimitStore(store: RateLimitStore): void {
  activeStore = store;
}

export function getRateLimitStore(): RateLimitStore {
  return activeStore;
}

export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetMs: number }> {
  return activeStore.check(key, max, windowMs);
}

export async function incrementRateLimit(key: string): Promise<void> {
  return activeStore.increment(key);
}

export async function resetRateLimit(key: string): Promise<void> {
  return activeStore.reset(key);
}

export function createRateLimitMiddleware(prefix: string) {
  return async function rateLimitMiddleware(
    key: string,
    max: number,
    windowMs: number,
  ) {
    const fullKey = `${prefix}:${key}`;
    const { allowed, remaining, resetMs } = await checkRateLimit(fullKey, max, windowMs);
    if (!allowed) {
      return {
        allowed: false,
        headers: {
          'Retry-After': String(Math.ceil(resetMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      };
    }
    await incrementRateLimit(fullKey);
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Remaining': String(remaining - 1),
      },
    };
  };
}

export async function tryRedisStore(url?: string): Promise<boolean> {
  try {
    const redisUrl = url || process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
    if (!redisUrl) return false;

    if (redisUrl.startsWith('rediss://') || redisUrl.startsWith('redis://')) {
      let client: any;
      try {
        const redisModule = 'redis';
        // Keep redis optional in local/test environments where it is not installed.
        const redis = await import(/* @vite-ignore */ redisModule);
        client = redis.createClient({ url: redisUrl });
        await client.connect();
      } catch {
        return false;
      }

      const RedisRateLimitStore: RateLimitStore = {
        async check(key: string, max: number, windowMs: number) {
          const now = Date.now();
          const cutoff = now - windowMs;
          await client.zRemRangeByScore(key, 0, cutoff);
          const count = await client.zCard(key);
          return {
            allowed: count < max,
            remaining: Math.max(0, max - count),
            resetMs: windowMs,
          };
        },
        async increment(key: string) {
          await client.zAdd(key, { score: Date.now(), value: `${Date.now()}-${Math.random()}` });
          await client.expire(key, Math.ceil(60));
        },
        async reset(key: string) {
          await client.del(key);
        },
      };

      setRateLimitStore(RedisRateLimitStore);
      return true;
    }

    if (redisUrl.startsWith('https://') || redisUrl.startsWith('http://')) {
      const RedisRateLimitStore: RateLimitStore = {
        async check(key: string, max: number, windowMs: number) {
          const res = await fetch(`${redisUrl}/lrange/${key}`, {
            headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN || ''}` },
          });
          const timestamps: number[] = await res.json();
          const now = Date.now();
          const cutoff = now - windowMs;
          const valid = timestamps.filter(t => t > cutoff);
          const earliest = valid.length > 0 ? valid[0] : 0;
          return {
            allowed: valid.length < max,
            remaining: Math.max(0, max - valid.length),
            resetMs: valid.length > 0 && earliest ? Math.max(0, windowMs - (now - earliest)) : 0,
          };
        },
        async increment(key: string) {
          await fetch(`${redisUrl}/rpush/${key}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN || ''}`,
            },
            body: JSON.stringify(Date.now()),
          });
          await fetch(`${redisUrl}/expire/${key}/60`, { method: 'POST' });
        },
        async reset(key: string) {
          await fetch(`${redisUrl}/del/${key}`, { method: 'POST' });
        },
      };

      setRateLimitStore(RedisRateLimitStore);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
