'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Input } from '@heritageverse/ui';
import { useAuth } from '@/lib/auth';
import { getCsrfToken } from '@/lib/api';
import clsx from 'clsx';

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReelCommentSheetProps {
  reelId: string;
  open: boolean;
  onClose: () => void;
}

export function ReelCommentSheet({ reelId, open, onClose }: ReelCommentSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchComments();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, reelId]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reels/${reelId}/comment`);
      if (!res.ok) throw new Error('Failed to load comments');
      const body = await res.json();
      setComments(body.data || body.comments || []);
      setError('Could not load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch(`/api/reels/${reelId}/comment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: newComment.trim() }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const body = await res.json();
      setComments((prev) => [body.data || body.comment || body, ...prev]);
      setNewComment('');
    } catch {
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-navy font-semibold text-base">
            Comments {comments.length > 0 && <span className="text-muted font-normal">({comments.length})</span>}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-bg transition-colors" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted/20 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted/20 rounded w-24" />
                    <div className="h-3 bg-muted/20 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted text-sm">{error}</p>
              <button onClick={fetchComments} className="text-accent text-sm mt-2 hover:underline">
                Retry
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted/40 mb-3">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <p className="text-muted text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden">
                  {comment.user.avatar ? (
                    <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                  ) : (
                    comment.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-navy">{comment.user.name}</span>
                    <span className="text-xs text-muted">{formatTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-navy/80 mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border px-4 py-3">
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || submitting}
                loading={submitting}
              >
                Post
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted text-center">
              <a href="/auth/login" className="text-accent hover:underline">Log in</a> to leave a comment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
