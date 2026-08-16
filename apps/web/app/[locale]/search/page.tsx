'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Input, Badge, Button } from '@heritageverse/ui';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  image: string | null;
  subtitle?: string;
  score: number;
  metadata?: Record<string, unknown>;
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'cultures', label: 'Cultures' },
  { value: 'articles', label: 'Articles' },
  { value: 'reels', label: 'Reels' },
  { value: 'news', label: 'News' },
  { value: 'events', label: 'Events' },
  { value: 'users', label: 'Users' },
  { value: 'media', label: 'Media' },
] as const;

const TYPE_ICONS: Record<string, string> = {
  cultures: '🏛️',
  articles: '📰',
  reels: '🎬',
  news: '📰',
  events: '📅',
  users: '👤',
  media: '🖼️',
  article: '📄',
  culture: '🏛️',
  reel: '🎬',
  user: '👤',
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  const initialQuery = searchParams?.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{ query: string; filters?: string }>>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const performSearch = useCallback(async (q: string, p: number) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ q, type: filter, page: String(p), limit: String(limit) });
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data || []);
        setTotal(data.total || 0);
        if (data.trending) setTrending(data.trending);
        if (data.history) setHistory(data.history);
      } else {
        throw new Error('Search failed');
      }
    } catch {
      setResults([]);
    }
    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) performSearch(initialQuery, 1);
    else {
      fetch('/api/search?mode=trending').then(r => r.json()).then(d => {
        if (d.data) setTrending(d.data.map((t: { query: string }) => t.query));
      }).catch(() => {});
    }
  }, [initialQuery, performSearch]);

  const handleSearch = () => {
    const q = query.trim();
    if (q) {
      router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
      performSearch(q, 1);
      setPage(1);
    }
  };

  const handleFilterChange = (f: string) => {
    setFilter(f);
    if (query.trim()) performSearch(query, 1);
    setPage(1);
  };

  const loadPage = (p: number) => {
    setPage(p);
    performSearch(query, p);
  };

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16 lg:pb-6">
      <div className="content-section">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="text-accent text-sm font-semibold tracking-widest uppercase">Explore</span>
            <h1 className="text-4xl font-serif text-navy mt-2">Search HeritageArk</h1>
            <p className="text-muted mt-3 max-w-xl">
              Discover cultures, artifacts, news, reels, and stories from around the world.
            </p>
          </div>

          <div className="mb-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Search cultures, artifacts, news, reels..."
                className="w-full pl-12 text-base py-3"
              />
            </div>
          </div>

          {!query.trim() && trending.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Trending Searches</h3>
              <div className="flex flex-wrap gap-2">
                {trending.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setQuery(t); router.push(`/${locale}/search?q=${encodeURIComponent(t)}`); performSearch(t, 1); }}
                    className="px-3 py-1.5 bg-white rounded-full border border-border text-sm text-navy hover:border-accent hover:text-accent transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query.trim() && history.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {history.map((h) => (
                  <button
                    key={h.query}
                    onClick={() => { setQuery(h.query); router.push(`/${locale}/search?q=${encodeURIComponent(h.query)}`); performSearch(h.query, 1); }}
                    className="px-3 py-1.5 bg-white rounded-full border border-border text-sm text-navy hover:border-accent hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {h.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => handleFilterChange(f.value)}>
                <Badge variant={filter === f.value ? 'accent' : 'muted'} size="md">
                  {f.label}
                </Badge>
              </button>
            ))}
          </div>

          {query.trim() && (
            <p className="text-sm text-muted mb-6">
              {isLoading ? 'Searching...' : `${total} result${total !== 1 ? 's' : ''} for "${query}"`}
              {filter !== 'all' && ` in ${filter}`}
            </p>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
                  <div className="h-40 skeleton-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-24 skeleton-pulse rounded" />
                    <div className="h-5 w-3/4 skeleton-pulse rounded" />
                    <div className="h-4 w-full skeleton-pulse rounded" />
                    <div className="h-4 w-2/3 skeleton-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => (
                  <Link
                    key={`${result.type}:${result.id}`}
                    href={result.url}
                    className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-card transition-all duration-300"
                  >
                    <div className="h-40 bg-gradient-to-br from-navy2 to-navy flex items-center justify-center text-5xl relative">
                      {result.image ? (
                        <img src={result.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="opacity-30">{TYPE_ICONS[result.type] || '📄'}</span>
                      )}
                      {result.subtitle && (
                        <span className="absolute top-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="accent" size="sm">{result.type}</Badge>
                        {result.metadata?.flag ? <span className="text-xs">{String(result.metadata.flag)}</span> : null}
                      </div>
                      <h3 className="font-serif text-lg text-navy group-hover:text-accent transition-colors line-clamp-2">
                        {result.title}
                      </h3>
                      <p className="text-sm text-muted mt-2 line-clamp-2">{result.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted/60">
                        <span>Score: {Math.round(result.score * 100)}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {total > limit && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => loadPage(page - 1)}>
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => loadPage(p)}
                          className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                            page === p ? 'bg-accent text-white' : 'text-navy hover:bg-accent/10'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    {Math.ceil(total / limit) > 5 && (
                      <span className="text-xs text-muted px-1">...</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => loadPage(page + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-xl font-serif text-navy mb-2">No results found</h3>
              <p className="text-muted text-sm max-w-md mx-auto">
                {query
                  ? `We couldn't find any ${filter !== 'all' ? filter : ''} results for "${query}". Try adjusting your search or filters.`
                  : 'Enter a search term to explore heritage content.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
