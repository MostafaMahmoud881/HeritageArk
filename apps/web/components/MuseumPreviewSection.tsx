'use client';

import Link from 'next/link';
import { useTranslate } from '@/lib/TranslationProvider';
import { ARTIFACTS } from '@/lib/data';

const featured = ARTIFACTS.slice(0, 4);

export default function MuseumPreviewSection() {
  const { t } = useTranslate();
  return (
    <section className="py-24 bg-gradient-to-b from-navy to-navy2 scroll-mt-20" id="museum-preview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">{t('museum.discover')}</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">{t('museum.title')}</h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">
            {t('museum.previewDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((artifact) => (
            <Link
              key={artifact.id}
              href={`/museum/${artifact.id}`}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-accent/30 transition-all duration-500 hover:translate-y-[-4px]"
            >
              <div className="aspect-square flex items-center justify-center text-5xl bg-gradient-to-br from-navy2 to-navy relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 group-hover:scale-110 transition-transform duration-500">
                  {artifact.emoji}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: artifact.col }}
                  />
                  <span className="text-xs text-white/40">{artifact.culture}</span>
                </div>
                <h3 className="font-serif text-white group-hover:text-accent transition-colors">
                  {artifact.name}
                </h3>
                <p className="text-xs text-white/30 mt-1">{artifact.period}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/museum"
            className="inline-flex items-center gap-2 bg-accent text-navy px-8 py-4 rounded-xl font-semibold hover:bg-accent/90 hover:translate-y-[-2px] transition-all duration-200"
          >
            {t('museum.enter')} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
