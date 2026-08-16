'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@heritageverse/ui';
import { useAuth } from '@/lib/auth';
import clsx from 'clsx';

interface HistoryItem {
  id: string;
  reelId: string;
  title: string;
  thumbnailUrl?: string;
  creator: { id: string; name: string };
  watchedAt: string;
  duration?: string;
}

interface GroupedHistory {
  label: string;
  items: HistoryItem[];
}

function groupHistory(items: HistoryItem[]): GroupedHistory[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: { label: string; items: HistoryItem[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'This Week', items: [] },
    { label: 'Earlier', items: [] },
  ];

  for (const item of items) {
    const date = new Date(item.watchedAt);
    if (date >= today) groups[0]!.items.push(item);
    else if (date >= yesterday) groups[1]!.items.push(item);
    else if (date >= weekAgo) groups[2]!.items.push(item);
    else groups[3]!.items.push(item);
  }

  return groups.filter((g) => g.items.length > 0);
}

export default function HistoryPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/reels/history');
        if (!res.ok) throw new Error('Failed to load history');
        const data = await res.json();
        setHistory(data.history || []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleClear = async () => {
    setClearing(true);
    try {
      await fetch('/api/reels/history', { method: 'DELETE' });
      setHistory([]);
    } catch {}
    setClearing(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString();
  };

  const grouped = groupHistory(history);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">History</span>
          <h1 className="text-3xl md:text-4xl font-serif text-navy mt-2">Watch History</h1>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} loading={clearing}>
            Clear All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((g) => (
            <div key={g} className="space-y-3">
              <div className="h-4 w-20 bg-muted/20 rounded animate-pulse" />
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-20 h-28 rounded-lg bg-muted/20 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-muted/20 rounded w-3/4" />
                    <div className="h-2 bg-muted/20 rounded w-1/2" />
                    <div className="h-2 bg-muted/20 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted/30 mb-4">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h2 className="text-lg font-serif text-navy mb-1">No Watch History</h2>
          <p className="text-muted text-sm mb-4">Your watch history will appear here</p>
          <Link href={`/${locale}/reels`}>
            <Button variant="outline" size="sm">Browse Reels</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-medium text-muted mb-3 uppercase tracking-wider">{group.label}</h3>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}/reels/${item.reelId}`}
                    className="flex gap-3 group rounded-xl p-2 hover:bg-bg transition-colors"
                  >
                    <div className="w-20 h-28 rounded-lg overflow-hidden bg-gradient-to-br from-navy via-navy2 to-navy shrink-0 relative">
                      {item.thumbnailUrl && (
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                      )}
                      {item.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {item.duration}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="text-sm font-medium text-navy group-hover:text-accent transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted mt-1">{item.creator.name}</p>
                      <p className="text-xs text-muted/60 mt-1">{formatTime(item.watchedAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
