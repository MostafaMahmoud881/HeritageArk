import { NextResponse } from 'next/server';
import type { ApiResponse } from './types';

/** Return a consistent success response */
export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data }, { status });
}

/** Return a consistent error response */
export function err(message: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ error: message }, { status });
}

/** Return 401 Unauthorized */
export function unauthorized(message = 'Unauthorized'): NextResponse<ApiResponse> {
  return err(message, 401);
}

/** Return 403 Forbidden */
export function forbidden(message = 'Forbidden'): NextResponse<ApiResponse> {
  return err(message, 403);
}

/** Return 404 Not Found */
export function notFound(message = 'Not found'): NextResponse<ApiResponse> {
  return err(message, 404);
}

/** Return 429 Too Many Requests */
export function tooManyRequests(retryAfter = 60): NextResponse<ApiResponse> {
  return NextResponse.json(
    { error: 'Too many requests', retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

/** Return 500 Internal Server Error — never expose raw error in production */
export function serverError(error?: unknown): NextResponse<ApiResponse> {
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    return err(error.message, 500);
  }
  return err('Internal server error', 500);
}

/** Validate required fields in a request body */
export function validateBody<T extends Record<string, unknown>>(
  body: unknown,
  required: (keyof T)[]
): { valid: true; data: T } | { valid: false; response: NextResponse<ApiResponse> } {
  if (!body || typeof body !== 'object') {
    return { valid: false, response: err('Invalid request body') };
  }
  for (const field of required) {
    if (!(field as string in (body as object))) {
      return { valid: false, response: err(`Missing required field: ${String(field)}`) };
    }
  }
  return { valid: true, data: body as T };
}
