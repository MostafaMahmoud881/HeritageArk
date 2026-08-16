'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AuthProvider } from '@/lib/auth';
import { TranslationProvider } from '@/lib/TranslationProvider';
import { SiteSettingsProvider } from '@/lib/site-settings';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import FloatingReelsButton from '@/components/FloatingReelsButton';
import { getDir } from '@/lib/rtl';

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    document.documentElement.dir = getDir(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TranslationProvider locale={locale}>
          <SiteSettingsProvider>
            <Header locale={locale} />
            <main className="min-h-screen pb-16 lg:pb-0">{children}</main>
            <Footer locale={locale} />
            <MobileBottomNav locale={locale} />
            <FloatingReelsButton />
          </SiteSettingsProvider>
        </TranslationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
