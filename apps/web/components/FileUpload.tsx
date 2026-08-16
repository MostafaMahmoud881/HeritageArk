'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';

const ACCEPTED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
};

const ACCEPT_STRING = Object.keys(ACCEPTED_TYPES).join(',');
const MAX_SIZE = 50 * 1024 * 1024;

type FileStatus = 'pending' | 'uploading' | 'done' | 'error';

interface UploadItem {
  id: string;
  file: File;
  preview: string | null;
  previewType: 'image' | 'video' | 'document' | null;
  progress: number;
  status: FileStatus;
  error?: string;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getPreviewType(file: File): UploadItem['previewType'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'document';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addItems = useCallback((fileList: FileList) => {
    const newItems: UploadItem[] = [];

    for (const file of Array.from(fileList)) {
      if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
        continue;
      }

      if (file.size > MAX_SIZE) {
        newItems.push({
          id: generateId(),
          file,
          preview: null,
          previewType: null,
          progress: 0,
          status: 'error',
          error: `File exceeds 50 MB limit (${formatSize(file.size)})`,
        });
        continue;
      }

      const previewType = getPreviewType(file);
      let preview: string | null = null;

      if (previewType === 'image' || previewType === 'video') {
        preview = URL.createObjectURL(file);
      }

      newItems.push({
        id: generateId(),
        file,
        preview,
        previewType,
        progress: 0,
        status: 'pending',
      });
    }

    setItems(prev => [...prev, ...newItems]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  }, []);

  const uploadItem = useCallback(async (item: UploadItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i));

    const formData = new FormData();
    formData.append('file', item.file);

    try {
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress } : i));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'done', progress: 100 } : i));
            resolve();
          } else {
            let message = `Upload failed (${xhr.status})`;
            try {
              const body = JSON.parse(xhr.responseText);
              if (body.error) message = body.error;
            } catch {}
            reject(new Error(message));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
    } catch (err) {
      setItems(prev => prev.map(i => i.id === item.id ? {
        ...i,
        status: 'error',
        error: (err as Error).message,
        progress: 0,
      } : i));
    }
  }, []);

  const uploadAll = useCallback(async () => {
    setIsUploading(true);
    const pending = items.filter(i => i.status === 'pending' || i.status === 'error');
    for (const item of pending) {
      await uploadItem(item);
    }
    setIsUploading(false);
  }, [items, uploadItem]);

  const retry = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (item) uploadItem(item);
  }, [items, uploadItem]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addItems(e.dataTransfer.files);
    }
  }, [addItems]);

  const handleBrowse = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addItems(e.target.files);
      e.target.value = '';
    }
  }, [addItems]);

  const hasFiles = items.length > 0;
  const pendingCount = items.filter(i => i.status === 'pending' || i.status === 'error').length;

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
          isDragging
            ? 'border-accent bg-accent/10 scale-[1.01]'
            : 'border-border hover:border-accent/50 hover:bg-accent/5'
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-accent/5 ring-2 ring-accent ring-offset-2 ring-offset-bg" />
        )}

        <div className={`relative transition-transform duration-200 ${isDragging ? 'scale-110' : ''}`}>
          <svg
            className="mx-auto h-12 w-12 text-accent/60 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>

          <p className="text-navy font-medium text-base">
            {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
          </p>
          <p className="text-muted text-sm mt-1">
            Images, videos & documents up to 50 MB each
          </p>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              JPG · PNG · WebP · SVG
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              MP4 · MOV · WebM
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              PDF · DOCX · PPTX
            </span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_STRING}
          className="hidden"
          onChange={handleBrowse}
        />
      </div>

      {hasFiles && (
        <div className="mt-6 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-serif text-navy text-base">
              {items.length} file{items.length !== 1 ? 's' : ''} selected
            </h3>
            <button
              onClick={uploadAll}
              disabled={isUploading || pendingCount === 0}
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isUploading ? 'Uploading...' : `Upload ${pendingCount > 0 ? `(${pendingCount})` : ''}`}
            </button>
          </div>

          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg/50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-bg overflow-hidden shrink-0 flex items-center justify-center">
                  {item.previewType === 'image' && item.preview ? (
                    <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  ) : item.previewType === 'video' && item.preview ? (
                    <video src={item.preview} className="w-full h-full object-cover" muted />
                  ) : (
                    <span className="text-2xl">📄</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-navy font-medium truncate">{item.file.name}</p>
                  <p className="text-xs text-muted mt-0.5">{formatSize(item.file.size)}</p>

                  {item.status === 'uploading' && (
                    <div className="w-full h-1.5 bg-border rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {item.status === 'error' && (
                    <p className="text-xs text-danger mt-1">{item.error || 'Upload failed'}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'done' && (
                    <span className="flex items-center gap-1 text-xs text-success font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Done
                    </span>
                  )}

                  {item.status === 'error' && (
                    <button
                      onClick={() => retry(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                      Retry
                    </button>
                  )}

                  {(item.status === 'pending' || item.status === 'error') && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
