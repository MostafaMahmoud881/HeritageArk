'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Badge } from '@heritageverse/ui';
import { getCsrfToken } from '@/lib/api';

interface Page {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  layout: string;
  sectionsCount: number;
  author: string;
  date: string;
}

interface CreatePageData {
  title: string;
  slug: string;
  description: string;
  layout: string;
}

const LAYOUTS = [
  { value: 'default', label: 'Default' },
  { value: 'full-width', label: 'Full Width' },
  { value: 'sidebar', label: 'With Sidebar' },
  { value: 'landing', label: 'Landing' },
];

function StatusBadge({ status }: { status: Page['status'] }) {
  const map: Record<string, { variant: 'success' | 'muted' | 'warning'; label: string }> = {
    published: { variant: 'success', label: 'Published' },
    draft: { variant: 'muted', label: 'Draft' },
    archived: { variant: 'warning', label: 'Archived' },
  };
  const s = map[status] || { variant: 'muted' as const, label: status };
  return <Badge variant={s.variant} size="sm">{s.label}</Badge>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function PagesPage() {
  const { can } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [publishingIds, setPublishingIds] = useState<Set<number>>(new Set());

  const [form, setForm] = useState<CreatePageData>({
    title: '',
    slug: '',
    description: '',
    layout: 'default',
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/pages');
        if (!res.ok) throw new Error('Failed to fetch pages');
        const body = await res.json();
        setPages(body.data ?? body);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.slug.trim()) return;
    setCreating(true);
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create page');
      const body = await res.json();
      setPages(prev => [...prev, body.data ?? body]);
      setShowCreateModal(false);
      setForm({ title: '', slug: '', description: '', layout: 'default' });
      setSlugManuallyEdited(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create page');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = {};
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete page');
      setPages(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete page');
    }
  };

  const handleTogglePublish = async (page: Page) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    setPublishingIds(prev => new Set(prev).add(page.id));
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch(`/api/admin/pages/${page.id}/publish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update page status');
      setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update page status');
    } finally {
      setPublishingIds(prev => { const next = new Set(prev); next.delete(page.id); return next; });
    }
  };

  const updateForm = (field: keyof CreatePageData, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !slugManuallyEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  if (!can('pages.view')) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 skeleton-pulse rounded" />
        <div className="h-4 w-48 skeleton-pulse rounded" />
        <div className="h-10 w-full skeleton-pulse rounded-lg" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 skeleton-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif text-navy">Pages</h1>
        <div className="bg-danger/10 text-danger p-4 rounded-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Pages</h1>
          <p className="text-muted mt-1">{pages.length} total pages</p>
        </div>
        {can('pages.create') && (
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Page
          </Button>
        )}
      </div>

      {/* Empty state */}
      {pages.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-navy mb-1">No pages yet</h3>
          <p className="text-sm text-muted mb-4">Create your first page to get started.</p>
          {can('pages.create') && (
            <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              Create Page
            </Button>
          )}
        </div>
      )}

      {/* Pages table */}
      {pages.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/50 border-b border-border">
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Title</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Slug</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Status</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Layout</th>
                  <th className="text-center py-3.5 px-4 font-medium text-muted">Sections</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Author</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Date</th>
                  <th className="text-right py-3.5 px-4 font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-navy">{page.title}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <code className="text-xs text-muted bg-bg px-1.5 py-0.5 rounded">/{page.slug}</code>
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={page.status} /></td>
                    <td className="py-3.5 px-4 text-muted capitalize">{page.layout}</td>
                    <td className="py-3.5 px-4 text-center text-muted">{page.sectionsCount}</td>
                    <td className="py-3.5 px-4 text-muted">{page.author}</td>
                    <td className="py-3.5 px-4 text-muted text-xs">{page.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {can('pages.publish') && (
                          <button
                            onClick={() => handleTogglePublish(page)}
                            disabled={publishingIds.has(page.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              page.status === 'published'
                                ? 'text-success hover:bg-success/10'
                                : 'text-muted hover:text-success hover:bg-success/10'
                            }`}
                            title={page.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {publishingIds.has(page.id) ? (
                              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {page.status === 'published' ? (
                                  <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></>
                                ) : (
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                )}
                              </svg>
                            )}
                          </button>
                        )}
                        {can('pages.edit') && (
                          <Link href={`/${locale}/admin/pages/${page.id}`}>
                            <button className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors" title="Edit">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </Link>
                        )}
                        {can('pages.delete') && (
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowCreateModal(false); setSlugManuallyEdited(false); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:text-navy transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <h2 className="text-lg font-semibold text-navy mb-5">Create New Page</h2>
            <div className="space-y-4">
              <Input
                label="Title"
                placeholder="Page title"
                value={form.title}
                onChange={e => updateForm('title', e.target.value)}
              />
              <Input
                label="Slug"
                placeholder="page-slug"
                value={form.slug}
                onChange={e => { setSlugManuallyEdited(true); updateForm('slug', e.target.value); }}
              />
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  placeholder="Brief description of this page"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Layout</label>
                <select
                  value={form.layout}
                  onChange={e => updateForm('layout', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  {LAYOUTS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                className="w-full"
                loading={creating}
                disabled={!form.title.trim() || !form.slug.trim()}
                onClick={handleCreate}
              >
                Create Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
