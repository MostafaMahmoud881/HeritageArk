'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { HERITAGE_SITES, type HeritageSite } from '@/lib/heritage-sites';
import { CULTURES, ARTIFACTS, LANGUAGES, CULTURE_DETAILS } from '@/lib/data';
import ThreeGlobeFallback from '@/components/ThreeGlobeFallback';
import type { Map as MapboxMap, Marker } from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

function SitePanel({ site, onClose }: { site: HeritageSite; onClose: () => void }) {
  const culture = CULTURES.find(c => c.id === site.cultureId);
  const details = site.cultureId ? CULTURE_DETAILS[site.cultureId] : undefined;
  const artifactCount = culture ? ARTIFACTS.filter(a => a.culture === culture.name).length : 0;
  const language = culture ? LANGUAGES.find(l => {
    const cName = culture.name.toLowerCase();
    return l.name.toLowerCase().includes(cName) || cName.includes(l.name.toLowerCase().replace(/\(.*\)/, '').trim());
  }) : undefined;

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-border overflow-hidden w-80 animate-slide-up">
      <div className="h-2" style={{ backgroundColor: site.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{site.emoji}</span>
            <div>
              <h3 className="font-semibold text-navy text-sm">{site.name}</h3>
              <span className="text-xs text-muted">{site.culture}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-navy transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-muted leading-relaxed mb-3">{site.description}</p>
        {culture && (
          <div className="mb-4 space-y-3">
            {details && (
              <div className="bg-navy/5 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-2">Culture Details</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Culture</span>
                    <span className="font-medium text-navy">{culture.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Region</span>
                    <span className="font-medium text-navy">{culture.region}</span>
                  </div>
                  {language && (
                    <div className="flex justify-between">
                      <span className="text-muted">Language</span>
                      <span className="font-medium text-navy">{language.name}</span>
                    </div>
                  )}
                  {artifactCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted">Artifacts</span>
                      <span className="font-medium text-navy">{artifactCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {details && details.traditions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-2">Traditions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {details.traditions.map(t => (
                    <span key={t} className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">{t}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
              <Link href={`/cultures/${site.cultureId}`} className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
                View Culture &rarr;
              </Link>
              {artifactCount > 0 && (
                <Link href={`/cultures/${site.cultureId}`} className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
                  View Artifacts &rarr;
                </Link>
              )}
              {language && (
                <Link href="/languages" className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
                  Learn Language &rarr;
                </Link>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-navy/5 text-navy/70">{site.period}</span>
          <span className="px-2 py-1 rounded-md" style={{ backgroundColor: site.color + '15', color: site.color }}>{site.type}</span>
        </div>
      </div>
    </div>
  );
}

export default function HeritageGlobe({ initialSiteId, initialCultureId }: { initialSiteId?: string; initialCultureId?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const rotateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hasToken] = useState(!!MAPBOX_TOKEN);
  const [mapboxFailed, setMapboxFailed] = useState(false);
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const initialSiteSelected = useRef(false);
  const initialSiteIdRef = useRef(initialSiteId);
  const initialCultureIdRef = useRef(initialCultureId);

  const filteredSites = activeFilter
    ? HERITAGE_SITES.filter(s => s.cultureId === activeFilter)
    : HERITAGE_SITES;

  const cultures = [...new Set(HERITAGE_SITES.map(s => s.cultureId))].map(id => ({
    id,
    name: HERITAGE_SITES.find(s => s.cultureId === id)!.culture,
    color: HERITAGE_SITES.find(s => s.cultureId === id)!.color,
    emoji: HERITAGE_SITES.find(s => s.cultureId === id)!.emoji,
  }));

  const startRotation = useCallback((map: MapboxMap) => {
    if (rotateTimerRef.current) clearInterval(rotateTimerRef.current);
    setIsRotating(true);
    rotateTimerRef.current = setInterval(() => {
      if (!map) return;
      const bearing = map.getBearing() + 0.3;
      map.setBearing(bearing);
    }, 50);
  }, []);

  const stopRotation = useCallback(() => {
    if (rotateTimerRef.current) {
      clearInterval(rotateTimerRef.current);
      rotateTimerRef.current = null;
    }
    setIsRotating(false);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !hasToken) return;

    let map: MapboxMap;
    let destroyed = false;

    import('mapbox-gl').then((mapboxgl) => {
      if (destroyed || !mapContainer.current) return;
      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      map = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: { name: 'globe' } as any,
        center: [20, 20],
        zoom: 1.5,
        attributionControl: false,
        dragRotate: true,
      });

      map.addControl(new mapboxgl.default.NavigationControl(), 'bottom-right');

      map.on('load', () => {
        if (destroyed) return;

        map.setFog({
          color: 'rgba(186, 210, 255, 0.1)',
          'high-color': 'rgba(36, 92, 223, 0.35)',
          'space-color': 'rgba(11, 11, 25, 0.85)',
          'horizon-blend': 0.15,
          'star-intensity': 0.8,
        });

        HERITAGE_SITES.forEach(site => {
          if (destroyed) return;
          const el = document.createElement('div');
          el.style.cssText = `cursor:pointer;transition:transform 0.2s;font-size:24px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6));`;
          el.textContent = site.emoji;
          el.title = site.name;

          const pulse = document.createElement('div');
          pulse.style.cssText = `position:absolute;top:50%;left:50%;width:40px;height:40px;transform:translate(-50%,-50%);border-radius:50%;background:${site.color}40;animation:pulse 2s infinite;pointer-events:none;`;
          el.appendChild(pulse);

          el.addEventListener('click', () => {
            stopRotation();
            setSelectedSite(site);
            map.flyTo({ center: [site.lng, site.lat], zoom: 4, duration: 1500 });
          });

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.3)';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
          });

          const marker = new mapboxgl.default.Marker({ element: el })
            .setLngLat([site.lng, site.lat])
            .addTo(map);
          markersRef.current.push(marker);
        });

        if (initialSiteIdRef.current && !initialSiteSelected.current) {
          initialSiteSelected.current = true;
          const target = HERITAGE_SITES.find(s => s.id === initialSiteIdRef.current);
          if (target) {
            stopRotation();
            setSelectedSite(target);
            map.flyTo({ center: [target.lng, target.lat], zoom: 4, duration: 1500 });
          }
        }

        if (!initialSiteSelected.current && initialCultureIdRef.current) {
          initialSiteSelected.current = true;
          const sitesForCulture = HERITAGE_SITES.filter(s => s.cultureId === initialCultureIdRef.current);
          const firstSite = sitesForCulture[0];
          if (firstSite) {
            stopRotation();
            setActiveFilter(initialCultureIdRef.current);
            const avgLat = sitesForCulture.reduce((sum, s) => sum + s.lat, 0) / sitesForCulture.length;
            const avgLng = sitesForCulture.reduce((sum, s) => sum + s.lng, 0) / sitesForCulture.length;
            setSelectedSite(firstSite);
            map.flyTo({ center: [avgLng, avgLat], zoom: 4, duration: 1500 });
          }
        }

        startRotation(map);
      });

      map.on('dragstart', () => stopRotation());
      map.on('dragend', () => {
        setTimeout(() => startRotation(map), 4000);
      });

      map.on('error', () => {
        if (!destroyed) setMapboxFailed(true);
      });

      mapRef.current = map;
    }).catch(() => {
      if (!destroyed) setMapboxFailed(true);
    });

    return () => {
      destroyed = true;
      if (rotateTimerRef.current) clearInterval(rotateTimerRef.current);
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
    };
  }, [hasToken, startRotation, stopRotation]);

  const handleSiteSelect = useCallback((site: HeritageSite) => {
    const map = mapRef.current;
    if (!map) return;
    stopRotation();
    setSelectedSite(site);
    map.flyTo({ center: [site.lng, site.lat], zoom: 4, duration: 1500 });
  }, [stopRotation]);

  const showFallback = !hasToken || mapboxFailed;
  if (showFallback) return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[600px] rounded-xl overflow-hidden">
      <ThreeGlobeFallback onSiteClick={handleSiteSelect} initialCultureId={initialCultureId} />
      <div className="absolute top-4 left-4 z-10">
        {selectedSite ? (
          <SitePanel site={selectedSite} onClose={() => setSelectedSite(null)} />
        ) : (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 w-72">
            <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Heritage Sites
            </h2>
            <div className="space-y-1 max-h-[50vh] overflow-y-auto scrollbar-thin pr-1">
              {HERITAGE_SITES.map(site => (
                <button
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-navy/5 transition-colors group"
                >
                  <span className="text-lg flex-shrink-0">{site.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-navy truncate group-hover:text-accent transition-colors">{site.name}</div>
                    <div className="text-[10px] text-muted truncate">{site.culture}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: site.color }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[600px] rounded-xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />

      <div className="absolute top-4 left-4 z-10 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
        {selectedSite ? (
          <SitePanel site={selectedSite} onClose={() => setSelectedSite(null)} />
        ) : (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 w-72">
            <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Heritage Sites
            </h2>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                onClick={() => { setActiveFilter(null); if (mapRef.current) { stopRotation(); setTimeout(() => startRotation(mapRef.current!), 2000); } }}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${!activeFilter ? 'bg-navy text-white' : 'bg-navy/5 text-navy/60 hover:bg-navy/10'}`}
              >
                All
              </button>
              {cultures.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    // Filter sites for this culture and fly the globe to their centroid,
                    // then open the first site as the culture detail panel.
                    const sitesForCulture = HERITAGE_SITES.filter(s => s.cultureId === c.id);
                    setActiveFilter(c.id);
                    setSelectedSite(null);
                    if (mapRef.current && sitesForCulture.length > 0) {
                      stopRotation();
                      const avgLat = sitesForCulture.reduce((sum, s) => sum + s.lat, 0) / sitesForCulture.length;
                      const avgLng = sitesForCulture.reduce((sum, s) => sum + s.lng, 0) / sitesForCulture.length;
                      mapRef.current.flyTo({ center: [avgLng, avgLat], zoom: 3.5, duration: 1500 });
                      // open the first site after the fly animation completes
                      setTimeout(() => { if (sitesForCulture[0]) setSelectedSite(sitesForCulture[0]); }, 1600);
                    }
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${activeFilter === c.id ? 'text-white' : 'text-navy/60 hover:bg-navy/10'}`}
                  style={activeFilter === c.id ? { backgroundColor: c.color } : {}}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
            <div className="space-y-1 max-h-[50vh] overflow-y-auto scrollbar-thin pr-1">
              {filteredSites.map(site => (
                <button
                  key={site.id}
                  onClick={() => handleSiteSelect(site)}
                  className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-navy/5 transition-colors group"
                >
                  <span className="text-lg flex-shrink-0">{site.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-navy truncate group-hover:text-accent transition-colors">{site.name}</div>
                    <div className="text-[10px] text-muted truncate">{site.culture}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: site.color }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20">
        <span className="text-[10px] text-muted">{filteredSites.length} sites</span>
        <span className="w-px h-3 bg-border" />
        <button
          onClick={() => { const m = mapRef.current; if (m) { stopRotation(); m.flyTo({ center: [20, 20], zoom: 1.5, duration: 2000 }); setTimeout(() => startRotation(m), 3000); } }}
          className="text-[10px] text-accent hover:text-accent/80 transition-colors font-medium"
        >
          Reset View
        </button>
        <span className="w-px h-3 bg-border" />
        <button
          onClick={() => { if (isRotating) stopRotation(); else if (mapRef.current) startRotation(mapRef.current); }}
          className="text-[10px] text-muted hover:text-navy transition-colors"
        >
          {isRotating ? 'Pause Spin' : 'Auto Spin'}
        </button>
        <span className="w-px h-3 bg-border" />
        <Link href="/map" className="text-[10px] text-accent hover:text-accent/80 transition-colors font-medium">
          View on Map &rarr;
        </Link>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 99px; }
        .mapboxgl-ctrl-attrib { display: none !important; }
      `}</style>
    </div>
  );
}
