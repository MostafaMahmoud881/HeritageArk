'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Badge } from '@heritageverse/ui';
import Link from 'next/link';

export default function AIVideoStudioPage() {
  const { user, can } = useAuth();

  const [providers, setProviders] = useState<any[]>([]);
  const [creditBalance, setCreditBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Form state
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [quality, setQuality] = useState('standard');
  const [style, setStyle] = useState('');
  const [mode, setMode] = useState<'text-to-video' | 'image-to-video' | 'story-to-video'>('text-to-video');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [storyText, setStoryText] = useState('');

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [provRes, creditRes, historyRes] = await Promise.all([
        fetch('/api/admin/ai/providers'),
        fetch('/api/admin/ai/credits'),
        fetch('/api/admin/ai/generate/history?limit=10'),
      ]);
      if (provRes.ok) { const d = await provRes.json(); setProviders(d.data ?? []); }
      if (creditRes.ok) {
        const d = await creditRes.json();
        const myCredit = (d.data ?? []).find((c: any) => c.userId === user?.id);
        setCreditBalance(myCredit || null);
      }
      if (historyRes.ok) { const d = await historyRes.json(); setHistory(d.data ?? []); }
    } catch (err) {
      setError('Failed to load studio data');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveProvider = providers.some(p => p.enabled && p.apiKeys?.length > 0);
  const hasCredits = creditBalance && creditBalance.videoCredits > 0;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setResult(null);
    setError(null);

    let imageUrl = '';
    if (mode === 'image-to-video' && imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      const uploadRes = await fetch('/api/media/upload', { method: 'POST', body: formData });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url || '';
      }
    }

    try {
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mode,
          prompt,
          negativePrompt: negativePrompt || undefined,
          imageUrl: imageUrl || undefined,
          storyText: mode === 'story-to-video' ? storyText : undefined,
          duration,
          aspectRatio,
          quality,
          style: style || undefined,
          language: 'en',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.data || data);
        loadData(); // refresh credits
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError('Failed to generate video');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="skeleton-pulse h-10 w-64 rounded-lg" />
          <div className="skeleton-pulse h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const stylePresets = ['cinematic', 'documentary', 'animated', 'watercolor', 'pixel-art', 'cultural-heritage'];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-navy">AI Video Studio</h1>
            <p className="text-muted mt-1">Generate stunning heritage videos with AI</p>
          </div>
          <div className="flex items-center gap-3">
            {creditBalance && (
              <Badge variant={hasCredits ? 'success' : 'danger'} size="sm">
                {creditBalance.videoCredits} video credits
              </Badge>
            )}
            {!hasActiveProvider && (
              <Badge variant="warning" size="sm">No Active Provider</Badge>
            )}
          </div>
        </div>

        {/* No provider warning */}
        {!hasActiveProvider && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-6 text-center">
            <p className="text-warning font-medium text-lg mb-1">Connect an AI provider to activate video generation.</p>
            <p className="text-muted text-sm">Go to <Link href="/admin/ai-settings" className="text-accent underline">AI Settings</Link> to add an API key.</p>
            <div className="mt-4 p-4 bg-white/50 rounded-lg border border-warning/10">
              <p className="text-sm text-muted">Using simulation mode — generated videos will be placeholders until a provider is configured.</p>
            </div>
          </div>
        )}

        {/* Generation Mode Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 w-fit">
          {(['text-to-video', 'image-to-video', 'story-to-video'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${mode === m ? 'bg-navy text-white' : 'text-muted hover:text-navy'}`}>
              {m.replace(/-/g, ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generation Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-border p-5 space-y-4">
              <h2 className="text-lg font-semibold text-navy">Prompt</h2>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Describe your video</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g., A cinematic aerial view of an ancient mosque at sunset, with golden light reflecting off minarets..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>

              {/* Negative Prompt */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Negative Prompt (optional)</label>
                <textarea
                  value={negativePrompt}
                  onChange={e => setNegativePrompt(e.target.value)}
                  placeholder="e.g., blurry, low quality, distorted faces"
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>

              {/* Image Upload (for image-to-video) */}
              {mode === 'image-to-video' && (
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Source Image</label>
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/40 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        <p className="text-xs text-muted">Click to change image</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted">Upload an image to animate</p>
                        <p className="text-xs text-muted/60 mt-1">JPG, PNG, WebP (Max 10MB)</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </div>
                </div>
              )}

              {/* Story Input (for story-to-video) */}
              {mode === 'story-to-video' && (
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Story / Script</label>
                  <textarea
                    value={storyText}
                    onChange={e => setStoryText(e.target.value)}
                    placeholder="Paste your story or script here. The AI will generate matching visuals..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Duration: {duration}s</label>
                <input
                  type="range"
                  min={3} max={60} step={1}
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>3s</span><span>60s</span>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Aspect Ratio</label>
                <div className="flex gap-2">
                  {['16:9', '9:16', '1:1', '4:3', '21:9'].map(ratio => (
                    <button key={ratio} onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${aspectRatio === ratio ? 'bg-navy text-white border-navy' : 'bg-white text-muted border-border hover:border-accent'}`}>
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Quality</label>
                <div className="flex gap-2">
                  {['standard', 'high', 'ultra'].map(q => (
                    <button key={q} onClick={() => setQuality(q)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors ${quality === q ? 'bg-navy text-white border-navy' : 'bg-white text-muted border-border hover:border-accent'}`}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Style (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {stylePresets.map(s => (
                    <button key={s} onClick={() => setStyle(style === s ? '' : s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors ${style === s ? 'bg-accent text-white border-accent' : 'bg-white text-muted border-border hover:border-accent'}`}>
                      {s.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                loading={generating}
                disabled={!prompt.trim() || (mode === 'image-to-video' && !imageFile) || (mode === 'story-to-video' && !storyText)}
              >
                {generating ? 'Generating...' : hasActiveProvider ? 'Generate Video' : 'Simulate Generation'}
              </Button>
            </div>
          </div>

          {/* Sidebar: Result + Templates */}
          <div className="space-y-4">
            {/* Result */}
            {result && (
              <div className="bg-white rounded-xl border border-border p-5 space-y-3">
                <h3 className="font-semibold text-navy">Generated Video</h3>
                {result.outputUrl && (
                  <div className="aspect-video bg-navy rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={result.outputUrl} alt="Generated video thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Status</span>
                    <Badge variant={result.status === 'completed' ? 'success' : 'accent'} size="sm">{result.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Duration</span>
                    <span className="text-navy font-medium">{duration}s</span>
                  </div>
                  {result.creditsUsed && (
                    <div className="flex justify-between">
                      <span className="text-muted">Credits used</span>
                      <span className="text-navy font-medium">{result.creditsUsed}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-danger/10 text-danger p-4 rounded-xl text-sm">{error}</div>
            )}

            {/* Credit Balance */}
            {creditBalance && (
              <div className="bg-white rounded-xl border border-border p-5 space-y-2">
                <h3 className="font-semibold text-navy text-sm">Your Credits</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-bg/50">
                    <p className="text-muted">Video</p>
                    <p className="font-medium text-navy">{creditBalance.videoCredits}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-bg/50">
                    <p className="text-muted">Image</p>
                    <p className="font-medium text-navy">{creditBalance.imageCredits}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-bg/50">
                    <p className="text-muted">Subtitle</p>
                    <p className="font-medium text-navy">{creditBalance.subtitleCredits}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-bg/50">
                    <p className="text-muted">Translation</p>
                    <p className="font-medium text-navy">{creditBalance.translationCredits}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent History */}
            {history.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-5 space-y-3">
                <h3 className="font-semibold text-navy text-sm">Recent Generations</h3>
                <div className="space-y-2">
                  {history.slice(0, 5).map((h: any) => (
                    <div key={h.id} className="p-2 rounded-lg hover:bg-bg/50 text-xs cursor-pointer">
                      <p className="text-navy font-medium truncate">{h.prompt?.slice(0, 50)}...</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={h.status === 'completed' ? 'success' : h.status === 'failed' ? 'danger' : 'accent'} size="sm">{h.status}</Badge>
                        <span className="text-muted">{h.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prompt History & Templates */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold text-navy mb-4">Prompt Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'Ancient Architecture', prompt: 'Cinematic drone shot of an ancient heritage site at golden hour, warm light, atmospheric', icon: '🏛️' },
              { name: 'Cultural Festival', prompt: 'Vibrant cultural festival with traditional dancers in colorful costumes, slow motion, celebratory', icon: '🎭' },
              { name: 'Historical Narrative', prompt: 'Dramatic reconstruction of a historical event, period-accurate costumes, epic cinematography', icon: '📜' },
              { name: 'Nature & Landscape', prompt: 'Breathtaking aerial view of pristine natural landscape, misty mountains, serene atmosphere', icon: '🌄' },
              { name: 'Art & Craftsmanship', prompt: 'Close-up detail of traditional craftsmanship, hands working with natural materials, warm lighting', icon: '🎨' },
              { name: 'Documentary Style', prompt: 'Documentary-style footage of daily life in a heritage community, natural lighting, authentic', icon: '🎥' },
            ].map(t => (
              <button key={t.name} onClick={() => { setPrompt(t.prompt); setMode('text-to-video'); }}
                className="p-3 rounded-lg border border-border hover:border-accent/40 hover:bg-bg/30 transition-colors text-left">
                <span className="text-lg">{t.icon}</span>
                <p className="text-sm font-medium text-navy mt-1">{t.name}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-2">{t.prompt}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
