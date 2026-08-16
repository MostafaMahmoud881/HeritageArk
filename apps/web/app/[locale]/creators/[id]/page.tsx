'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Badge } from '@heritageverse/ui';
import { useAuth } from '@/lib/auth';
import { ReelCard } from '@/components/Reels/ReelCard';
import { ReelSkeletonGrid } from '@/components/Reels/ReelSkeleton';

interface CreatorProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  reelCount: number;
  totalLikes: number;
  totalViews: number;
  isFollowing?: boolean;
  joinedAt?: string;
}

interface CreatorReel {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  viewCount: number;
  likeCount?: number;
  saveCount?: number;
  tags?: string[];
  createdAt?: string;
}

export default function CreatorProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const creatorId = params.id as string;
  const { user } = useAuth();

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [reels, setReels] = useState<CreatorReel[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReels, setLoadingReels] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        const res = await fetch(`/api/creators/${creatorId}`);
        if (!res.ok) throw new Error('Creator not found');
        const data = await res.json();
        setProfile(data);
        setFollowing(data.isFollowing || false);
        setFollowerCount(data.followerCount || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [creatorId]);

  useEffect(() => {
    const fetchReels = async () => {
      setLoadingReels(true);
      try {
        const res = await fetch(`/api/creators/${creatorId}/reels`);
        if (!res.ok) throw new Error('Failed to load reels');
        const data = await res.json();
        setReels(data.reels || []);
      } catch {
        setReels([]);
      } finally {
        setLoadingReels(false);
      }
    };
    fetchReels();
  }, [creatorId]);

  const handleFollow = async () => {
    if (!user) {
      window.location.href = `/${locale}/auth/login`;
      return;
    }
    setFollowing(!following);
    setFollowerCount((c) => following ? c - 1 : c + 1);
    try {
      await fetch(`/api/creators/${creatorId}/follow`, { method: 'POST' });
    } catch {}
  };

  if (loadingProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-muted/20" />
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-muted/20 rounded w-48" />
              <div className="h-3 bg-muted/20 rounded w-64" />
              <div className="h-3 bg-muted/20 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-muted/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted/30 mb-3">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 className="text-lg font-serif text-navy mb-1">Creator Not Found</h2>
          <p className="text-muted text-sm">{error || 'This creator could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-white text-2xl font-semibold shrink-0 overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-serif text-navy">{profile.name}</h1>
              {profile.bio && <p className="text-sm text-muted mt-1 max-w-lg">{profile.bio}</p>}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                <span><strong className="text-navy">{profile.followerCount.toLocaleString()}</strong> followers</span>
                <span><strong className="text-navy">{profile.followingCount.toLocaleString()}</strong> following</span>
                {profile.joinedAt && (
                  <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <Button
              variant={following ? 'ghost' : 'primary'}
              size="sm"
              onClick={handleFollow}
              className="shrink-0"
            >
              {following ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Reels', value: profile.reelCount },
          { label: 'Total Likes', value: profile.totalLikes },
          { label: 'Total Views', value: profile.totalViews },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-bg p-4 text-center">
            <p className="text-2xl font-serif text-navy">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {profile.reelCount === 0 ? (
        <div className="text-center py-12">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted/30 mb-3">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
          </svg>
          <h2 className="text-lg font-serif text-navy mb-1">No Reels Yet</h2>
          <p className="text-muted text-sm">{profile.name} hasn&apos;t uploaded any reels yet.</p>
        </div>
      ) : loadingReels ? (
        <ReelSkeletonGrid count={6} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
