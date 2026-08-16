'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useParams, useSearchParams } from 'next/navigation';
import { Button, Input, Badge } from '@heritageverse/ui';

const CATEGORIES = ['History', 'Crafts', 'Languages', 'Fashion', 'Architecture', 'Art', 'Stories', 'Music', 'Food', 'Rituals'];

type FormatAction = 'bold' | 'italic' | 'heading' | 'bullet' | 'number' | 'quote';

export default function EditorPage() {
  const { can } = useAuth();
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [scheduleDate, setScheduleDate] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cms/articles/${id}`);
        if (!res.ok) throw new Error('Failed to load article');
        const data = await res.json();
        setTitle(data.title || '');
        setContent(data.content || '');
        setCategory(data.category || '');
        setStatus(data.status || 'draft');
        setScheduleDate(data.scheduleDate || '');
        setTags(data.tags || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleFormat = (action: FormatAction) => {
    const textarea = document.getElementById('editor-content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    let replacement = '';

    switch (action) {
      case 'bold': replacement = `**${selected}**`; break;
      case 'italic': replacement = `*${selected}*`; break;
      case 'heading': replacement = `\n## ${selected}\n`; break;
      case 'bullet': replacement = `\n- ${selected}`; break;
      case 'number': replacement = `\n1. ${selected}`; break;
      case 'quote': replacement = `\n> ${selected}`; break;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const newStatus = publish ? 'published' : 'draft';
      setStatus(newStatus);
      const body = { title, content, category, status: newStatus, scheduleDate, tags };

      let res: Response;
      if (id) {
        res = await fetch(`/api/cms/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/cms/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to save article');
      }

      const msg = publish ? 'Article published successfully!' : 'Draft saved successfully!';
      setMessage(msg);
      if (publish) {
        setTimeout(() => { window.location.href = '/en/admin/cms'; }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const canPublish = can('content.publish');

  const formatTools: { action: FormatAction; icon: string; label: string }[] = [
    { action: 'bold', icon: 'B', label: 'Bold' },
    { action: 'italic', icon: 'I', label: 'Italic' },
    { action: 'heading', icon: 'H', label: 'Heading' },
    { action: 'bullet', icon: '•', label: 'Bullet List' },
    { action: 'number', icon: '1.', label: 'Numbered List' },
    { action: 'quote', icon: '"', label: 'Quote' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif text-navy">Loading article...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">
            {title || 'New Article'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted text-sm">Content Editor</p>
            {status === 'draft' && <Badge variant="muted" size="sm">Draft</Badge>}
            {status === 'published' && <Badge variant="success" size="sm">Published</Badge>}
            {status === 'scheduled' && <Badge variant="gold" size="sm">Scheduled</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && <p className="text-sm text-danger">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button variant="outline" size="md" onClick={() => handleSave(false)} disabled={saving || !title || loading}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          {canPublish && (
            <Button variant="primary" size="md" onClick={() => handleSave(true)} disabled={saving || !title || loading}>
              {saving ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <Input
            placeholder="Article title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-lg font-semibold"
          />

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 p-2 bg-white rounded-xl border border-border">
            {formatTools.map((tool) => (
              <button
                key={tool.action}
                onClick={() => handleFormat(tool.action)}
                className="w-8 h-8 rounded-lg text-sm text-muted hover:text-navy hover:bg-bg transition-colors font-medium"
                title={tool.label}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          {/* Rich Text Area */}
          <textarea
            id="editor-content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start writing your article content here..."
            rows={18}
            className="w-full p-5 bg-white rounded-xl border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all font-sans leading-relaxed"
          />

          {/* Word/char count */}
          <div className="text-xs text-muted text-right">
            {content.length} characters · {content.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-navy mb-3">Status</h3>
            <div className="space-y-2">
              {(['draft', 'published', 'scheduled'] as const).map((s) => (
                <label key={s} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-bg/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="status"
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="w-4 h-4 text-accent focus:ring-accent/30 border-border"
                    disabled={s === 'published' && !canPublish}
                  />
                  <div>
                    <p className="text-sm font-medium text-navy capitalize">{s}</p>
                    <p className="text-xs text-muted">
                      {s === 'draft' && 'Not yet published'}
                      {s === 'published' && 'Visible to everyone'}
                      {s === 'scheduled' && 'Set a future date'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            {status === 'scheduled' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-muted mb-1">Schedule Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-navy mb-3">Category</h3>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-navy mb-3">Featured Image</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/40 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="text-sm text-muted">Drop an image here</p>
              <p className="text-xs text-muted/60 mt-1">or click to browse</p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-navy mb-3">Tags</h3>
            <Input
              placeholder="Comma separated tags..."
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
            {tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.split(',').map((tag, i) => (
                  tag.trim() && <Badge key={i} variant="accent" size="sm">{tag.trim()}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Version History */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-navy mb-3">Version History</h3>
            <div className="space-y-3">
              {[{ id: 1, version: 'v0.3', date: '2026-06-27 14:32', author: 'Tariq Osman', changes: 'Added featured image, updated tags' },
                { id: 2, version: 'v0.2', date: '2026-06-27 11:15', author: 'Tariq Osman', changes: 'Expanded introduction section' },
                { id: 3, version: 'v0.1', date: '2026-06-26 09:00', author: 'Tariq Osman', changes: 'Initial draft created' },
              ].map((v) => (
                <div key={v.id} className="p-3 rounded-lg bg-bg/50 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-navy">{v.version}</span>
                    <span className="text-xs text-muted">{v.date}</span>
                  </div>
                  <p className="text-xs text-muted mb-1">{v.author}</p>
                  <p className="text-xs text-muted/70">{v.changes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
