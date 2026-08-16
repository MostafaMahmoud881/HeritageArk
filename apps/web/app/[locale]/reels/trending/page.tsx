'use client';

import { useState, useEffect } from 'react';
import { Badge, Button } from '@heritageverse/ui';
import { ReelCard } from '@/components/Reels/ReelCard';
import { ReelSkeletonGrid } from '@/components/Reels/ReelSkeleton';
import { useParams } from 'next/navigation';
import clsx from 'clsx';

type SortPeriod = 'today' | 'week' | 'month';

const sortOptions: { value: SortPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

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

export default function TrendingReelsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [sort, setSort] = useState<SortPeriod>('today');
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reels/trending?period=${sort}`);
        if (!res.ok) throw new Error('Failed to load trending reels');
        const data = await res.json();
        setReels(data.reels || []);
      } catch (err) {
        setError('Could not load trending reels');
        setReels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Trending</span>
          <h1 className="text-3xl md:text-4xl font-serif text-navy mt-2">Trending Reels</h1>
          <p className="text-muted mt-2 text-sm">Discover what&apos;s popular across the heritage community</p>
        </div>
        <div className="flex gap-1 bg-bg rounded-lg p-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                sort === opt.value
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-muted hover:text-navy'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <ReelSkeletonGrid count={8} />
      ) : error ? (
        <div className="text-center py-16">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted/30 mb-3">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-muted text-sm mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setSort(sort)}>Retry</Button>
        </div>
      ) : reels.length === 0 ? (
        <div className="text-center py-16">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted/30 mb-3">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <h2 className="text-lg font-serif text-navy mb-1">No Trending Reels</h2>
          <p className="text-muted text-sm">No reels trending for this period yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
