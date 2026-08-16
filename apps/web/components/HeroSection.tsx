'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@heritageverse/ui';
import { useTranslate } from '@/lib/TranslationProvider';

const HERO_BG = 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Machu_Picchu_2024.jpg';

const QUICK_LINKS = [
  { href: '/reels', key: 'hero.quickReels', icon: '🎬' },
  { href: '/museum', key: 'hero.quickMuseum', icon: '🏛️' },
  { href: '/chat', key: 'hero.quickChat', icon: '🤖' },
  { href: '#globe', key: 'hero.quickGlobe', icon: '🌍', scroll: true },
  { href: '/stories', key: 'hero.quickStories', icon: '📖' },
  { href: '/quests', key: 'hero.quickQuests', icon: '⚔️' },
];

export default function HeroSection() {
  const { t } = useTranslate();
  const [loaded, setLoaded] = useState(false);

  const scrollToGlobe = () => {
    document.getElementById('globe')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const img = new Image();
    img.src = HERO_BG;
    img.onload = () => setLoaded(true);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      <div className="absolute inset-0 bg-hero-gradient" />

      <div className="relative z-10 content-section text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white text-balance max-w-4xl mx-auto leading-tight" dir="ltr">
          {t('hero.title1')}
          <span className="text-gradient block md:inline"> {t('hero.title2')}</span>
          <br />
          {t('hero.title3')}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/museum">
            <Button size="lg">{t('hero.cta')}</Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => {
            document.getElementById('documentaries')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            {t('hero.watch')}
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {QUICK_LINKS.map((link) => {
            if (link.scroll) {
              return (
                <button
                  key={link.key}
                  onClick={scrollToGlobe}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white transition-all text-sm"
                >
                  <span>{link.icon}</span>
                  <span>{t(link.key)}</span>
                </button>
              );
            }
            return (
              <Link
                key={link.key}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white transition-all text-sm"
              >
                <span>{link.icon}</span>
                <span>{t(link.key)}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/50 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            {t('hero.statCultures')}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            {t('hero.statArtifacts')}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            {t('hero.statDocumentaries')}
          </span>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-50">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </section>
  );
}
