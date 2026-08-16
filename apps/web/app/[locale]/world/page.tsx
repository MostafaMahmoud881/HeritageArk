'use client';

import { useState, useCallback } from 'react';
import { HERITAGE_SITES, type HeritageSite } from '@/lib/heritage-sites';
import { CULTURES, CULTURE_DETAILS, ARTIFACTS, LANGUAGES } from '@/lib/data';
import ThreeGlobeFallback from '@/components/ThreeGlobeFallback';
import Link from 'next/link';
import { Badge } from '@heritageverse/ui';

export default function WorldExplorerPage() {
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);
  const [activeCulture, setActiveCulture] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'globe' | 'list'>('globe');

  const filteredSites = activeCulture
    ? HERITAGE_SITES.filter(s => s.cultureId === activeCulture)
    : HERITAGE_SITES;

  const cultures = [...new Set(HERITAGE_SITES.map(s => s.cultureId))].map(id => ({
    id,
    name: HERITAGE_SITES.find(s => s.cultureId === id)!.culture,
    color: HERITAGE_SITES.find(s => s.cultureId === id)!.color,
    emoji: HERITAGE_SITES.find(s => s.cultureId === id)!.emoji,
  }));

  const handleSiteClick = useCallback((site: HeritageSite) => {
    setSelectedSite(site);
  }, []);

  const selectedCulture = selectedSite?.cultureId
    ? CULTURES.find(c => c.id === selectedSite.cultureId)
    : null;

  const details = selectedSite?.cultureId
    ? CULTURE_DETAILS[selectedSite.cultureId]
    : null;

  const artifactCount = selectedCulture
    ? ARTIFACTS.filter(a => a.culture === selectedCulture.name).length
    : 0;

  const language = selectedCulture
    ? LANGUAGES.find(l => l.name.toLowerCase().includes(selectedCulture.name.toLowerCase()))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/5 to-bg pt-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-accent text-sm font-semibold tracking-widest uppercase">Explore</span>
            <h1 className="text-3xl md:text-4xl font-serif text-navy mt-1">Heritage World</h1>
            <p className="text-muted text-sm mt-1 max-w-xl">
              Click on any marker to explore ancient cultures, traditions, and heritage sites across the globe.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('globe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'globe' ? 'bg-accent text-white' : 'bg-white border border-border text-muted'
              }`}
            >
              🌍 Globe
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list' ? 'bg-accent text-white' : 'bg-white border border-border text-muted'
              }`}
            >
              📋 List
            </button>
          </div>
        </div>

        {/* Culture Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setActiveCulture(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !activeCulture ? 'bg-navy text-white' : 'bg-white border border-border text-muted hover:border-accent'
            }`}
          >
            All Cultures
          </button>
          {cultures.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCulture(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCulture === c.id
                  ? 'text-white'
                  : 'bg-white border border-border text-muted hover:border-accent'
              }`}
              style={activeCulture === c.id ? { backgroundColor: c.color } : {}}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Globe View */}
      {viewMode === 'globe' && (
        <div className="relative w-full px-4 pb-8">
          <div className="relative w-full h-[70vh] min-h-[500px] rounded-xl overflow-hidden border border-border shadow-card">
            <ThreeGlobeFallback onSiteClick={handleSiteClick} />

            {/* Site Info Panel */}
            <div className="absolute top-4 left-4 z-10 max-w-sm">
              {selectedSite ? (
                <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-border p-5 animate-slide-up">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{selectedSite.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-navy">{selectedSite.name}</h3>
                        <span className="text-xs text-muted">{selectedSite.culture}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSite(null)}
                      className="text-muted hover:text-navy p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-sm text-muted leading-relaxed mb-3">{selectedSite.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="muted" size="sm">{selectedSite.period}</Badge>
                    <Badge variant="accent" size="sm">{selectedSite.type}</Badge>
                  </div>

                  {details && (
                    <div className="bg-accent/5 rounded-lg p-3 mb-3 space-y-2">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted">Region</span>
                          <p className="font-medium text-navy">{selectedCulture?.region || '-'}</p>
                        </div>
                        {language && (
                          <div>
                            <span className="text-muted">Language</span>
                            <p className="font-medium text-navy">{language.name}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted">Artifacts</span>
                          <p className="font-medium text-navy">{artifactCount}</p>
                        </div>
                        <div>
                          <span className="text-muted">Traditions</span>
                          <p className="font-medium text-navy">{details.traditions.length}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    {selectedSite.cultureId && (
                      <Link
                        href={`/cultures/${selectedSite.cultureId}`}
                        className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                      >
                        View Culture & Culture Details →
                      </Link>
                    )}
                    {selectedSite.cultureId && (
                      <Link
                        href={`/stories/immersive`}
                        className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                      >
                        🎭 Experience Immersive Story →
                      </Link>
                    )}
                    {language && (
                      <Link
                        href="/languages"
                        className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                      >
                        🗣️ Learn Language →
                      </Link>
                    )}
                    <Link
                      href="/map"
                      className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                    >
                      🗺️ Open Full Map →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
                  <h2 className="text-sm font-semibold text-navy mb-2">🌍 {filteredSites.length} Sites</h2>
                  <p className="text-xs text-muted">
                    Click any glowing marker on the globe to explore a heritage site.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cultures.map(c => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: c.color + '15', color: c.color }}
                      >
                        {c.emoji} {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20 flex items-center gap-3">
              <span className="text-[10px] text-muted">{filteredSites.length} sites</span>
              <span className="w-px h-3 bg-border" />
              <span className="text-[10px] text-muted">
                Drag to rotate · Scroll to zoom · Click markers
              </span>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSites.map(site => {
              const culture = CULTURES.find(c => c.id === site.cultureId);
              const siteDetails = site.cultureId ? CULTURE_DETAILS[site.cultureId] : null;
              return (
                <button
                  key={site.id}
                  onClick={() => { setSelectedSite(site); setViewMode('globe'); }}
                  className="group bg-white rounded-xl border border-border p-4 text-left hover:shadow-card hover:border-accent/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: site.color + '20' }}
                    >
                      {site.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-medium text-navy text-sm group-hover:text-accent transition-colors truncate">
                          {site.name}
                        </h3>
                        <Badge variant="muted" size="sm">{site.type}</Badge>
                      </div>
                      <p className="text-xs text-muted truncate">{site.culture}</p>
                      <p className="text-xs text-muted/70 mt-1 line-clamp-2">{site.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span>{site.period}</span>
                        {culture && (
                          <>
                            <span className="text-muted">·</span>
                            <span>{culture.region}</span>
                          </>
                        )}
                        {siteDetails && (
                          <>
                            <span className="text-muted">·</span>
                            <span>{siteDetails.traditions.length} traditions</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}