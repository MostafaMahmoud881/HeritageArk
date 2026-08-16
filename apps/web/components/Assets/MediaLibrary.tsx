'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button, Input } from '@heritageverse/ui';
import { getCsrfToken } from '@/lib/api';
import { isExternalAvailable, getSafeUrl, getFallbackIcon } from '@/lib/assets/fallback';

type AssetType = 'all' | 'image' | 'video' | 'audio' | 'document' | 'icon' | 'illustration' | '3d-model';

interface LibraryItem {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  thumbnailUrl?: string;
  size?: number;
  tags: string[];
  source: string;
  createdAt: string;
}

export default function MediaLibrary({
  onSelect,
  multiSelect = false,
  allowedTypes = ['all'],
}: {
  onSelect?: (items: LibraryItem[]) => void;
  multiSelect?: boolean;
  allowedTypes?: AssetType[];
}) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AssetType>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/upload');
      if (!res.ok) throw new Error('Failed to fetch media');
      const body = await res.json();
      const mapped: LibraryItem[] = (body.data || []).map((f: any) => ({
        id: f.id,
        name: f.originalName || f.name,
        type: f.type || 'document',
        url: f.url,
        thumbnailUrl: f.thumbnailUrl || (f.type === 'image' ? f.url : undefined),
        size: f.size,
        tags: f.tags || [],
        source: f.source || 'local-upload',
        createdAt: f.createdAt,
      }));
      setItems(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filter === 'all' || item.type === filter;
    const matchesAllowed = allowedTypes.includes('all') || allowedTypes.includes(item.type);
    return matchesSearch && matchesType && matchesAllowed;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (!multiSelect) next.clear();
      next.add(id);
    }
    setSelected(next);
  };

  const confirmSelection = () => {
    const selectedItems = items.filter(i => selected.has(i.id));
    onSelect?.(selectedItems);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = {};
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch('/api/upload', { method: 'POST', body: formData, headers });
      if (!res.ok) throw new Error('Upload failed');
      await fetchItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(f => handleUpload(f));
  }, []);

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(f => handleUpload(f));
    e.target.value = '';
  };

  const filters: { id: AssetType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { id: 'image', label: 'Images', icon: 'M2 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'video', label: 'Video', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'audio', label: 'Audio', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
    { id: 'document', label: 'Documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: '3d-model', label: '3D Models', icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9' },
  ];

  if (!isExternalAvailable()) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
        You are currently offline. Showing locally cached media only.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search media..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                filter === f.id ? 'bg-navy text-white' : 'text-muted hover:text-navy'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
          className="p-2 rounded-lg border border-border text-muted hover:text-navy transition-colors"
          aria-label="Toggle view"
        >
          {viewMode === 'grid' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-3 rounded-xl text-sm">{error}</div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-bg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <p className="text-navy font-medium">No media found</p>
          <p className="text-muted text-sm mt-1">Upload files or adjust your search</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => fileInputRef.current?.click()}>
            Upload Files
          </Button>
        </div>
      )}

      {!loading && filteredItems.length > 0 && (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'
          : 'space-y-1'
        }>
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`group relative rounded-xl border overflow-hidden transition-all text-left ${
                selected.has(item.id)
                  ? 'ring-2 ring-accent border-accent'
                  : 'border-border hover:shadow-card hover:border-accent/30'
              } ${viewMode === 'list' ? 'flex items-center gap-3 p-3' : ''}`}
            >
              {selected.has(item.id) && (
                <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}

              {viewMode === 'grid' && (
                <>
                  <div className="aspect-square bg-bg flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : item.type === 'image' ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-3xl opacity-40">
                        {item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : item.type === '3d-model' ? '🧊' : item.type === 'icon' ? '🎨' : '📄'}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-navy truncate">{item.name}</p>
                    <p className="text-[10px] text-muted mt-0.5">{item.type}</p>
                  </div>
                </>
              )}

              {viewMode === 'list' && (
                <>
                  <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center shrink-0 text-lg">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span>{item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : '📄'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-navy truncate">{item.name}</p>
                    <p className="text-xs text-muted">{item.type} · {item.source}</p>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragOver ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-border hover:border-accent/40'
        }`}
      >
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleBrowse} />
        <div className="flex flex-col items-center gap-2">
          <svg className={`w-8 h-8 text-accent/60 transition-transform ${dragOver ? 'scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-navy font-medium">
            {dragOver ? 'Drop files here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted">Images, videos, audio, 3D models, and documents</p>
        </div>
      </div>

      {multiSelect && selected.size > 0 && (
        <div className="flex items-center justify-between bg-accent/5 rounded-xl p-3 border border-accent/20">
          <p className="text-sm text-navy font-medium">{selected.size} selected</p>
          <Button variant="primary" size="sm" onClick={confirmSelection}>
            Confirm Selection
          </Button>
        </div>
      )}
    </div>
  );
}
