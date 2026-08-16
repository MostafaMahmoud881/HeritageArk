'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input } from '@heritageverse/ui';
import { useAuth } from '@/lib/auth';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || 'en';
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0 || uploading) return;
    setUploading(true);

    for (const file of files) {
      if (file.status === 'done') continue;

      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'uploading' } : f));

      try {
        const formData = new FormData();
        formData.append('file', file.file);
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress } : f));
          }
        });

        await new Promise<void>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'done', progress: 100 } : f));
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          });
          xhr.addEventListener('error', () => reject(new Error('Network error')));
          xhr.open('POST', '/api/upload');
          xhr.send(formData);
        });
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'error', error: (err as Error).message } : f));
      }
    }

    setUploading(false);
  }, [files, uploading, title, description]);

  if (!user) {
    return (
      <div className="min-h-screen bg-bg pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-serif text-navy mb-2">Login required</h2>
          <p className="text-muted text-sm mb-4">You need to be logged in to upload files.</p>
          <Button onClick={() => router.push(`/${locale}/auth/login`)}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16 lg:pb-6">
      <div className="content-section">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <span className="text-accent text-sm font-semibold tracking-widest uppercase">Upload</span>
            <h1 className="text-4xl font-serif text-navy mt-2">Upload Files</h1>
            <p className="text-muted mt-3">Upload images, videos, audio, documents, and more.</p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 mb-6">
            <div className="mb-4">
              <label className="text-sm text-muted font-medium">Title (optional)</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Ancient artifact photo" className="mt-1" />
            </div>
            <div className="mb-6">
              <label className="text-sm text-muted font-medium">Description (optional)</label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your file..." className="mt-1" />
            </div>

            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-accent/5'
              }`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current?.click()}
            >
              <div className="text-4xl mb-3">📁</div>
              <p className="text-navy font-medium">Drop files here or click to browse</p>
              <p className="text-muted text-sm mt-1">Up to 500MB per file</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files) addFiles(e.target.files); }}
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-navy">{files.length} file{files.length > 1 ? 's' : ''}</h2>
                <Button onClick={uploadFiles} disabled={uploading} size="sm">
                  {uploading ? 'Uploading...' : 'Upload All'}
                </Button>
              </div>
              <div className="space-y-3">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-4 p-3 bg-bg rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-lg shrink-0">
                      {f.file.type.startsWith('image/') ? '🖼️' : f.file.type.startsWith('video/') ? '🎬' : f.file.type.startsWith('audio/') ? '🎵' : '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy truncate font-medium">{f.file.name}</p>
                      <p className="text-xs text-muted">{(f.file.size / 1024 / 1024).toFixed(1)} MB</p>
                      {f.status === 'uploading' && (
                        <div className="w-full h-1.5 bg-border rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                        </div>
                      )}
                      {f.status === 'error' && <p className="text-xs text-red-500 mt-1">{f.error || 'Upload failed'}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {f.status === 'done' && <span className="text-xs text-green-600 font-medium">Done</span>}
                      {f.status === 'error' && <button onClick={() => removeFile(f.id)} className="text-xs text-red-500 hover:underline">Remove</button>}
                      {f.status === 'pending' && (
                        <button onClick={() => removeFile(f.id)} className="text-muted hover:text-red-500 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-serif text-lg text-navy mb-3">Supported Formats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[
                { icon: '🖼️', label: 'Images', formats: 'JPEG, PNG, WebP, GIF' },
                { icon: '🎬', label: 'Videos', formats: 'MP4, WebM, MOV' },
                { icon: '🎵', label: 'Audio', formats: 'MP3, OGG, WAV' },
                { icon: '📄', label: 'Documents', formats: 'PDF, CSV, HTML' },
              ].map((cat) => (
                <div key={cat.label} className="p-3 bg-bg rounded-xl">
                  <div className="text-lg mb-1">{cat.icon}</div>
                  <p className="text-navy font-medium text-xs">{cat.label}</p>
                  <p className="text-muted text-xs mt-0.5">{cat.formats}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
