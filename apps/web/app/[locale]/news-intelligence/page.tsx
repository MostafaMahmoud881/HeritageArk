'use client';

import { useState, useMemo } from 'react';
import { NEWS_ARTICLES, CULTURES } from '@/lib/data';
import { Badge, Button } from '@heritageverse/ui';

const CATEGORIES = ['All', 'Policy', 'Expedition', 'Culture', 'Partnership', 'Opinion'];

export default function NewsIntelligencePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    return NEWS_ARTICLES.filter((a) => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.summary.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeCategory !== 'All' && a.cat !== activeCategory) return false;
      return true;
    });
  }, [search, activeCategory]);

  const getRelatedCulture = (article: typeof NEWS_ARTICLES[0]) => {
    return CULTURES.find(c => article.title.toLowerCase().includes(c.name.toLowerCase()) || article.summary.toLowerCase().includes(c.name.toLowerCase()));
  };

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Monitor</span>
          <h1 className="text-4xl font-serif text-navy mt-2">Cultural News Intelligence</h1>
          <p className="text-muted mt-3 max-w-xl">
            Real-time intelligence on cultural heritage news, policy changes, and field expeditions.
          </p>
        </div>

        <div className="bg-navy rounded-2xl p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔴</span>
            <div>
              <p className="text-white font-semibold text-sm">Breaking News</p>
              <p className="text-white/60 text-xs mt-0.5">Live updates from UNESCO and field partners</p>
            </div>
          </div>
          <Badge variant="danger" size="sm">LIVE</Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news articles..."
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy placeholder-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-white border border-border text-muted hover:border-accent/30 hover:text-navy'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filtered.slice(0, 2).map((article) => {
            const culture = getRelatedCulture(article);
            return (
              <div
                key={article.id}
                className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl border-2 border-accent/30 shadow-card overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center text-7xl">
                    {article.img}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="danger" size="sm">Featured</Badge>
                      <Badge variant="accent" size="sm">{article.cat}</Badge>
                      {culture && <Badge variant="muted" size="sm">{culture.flag}</Badge>}
                    </div>
                    <h3 className="text-xl font-serif text-navy mb-2">{article.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{article.summary}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted">{article.date} · {article.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.slice(2).map((article) => {
            const culture = getRelatedCulture(article);
            return (
              <div
                key={article.id}
                className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card hover:border-accent/30 transition-all duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-accent/5 to-transparent flex items-center justify-center text-5xl">
                  {article.img}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="accent" size="sm">{article.cat}</Badge>
                    {culture && (
                      <span className="text-sm" title={culture.name}>{culture.flag}</span>
                    )}
                  </div>
                  <h3 className="font-serif text-navy group-hover:text-accent transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-muted mt-2 line-clamp-2">{article.summary}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted">{article.author}</span>
                    <span className="text-xs text-muted">{article.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl">🔍</span>
            <p className="text-muted text-lg mt-4">No articles match your search.</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="text-accent hover:text-accent/80 mt-2 text-sm">
              Clear filters
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇺🇳</span>
              <h2 className="text-xl font-serif text-navy">UNESCO Feed</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-bg rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent" size="sm">UNESCO</Badge>
                  <span className="text-xs text-muted">2026-06-22</span>
                </div>
                <p className="text-sm text-navy font-medium">Intangible Heritage Committee reviews 15 new nominations</p>
                <p className="text-xs text-muted mt-1">50+ countries represented at annual session</p>
              </div>
              <div className="bg-bg rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent" size="sm">UNESCO</Badge>
                  <span className="text-xs text-muted">2026-06-15</span>
                </div>
                <p className="text-sm text-navy font-medium">World Heritage List expands to include cultural landscapes</p>
                <p className="text-xs text-muted mt-1">Three new sites added in Africa and Asia</p>
              </div>
              <div className="bg-bg rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent" size="sm">UNESCO</Badge>
                  <span className="text-xs text-muted">2026-06-08</span>
                </div>
                <p className="text-sm text-navy font-medium">Digital preservation workshop for indigenous communities</p>
                <p className="text-xs text-muted mt-1">New toolkit released for community-led documentation</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {CULTURES.slice(0, 4).map((culture) => (
            <div key={culture.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 hover:shadow-card transition-all">
              <span className="text-2xl">{culture.flag}</span>
              <div>
                <p className="font-medium text-navy text-sm">{culture.name}</p>
                <p className="text-xs text-muted">{culture.region}</p>
              </div>
              <div className="ml-auto text-xs text-muted">
                {NEWS_ARTICLES.filter(a => a.title.toLowerCase().includes(culture.name.toLowerCase())).length} articles
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
