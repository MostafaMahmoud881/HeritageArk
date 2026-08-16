'use client';

import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Input, Badge } from '@heritageverse/ui';

type Branding = {
  id: string;
  siteName: string;
  tagline: string;
  logo: string | null;
  logoDark: string | null;
  favicon: string | null;
  appIcon: string | null;
  splashScreen: string | null;
  watermark: string | null;
  ogImage: string | null;
  ogTitle: string;
  ogDescription: string;
  twitterHandle: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('heritageverse_access_token');
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function BrandingPage() {
  const { user } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [branding, setBranding] = useState<Branding>({
    id: '',
    siteName: '',
    tagline: '',
    logo: null,
    logoDark: null,
    favicon: null,
    appIcon: null,
    splashScreen: null,
    watermark: null,
    ogImage: null,
    ogTitle: '',
    ogDescription: '',
    twitterHandle: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  const logoRef = useRef<HTMLInputElement>(null!);
  const logoDarkRef = useRef<HTMLInputElement>(null!);
  const faviconRef = useRef<HTMLInputElement>(null!);
  const appIconRef = useRef<HTMLInputElement>(null!);
  const splashRef = useRef<HTMLInputElement>(null!);
  const watermarkRef = useRef<HTMLInputElement>(null!);
  const ogImageRef = useRef<HTMLInputElement>(null!);

  const fetchBranding = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/branding', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load branding');
      const data = await res.json();
      if (data) setBranding(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  async function handleFileUpload(
    file: File,
    field: keyof Branding,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) {
    try {
      setUploading(field as string);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setBranding(prev => ({ ...prev, [field]: url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(branding),
      });
      if (!res.ok) throw new Error('Failed to save branding');
      setSuccess('Branding saved successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function renderUploadSection(
    label: string,
    field: keyof Branding,
    inputRef: React.RefObject<HTMLInputElement | null>,
    previewClass = ''
  ) {
    const url = branding[field] as string | null;
    const isUploading = uploading === field;

    return (
      <div className="flex items-center gap-4">
        <div className={`shrink-0 ${previewClass || 'w-20 h-20'} bg-bg rounded-lg border border-border overflow-hidden flex items-center justify-center`}>
          {url ? (
            <img src={url} alt={label} className="w-full h-full object-contain" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted/50">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-navy mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef as React.LegacyRef<HTMLInputElement>}
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, field, inputRef);
              }}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              loading={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {url ? 'Replace' : 'Upload'}
            </Button>
            {url && (
              <button
                onClick={() => setBranding(prev => ({ ...prev, [field]: null }))}
                className="text-xs text-danger hover:text-danger/80 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-32 skeleton-pulse rounded" />
        <div className="h-4 w-56 skeleton-pulse rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-6 space-y-4">
            <div className="h-5 w-36 skeleton-pulse rounded" />
            <div className="h-10 w-full skeleton-pulse rounded-lg" />
            <div className="h-20 w-full skeleton-pulse rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Branding</h1>
          <p className="text-muted mt-1">Manage your brand identity, logos, and SEO metadata</p>
        </div>
        <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          Save Branding
        </Button>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl px-5 py-3 text-danger text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success/10 border border-success/20 rounded-xl px-5 py-3 text-success text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {success}
        </div>
      )}

      {/* Site Info */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">Site Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Site Name"
            value={branding.siteName}
            onChange={e => setBranding(prev => ({ ...prev, siteName: e.target.value }))}
            placeholder="HeritageArk"
          />
          <Input
            label="Tagline"
            value={branding.tagline}
            onChange={e => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
            placeholder="Preserving the Past, Inspiring the Future"
          />
        </div>
      </div>

      {/* Logos */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy mb-4">Logos</h2>
        {renderUploadSection('Site Logo', 'logo', logoRef)}
        {renderUploadSection('Logo (Dark Mode)', 'logoDark', logoDarkRef)}
        {renderUploadSection('Favicon', 'favicon', faviconRef, 'w-10 h-10')}
        {renderUploadSection('App Icon', 'appIcon', appIconRef)}
        {renderUploadSection('Splash Screen', 'splashScreen', splashRef, 'w-32 h-20')}
        {renderUploadSection('Watermark', 'watermark', watermarkRef, 'w-24 h-16')}
      </div>

      {/* Social Sharing */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">Social Sharing</h2>
        <div className="space-y-4">
          {renderUploadSection('OG Image (1200x630)', 'ogImage', ogImageRef, 'w-32 h-20')}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="OG Title"
              value={branding.ogTitle}
              onChange={e => setBranding(prev => ({ ...prev, ogTitle: e.target.value }))}
              placeholder="HeritageArk - Preserving the Past"
            />
            <Input
              label="Twitter Handle"
              value={branding.twitterHandle}
              onChange={e => setBranding(prev => ({ ...prev, twitterHandle: e.target.value }))}
              placeholder="@HeritageArk"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">OG Description</label>
            <textarea
              value={branding.ogDescription}
              onChange={e => setBranding(prev => ({ ...prev, ogDescription: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
              placeholder="HeritageArk is a platform dedicated to preserving and sharing cultural heritage..."
            />
          </div>
        </div>
      </div>

      {/* SEO Defaults */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">SEO Defaults</h2>
        <div className="space-y-4">
          <Input
            label="Default Meta Title"
            value={branding.metaTitle}
            onChange={e => setBranding(prev => ({ ...prev, metaTitle: e.target.value }))}
            placeholder="HeritageArk - Preserving the Past, Inspiring the Future"
          />
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Default Meta Description</label>
            <textarea
              value={branding.metaDescription}
              onChange={e => setBranding(prev => ({ ...prev, metaDescription: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
              placeholder="Discover, explore, and contribute to the rich tapestry of world heritage..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Meta Keywords</label>
            <textarea
              value={branding.metaKeywords}
              onChange={e => setBranding(prev => ({ ...prev, metaKeywords: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
              placeholder="heritage, culture, history, archaeology, preservation"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
