'use client';

import { useTranslate } from '@/lib/TranslationProvider';

export function T({ path, fallback }: { path: string; fallback?: string }) {
  const { t } = useTranslate();
  const translated = t(path);
  if (translated === path && fallback !== undefined) return <>{fallback}</>;
  return <>{translated}</>;
}
