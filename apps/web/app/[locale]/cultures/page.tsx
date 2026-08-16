'use client';

import { useCultures } from '@/lib/queries';
import { Card } from '@heritageverse/ui';
import Link from 'next/link';

export default function CulturesPage() {
  const { data: cultures, isLoading } = useCultures();

  return (
    <div className="pt-24 pb-16">
      <div className="content-section mb-12">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">
          Explore
        </span>
        <h1 className="text-4xl font-serif text-navy mt-2">All Cultures</h1>
        <p className="text-muted mt-3 max-w-xl">
          Discover the rich tapestry of human civilization through our curated collection of cultures.
        </p>
      </div>

      {isLoading ? (
        <div className="content-section grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg skeleton-pulse" />
          ))}
        </div>
      ) : (
        <div className="content-section grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cultures?.map((culture) => (
            <Link key={culture._id || culture.slug} href={`/cultures/${culture.slug}`}>
              <Card
                image={culture.thumbnail?.url}
                title={culture.name}
                subtitle={culture.region}
                aspectRatio="3/4"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
