'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslate } from '@/lib/TranslationProvider';

export default function FloatingReelsButton() {
  const { t } = useTranslate();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  return (
    <Link
      href={`/${locale}/reels`}
      className="fixed bottom-20 lg:bottom-6 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
      aria-label={t('reels.browse')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="4" /><path d="M10 9l5 3-5 3V9z" />
      </svg>
      <span className="text-sm font-medium hidden sm:inline">{t('nav.reels')}</span>
    </Link>
  );
}
