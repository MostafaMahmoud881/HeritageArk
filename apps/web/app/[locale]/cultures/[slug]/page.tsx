'use client';

import { useCulture } from '@/lib/queries';
import { Badge, Button } from '@heritageverse/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function CultureDetailPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const { data: culture, isLoading } = useCulture(slug);

  if (isLoading) {
    return (
      <div className="pt-24 content-section">
        <div className="h-64 rounded-lg skeleton-pulse mb-8" />
        <div className="h-8 w-1/3 rounded skeleton-pulse mb-4" />
        <div className="h-4 w-2/3 rounded skeleton-pulse mb-2" />
        <div className="h-4 w-1/2 rounded skeleton-pulse" />
      </div>
    );
  }

  if (!culture) return notFound();

  return (
    <>
      <section className="relative pt-16">
        <div className="h-[40vh] md:h-[50vh] overflow-hidden">
          {culture.thumbnail?.url ? (
            <img
              src={culture.thumbnail.url}
              alt={culture.thumbnail.alt || culture.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy via-navy2 to-accent/10 flex items-center justify-center">
              <span className="text-white/10 font-serif text-[12rem]">
                {culture.name[0]}
              </span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 content-section pb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="accent">{culture.region}</Badge>
            <Badge variant="gold">{culture.traditions.length || 0} Milestones</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white">{culture.name}</h1>
          <p className="text-white/70 mt-4 max-w-2xl text-lg">{culture.summary}</p>
        </div>
      </section>

      <section className="py-16 content-section">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-serif text-navy mb-4">About</h2>
          <p className="text-muted leading-relaxed whitespace-pre-line">
            {culture.description}
          </p>
        </div>
      </section>

      {culture.traditions && culture.traditions.length > 0 && (
        <section className="py-16 content-section">
          <h2 className="text-2xl font-serif text-navy mb-6">Traditions</h2>
          <div className="flex flex-wrap gap-3">
            {culture.traditions.map((tradition) => (
              <Badge key={tradition} variant="navy" size="md">
                {tradition}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="content-section">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-navy">Artifacts</h2>
            <Link
              href={`/cultures/${slug}/artifacts`}
              className="text-sm text-accent hover:text-gold transition-colors"
            >
              View All &rarr;
            </Link>
          </div>
          {culture.artifacts?.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {culture.artifacts.slice(0, 4).map((artifact: any) => (
                <div key={artifact._id} className="bg-bg rounded-lg p-4">
                  <h3 className="font-serif text-navy">{artifact.name}</h3>
                  <p className="text-xs text-muted mt-1">{artifact.era}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No artifacts yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
