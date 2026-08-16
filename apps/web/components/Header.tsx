'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Button } from '@heritageverse/ui';
import { useAuth } from '@/lib/auth';
import { useTranslate } from '@/lib/TranslationProvider';
import { useSiteSettings } from '@/lib/site-settings';
import { locales, type Locale } from '@/lib/i18n';
import { SearchBar } from '@/components/SearchBar';

interface NavItem {
  href: string;
  labelKey: string;
}

function localePath(locale: string, path: string) {
  if (locale === 'en') return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

const NAV_MAIN: NavItem[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/indigenous', labelKey: 'nav.indigenous' },
  { href: '/museum', labelKey: 'nav.museum' },
  { href: '/reels', labelKey: 'nav.reels' },
  { href: '/news', labelKey: 'nav.news' },
];

const NAV_MORE: NavItem[] = [
  { href: '/chat', labelKey: 'nav.chat' },
  { href: '/stories', labelKey: 'nav.stories' },
  { href: '/stories/immersive', labelKey: 'nav.immersiveStories' },
  { href: '/cultures', labelKey: 'nav.cultures' },
  { href: '#crafts', labelKey: 'nav.crafts' },
  { href: '#fashion', labelKey: 'nav.fashion' },
  { href: '/languages', labelKey: 'nav.languages' },
  { href: '#timeline', labelKey: 'nav.timeline' },
  { href: '#expeditions', labelKey: 'nav.expeditions' },
  { href: '/museum', labelKey: 'nav.museum' },
  { href: '/tours', labelKey: 'nav.tours' },
  { href: '/news-intelligence', labelKey: 'nav.newsIntelligence' },
  { href: '/research', labelKey: 'nav.research' },
  { href: '/education', labelKey: 'nav.education' },
  { href: '/citation', labelKey: 'nav.citation' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/upload', labelKey: 'nav.upload' },
];

function scrollToHash(href: string) {
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', href);
  }
}

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const { t, locale } = useTranslate();
  if (item.href.startsWith('#')) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          scrollToHash(item.href);
          onClick?.();
        }}
        className="text-sm text-white/70 hover:text-[#D4A373] transition-colors text-left"
      >
        {t(item.labelKey)}
      </button>
    );
  }
  return (
    <Link
      href={localePath(locale, item.href)}
      className="text-sm text-white/70 hover:text-[#D4A373] transition-colors"
      onClick={onClick}
    >
      {t(item.labelKey)}
    </Link>
  );
}

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN', ar: 'AR', fr: 'FR', it: 'IT', ber: 'ⴱⴻⵔ',
};

export default function Header({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { t, dir } = useTranslate();
  const params = useParams();
  const { logoUrl, siteName } = useSiteSettings();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (locales.includes(segments[0] as Locale)) segments[0] = newLocale;
    else segments.unshift(newLocale);
    window.location.href = '/' + segments.join('/');
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-[#0B132B]/95 backdrop-blur-sm border-b border-white/10"
      dir={dir}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link
          href={localePath(locale, '/')}
          className="font-serif text-xl text-[#E8DDC8] tracking-wide hover:text-white transition-colors flex items-center gap-2"
        >
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
          ) : (
            <>
              <img src="/brand-assets/heritageark-mark.svg" alt="HeritageArk" className="h-8 w-auto" />
              <span>{siteName || 'HeritageArk'}</span>
            </>
          )}
        </Link>

        <div className="hidden lg:flex items-center gap-5">
          {NAV_MAIN.map((item) => (
            <NavLink key={`${item.href}-${item.labelKey}`} item={item} />
          ))}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="text-sm text-white/70 hover:text-[#D4A373] transition-colors flex items-center gap-1"
            >
              {t('nav.more')}
              <svg className={`w-3 h-3 transition-transform ${moreOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#1C2541] rounded-xl shadow-xl border border-white/10 py-2">
                {NAV_MORE.map((item) => (
                  <div key={`${item.href}-${item.labelKey}`} className="px-4 py-1">
                    <NavLink item={item} onClick={() => setMoreOpen(false)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar />
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
            >
              {LOCALE_LABELS[locale] || locale.toUpperCase()}
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-2 bg-[#1C2541] rounded-xl shadow-xl border border-white/10 py-1 min-w-[120px]">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => { switchLocale(l); setLangOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${locale === l ? 'text-[#D4A373] bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                  >
                    {t(`locales.${l}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth / Admin */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link href={localePath(locale, '/admin')} className="text-xs text-[#D4A373] hover:text-[#E9C46A] transition-colors">
                {t('nav.admin')}
              </Link>
              <button onClick={logout} className="text-xs text-white/50 hover:text-white transition-colors">
                {t('auth.logout')}
              </button>
            </div>
          ) : (
            <Link href={localePath(locale, '/auth/login')}>
              <Button variant="outline" size="sm">{t('auth.login')}</Button>
            </Link>
          )}

          <button
            className="lg:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label={t('nav.more')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden bg-[#1C2541] border-t border-white/10 px-4 py-4 space-y-3">
          {[...NAV_MAIN, ...NAV_MORE].map((item) => (
            <div key={`${item.href}-${item.labelKey}`}>
              <NavLink item={item} onClick={() => setOpen(false)} />
            </div>
          ))}
          <hr className="border-white/10" />
          {user ? (
            <>
              <Link href={localePath(locale, '/admin')} className="block text-sm text-[#D4A373]" onClick={() => setOpen(false)}>{t('nav.admin')}</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="block text-sm text-white/50">{t('auth.logout')}</button>
            </>
          ) : (
            <Link href={localePath(locale, '/auth/login')} className="block text-sm text-white/70" onClick={() => setOpen(false)}>{t('auth.login')}</Link>
          )}
        </div>
      )}
    </header>
  );
}
