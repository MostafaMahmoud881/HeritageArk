'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Badge } from '@heritageverse/ui';
import { useAuth, getAccessToken } from '@/lib/auth';
import { getCsrfToken } from '@/lib/api';
import clsx from 'clsx';

const CULTURAL_TAGS = [
  'Music', 'Dance', 'Cuisine', 'Textile', 'Architecture',
  'Ceremony', 'Festival', 'Language', 'Craft', 'Ritual',
  'Storytelling', 'Medicine', 'Agriculture', 'Maritime',
  'Warfare', 'Calligraphy', 'Pottery', 'Sculpture', 'Painting',
];

const LANGUAGES = [
  'English', 'Arabic', 'French', 'Italian', 'Spanish',
  'Hindi', 'Mandarin', 'Swahili', 'Portuguese', 'Russian',
  'Turkish', 'Persian', 'Urdu', 'Bengali', 'Japanese',
];

export default function UploadReelPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [references, setReferences] = useState<{ title: string; url: string }[]>([{ title: '', url: '' }]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) setSelectedTags((prev) => [...prev, tag]);
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const addReference = () => {
    setReferences((prev) => [...prev, { title: '', url: '' }]);
  };

  const updateReference = (index: number, field: 'title' | 'url', value: string) => {
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref))
    );
  };

  const removeReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    setUploadingFile(true);
    setError(null);
    try {
      const token = getAccessToken();
      const formData = new FormData();
      formData.append('file', file);
      const uploadHeaders: Record<string, string> = {};
      if (token) uploadHeaders['Authorization'] = `Bearer ${token}`;
      const csrfToken = getCsrfToken();
      if (csrfToken) uploadHeaders['x-csrf-token'] = csrfToken;
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: uploadHeaders,
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'File upload failed');
      }
      const data = await res.json();
      return data.url;
    } catch (err) {
      throw err;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !language) {
      setError('Please fill in all required fields');
      return;
    }
    if (uploadMethod === 'url' && !videoUrl) {
      setError('Please provide a video URL');
      return;
    }
    if (uploadMethod === 'file' && !videoFile) {
      setError('Please select a video file');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let finalUrl = videoUrl;
      if (uploadMethod === 'file' && videoFile) {
        finalUrl = await handleFileUpload(videoFile);
      }
      const csrfToken2 = getCsrfToken();
      const reelHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (csrfToken2) reelHeaders['x-csrf-token'] = csrfToken2;
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: reelHeaders,
        body: JSON.stringify({
          videoUrl: finalUrl,
          title,
          description,
          language,
          tags: selectedTags,
          researchReferences: references.filter((r) => r.title && r.url),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to upload reel');
      }
      const data = await res.json();
      router.push(`/${locale}/reels/${data.id || data.data?.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputValid = uploadMethod === 'url' ? videoUrl : videoFile;
  const canGoNext = inputValid && title;
  const isStep1 = step === 1;
  const isStep2 = step === 2;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      <div className="mb-8">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">Create</span>
        <h1 className="text-3xl md:text-4xl font-serif text-navy mt-2">Upload Reel</h1>
        <p className="text-muted text-sm mt-2">Share your cultural heritage story with the world</p>
      </div>

      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
              step >= s ? 'bg-accent text-navy' : 'bg-border text-muted'
            )}>
              {s}
            </div>
            <span className={clsx('text-sm font-medium', step >= s ? 'text-navy' : 'text-muted')}>
              {s === 1 ? 'Details' : 'Metadata'}
            </span>
            {s < 2 && <div className="w-12 h-px bg-border" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isStep1 && (
          <div className="space-y-5 animate-fade-in">
            {/* Upload method toggle */}
            <div className="flex items-center gap-2 bg-bg rounded-lg p-1 border border-border w-fit">
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${uploadMethod === 'url' ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'}`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${uploadMethod === 'file' ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'}`}
              >
                From Device
              </button>
            </div>

            {uploadMethod === 'url' ? (
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Video URL <span className="text-danger">*</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
                <p className="text-xs text-muted mt-1">Paste a direct video URL. Max 500MB.</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Video File <span className="text-danger">*</span>
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="reel-video-file-input"
                  />
                  <label htmlFor="reel-video-file-input" className="cursor-pointer">
                    {videoFile ? (
                      <div className="text-left">
                        <p className="text-sm font-medium text-navy truncate">{videoFile.name}</p>
                        <p className="text-xs text-muted mt-1">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
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
                {uploadingFile && <p className="text-xs text-accent mt-1">Uploading...</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your reel a compelling title"
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
              <p className="text-xs text-muted mt-1 text-right">{title.length}/120</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the story behind this cultural heritage..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-none"
              />
              <p className="text-xs text-muted mt-1 text-right">{description.length}/500</p>
            </div>

            {(videoUrl || videoFile) && title && (
              <div className="rounded-xl border border-border overflow-hidden bg-bg p-4">
                <h3 className="text-sm font-medium text-navy mb-3">Preview</h3>
                <div className="aspect-[9/16] max-w-[200px] mx-auto rounded-lg overflow-hidden bg-gradient-to-br from-navy via-navy2 to-navy flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-10 h-10 mx-auto rounded-full border-2 border-accent/30 flex items-center justify-center mb-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A373" strokeWidth="1.5">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <p className="text-accent/70 text-xs font-medium line-clamp-2">{title}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canGoNext}
              >
                Next: Metadata
              </Button>
            </div>
          </div>
        )}

        {isStep2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="relative">
              <label className="block text-sm font-medium text-navy mb-1.5">
                Language <span className="text-danger">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-left text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors flex items-center justify-between"
              >
                <span className={language ? 'text-navy' : 'text-muted/50'}>
                  {language || 'Select language'}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {showLanguageDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-card border border-border max-h-48 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => { setLanguage(lang); setShowLanguageDropdown(false); }}
                      className={clsx(
                        'w-full text-left px-4 py-2 text-sm hover:bg-accent/5 transition-colors',
                        language === lang ? 'text-accent font-medium' : 'text-navy'
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">
                Cultural Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm border border-accent/20">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-danger transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {CULTURAL_TAGS.filter((t) => !selectedTags.includes(t)).map((tag) => (
                  <button key={tag} type="button" onClick={() => addTag(tag)}>
                    <Badge variant="muted" size="sm" className="cursor-pointer hover:bg-accent/20 hover:text-accent hover:border-accent/20 transition-all">
                      + {tag}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">
                Research References
              </label>
              <div className="space-y-3">
                {references.map((ref, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={ref.title}
                        onChange={(e) => updateReference(i, 'title', e.target.value)}
                        placeholder="Reference title"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                      />
                      <input
                        type="url"
                        value={ref.url}
                        onChange={(e) => updateReference(i, 'url', e.target.value)}
                        placeholder="https://... (URL)"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                      />
                    </div>
                    {references.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReference(i)}
                        className="p-1.5 rounded-full hover:bg-danger/10 text-muted hover:text-danger transition-colors mt-1"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addReference}
                className="mt-2 text-sm text-accent hover:underline flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Add reference
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting}>
                Publish Reel
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
