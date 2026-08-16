'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@heritageverse/ui';
import { useTranslate } from '@/lib/TranslationProvider';

interface ReelItem {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  views: number;
  likes: number;
  culturalTags: string[];
  user: { id: string; name: string; avatar: string | null };
  createdAt: string;
}

export default function HomeReelsSection() {
  const { t } = useTranslate();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [trendingReels, setTrendingReels] = useState<ReelItem[]>([]);
  const [forYouReels, setForYouReels] = useState<ReelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mapReel = (r: any): ReelItem => ({
      id: r.id,
      title: r.title,
      description: r.description,
      thumbnailUrl: r.thumbnailUrl,
      videoUrl: r.videoUrl,
      views: r.viewCount ?? r.views ?? 0,
      likes: r.likeCount ?? r.likes ?? 0,
      culturalTags: r.culturalTags ?? r.tags ?? [],
      user: r.creator || r.user || { id: '', name: 'Unknown', avatar: null },
      createdAt: r.createdAt,
    });

    Promise.all([
      fetch('/api/reels/feed?limit=6&sort=trending').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/reels/feed?limit=6&sort=recent').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([trending, recent]) => {
      setTrendingReels((trending.data || []).map(mapReel));
      setForYouReels((recent.data || []).map(mapReel));
      setIsLoading(false);
    });
  }, []);

  const ReelCard = ({ reel }: { reel: ReelItem }) => (
    <Link
      href={`/${locale}/reels/${reel.id}`}
      className="group flex-shrink-0 w-64 md:w-72 bg-white rounded-xl border border-border overflow-hidden hover:shadow-card transition-all duration-300"
    >
      <div className="aspect-[9/16] bg-gradient-to-br from-navy2 to-navy relative overflow-hidden">
        {reel.thumbnailUrl ? (
          <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="4" /><path d="M10 9l5 3-5 3V9z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white text-sm font-medium line-clamp-1">{reel.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/60 text-xs">{reel.views} views</span>
            <span className="text-white/60 text-xs">·</span>
            <span className="text-white/60 text-xs">{reel.likes} likes</span>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {reel.user.avatar ? (
            <img src={reel.user.avatar} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[8px] text-accent">
              {reel.user.name.charAt(0)}
            </div>
          )}
          <span className="text-xs text-muted truncate">{reel.user.name}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(reel.culturalTags || []).slice(0, 2).map((tag) => (
            <Badge key={tag} variant="muted" size="sm">{tag}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );

  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-64 md:w-72 bg-white rounded-xl border border-border overflow-hidden">
      <div className="aspect-[9/16] skeleton-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-24 skeleton-pulse rounded" />
        <div className="h-3 w-16 skeleton-pulse rounded" />
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-white/50">
      <div className="content-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-accent text-sm font-semibold tracking-widest uppercase">{t('reels.title')}</span>
              <h2 className="text-3xl font-serif text-navy mt-2">{t('reels.trending')}</h2>
              <p className="text-muted mt-1">{t('reels.subtitle')}</p>
            </div>
            <Link href={`/${locale}/reels`} className="text-sm text-accent hover:underline hidden sm:block">
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : trendingReels.map((reel) => <ReelCard key={reel.id} reel={reel} />)
            }
            {!isLoading && trendingReels.length === 0 && (
              <div className="w-full text-center py-12">
                <div className="text-4xl mb-2">🎬</div>
                <p className="text-muted text-sm">{t('common.noResults')}</p>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between mt-12 mb-8">
            <div>
              <h2 className="text-3xl font-serif text-navy mt-2">{t('reels.forYou')}</h2>
              <p className="text-muted mt-1">{t('reels.subtitle')}</p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : forYouReels.map((reel) => <ReelCard key={reel.id} reel={reel} />)
            }
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href={`/${locale}/reels`} className="text-sm text-accent hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
