'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ReelPlayer } from '@/components/Reels/ReelPlayer';
import { ReelCommentSheet } from '@/components/Reels/ReelCommentSheet';
import { ReelSkeletonFull } from '@/components/Reels/ReelSkeleton';

interface Reel {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  creator: { id: string; name: string; avatar?: string };
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  tags?: string[];
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function ReelsFeedPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [commentReelId, setCommentReelId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchReels = useCallback(async (cursorVal?: string) => {
    try {
      const url = new URL('/api/reels/feed', window.location.origin);
      if (cursorVal) url.searchParams.set('cursor', cursorVal);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load feed');
      const data = await res.json();
      return data;
    } catch {
      return { reels: [], cursor: null, hasMore: false };
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await fetchReels();
      setReels(result.data || []);
      setCursor(result.nextCursor || null);
      setHasMore(!!result.nextCursor);
      setLoading(false);
    };
    load();
  }, [fetchReels]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const result = await fetchReels(cursor ?? undefined);
    setReels((prev) => [...prev, ...(result.data || [])]);
    setCursor(result.nextCursor || null);
    setHasMore(!!result.nextCursor);
  }, [cursor, hasMore, loading, fetchReels]);

  useEffect(() => {
    if (currentIndex >= reels.length - 2 && hasMore) {
      loadMore();
    }
  }, [currentIndex, reels.length, hasMore, loadMore]);

  const handleView = useCallback(async (id: string) => {
    try {
      await fetch(`/api/reels/${id}/view`, { method: 'POST' });
    } catch {}
  }, []);

  const handleLike = useCallback(async (id: string) => {
    try {
      await fetch(`/api/reels/${id}/like`, { method: 'POST' });
    } catch {}
  }, []);

  const handleSave = useCallback(async (id: string) => {
    try {
      await fetch(`/api/reels/${id}/save`, { method: 'POST' });
    } catch {}
  }, []);

  const handleShare = useCallback(async (id: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Heritage Reel',
          url: `${window.location.origin}/${locale}/reels/${id}`,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}/${locale}/reels/${id}`);
    }
  }, [locale]);

  const goNext = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, reels.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') goPrev();
    else if (e.key === 'ArrowDown') goNext();
  }, [goNext, goPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading && reels.length === 0) {
    return <ReelSkeletonFull />;
  }

  if (!loading && reels.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted/30 mb-4">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          <h2 className="text-xl font-serif text-navy mb-2">No Reels Yet</h2>
          <p className="text-muted text-sm mb-4">Be the first to share a cultural heritage reel!</p>
          <a href={`/${locale}/reels/upload`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-navy font-semibold text-sm hover:bg-accent/90 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Upload Reel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] overflow-hidden relative">
      <div
        className="h-full transition-transform duration-300"
        style={{ transform: `translateY(-${currentIndex * 100}%)` }}
      >
        <div className="h-full">
          {reels.map((reel, index) => (
            <div key={reel.id} className="h-full">
              <ReelPlayer
                reel={reel}
                isActive={index === currentIndex}
                onSwipeUp={goNext}
                onSwipeDown={goPrev}
                onView={handleView}
                onLike={handleLike}
                onComment={(id) => setCommentReelId(id)}
                onSave={handleSave}
                onShare={handleShare}
                locale={locale}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
        {reels.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              i === currentIndex ? 'bg-accent h-3' : 'bg-white/30 hover:bg-white/50'
            )}
            aria-label={`Go to reel ${i + 1}`}
          />
        ))}
      </div>

      {commentReelId && (
        <ReelCommentSheet
          reelId={commentReelId}
          open={!!commentReelId}
          onClose={() => setCommentReelId(null)}
        />
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
