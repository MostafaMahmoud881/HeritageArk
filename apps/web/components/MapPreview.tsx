'use client';

import dynamic from 'next/dynamic';
import { useTranslate } from '@/lib/TranslationProvider';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[21/9] rounded-lg skeleton-pulse" />
  ),
});

export default function MapPreview() {
  const { t } = useTranslate();
  return (
    <section className="py-24 bg-navy">
      <div className="content-section">
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">
            {t('hero.explore')}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">
            {t('map.title')}
          </h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">
            {t('map.subtitle')}
          </p>
        </div>
        <div className="rounded-xl overflow-hidden shadow-card">
          <InteractiveMap />
        </div>
      </div>
    </section>
  );
}
