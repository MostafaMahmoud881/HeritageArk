'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@heritageverse/ui';
import { useTranslate } from '@/lib/TranslationProvider';

const RECENT_SEARCHES_KEY = 'heritageverse_recent_searches';
const MAX_RECENT = 5;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function localePath(locale: string, path: string) {
  if (locale === 'en') return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

export function SearchBar() {
  const { t, locale } = useTranslate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [index, setIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    fetch('/api/search?mode=trending').then(r => r.json()).then(d => {
      if (d.data) setTrending(d.data.map((t: { query: string }) => t.query));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 1) {
      fetch(`/api/search?mode=suggestions&q=${encodeURIComponent(debouncedQuery)}`)
        .then(r => r.json())
        .then(d => setSuggestions(d.data || []))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
    setIndex(-1);
  }, [debouncedQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSubmit = useCallback((searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;
    saveRecentSearch(q);
    setOpen(false);
    setQuery('');
    router.push(`${localePath(locale, '/search')}?q=${encodeURIComponent(q)}`);
  }, [locale, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query.trim() ? suggestions : (recentSearches.length > 0 ? recentSearches : trending);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (index >= 0 && items[index]) handleSubmit(items[index]);
      else handleSubmit(query);
    }
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm"
        aria-label={t('common.search')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="hidden sm:inline">{t('common.search')}</span>
        <kbd className="hidden lg:inline-flex text-xs px-1.5 py-0.5 rounded border border-white/10 text-white/30">⌘K</kbd>
      </button>

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
        >
          <div className="w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('common.search')}
                  className="w-full pl-10 pr-4 py-2.5 border-none bg-bg/50 focus:ring-0 text-navy"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {suggestions.length > 0 && (
                <div className="p-2 border-b border-border/50">
                  <p className="text-xs text-muted px-3 py-1.5 font-medium">{t('common.search')}</p>
                  {suggestions.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => handleSubmit(s)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                        i === index ? 'bg-accent/10 text-accent' : 'text-navy hover:bg-accent/5'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/50 shrink-0">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <span dangerouslySetInnerHTML={{ __html: highlightMatch(s, query) }} />
                    </button>
                  ))}
                </div>
              )}

              {!query.trim() && recentSearches.length > 0 && (
                <div className="p-2 border-b border-border/50">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <p className="text-xs text-muted font-medium">{t('common.search')}</p>
                    <button onClick={clearRecent} className="text-xs text-muted/60 hover:text-muted transition-colors">{t('common.cancel')}</button>
                  </div>
                  {recentSearches.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => handleSubmit(s)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                        i === index ? 'bg-accent/10 text-accent' : 'text-navy hover:bg-accent/5'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/50 shrink-0">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {!query.trim() && trending.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-muted px-3 py-1.5 font-medium">{t('common.search')}</p>
                  {trending.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => handleSubmit(s)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                        !query.trim() && !recentSearches.length && i === index ? 'bg-accent/10 text-accent' : 'text-navy hover:bg-accent/5'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/50 shrink-0">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                      </svg>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {suggestions.length === 0 && !query.trim() && recentSearches.length === 0 && trending.length === 0 && (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm text-muted">{t('common.search')}</p>
                  <p className="text-xs text-muted/60 mt-1">
                    {locale === 'ar' ? 'استخدم' : 'Press'} <kbd className="px-1.5 py-0.5 rounded border border-border text-navy text-xs">↑↓</kbd>{' '}
                    {locale === 'ar' ? 'للتنقل، و' : 'to navigate, '}
                    <kbd className="px-1.5 py-0.5 rounded border border-border text-navy text-xs">Enter</kbd>{' '}
                    {locale === 'ar' ? 'للاختيار' : 'to select'}
                  </p>
                </div>
              )}

              <div className="border-t border-border p-2">
                <button
                  onClick={() => { setOpen(false); router.push(localePath(locale, '/search')); }}
                  className="w-full text-center px-3 py-2.5 text-sm text-accent hover:bg-accent/5 rounded-lg transition-colors font-medium"
                >
                  {t('common.search')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedText = escapeHtml(text);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return escapedText.replace(regex, '<strong class="text-accent font-semibold">$1</strong>');
}
