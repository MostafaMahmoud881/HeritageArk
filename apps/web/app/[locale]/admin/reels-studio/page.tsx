'use client';

import { useAuth, authenticatedFetch } from '@/lib/auth';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Badge } from '@heritageverse/ui';

type Creator = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

type Reel = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  status: string;
  tags: string[];
  language: string;
  category: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  creatorId: string;
  creator: Creator;
  createdAt: string;
  updatedAt: string;
};

type ReelStudioEntry = {
  id: string;
  reelId: string;
  status: string;
  scheduledAt: string | null;
  customThumbnailUrl: string | null;
  autoSubtitleGenerated: boolean;
  subtitleUrl: string | null;
  subtitleTracks: string | null;
  hashtags: string[];
  trendingAudioId: string | null;
  trendingAudio: string | null;
  reel: Reel;
  createdAt: string;
  updatedAt: string;
};

const STATUS_VARIANTS: Record<string, 'muted' | 'warning' | 'success' | 'navy' | 'accent'> = {
  draft: 'warning',
  scheduled: 'warning',
  published: 'success',
  private: 'navy',
  unlisted: 'accent',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  private: 'Private',
  unlisted: 'Unlisted',
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'de', label: 'German' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ur', label: 'Urdu' },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function ReelsStudioPage() {
  const { user, can } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  const [entries, setEntries] = useState<ReelStudioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ReelStudioEntry | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formThumbnail, setFormThumbnail] = useState<File | null>(null);
  const [formHashtags, setFormHashtags] = useState('');
  const [formLanguage, setFormLanguage] = useState('en');

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authenticatedFetch('/api/admin/reels-studio');
      if (!res.ok) throw new Error('Failed to load reels');
      const json = await res.json();
      setEntries(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function resetForm() {
    setFormTitle('');
    setFormDescription('');
    setFormFile(null);
    setFormThumbnail(null);
    setFormHashtags('');
    setFormLanguage('en');
  }

  async function handleUpload() {
    if (!formTitle.trim() || !formFile) return;
    try {
      setUploading(true);
      setError(null);
      const uploadFormData = new FormData();
      uploadFormData.append('file', formFile);
      if (formThumbnail) uploadFormData.append('thumbnail', formThumbnail);

      const uploadRes = await authenticatedFetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      if (!uploadRes.ok) throw new Error('File upload failed');
      const uploadData = await uploadRes.json();

      const hashtags = formHashtags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const reelBody: Record<string, any> = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        videoUrl: uploadData.url,
        hashtags,
        language: formLanguage,
        duration: uploadData.duration || 0,
      };

      if (uploadData.thumbnailUrl) reelBody.thumbnailUrl = uploadData.thumbnailUrl;

      const reelRes = await authenticatedFetch('/api/admin/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reelBody),
      });
      if (!reelRes.ok) throw new Error('Failed to create reel');
      const reelData = await reelRes.json();
      const reelId = reelData.data?.id || reelData.id;

      const studioRes = await authenticatedFetch('/api/admin/reels-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reelId,
          status: 'draft',
          hashtags,
        }),
      });
      if (!studioRes.ok) throw new Error('Failed to create studio entry');

      setShowUploadModal(false);
      resetForm();
      fetchEntries();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdateStatus(entry: ReelStudioEntry, newStatus: string) {
    try {
      setError(null);
      const res = await authenticatedFetch(`/api/admin/reels-studio/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchEntries();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(entry: ReelStudioEntry) {
    if (!confirm(`Delete "${entry.reel.title}"? This action cannot be undone.`)) return;
    try {
      setError(null);
      const res = await authenticatedFetch(`/api/admin/reels-studio/${entry.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete reel');
      fetchEntries();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!can('reels.view')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="mx-auto mb-4 text-muted" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" />
          </svg>
          <p className="text-muted text-lg">You don&apos;t have permission to access this page</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton-pulse rounded" />
        <div className="h-4 w-64 skeleton-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="aspect-[9/16] skeleton-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 skeleton-pulse rounded" />
                <div className="h-3 w-1/2 skeleton-pulse rounded" />
                <div className="flex items-center gap-4">
                  <div className="h-3 w-16 skeleton-pulse rounded" />
                  <div className="h-3 w-16 skeleton-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Reels Creator Studio</h1>
          <p className="text-muted mt-1">
            {entries.length} {entries.length === 1 ? 'reel' : 'reels'} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={() => setShowUploadModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Reel
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl px-5 py-3 text-danger text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          {error}
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <svg className="mx-auto mb-4 text-muted" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" />
          </svg>
          <h3 className="text-lg font-semibold text-navy mb-1">No reels yet</h3>
          <p className="text-muted mb-4">Upload your first reel to get started</p>
          <Button variant="primary" size="md" onClick={() => setShowUploadModal(true)}>
            Upload Reel
          </Button>
        </div>
      ) : (
        /* Reel Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-card transition-all group"
            >
              {/* Thumbnail */}
              <div className="aspect-[9/16] bg-muted/10 relative overflow-hidden">
                {(entry.customThumbnailUrl || entry.reel.thumbnailUrl) ? (
                  <img
                    src={entry.customThumbnailUrl || entry.reel.thumbnailUrl!}
                    alt={entry.reel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted/40">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                )}
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-navy/80 text-white text-xs font-mono px-2 py-0.5 rounded">
                  {formatDuration(entry.reel.duration)}
                </div>
                {/* Status badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant={STATUS_VARIANTS[entry.status] || 'muted'} size="sm">
                    {STATUS_LABELS[entry.status] || entry.status}
                  </Badge>
                </div>
                {/* Actions overlay on hover */}
                <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => { setEditingEntry(entry); setShowEditModal(true); }}
                    className="w-9 h-9 rounded-full bg-white/90 text-navy flex items-center justify-center hover:bg-white transition-colors"
                    title="Edit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(entry)}
                    className="w-9 h-9 rounded-full bg-white/90 text-danger flex items-center justify-center hover:bg-white transition-colors"
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-navy truncate mb-2">{entry.reel.title}</h3>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-3">
                  {entry.reel.creator.avatar ? (
                    <img
                      src={entry.reel.creator.avatar}
                      alt={entry.reel.creator.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] flex items-center justify-center font-semibold">
                      {entry.reel.creator.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-muted truncate">{entry.reel.creator.name}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    {formatCount(entry.reel.viewCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" /><polyline points="7 22 7 13" /></svg>
                    {formatCount(entry.reel.likeCount)}
                  </span>
                </div>

                {/* Date */}
                <p className="text-xs text-muted/60 mt-2">{formatDate(entry.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-card p-6 w-full max-w-lg mx-4 border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-navy">Upload Reel</h3>
              <button
                onClick={() => { setShowUploadModal(false); resetForm(); }}
                className="text-muted hover:text-navy transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Title"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Reel title"
              />

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Video File</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => setFormFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="reel-video-input"
                  />
                  <label htmlFor="reel-video-input" className="cursor-pointer">
                    {formFile ? (
                      <div className="text-left">
                        <p className="text-sm font-medium text-navy truncate">{formFile.name}</p>
                        <p className="text-xs text-muted mt-1">
                          {(formFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto mb-2 text-muted" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className="text-sm text-muted">Click to select a video file</p>
                        <p className="text-xs text-muted/60 mt-1">MP4, WebM, MOV supported</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Thumbnail (optional)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-accent/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFormThumbnail(e.target.files?.[0] || null)}
                    className="hidden"
                    id="reel-thumbnail-input"
                  />
                  <label htmlFor="reel-thumbnail-input" className="cursor-pointer">
                    {formThumbnail ? (
                      <div className="text-left">
                        <p className="text-sm font-medium text-navy truncate">{formThumbnail.name}</p>
                        <p className="text-xs text-muted mt-1">
                          {(formThumbnail.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted">Click to select thumbnail image</p>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y text-sm"
                  placeholder="Reel description"
                />
              </div>

              <Input
                label="Hashtags (comma separated)"
                value={formHashtags}
                onChange={e => setFormHashtags(e.target.value)}
                placeholder="heritage, culture, history"
              />

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Language</label>
                <select
                  value={formLanguage}
                  onChange={e => setFormLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-sm"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                size="md"
                onClick={() => { setShowUploadModal(false); resetForm(); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={uploading}
                disabled={!formTitle.trim() || !formFile}
                onClick={handleUpload}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-card p-6 w-full max-w-md mx-4 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-navy">Edit Reel</h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingEntry(null); }}
                className="text-muted hover:text-navy transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Status</label>
                <select
                  value={editingEntry.status}
                  onChange={e => {
                    setEditingEntry({ ...editingEntry, status: e.target.value });
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>

              <Input
                label="Hashtags"
                value={editingEntry.hashtags?.join(', ') || ''}
                onChange={e => setEditingEntry({ ...editingEntry, hashtags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="heritage, culture, history"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                size="md"
                onClick={() => { setShowEditModal(false); setEditingEntry(null); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={async () => {
                  await handleUpdateStatus(editingEntry, editingEntry.status);
                  setShowEditModal(false);
                  setEditingEntry(null);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
