'use client';

export function ReelSkeletonFull() {
  return (
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-navy">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy2 to-navy animate-pulse" />
      <div className="absolute bottom-24 left-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
          <div className="h-2 w-40 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-16 bg-white/10 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="absolute right-4 bottom-1/2 translate-y-1/2 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function ReelSkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-border animate-pulse">
      <div className="aspect-[9/16] bg-gradient-to-br from-navy via-navy2 to-navy" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted/20 rounded w-3/4" />
        <div className="h-2 bg-muted/20 rounded w-1/2" />
      </div>
    </div>
  );
}

export function ReelSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ReelSkeletonCard key={i} />
      ))}
    </div>
  );
}
