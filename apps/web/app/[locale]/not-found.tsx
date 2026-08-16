'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslate } from '@/lib/TranslationProvider';

export default function NotFound() {
  const { t } = useTranslate();
  const { locale } = useParams<{ locale: string }>();

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            fill="none"
            className="text-accent/25"
          >
            <rect x="30" y="20" width="80" height="100" rx="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M30 50h80M30 70h80M30 90h80" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <path
              d="M55 35a8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8 8 8 0 018 8z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M75 43l6-6 6 6M87 31l-6 6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="100" cy="110" r="18" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M105 113l-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M110 110a8 8 0 010 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="text-6xl font-serif text-navy mb-2">404</h1>
        <p className="text-xl text-muted mb-6">
          {t('common.error')}
        </p>

        <p className="text-sm text-muted mb-8">
          {t('common.noResults')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${locale}/cultures`}
            className="px-6 py-2.5 bg-accent text-navy font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            {t('museum.explore')}
          </Link>
          <Link
            href={`/${locale}`}
            className="px-6 py-2.5 border border-border text-navy font-medium rounded-lg hover:bg-white transition-colors"
          >
            {t('common.back')}
          </Link>
        </div>
      </div>
    </div>
  );
}
