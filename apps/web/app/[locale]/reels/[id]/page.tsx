'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Button } from '@heritageverse/ui';
import { ReelCommentSheet } from '@/components/Reels/ReelCommentSheet';
import { ReelCard } from '@/components/Reels/ReelCard';
import { ReelSkeletonFull } from '@/components/Reels/ReelSkeleton';

interface ReelDetail {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    followerCount?: number;
    isFollowing?: boolean;
  };
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved: boolean;
  tags?: string[];
  language?: string;
  researchReferences?: { title: string; url: string }[];
  viewCount?: number;
  createdAt?: string;
  suggestedReels?: Array<{
    id: string;
    title: string;
    thumbnailUrl?: string;
    duration?: string;
    viewCount: number;
    creator?: { id: string; name: string; avatar?: string };
  }>;
}

export default function ReelDetailPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const [reel, setReel] = useState<ReelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchReel = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reels/${id}`);
        if (!res.ok) throw new Error('Reel not found');
        const body = await res.json();
        const reelData = body.data || body;
        setReel(reelData);
        setLiked(reelData.isLiked || false);
        setSaved(reelData.isSaved || false);
        setLikeCount(reelData.likeCount || 0);
        setFollowing(reelData.creator?.isFollowing || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reel');
      } finally {
        setLoading(false);
      }
    };
    fetchReel();
  }, [id]);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    try { await fetch(`/api/reels/${id}/like`, { method: 'POST' }); } catch {}
  };

  const handleSave = async () => {
    setSaved(!saved);
    try { await fetch(`/api/reels/${id}/save`, { method: 'POST' }); } catch {}
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/reels/${id}`;
    if (navigator.share) {
      try { await navigator.share({ title: reel?.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleFollow = async () => {
    if (!reel) return;
    setFollowing(!following);
    try {
      await fetch(`/api/creators/${reel.creator.id}/follow`, { method: 'POST' });
    } catch {}
  };

  if (loading) return <ReelSkeletonFull />;

  if (error || !reel) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted/30 mb-3">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 className="text-lg font-serif text-navy mb-1">Reel Not Found</h2>
          <p className="text-muted text-sm mb-4">{error || 'This reel could not be loaded.'}</p>
          <Link href={`/${locale}/reels`}>
            <Button variant="outline">Back to Feed</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-navy via-navy2 to-navy relative max-h-[70vh] md:max-h-[80vh]">
          {reel.videoUrl ? (
            <video src={reel.videoUrl} controls className="w-full h-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full border-2 border-accent/30 flex items-center justify-center mb-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4A373" strokeWidth="1.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <p className="text-accent/50 text-sm font-serif">{reel.title}</p>
              </div>
            </div>
          )}
          {reel.viewCount !== undefined && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              {reel.viewCount.toLocaleString()} views
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/creators/${reel.creator.id}`}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-white font-semibold overflow-hidden">
                  {reel.creator.avatar ? (
                    <img src={reel.creator.avatar} alt={reel.creator.name} className="w-full h-full object-cover" />
                  ) : (
                    reel.creator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  )}
                </div>
              </Link>
              <div>
                <Link href={`/${locale}/creators/${reel.creator.id}`} className="font-medium text-navy hover:text-accent transition-colors">
                  {reel.creator.name}
                </Link>
                {reel.creator.bio && (
                  <p className="text-xs text-muted">{reel.creator.bio}</p>
                )}
              </div>
            </div>
            <Button
              variant={following ? 'ghost' : 'primary'}
              size="sm"
              onClick={handleFollow}
            >
              {following ? 'Following' : 'Follow'}
            </Button>
          </div>

          <div>
            <h1 className="text-xl font-serif text-navy">{reel.title}</h1>
            {reel.description && (
              <p className="text-sm text-muted mt-2 leading-relaxed">{reel.description}</p>
            )}
            {reel.language && (
              <p className="text-xs text-muted mt-2">
                Language: <span className="font-medium text-navy">{reel.language}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 py-3 border-y border-border">
            <button onClick={handleLike} className="flex items-center gap-1.5 group">
              <div className="p-2 rounded-full group-hover:bg-danger/10 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? '#DC2626' : 'none'} stroke={liked ? '#DC2626' : 'currentColor'} strokeWidth="2" className="text-muted group-hover:text-danger transition-colors">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-navy">{likeCount}</span>
            </button>

            <button onClick={() => setCommentOpen(true)} className="flex items-center gap-1.5 group">
              <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted group-hover:text-accent transition-colors">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-navy">{reel.commentCount}</span>
            </button>

            <button onClick={handleSave} className="flex items-center gap-1.5 group">
              <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? '#D4A373' : 'none'} stroke="currentColor" strokeWidth="2" className="text-muted group-hover:text-accent transition-colors">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-navy">{reel.saveCount}</span>
            </button>

            <button onClick={handleShare} className="flex items-center gap-1.5 group">
              <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted group-hover:text-accent transition-colors">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
            </button>
          </div>

          {reel.tags && reel.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-navy mb-2">Cultural Tags</h3>
              <div className="flex flex-wrap gap-2">
                {reel.tags.map((tag) => (
                  <Link key={tag} href={`/${locale}/reels/explore?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="accent" className="cursor-pointer hover:bg-accent/20 transition-colors">{tag}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {reel.researchReferences && reel.researchReferences.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-navy mb-2">Research References</h3>
              <ul className="space-y-2">
                {reel.researchReferences.map((ref, i) => (
                  <li key={i}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline flex items-center gap-1.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reel.createdAt && (
            <p className="text-xs text-muted">
              Posted {new Date(reel.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-serif text-navy">Comments</h2>
          <Button variant="ghost" size="sm" onClick={() => setCommentOpen(true)}>
            View All ({reel.commentCount})
          </Button>
        </div>
        <div className="bg-bg rounded-xl p-6 text-center">
          <p className="text-muted text-sm">Join the conversation</p>
          <button
            onClick={() => setCommentOpen(true)}
            className="text-accent text-sm font-medium hover:underline mt-1"
          >
            Open comments
          </button>
        </div>
      </div>

      {reel.suggestedReels && reel.suggestedReels.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-lg font-serif text-navy mb-6">More Reels You Might Like</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {reel.suggestedReels.map((suggested) => (
              <div key={suggested.id} className="shrink-0 w-40">
                <ReelCard reel={suggested} locale={locale} />
              </div>
            ))}
          </div>
        </div>
      )}

      {commentOpen && (
        <ReelCommentSheet
          reelId={id}
          open={commentOpen}
          onClose={() => setCommentOpen(false)}
        />
      )}
    </div>
  );
}
