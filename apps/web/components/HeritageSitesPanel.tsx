'use client';

import { useRouter } from 'next/navigation';
import { HERITAGE_SITES, type HeritageSite } from '@/lib/heritage-sites';
import { CULTURES } from '@/lib/data';

interface HeritageSitesPanelProps {
  selectedCultureId?: string;
  onSiteClick?: (site: HeritageSite) => void;
  onCultureFilter?: (cultureId: string | undefined) => void;
}

export default function HeritageSitesPanel({ selectedCultureId, onSiteClick, onCultureFilter }: HeritageSitesPanelProps) {
  const router = useRouter();
  const filteredSites = selectedCultureId
    ? HERITAGE_SITES.filter(s => s.cultureId === selectedCultureId)
    : HERITAGE_SITES;

  const cultures = [...new Set(HERITAGE_SITES.map(s => s.cultureId))].map(id => {
    const site = HERITAGE_SITES.find(s => s.cultureId === id)!;
    const culture = CULTURES.find(c => c.id === id);
    return {
      id,
      name: site.culture,
      emoji: site.emoji,
      color: site.color,
      flag: culture?.flag || '',
    };
  });

  const handleSiteClick = (site: HeritageSite) => {
    if (onSiteClick) {
      onSiteClick(site);
    }
  };

  const handleCultureClick = (cultureId: string) => {
    onCultureFilter?.(cultureId);
    router.push(`/map?culture=${cultureId}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <h3 className="font-serif text-navy text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Heritage Sites Around the World
        </h3>
        <p className="text-xs text-muted mt-1">Select a site to explore on the interactive globe</p>
      </div>

      {/* Culture filters */}
      <div className="px-5 py-3 border-b border-border bg-bg/50">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCultureFilter?.(undefined)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${!selectedCultureId ? 'bg-navy text-white' : 'bg-navy/5 text-navy/60 hover:bg-navy/10'}`}
          >
            All
          </button>
          {cultures.map(c => (
            <button
              key={c.id}
              onClick={() => handleCultureClick(c.id)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${selectedCultureId === c.id ? 'text-white' : 'text-navy/60 hover:bg-navy/10'}`}
              style={selectedCultureId === c.id ? { backgroundColor: c.color } : {}}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sites list */}
      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
        {filteredSites.map(site => (
          <button
            key={site.id}
            onClick={() => handleSiteClick(site)}
            className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-navy/5 transition-colors group border-b border-border last:border-b-0"
          >
            <span className="text-2xl flex-shrink-0">{site.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-navy truncate group-hover:text-accent transition-colors">
                {site.name}
              </div>
              <div className="text-xs text-muted truncate">{site.description}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-navy/5 text-navy/70">{site.period}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: site.color + '15', color: site.color }}>{site.type}</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: site.color }} />
          </button>
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 99px; }
      `}</style>
    </div>
  );
}
