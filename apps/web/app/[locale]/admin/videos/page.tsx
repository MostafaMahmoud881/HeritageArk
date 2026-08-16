'use client';

import { useAuth, getAccessToken } from '@/lib/auth';
import { getCsrfToken } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Badge } from '@heritageverse/ui';

type Creator = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

type Video = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  fileSize: number | null;
  mimeType: string | null;
  status: string;
  scheduledAt: string | null;
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

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUS_VARIANTS: Record<string, 'muted' | 'warning' | 'success' | 'navy' | 'accent'> = {
  draft: 'muted',
  scheduled: 'warning',
  published: 'success',
  private: 'navy',
  unlisted: 'accent',
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const CATEGORIES = [
  'Entertainment', 'Music', 'Education', 'Gaming', 'News',
  'Sports', 'Technology', 'Lifestyle', 'Travel', 'Other',
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'de', label: 'German' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ur', label: 'Urdu' },
];

export default function VideosPage() {
  const { user, can } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  const [videos, setVideos] = useState<Video[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formTags, setFormTags] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formLanguage, setFormLanguage] = useState('en');

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      const res = await fetch(`/api/admin/videos?page=${page}&limit=${meta.limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load videos');
      const json = await res.json();
      setVideos(json.data);
      setMeta(json.meta);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, meta.limit]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  function resetForm() {
    setFormTitle('');
    setFormDescription('');
    setFormFile(null);
    setFormTags('');
    setFormCategory('');
    setFormLanguage('en');
  }

  async function handleUpload() {
    if (!formTitle.trim() || !formFile) return;
    try {
      setUploading(true);
      setError(null);
      const token = getAccessToken();
      const xcsrf = getCsrfToken();

      const formData = new FormData();
      formData.append('file', formFile);
      const uploadHeaders: Record<string, string> = {};
      if (token) uploadHeaders['Authorization'] = `Bearer ${token}`;
      if (xcsrf) uploadHeaders['x-csrf-token'] = xcsrf;
      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: uploadHeaders,
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('File upload failed');
      const uploadData = await uploadRes.json();

      const tags = formTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const body: Record<string, any> = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        videoUrl: uploadData.url,
        tags,
        language: formLanguage,
        category: formCategory || undefined,
        duration: 0,
      };

      if (uploadData.duration) body.duration = uploadData.duration;
      if (uploadData.fileSize) body.fileSize = uploadData.fileSize;
      if (uploadData.mimeType) body.mimeType = uploadData.mimeType;
      if (uploadData.thumbnailUrl) body.thumbnailUrl = uploadData.thumbnailUrl;

      const videoHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) videoHeaders['Authorization'] = `Bearer ${token}`;
      if (xcsrf) videoHeaders['x-csrf-token'] = xcsrf;
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: videoHeaders,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create video');

      setShowUploadModal(false);
      resetForm();
      setPage(1);
      fetchVideos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(video: Video) {
    if (!confirm(`Delete "${video.title}"? This action cannot be undone.`)) return;
    try {
      setError(null);
      const token = getAccessToken();
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete video');
      fetchVideos();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!can('video.view')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="mx-auto mb-4 text-muted" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
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
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 skeleton-pulse rounded-lg" />
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
          <h1 className="text-3xl font-serif text-navy">Video Creator Studio</h1>
          <p className="text-muted mt-1">
            {meta.total} {meta.total === 1 ? 'video' : 'videos'} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={() => setShowUploadModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Video
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
      {videos.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <svg className="mx-auto mb-4 text-muted" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <h3 className="text-lg font-semibold text-navy mb-1">No videos yet</h3>
          <p className="text-muted mb-4">Upload your first video to get started</p>
          <Button variant="primary" size="md" onClick={() => setShowUploadModal(true)}>
            Upload Video
          </Button>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Thumbnail</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Creator</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Views</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Duration</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {videos.map(video => (
                  <tr key={video.id} className="hover:bg-bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-24 h-14 rounded-lg overflow-hidden bg-muted/10 shrink-0">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted/40">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-navy truncate max-w-[240px]">{video.title}</p>
                      {video.category && (
                        <p className="text-xs text-muted/70 mt-0.5">{video.category}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[video.status] || 'muted'} size="sm">
                        {video.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {video.creator.avatar ? (
                          <img
                            src={video.creator.avatar}
                            alt={video.creator.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-semibold">
                            {video.creator.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-navy truncate max-w-[120px]">{video.creator.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-navy">{formatViews(video.viewCount)}</td>
                    <td className="px-4 py-3 text-right text-sm text-muted font-mono">{formatDuration(video.duration)}</td>
                    <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">{formatDate(video.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.location.href = `/${locale}/admin/videos/${video.id}`;
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(video)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted">
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - meta.page) <= 2 || p === 1 || p === meta.totalPages)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-muted">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          p === meta.page
                            ? 'bg-accent text-navy'
                            : 'text-navy hover:bg-bg-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-card p-6 w-full max-w-lg mx-4 border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-navy">Upload Video</h3>
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
                placeholder="Video title"
              />

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Video File</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => setFormFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="video-file-input"
                  />
                  <label htmlFor="video-file-input" className="cursor-pointer">
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
                <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y text-sm"
                  placeholder="Video description"
                />
              </div>

              <Input
                label="Tags (comma separated)"
                value={formTags}
                onChange={e => setFormTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-sm"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
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
    </div>
  );
}
