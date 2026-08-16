'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from '@heritageverse/ui';
import clsx from 'clsx';

interface ReelPlayerProps {
  reel: {
    id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    creator: { id: string; name: string; avatar?: string };
    likeCount?: number;
    commentCount?: number;
    saveCount?: number;
    shareCount?: number;
    tags?: string[];
    isLiked?: boolean;
    isSaved?: boolean;
  };
  isActive: boolean;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onView?: (id: string) => void;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  locale?: string;
}

export function ReelPlayer({
  reel,
  isActive,
  onSwipeUp,
  onSwipeDown,
  onView,
  onLike,
  onComment,
  onSave,
  onShare,
  locale,
}: ReelPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const [liked, setLiked] = useState(reel.isLiked || false);
  const [saved, setSaved] = useState(reel.isSaved || false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Autoplay / pause the video when the reel becomes active
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.currentTime = 0;
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      v.pause();
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !containerRef.current || !onView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onView(reel.id);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isActive, reel.id, onView]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndY.current = e.touches[0]?.clientY ?? 0;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartY.current - touchEndY.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onSwipeUp?.();
      else onSwipeDown?.();
    }
  }, [onSwipeUp, onSwipeDown]);

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 600);
    }
    onLike?.(reel.id);
  };

  const handleDoubleTap = () => {
    if (!liked) {
      setLiked(true);
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 600);
      onLike?.(reel.id);
    }
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      v.pause();
    }
  }, []);

  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap → like
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      handleDoubleTap();
    } else {
      // Single tap → play/pause (delayed so a double tap can cancel it)
      tapTimer.current = setTimeout(() => {
        togglePlay();
        tapTimer.current = null;
      }, 260);
    }
    lastTap.current = now;
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full max-w-md mx-auto bg-navy overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
    >
      {reel.videoUrl ? (
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.thumbnailUrl}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted={muted}
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          {/* Play overlay when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white" stroke="none">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              </div>
            </div>
          )}
          {/* Mute / unmute toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            )}
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy2 to-navy">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(212,163,115,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(233,196,106,0.1) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-accent/30 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4A373" strokeWidth="1.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <p className="text-accent/50 text-sm font-medium">{reel.title}</p>
            </div>
          </div>
        </div>
      )}

      {showHeartPop && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-fade-in">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="#DC2626" stroke="#DC2626" className="animate-bounce">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
      )}

      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group" aria-label="Like">
          <div className={clsx(
            'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200',
            liked ? 'bg-danger/20' : 'bg-white/10 hover:bg-white/20'
          )}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? '#DC2626' : 'none'} stroke={liked ? '#DC2626' : 'white'} strokeWidth="2" className="transition-colors">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <span className="text-white/70 text-xs font-medium">{reel.likeCount ?? 0}</span>
        </button>

        <button onClick={() => onComment?.(reel.id)} className="flex flex-col items-center gap-1 group" aria-label="Comment">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <span className="text-white/70 text-xs font-medium">{reel.commentCount ?? 0}</span>
        </button>

        <button onClick={() => { setSaved(!saved); onSave?.(reel.id); }} className="flex flex-col items-center gap-1 group" aria-label="Save">
          <div className={clsx(
            'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200',
            saved ? 'bg-accent/20' : 'bg-white/10 hover:bg-white/20'
          )}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? '#D4A373' : 'none'} stroke="white" strokeWidth="2" className="transition-colors">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </div>
          <span className="text-white/70 text-xs font-medium">{reel.saveCount ?? 0}</span>
        </button>

        <button onClick={() => onShare?.(reel.id)} className="flex flex-col items-center gap-1 group" aria-label="Share">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </div>
          <span className="text-white/70 text-xs font-medium">{reel.shareCount ?? 0}</span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-6 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/${locale || 'en'}/creators/${reel.creator.id}`} className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
              {reel.creator.avatar ? (
                <img src={reel.creator.avatar} alt={reel.creator.name} className="w-full h-full object-cover" />
              ) : (
                reel.creator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              )}
            </div>
          </Link>
          <div className="min-w-0">
            <Link href={`/${locale || 'en'}/creators/${reel.creator.id}`} className="text-white font-medium text-sm hover:text-accent transition-colors">
              {reel.creator.name}
            </Link>
            <h2 className="text-white/90 text-sm font-serif mt-0.5 line-clamp-1">{reel.title}</h2>
          </div>
        </div>
        {reel.description && (
          <p className="text-white/60 text-xs line-clamp-2 mb-2">{reel.description}</p>
        )}
        {reel.tags && reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {reel.tags.map((tag) => (
              <Link key={tag} href={`/${locale || 'en'}/reels/explore?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="accent" size="sm" className="cursor-pointer hover:bg-accent/20 transition-colors">{tag}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center pb-1">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-[10px] text-accent/70 font-medium tracking-wider uppercase">Heritage Reels</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
}
