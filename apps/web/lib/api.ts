import type { ApiResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

// ─── CSRF ─────────────────────────────────────────────────────────────────────

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1] ?? '') : null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = endpoint.startsWith('/api') ? endpoint : `${API_BASE}${endpoint}`;
  if (!params) return url;
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return qs ? `${url}?${qs}` : url;
}

function buildHeaders(method: string, extra?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra as Record<string, string>),
  };
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers['x-csrf-token'] = csrf;
  }
  return headers;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  retries?: number;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, timeout = DEFAULT_TIMEOUT_MS, retries = MAX_RETRIES, ...fetchOpts } = options;
  const method = (fetchOpts.method ?? 'GET').toUpperCase();
  const url = buildUrl(endpoint, params);
  const headers = buildHeaders(method, fetchOpts.headers);

  let lastError: Error = new Error('Request failed');

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...fetchOpts,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText })) as ApiResponse;
        throw new Error(body.error ?? body.message ?? `HTTP ${res.status}`);
      }

      return res.json() as Promise<T>;
    } catch (err) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on client errors (4xx) or abort
      const isAbort = lastError.name === 'AbortError';
      const isClientError = lastError.message.startsWith('HTTP 4');
      if (isAbort || isClientError || attempt === retries) break;

      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw lastError;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string, params?: FetchOptions['params'], opts?: Omit<FetchOptions, 'params'>) =>
    fetchAPI<T>(endpoint, { ...opts, params }),

  post: <T>(endpoint: string, data: unknown, opts?: Omit<FetchOptions, 'body' | 'method'>) =>
    fetchAPI<T>(endpoint, { ...opts, method: 'POST', body: JSON.stringify(data) }),

  put: <T>(endpoint: string, data: unknown, opts?: Omit<FetchOptions, 'body' | 'method'>) =>
    fetchAPI<T>(endpoint, { ...opts, method: 'PUT', body: JSON.stringify(data) }),

  patch: <T>(endpoint: string, data: unknown, opts?: Omit<FetchOptions, 'body' | 'method'>) =>
    fetchAPI<T>(endpoint, { ...opts, method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T>(endpoint: string, opts?: Omit<FetchOptions, 'method'>) =>
    fetchAPI<T>(endpoint, { ...opts, method: 'DELETE' }),
};
