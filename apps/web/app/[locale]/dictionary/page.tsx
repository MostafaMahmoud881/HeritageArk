'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Input, Badge } from '@heritageverse/ui';

interface Language {
  language: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  ar: 'العربية', en: 'English', fr: 'Français', it: 'Italiano',
  es: 'Español', de: 'Deutsch', zh: '中文', ja: '日本語',
  hi: 'हिन्दी', pt: 'Português', ru: 'Русский',
};

const LANGUAGE_FLAGS: Record<string, string> = {
  ar: '🇸🇦', en: '🇬🇧', fr: '🇫🇷', it: '🇮🇹',
  es: '🇪🇸', de: '🇩🇪', zh: '🇨🇳', ja: '🇯🇵',
  hi: '🇮🇳', pt: '🇧🇷', ru: '🇷🇺',
};

export default function DictionaryPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const [languages, setLanguages] = useState<Language[]>([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; word: string; phonetic: string | null; partOfSpeech: string | null }>>([]);
  const [selectedLang, setSelectedLang] = useState(locale || 'en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dictionary?mode=languages')
      .then(r => r.json())
      .then(d => { setLanguages(d.data || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/dictionary?mode=suggest&lang=${selectedLang}&q=${encodeURIComponent(q)}`);
      const d = await res.json();
      setSuggestions(d.data || []);
    } catch { setSuggestions([]); }
  }, [selectedLang]);

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="content-section">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="text-accent text-sm font-semibold tracking-widest uppercase">Reference</span>
            <h1 className="text-4xl font-serif text-navy mt-2">Multilingual Dictionary</h1>
            <p className="text-muted mt-3">Explore words, translations, and cultural notes across heritage languages.</p>
          </div>

          <div className="relative mb-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <Input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for a word..."
                className="w-full pl-12 text-base py-3"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-border shadow-lg z-10 max-h-64 overflow-y-auto">
                {suggestions.map(s => (
                  <Link
                    key={s.id}
                    href={`/${locale}/dictionary/${selectedLang}?q=${encodeURIComponent(s.word)}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-accent/5 transition-colors border-b border-border/50 last:border-0"
                  >
                    <div>
                      <span className="text-navy font-medium">{s.word}</span>
                      {s.phonetic && <span className="text-muted text-sm ml-2">{s.phonetic}</span>}
                    </div>
                    {s.partOfSpeech && <Badge variant="muted" size="sm">{s.partOfSpeech}</Badge>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 skeleton-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {languages.map((l) => (
                <Link
                  key={l.language}
                  href={`/${locale}/dictionary/${l.language}`}
                  className="group bg-white rounded-xl border border-border p-5 hover:shadow-card hover:border-accent/30 transition-all duration-300"
                >
                  <div className="text-3xl mb-2">{LANGUAGE_FLAGS[l.language] || '📖'}</div>
                  <h3 className="font-serif text-navy group-hover:text-accent transition-colors">{LANGUAGE_NAMES[l.language] || l.language}</h3>
                  <p className="text-xs text-muted mt-1">{l.language.toUpperCase()}</p>
                </Link>
              ))}
              {languages.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="text-5xl mb-4">📖</div>
                  <h3 className="text-xl font-serif text-navy mb-2">Dictionary coming soon</h3>
                  <p className="text-muted text-sm">Heritage language dictionaries are being compiled.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
