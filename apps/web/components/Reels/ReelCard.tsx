'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@heritageverse/ui';
import clsx from 'clsx';

interface ReelCardProps {
  reel: {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    duration?: string;
    viewCount?: number;
    likeCount?: number;
    saveCount?: number;
    creator?: { id: string; name: string; avatar?: string };
    tags?: string[];
    language?: string;
  };
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  locale?: string;
}

export function ReelCard({ reel, onLike, onSave, locale }: ReelCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    onLike?.(reel.id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(reel.id);
  };

  return (
    <Link
      href={`/${locale || 'en'}/reels/${reel.id}`}
      className="group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-card transition-all duration-300 border border-border block"
    >
      <div className="aspect-[9/16] relative overflow-hidden bg-gradient-to-br from-navy via-navy2 to-navy">
        {reel.thumbnailUrl && (
          <img
            src={reel.thumbnailUrl}
            alt={reel.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        {reel.duration && (
          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md font-medium">
            {reel.duration}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-serif text-sm line-clamp-2">{reel.title}</h3>
            {reel.viewCount !== undefined && (
              <p className="text-white/60 text-xs mt-1">{reel.viewCount.toLocaleString()} views</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-navy group-hover:text-accent transition-colors line-clamp-1">
              {reel.title}
            </h3>
            {reel.creator && (
              <p className="text-xs text-muted mt-0.5">{reel.creator.name}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleLike} className="p-1 rounded-full hover:bg-accent/10 transition-colors" aria-label="Like">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#DC2626' : 'none'} stroke={liked ? '#DC2626' : 'currentColor'} strokeWidth="2" className="text-muted hover:text-danger transition-colors">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
            <button onClick={handleSave} className="p-1 rounded-full hover:bg-accent/10 transition-colors" aria-label="Save">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? '#D4A373' : 'none'} stroke="currentColor" strokeWidth="2" className="text-muted hover:text-accent transition-colors">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </button>
          </div>
        </div>
        {reel.tags && reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {reel.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="accent" size="sm">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
