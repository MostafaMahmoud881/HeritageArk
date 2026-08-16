'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Badge } from '@heritageverse/ui';
import { getCsrfToken } from '@/lib/api';

interface MediaItem {
  id: number;
  name: string;
  type: string;
  dimensions: string;
  size: string;
  date: string;
  icon: string;
  bg: string;
}

type FilterType = 'all' | 'image' | 'document' | 'audio' | 'video';

export default function MediaPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/media');
        if (!res.ok) throw new Error('Failed to fetch media');
        const body = await res.json();
        setMediaItems(body.data ?? body);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = {};
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData, headers });
      if (!res.ok) throw new Error('Upload failed');
      const mediaRes = await fetch('/api/media');
      const mediaBody = await mediaRes.json();
      setMediaItems(mediaBody.data ?? mediaBody);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'image', label: 'Images' },
    { id: 'document', label: 'Documents' },
    { id: 'audio', label: 'Audio' },
    { id: 'video', label: 'Video' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Media Library</h1>
          <p className="text-muted mt-1">{loading ? 'Loading...' : `${mediaItems.length} assets`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={() => setShowAIModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 6-2-2-4-4-4-6a4 4 0 0 1 4-4z" /><path d="M12 22v-8" />
            </svg>
            AI Generate
          </Button>
          {can('media.upload') && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="primary"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search media..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-border p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === f.id ? 'bg-navy text-white' : 'text-muted hover:text-navy'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-xl">Error: {error}</div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="text-center py-12 text-muted">Loading media...</div>
      )}

      {/* Media Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-card transition-all text-left"
            >
              <div className={`aspect-square ${item.bg} flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-navy truncate">{item.name}</p>
                <p className="text-xs text-muted">{item.size}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bulk Upload Area */}
      {can('media.upload') && (
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/40 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-navy mb-1">Bulk Upload</h3>
          <p className="text-sm text-muted mb-4">Drag and drop files here or click to browse</p>
          <p className="text-xs text-muted/60">Supports: JPG, PNG, PDF, MP3, MP4, TIFF (Max 2GB each)</p>
        </div>
      )}

      {/* Detail Panel */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:text-navy transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className={`w-16 h-16 rounded-xl ${selectedItem.bg} flex items-center justify-center text-3xl`}>
                {selectedItem.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy break-all">{selectedItem.name}</h2>
                <Badge variant="accent" size="sm">{selectedItem.type}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-bg/50">
                <p className="text-muted text-xs">Dimensions</p>
                <p className="font-medium text-navy">{selectedItem.dimensions}</p>
              </div>
              <div className="p-3 rounded-lg bg-bg/50">
                <p className="text-muted text-xs">File Size</p>
                <p className="font-medium text-navy">{selectedItem.size}</p>
              </div>
              <div className="p-3 rounded-lg bg-bg/50">
                <p className="text-muted text-xs">Upload Date</p>
                <p className="font-medium text-navy">{selectedItem.date}</p>
              </div>
              <div className="p-3 rounded-lg bg-bg/50">
                <p className="text-muted text-xs">Copyright</p>
                <p className="font-medium text-navy">CC BY-SA 4.0</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="accent" size="sm">heritage</Badge>
                <Badge variant="accent" size="sm">cultural</Badge>
                <Badge variant="accent" size="sm">archive</Badge>
              </div>
            </div>

            <div className="flex gap-2 mt-5 pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="flex-1">Download</Button>
              <Button variant="danger" size="sm">Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAIModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowAIModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:text-navy transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-gold flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 6-2-2-4-4-4-6a4 4 0 0 1 4-4z" /><path d="M12 22v-8" /></svg>
              </div>
              <h2 className="text-lg font-semibold text-navy">AI Media Generator</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Describe what you want to generate</label>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="e.g., 'A watercolor painting of an ancient mosque in Mali'"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
              <div className="flex gap-2">
                <select className="flex-1 px-3 py-2.5 rounded-lg border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent/30">
                  <option>Photo-realistic</option>
                  <option>Watercolor</option>
                  <option>Oil Painting</option>
                  <option>Sketch</option>
                  <option>3D Render</option>
                </select>
                <select className="flex-1 px-3 py-2.5 rounded-lg border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent/30">
                  <option>1024×1024</option>
                  <option>1792×1024</option>
                  <option>1024×1792</option>
                </select>
              </div>
              <Button variant="primary" className="w-full" disabled={!aiPrompt.trim()}>
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
