'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Badge, Input } from '@heritageverse/ui';
import { ReelCard } from '@/components/Reels/ReelCard';
import { ReelSkeletonGrid } from '@/components/Reels/ReelSkeleton';
import clsx from 'clsx';

const CULTURAL_TAGS = [
  'Music', 'Dance', 'Cuisine', 'Textile', 'Architecture',
  'Ceremony', 'Festival', 'Language', 'Craft', 'Ritual',
  'Storytelling', 'Medicine', 'Agriculture', 'Maritime',
];

const LANGUAGES = ['All', 'English', 'Arabic', 'French', 'Italian', 'Spanish', 'Hindi', 'Mandarin', 'Swahili'];

interface Reel {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  viewCount: number;
  likeCount?: number;
  saveCount?: number;
  creator?: { id: string; name: string; avatar?: string };
  tags?: string[];
  language?: string;
}

export default function ExploreReelsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagParam = searchParams.get('tag');
    return tagParam ? [tagParam] : [];
  });
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSelectedTags((prev) => {
      const tagParam = searchParams.get('tag');
      return tagParam ? [tagParam] : prev;
    });
  }, [searchParams]);

  const fetchExplore = useCallback(async (cursorVal?: string, reset?: boolean) => {
    if (reset) { setLoading(true); setReels([]); }
    try {
      const url = new URL('/api/reels/explore', window.location.origin);
      if (debouncedSearch) url.searchParams.set('q', debouncedSearch);
      if (selectedTags.length > 0) url.searchParams.set('tags', selectedTags.join(','));
      if (selectedLanguage !== 'All') url.searchParams.set('language', selectedLanguage);
      if (cursorVal) url.searchParams.set('cursor', cursorVal);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      if (reset) setReels(data.reels || []);
      else setReels((prev) => [...prev, ...(data.reels || [])]);
      setCursor(data.cursor || null);
      setHasMore(data.hasMore ?? false);
    } catch {
      if (reset) setReels([]);
    } finally {
      if (reset) setLoading(false);
    }
  }, [debouncedSearch, selectedTags, selectedLanguage]);

  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    fetchExplore(undefined, true);
  }, [fetchExplore]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          fetchExplore(cursor ?? undefined).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [cursor, hasMore, loadingMore, loading, fetchExplore]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
      <div className="mb-8">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">Discover</span>
        <h1 className="text-3xl md:text-4xl font-serif text-navy mt-2">Explore Reels</h1>
      </div>

      <div className="space-y-4 mb-8">
        <Input
          placeholder="Search reels by title, creator, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xl"
        />

        <div className="flex flex-wrap gap-2">
          {CULTURAL_TAGS.map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)}>
              <Badge
                variant={selectedTags.includes(tag) ? 'accent' : 'muted'}
                size="sm"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted font-medium mr-1">Language:</span>
          {LANGUAGES.map((lang) => (
            <button key={lang} onClick={() => setSelectedLanguage(lang)}>
              <Badge
                variant={selectedLanguage === lang ? 'gold' : 'muted'}
                size="sm"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {lang}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <ReelSkeletonGrid count={8} />
      ) : reels.length === 0 ? (
        <div className="text-center py-16">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted/30 mb-4">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h2 className="text-lg font-serif text-navy mb-1">No Reels Found</h2>
          <p className="text-muted text-sm max-w-xs mx-auto">
            {selectedTags.length > 0 || selectedLanguage !== 'All' || debouncedSearch
              ? 'Try adjusting your filters or search terms.'
              : 'No reels have been uploaded yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} locale={locale} />
            ))}
          </div>
          {loadingMore && (
            <div className="mt-6">
              <ReelSkeletonGrid count={4} />
            </div>
          )}
          <div ref={sentinelRef} className="h-4" />
          {!hasMore && reels.length > 0 && (
            <p className="text-center text-muted text-sm mt-8">You&apos;ve reached the end</p>
          )}
        </>
      )}
    </div>
  );
}
