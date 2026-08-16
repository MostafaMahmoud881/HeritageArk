'use client';

import { createContext, useContext, useMemo } from 'react';
import { t as translateFn, type Locale } from './i18n';

export interface TranslateContext {
  locale: Locale;
  t: (path: string) => string;
  dir: 'ltr' | 'rtl';
}

const TContext = createContext<TranslateContext | null>(null);

export function TranslationProvider({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const value = useMemo<TranslateContext>(
    () => ({
      locale: locale as Locale,
      t: (path: string) => translateFn(locale as Locale, path),
      dir: locale === 'ar' ? 'rtl' : 'ltr',
    }),
    [locale],
  );

  return <TContext.Provider value={value}>{children}</TContext.Provider>;
}

export function useTranslate(): TranslateContext {
  const ctx = useContext(TContext);
  if (!ctx) {
    throw new Error('useTranslate must be used within a TranslationProvider');
  }
  return ctx;
}
