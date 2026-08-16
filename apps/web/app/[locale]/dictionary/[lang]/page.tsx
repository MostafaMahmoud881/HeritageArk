'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Input, Badge } from '@heritageverse/ui';

interface DictionaryEntry {
  id: string;
  language: string;
  word: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  definition: string;
  culturalNotes: string | null;
  audioUrl: string | null;
  translations?: Array<{ id: string; word: string; language: string; definition: string; usage: string | null }>;
  examples?: Array<{ id: string; text: string; translation: string | null; audioUrl: string | null }>;
  relations?: Array<{ id: string; type: string; word: string; language: string; phonetic: string | null }>;
}

const LANG_NAMES: Record<string, string> = {
  ar: 'Arabic', en: 'English', fr: 'French', it: 'Italian',
};

export default function DictionaryLangPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string || 'en';
  const lang = params?.lang as string || 'en';
  const lookupWord = searchParams?.get('q') || '';

  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadEntries = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dictionary/${lang}?page=${page}&limit=50`);
      const d = await res.json();
      setEntries(d.data || []);
      setTotal(d.total || 0);
    } catch { setEntries([]); }
    setIsLoading(false);
  }, [lang]);

  const lookupEntry = useCallback(async (word: string) => {
    if (!word) { setEntry(null); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dictionary?mode=lookup&lang=${lang}&q=${encodeURIComponent(word)}`);
      const d = await res.json();
      setEntry(d.data || null);
    } catch { setEntry(null); }
    setIsLoading(false);
  }, [lang]);

  useEffect(() => {
    if (lookupWord) {
      setQuery(lookupWord);
      lookupEntry(lookupWord);
    } else {
      loadEntries();
    }
  }, [lookupWord, lookupEntry, loadEntries]);

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="content-section">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted mb-1">
              <Link href={`/${locale}/dictionary`} className="hover:text-accent transition-colors">Dictionary</Link>
              <span>/</span>
              <span className="text-navy font-medium">{LANG_NAMES[lang] || lang}</span>
            </div>
            <h1 className="text-3xl font-serif text-navy">{LANG_NAMES[lang] || lang} Dictionary</h1>
            <p className="text-muted text-sm mt-1">{total} entries</p>
          </div>

          <div className="relative mb-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') lookupEntry(query); }}
                placeholder={`Search in ${LANG_NAMES[lang] || lang}...`}
                className="w-full pl-12 text-base py-3"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 skeleton-pulse rounded-xl" />
              ))}
            </div>
          ) : entry ? (
            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-serif text-navy">{entry.word}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    {entry.phonetic && <span className="text-muted text-sm">{entry.phonetic}</span>}
                    {entry.partOfSpeech && <Badge variant="accent" size="sm">{entry.partOfSpeech}</Badge>}
                  </div>
                </div>
                {entry.audioUrl && (
                  <button className="p-3 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors" aria-label="Play pronunciation">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </button>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Definition</h3>
                <p className="text-navy text-lg leading-relaxed">{entry.definition}</p>
              </div>

              {entry.culturalNotes && (
                <div className="mb-8 p-4 bg-bg rounded-xl border border-border/50">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Cultural Notes</h3>
                  <p className="text-navy text-sm leading-relaxed">{entry.culturalNotes}</p>
                </div>
              )}

              {entry.translations && entry.translations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Translations</h3>
                  <div className="space-y-3">
                    {entry.translations.map((t) => (
                      <div key={t.id} className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="muted" size="sm">{t.language}</Badge>
                          <span className="text-navy font-medium">{t.word}</span>
                        </div>
                        <p className="text-sm text-muted">{t.definition}</p>
                        {t.usage && <p className="text-xs text-muted/60 mt-1 italic">"{t.usage}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {entry.examples && entry.examples.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Examples</h3>
                  <div className="space-y-3">
                    {entry.examples.map((e) => (
                      <div key={e.id} className="p-4 bg-bg rounded-xl">
                        <p className="text-navy">"{e.text}"</p>
                        {e.translation && <p className="text-sm text-muted mt-1">— {e.translation}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {entry.relations && entry.relations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Related Words</h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.relations.map((r) => (
                      <Link
                        key={r.id}
                        href={`/${locale}/dictionary/${r.language}?q=${encodeURIComponent(r.word)}`}
                        className="px-3 py-1.5 bg-bg rounded-full border border-border text-sm text-navy hover:border-accent hover:text-accent transition-colors"
                      >
                        {r.word} {r.phonetic && <span className="text-muted text-xs">({r.phonetic})</span>}
                        {r.type !== 'related' && <span className="text-xs text-muted ml-1">({r.type})</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border">
                <Link href={`/${locale}/dictionary/${lang}`} className="text-sm text-accent hover:underline">← Back to all entries</Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {entries.map((e) => (
                <Link
                  key={e.id}
                  href={`/${locale}/dictionary/${lang}?q=${encodeURIComponent(e.word)}`}
                  className="bg-white rounded-xl border border-border p-4 hover:shadow-card hover:border-accent/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-navy font-medium text-lg">{e.word}</span>
                      {e.phonetic && <span className="text-muted text-sm ml-2">{e.phonetic}</span>}
                    </div>
                    <Badge variant="muted" size="sm">{e.partOfSpeech || 'word'}</Badge>
                  </div>
                  <p className="text-sm text-muted mt-1 line-clamp-1">{e.definition}</p>
                </Link>
              ))}
              {entries.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📖</div>
                  <h3 className="text-xl font-serif text-navy mb-2">No entries yet</h3>
                  <p className="text-muted text-sm">This dictionary is being compiled. Check back later.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
