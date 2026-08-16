'use client';

import { useRef, useEffect, useState } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface CultureMarker {
  lng: number;
  lat: number;
  name: string;
  color: string;
}

const CULTURE_MARKERS: CultureMarker[] = [
  { lng: -72.5, lat: -13.5, name: 'Inca', color: '#D4A373' },
  { lng: 31.2, lat: 29.9, name: 'Ancient Egyptian', color: '#E9C46A' },
  { lng: 135.5, lat: 34.7, name: 'Japanese', color: '#D4A373' },
  { lng: -90.5, lat: 14.6, name: 'Maya', color: '#E9C46A' },
];

function MapFallback() {
  return (
    <div className="w-full aspect-[21/9] bg-navy2 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <svg className="w-12 h-12 text-accent/50 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
        <p className="text-white/50 text-sm mb-2">Interactive map loading...</p>
        <p className="text-white/30 text-xs">Add NEXT_PUBLIC_MAPBOX_TOKEN to .env to enable</p>
      </div>
    </div>
  );
}

export default function InteractiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [hasToken] = useState(!!MAPBOX_TOKEN);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !hasToken) return;

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [20, 20],
        zoom: 1.5,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.default.NavigationControl(), 'bottom-right');

      map.on('load', () => {
        CULTURE_MARKERS.forEach(({ lng, lat, name, color }) => {
          const el = document.createElement('div');
          el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-lg';
          el.style.backgroundColor = color;
          el.style.cursor = 'pointer';

          new mapboxgl.default.Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.default.Popup({ offset: 25 }).setHTML(`<strong>${name}</strong>`))
            .addTo(map);
        });
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [hasToken]);

  if (!hasToken) return <MapFallback />;

  return <div ref={mapContainer} className="w-full aspect-[21/9]" />;
}
