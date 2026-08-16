import type { Locale } from './i18n';

const RTL_LOCALES: Locale[] = ['ar'];

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale as Locale);
}

export function getDir(locale: string): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

export function getMirrorStyle(locale: string, value: string): string | undefined {
  if (!isRTL(locale)) return undefined;
  return value;
}

export function getMarginStart(locale: string, value: string): string {
  return isRTL(locale) ? `me-${value}` : `ms-${value}`;
}

export function getMarginEnd(locale: string, value: string): string {
  return isRTL(locale) ? `ms-${value}` : `me-${value}`;
}

export function getPaddingStart(locale: string, value: string): string {
  return isRTL(locale) ? `pe-${value}` : `ps-${value}`;
}

export function getPaddingEnd(locale: string, value: string): string {
  return isRTL(locale) ? `ps-${value}` : `pe-${value}`;
}

export function getTransformScale(locale: string): string {
  return isRTL(locale) ? 'scaleX(-1)' : 'scaleX(1)';
}
