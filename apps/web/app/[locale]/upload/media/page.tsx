'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Input, Badge } from '@heritageverse/ui';
import { useAuth } from '@/lib/auth';

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  status: string;
  createdAt: string;
  uploadedBy: { id: string; name: string; avatar: string | null };
}

export default function MediaUploadPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadFiles();
  }, [page, filter]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams({ page: String(page), limit: '20' });
      if (filter) urlParams.set('type', filter);
      const res = await fetch(`/api/upload?${urlParams}`);
      const d = await res.json();
      setFiles(d.data || []);
      setTotal(d.total || 0);
    } catch { setFiles([]); }
    setIsLoading(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = (type: string) => {
    if (type === 'image') return '🖼️';
    if (type === 'video') return '🎬';
    if (type === 'audio') return '🎵';
    return '📄';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-serif text-navy mb-2">Login required</h2>
          <p className="text-muted text-sm">You need to be logged in to view uploaded media.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16 lg:pb-6">
      <div className="content-section">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif text-navy">My Uploads</h1>
              <p className="text-muted text-sm mt-1">{total} file{total !== 1 ? 's' : ''}</p>
            </div>
            <Button onClick={() => window.location.href = `/${locale}/upload`}>Upload New</Button>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {['', 'image', 'video', 'audio'].map((t) => (
              <button key={t} onClick={() => { setFilter(t); setPage(1); }}>
                <Badge variant={filter === t ? 'accent' : 'muted'}>{t || 'All'}</Badge>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square skeleton-pulse rounded-xl" />
              ))}
            </div>
          ) : files.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((f) => (
                <div key={f.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-card transition-all duration-200 group">
                  <div className="aspect-square bg-gradient-to-br from-navy2 to-navy flex items-center justify-center text-4xl relative">
                    {f.thumbnailUrl ? (
                      <img src={f.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="opacity-40">{getIcon(f.type)}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-navy font-medium truncate">{f.originalName}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted">{formatSize(f.size)}</span>
                      <Badge variant="muted" size="sm">{f.type}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📁</div>
              <h3 className="text-xl font-serif text-navy mb-2">No files uploaded yet</h3>
              <p className="text-muted text-sm mb-4">Upload your first file to get started.</p>
              <Button onClick={() => window.location.href = `/${locale}/upload`}>Upload Files</Button>
            </div>
          )}

          {total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center text-sm text-muted px-3">{page} / {Math.ceil(total / 20)}</span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
