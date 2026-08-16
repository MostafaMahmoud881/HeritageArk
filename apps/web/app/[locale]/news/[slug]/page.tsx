'use client';

import { useNews } from '@/lib/queries';
import { Badge } from '@heritageverse/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function NewsDetailPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const { data: articles, isLoading } = useNews();
  const router = useRouter();
  const article = articles?.find((a) => a.slug === slug);

  if (isLoading) {
    return (
      <div className="pt-24 content-section max-w-3xl mx-auto">
        <div className="h-8 w-2/3 rounded skeleton-pulse mb-4" />
        <div className="h-4 w-1/3 rounded skeleton-pulse mb-8" />
        <div className="aspect-video rounded-lg skeleton-pulse mb-8" />
        <div className="space-y-3">
          <div className="h-4 rounded skeleton-pulse" />
          <div className="h-4 rounded skeleton-pulse" />
          <div className="h-4 w-3/4 rounded skeleton-pulse" />
        </div>
      </div>
    );
  }

  if (!article) return notFound();

  const relatedSite = article.cultureId;

  return (
    <article className="pt-24 pb-16">
      <div className="content-section max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/news"
            className="text-sm text-accent hover:text-gold transition-colors mb-4 inline-block"
          >
            &larr; Back to News
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            {article.categories?.map((cat: string) => (
              <Badge key={cat} variant="accent" size="sm">
                {cat}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-navy leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted">
            <span>{article.author}</span>
            <span>&middot;</span>
            <time>
              {new Date(article.publishedAt).toLocaleDateString(
                undefined,
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </time>
          </div>
        </div>

        <div className="aspect-video rounded-lg overflow-hidden mb-8 bg-[#F8F5F0] flex items-center justify-center text-7xl">
          {article.img}
        </div>

        <div className="prose prose-lg max-w-none text-muted leading-relaxed">
          <p>{article.excerpt}</p>
        </div>

        {article.culturalIntelligence && (
          <div className="mt-8 bg-navy/5 rounded-xl p-6">
            <h2 className="text-xl font-serif text-navy mb-3 flex items-center gap-2">
              🧠 Cultural Intelligence
            </h2>
            <p className="text-muted leading-relaxed">{article.culturalIntelligence}</p>
          </div>
        )}

        {article.fashionEvolution && (
          <div className="mt-6 bg-accent/5 rounded-xl p-6">
            <h2 className="text-xl font-serif text-navy mb-3 flex items-center gap-2">
              👗 Evolution of Traditional Fashion
            </h2>
            <p className="text-muted leading-relaxed">{article.fashionEvolution}</p>
          </div>
        )}

        {article.tourItinerary && (
          <div className="mt-6 bg-white border border-border rounded-xl p-6">
            <h2 className="text-xl font-serif text-navy mb-3 flex items-center gap-2">
              🗺️ Curated Historical Tour Itinerary
            </h2>
            <p className="text-muted leading-relaxed whitespace-pre-line">{article.tourItinerary}</p>
          </div>
        )}

        {article.imagePrompt && (
          <div className="mt-6 bg-gray-900 rounded-xl p-6 text-white">
            <h2 className="text-xl font-serif mb-3 flex items-center gap-2">
              📸 Image Generation Prompt
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed font-mono">{article.imagePrompt}</p>
            <p className="text-xs text-gray-500 mt-2">Use this prompt with AI image generators to create high-resolution JPG/PNG visuals for this article.</p>
          </div>
        )}

        {relatedSite && (
          <div className="mt-8 p-5 bg-white border border-border rounded-xl">
            <h3 className="font-serif text-navy text-lg mb-3">Explore on Map</h3>
            <p className="text-sm text-muted mb-4">Visit the interactive globe to explore this heritage site and related cultures.</p>
            <button
              onClick={() => router.push(`/map?site=${relatedSite}`)}
              className="px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-accent transition-colors"
            >
              View on Heritage Globe →
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
