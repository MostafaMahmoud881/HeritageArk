import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from './constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_TAG_REGEX = /<\/?(?:script|iframe|object|embed|form|input|button|textarea|select|style|link|meta|base|applet|marquee|svg|math)[^>]*>/gi;
const TAG_REGEX = /<[^>]*>/g;

const PASSWORD_MIN = MIN_PASSWORD_LENGTH;
const PASSWORD_MAX = MAX_PASSWORD_LENGTH;
const SLUG_MIN = 2;
const SLUG_MAX = 80;

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < PASSWORD_MIN) {
    errors.push(`Password must be at least ${PASSWORD_MIN} characters`);
  }
  if (password.length > PASSWORD_MAX) {
    errors.push(`Password must not exceed ${PASSWORD_MAX} characters`);
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return { valid: errors.length === 0, errors };
}

export function validateSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX) return false;
  return SLUG_REGEX.test(slug);
}

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(SAFE_TAG_REGEX, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
