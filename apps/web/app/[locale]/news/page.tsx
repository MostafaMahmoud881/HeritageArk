'use client';

import { useNewsInfinite, useTrendingTopics } from '@/lib/queries';
import { Badge, Button, Input } from '@heritageverse/ui';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HeritageSitesPanel from '@/components/HeritageSitesPanel';
import { type HeritageSite } from '@/lib/heritage-sites';

export default function NewsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedCultureId, setSelectedCultureId] = useState<string | undefined>(undefined);
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNewsInfinite();
  const { data: trending } = useTrendingTopics();

  const allArticles = data?.pages.flatMap((p) => p.data) || [];

  const filtered = allArticles.filter((article) => {
    if (search && !article.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory && !article.categories?.includes(activeCategory)) return false;
    return true;
  });

  const handleSiteClick = (site: HeritageSite) => {
    router.push(`/map?site=${site.id}`);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="content-section mb-12">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">
          Stay Informed
        </span>
        <h1 className="text-4xl font-serif text-navy mt-2">Heritage News</h1>
        <p className="text-muted mt-3 max-w-xl">
          Curated heritage and archaeology news from museums, universities, and cultural institutions worldwide.
        </p>
      </div>

      <div className="content-section mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className="flex flex-wrap gap-2 items-center">
            {trending?.slice(0, 6).map((topic) => (
              <button
                key={topic}
                onClick={() =>
                  setActiveCategory(activeCategory === topic ? null : topic)
                }
              >
                <Badge
                  variant={activeCategory === topic ? 'accent' : 'muted'}
                  size="sm"
                >
                  {topic}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="content-section grid lg:grid-cols-3 gap-8">
        {/* News Grid */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-lg skeleton-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((article) => (
                <Link
                  key={article._id}
                  href={`/news/${article.slug}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-card transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-video overflow-hidden bg-[#F8F5F0] flex items-center justify-center text-4xl">
                    {article.img}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.categories?.slice(0, 2).map((cat) => (
                        <Badge key={cat} variant="accent" size="sm">
                          {cat}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted ml-auto">{article.author}</span>
                    </div>
                    <h3 className="font-serif text-lg text-navy group-hover:text-accent transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted mt-2 line-clamp-2">{article.excerpt}</p>
                    <time className="text-xs text-muted mt-3 block">
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>

        {/* Heritage Sites Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <HeritageSitesPanel
              selectedCultureId={selectedCultureId}
              onSiteClick={handleSiteClick}
              onCultureFilter={(id) => setSelectedCultureId(id ?? undefined)}
            />
            <div className="mt-4 bg-white rounded-2xl border border-border p-5">
              <h3 className="font-serif text-navy text-lg mb-3">🗺️ Explore on Globe</h3>
              <p className="text-xs text-muted mb-4">Select a heritage site from the panel above to view it on our interactive 3D Earth map. Discover locations, cultures, and artifacts from around the world.</p>
              <Link href="/map" className="block w-full text-center py-2.5 rounded-xl bg-navy text-white text-sm font-medium hover:bg-accent transition-colors">
                Open Full Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
