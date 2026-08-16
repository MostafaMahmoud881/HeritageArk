'use client';

import dynamic from 'next/dynamic';
import { useTranslate } from '@/lib/TranslationProvider';

const HeritageGlobe = dynamic(() => import('@/components/HeritageGlobe'), { ssr: false });

export default function HeritageGlobeSection() {
  const { t } = useTranslate();
  return (
    <section className="py-24 bg-navy scroll-mt-20" id="globe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#D4A373] text-sm font-semibold tracking-widest uppercase">{t('hero.explore')}</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">{t('map.title')}</h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">{t('globe.description')}</p>
        </div>
        <HeritageGlobe />
      </div>
    </section>
  );
}
