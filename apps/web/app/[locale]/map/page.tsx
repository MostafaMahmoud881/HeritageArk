'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const HeritageGlobe = dynamic(() => import('@/components/HeritageGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-80px)] min-h-[600px] bg-gradient-to-b from-navy to-navy2 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-white/50 text-sm">Loading heritage globe...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('site');
  const cultureId = searchParams.get('culture');

  return (
    <div className="min-h-screen bg-bg">
      <div className="relative">
        <HeritageGlobe initialSiteId={siteId || undefined} initialCultureId={cultureId || undefined} />
      </div>
    </div>
  );
}
