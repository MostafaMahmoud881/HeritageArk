'use client';

import Link from 'next/link';
import { useTranslate } from '@/lib/TranslationProvider';

function localePath(locale: string, path: string) {
  if (locale === 'en') return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

export default function Footer({ locale }: { locale: string }) {
  const { t, dir } = useTranslate();

  return (
    <footer className="bg-navy text-white/60 border-t border-white/10" dir={dir}>
      <div className="content-section py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-accent text-lg mb-4 flex items-center gap-2">
              <img src="/brand-assets/heritageark-mark.svg" alt="HeritageArk" className="h-6 w-auto" />
              HeritageArk
            </h3>
            <p className="text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t('footer.explore')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={localePath(locale, '/cultures')} className="hover:text-accent transition-colors">{t('nav.cultures')}</Link></li>
              <li><Link href={localePath(locale, '/museum')} className="hover:text-accent transition-colors">{t('nav.museum')}</Link></li>
              <li><Link href={localePath(locale, '/documentary')} className="hover:text-accent transition-colors">{t('nav.documentaries')}</Link></li>
              <li><Link href={localePath(locale, '/#expeditions')} className="hover:text-accent transition-colors">{t('nav.expeditions')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t('footer.resources')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={localePath(locale, '/news')} className="hover:text-accent transition-colors">{t('nav.news')}</Link></li>
              <li><Link href={localePath(locale, '/research')} className="hover:text-accent transition-colors">{t('footer.research')}</Link></li>
              <li><Link href={localePath(locale, '/about')} className="hover:text-accent transition-colors">{t('footer.about')}</Link></li>
              <li><Link href={localePath(locale, '/contact')} className="hover:text-accent transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={localePath(locale, '/privacy')} className="hover:text-accent transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link href={localePath(locale, '/terms')} className="hover:text-accent transition-colors">{t('footer.terms')}</Link></li>
              <li><Link href={localePath(locale, '/attribution')} className="hover:text-accent transition-colors">{t('footer.attribution')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} HeritageArk. {t('footer.copyright')}</p>
          <p>{t('footer.motto')}</p>
        </div>
      </div>
    </footer>
  );
}
