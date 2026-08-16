'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Badge } from '@heritageverse/ui';

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'reel_like', label: 'Likes' },
  { value: 'reel_comment', label: 'Comments' },
  { value: 'follow', label: 'Follows' },
];

const TYPE_ICONS: Record<string, string> = {
  reel_like: '❤️',
  reel_comment: '💬',
  follow: '👤',
  reel_follow: '👤',
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('heritageverse_access_token');
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const token = getAuthToken();

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // revert on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="content-section">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif text-navy">Notifications</h1>
              <p className="text-muted mt-1">
                {loading ? 'Loading...' : unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {NOTIFICATION_TYPES.map((t) => (
              <button key={t.value} onClick={() => setFilter(t.value)}>
                <Badge variant={filter === t.value ? 'accent' : 'muted'} size="md">
                  {t.label}
                </Badge>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted text-sm">Loading notifications...</p>
            </div>
          ) : !token ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-xl font-serif text-navy mb-2">Sign in to view notifications</h3>
              <p className="text-muted text-sm">Your notifications will appear here once you log in.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🔔</div>
              <h3 className="text-xl font-serif text-navy mb-2">No notifications</h3>
              <p className="text-muted text-sm">
                {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    notification.read
                      ? 'bg-white border-border'
                      : 'bg-accent/5 border-accent/20'
                  } hover:bg-accent/10`}
                >
                  <span className="text-xl mt-0.5 relative">
                    {TYPE_ICONS[notification.type] || '📄'}
                    {!notification.read && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${notification.read ? 'text-navy' : 'text-navy font-semibold'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-xs text-muted mt-0.5">{notification.message}</p>
                    )}
                    <p className="text-xs text-muted/60 mt-1">{formatTime(notification.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
