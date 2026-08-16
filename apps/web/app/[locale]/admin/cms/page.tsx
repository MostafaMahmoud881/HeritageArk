'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Badge } from '@heritageverse/ui';
import { getCsrfToken } from '@/lib/api';

interface Article {
  id: number;
  title: string;
  status: string;
  author: string;
  date: string;
  category: string;
}

interface Category {
  id: number;
  name: string;
  count: number;
  color: string;
}

interface NewsItem {
  id: string;
  title: string;
  source: string | null;
  date: string;
  status: string;
  image: string | null;
}

interface Artifact {
  id: number;
  name: string;
  origin: string;
  period: string;
  material: string;
  location: string;
}

interface Language {
  id: number;
  name: string;
  speakers: string;
  status: string;
  articles: number;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'success' | 'gold' | 'muted'; label: string }> = {
    published: { variant: 'success', label: 'Published' },
    draft: { variant: 'muted', label: 'Draft' },
    scheduled: { variant: 'gold', label: 'Scheduled' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'muted', label: 'Inactive' },
  };
  const s = map[status] || { variant: 'muted' as const, label: status };
  return <Badge variant={s.variant} size="sm">{s.label}</Badge>;
}

export default function CMSPage() {
  const { can } = useAuth();
  const { locale } = useParams<{ locale: string }>();
  const [activeTab, setActiveTab] = useState('articles');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;
  const canEdit = can('content.edit');
  const canDelete = can('content.delete');
  const canCreate = can('content.create');

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heritageNews, setHeritageNews] = useState<NewsItem[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [languagesList, setLanguagesList] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState('');
  const [newsAuthor, setNewsAuthor] = useState('');
  const [newsSource, setNewsSource] = useState('');
  const [newsImage, setNewsImage] = useState('');
  const [newsSaving, setNewsSaving] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [articlesRes, categoriesRes, newsRes, artifactsRes, languagesRes] = await Promise.all([
          fetch('/api/cms/articles'),
          fetch('/api/cms/categories'),
          fetch('/api/news'),
          fetch('/api/cms/artifacts'),
          fetch('/api/cms/languages'),
        ]);
        if (!articlesRes.ok) throw new Error('Failed to fetch articles');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        if (!newsRes.ok) throw new Error('Failed to fetch news');
        if (!artifactsRes.ok) throw new Error('Failed to fetch artifacts');
        if (!languagesRes.ok) throw new Error('Failed to fetch languages');

        setArticles(await articlesRes.json());
        setCategories(await categoriesRes.json());
        setHeritageNews(await newsRes.json());
        setArtifacts(await artifactsRes.json());
        setLanguagesList(await languagesRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = {};
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch(`/api/cms/articles/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete article');
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete article');
    }
  };

  const openNewsCreate = () => {
    setEditingNews(null);
    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
    setNewsCategory('');
    setNewsAuthor('');
    setNewsSource('');
    setNewsImage('');
    setNewsError(null);
    setShowNewsModal(true);
  };

  const openNewsEdit = (n: NewsItem) => {
    setEditingNews(n);
    setNewsTitle(n.title);
    setNewsSummary('');
    setNewsContent('');
    setNewsCategory('');
    setNewsAuthor(n.source ?? '');
    setNewsSource(n.source ?? '');
    setNewsImage(n.image ?? '');
    setNewsError(null);
    setShowNewsModal(true);
  };

  const handleNewsSave = async () => {
    if (!newsTitle.trim()) {
      setNewsError('Title is required');
      return;
    }
    setNewsSaving(true);
    setNewsError(null);
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const method = editingNews ? 'PUT' : 'POST';
      const url = editingNews ? `/api/news/${editingNews.id}` : '/api/news';
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          title: newsTitle.trim(),
          summary: newsSummary,
          content: newsContent,
          category: newsCategory,
          author: newsAuthor,
          source: newsSource,
          image: newsImage,
        }),
      });
      if (!res.ok) throw new Error('Failed to save news');
      setShowNewsModal(false);
      const newsRes = await fetch('/api/news');
      if (newsRes.ok) setHeritageNews(await newsRes.json());
    } catch (err) {
      setNewsError(err instanceof Error ? err.message : 'Failed to save news');
    } finally {
      setNewsSaving(false);
    }
  };

  const handleNewsDelete = async (n: NewsItem) => {
    if (!confirm(`Delete news "${n.title}"?`)) return;
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = {};
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch(`/api/news/${n.id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete news');
      setHeritageNews(prev => prev.filter(x => x.id !== n.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete news');
    }
  };

  const tabs = [
    { id: 'articles', label: 'Articles' },
    { id: 'categories', label: 'Categories' },
    { id: 'news', label: 'Heritage News' },
    { id: 'artifacts', label: 'Artifacts' },
    { id: 'languages', label: 'Languages' },
  ];

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredArticles.length / perPage);
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif text-navy">Content Management</h1>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif text-navy">Content Management</h1>
        <div className="bg-danger/10 text-danger p-4 rounded-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Content Management</h1>
          <p className="text-muted mt-1">Manage articles, categories, and translations</p>
        </div>
        {canCreate && (
          <Link href={`/${locale}/admin/cms/editor`}>
            <Button variant="primary" size="md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New
            </Button>
          </Link>
        )}
        {canCreate && activeTab === 'news' && (
          <Button variant="ghost" size="md" onClick={openNewsCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add News
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-border p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSearch(''); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-navy text-white'
                : 'text-muted hover:text-navy hover:bg-bg'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/50 border-b border-border">
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Title</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Status</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Author</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Date</th>
                  <th className="text-right py-3.5 px-4 font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedArticles.map((article) => (
                  <tr key={article.id} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-medium text-navy">{article.title}</p>
                        <p className="text-xs text-muted mt-0.5">{article.category}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={article.status} /></td>
                    <td className="py-3.5 px-4 text-muted">{article.author}</td>
                    <td className="py-3.5 px-4 text-muted text-xs">{article.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <Link href={`/${locale}/admin/cms/editor?id=${article.id}`}>
                            <button className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors" title="Edit">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(article.id)}
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
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted">
              Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredArticles.length)} of {filteredArticles.length}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                    currentPage === i + 1 ? 'bg-accent text-navy font-medium' : 'text-muted hover:bg-bg'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-border p-5 flex items-center justify-between hover:shadow-card transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${cat.color}`}>
                  {cat.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-navy">{cat.name}</p>
                  <p className="text-xs text-muted">{cat.count} articles</p>
                </div>
              </div>
              <div className="flex gap-1">
                {canEdit && (
                  <button className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors" title="Edit">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                )}
                {canDelete && (
                  <button className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Delete">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Heritage News Tab */}
      {activeTab === 'news' && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/50 border-b border-border">
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Image</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Title</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Source</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Date</th>
                  <th className="text-right py-3.5 px-4 font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {heritageNews.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-muted">No news articles.</td></tr>
                ) : heritageNews.map((news) => (
                  <tr key={news.id} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                    <td className="py-3.5 px-4">
                      {news.image ? (
                        <img src={news.image} alt={news.title} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-bg flex items-center justify-center text-muted text-xs">No img</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-navy">{news.title}</td>
                    <td className="py-3.5 px-4 text-muted">{news.source}</td>
                    <td className="py-3.5 px-4 text-muted text-xs">{news.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <button onClick={() => openNewsEdit(news)} className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleNewsDelete(news)} className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
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

      {/* Artifacts Tab */}
      {activeTab === 'artifacts' && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/50 border-b border-border">
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Name</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Origin</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Period</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Material</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Location</th>
                </tr>
              </thead>
              <tbody>
                {artifacts.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-navy">{a.name}</td>
                    <td className="py-3.5 px-4 text-muted">{a.origin}</td>
                    <td className="py-3.5 px-4 text-muted">{a.period}</td>
                    <td className="py-3.5 px-4 text-muted">{a.material}</td>
                    <td className="py-3.5 px-4 text-muted">{a.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Languages Tab */}
      {activeTab === 'languages' && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/50 border-b border-border">
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Language</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Speakers</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Translated Articles</th>
                  <th className="text-left py-3.5 px-4 font-medium text-muted">Status</th>
                  <th className="text-right py-3.5 px-4 font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {languagesList.map((lang) => (
                  <tr key={lang.id} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-navy">{lang.name}</td>
                    <td className="py-3.5 px-4 text-muted">{lang.speakers}</td>
                    <td className="py-3.5 px-4 text-muted">{lang.articles.toLocaleString()}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={lang.status} /></td>
                    <td className="py-3.5 px-4 text-right">
                      {canEdit && (
                        <button className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors" title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* News Editor Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNewsModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowNewsModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:text-navy transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <h2 className="text-lg font-semibold text-navy mb-5">{editingNews ? 'Edit News' : 'Add News'}</h2>
            <div className="space-y-4">
              <Input label="Title" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Summary</label>
                <textarea value={newsSummary} onChange={e => setNewsSummary(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Content</label>
                <textarea value={newsContent} onChange={e => setNewsContent(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Category" value={newsCategory} onChange={e => setNewsCategory(e.target.value)} />
                <Input label="Author" value={newsAuthor} onChange={e => setNewsAuthor(e.target.value)} />
              </div>
              <Input label="Source" value={newsSource} onChange={e => setNewsSource(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Image URL <span className="text-muted font-normal">(paste an uploaded media URL)</span></label>
                <Input value={newsImage} onChange={e => setNewsImage(e.target.value)} placeholder="https://..." />
                {newsImage && <img src={newsImage} alt="preview" className="mt-2 w-24 h-24 rounded-lg object-cover border border-border" />}
              </div>
              {newsError && <p className="text-sm text-danger">{newsError}</p>}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowNewsModal(false)} disabled={newsSaving}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={handleNewsSave} disabled={newsSaving}>
                  {newsSaving ? 'Saving...' : 'Save News'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
