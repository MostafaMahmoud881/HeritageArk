'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslate } from '@/lib/TranslationProvider';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslate();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            className="text-accent/30"
          >
            <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="2" />
            <circle cx="60" cy="60" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 4" />
            <path
              d="M60 40v20M60 72v2"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M45 50a20 20 0 0030 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-serif text-navy mb-2">
          {t('common.error')}
        </h1>
        <p className="text-muted text-sm mb-8">
          {t('common.error')}
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-accent text-navy font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            {t('common.retry')}
          </button>
          <Link
            href={`/${locale}`}
            className="px-6 py-2.5 border border-border text-navy font-medium rounded-lg hover:bg-white transition-colors"
          >
            {t('common.back')}
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-xs font-mono text-red-700 break-all">{error.message}</p>
            {error.digest && (
              <p className="text-xs font-mono text-red-500 mt-2">Digest: {error.digest}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
