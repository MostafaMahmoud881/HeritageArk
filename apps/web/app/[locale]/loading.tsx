export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header skeleton */}
      <header className="fixed top-0 inset-x-0 z-50 bg-navy/95 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="h-6 w-40 skeleton-pulse rounded" />
          <div className="hidden lg:flex items-center gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3 w-16 skeleton-pulse rounded" />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-10 skeleton-pulse rounded" />
            <div className="h-8 w-16 skeleton-pulse rounded-lg" />
          </div>
        </div>
      </header>

      {/* Hero skeleton */}
      <section className="pt-24 pb-16">
        <div className="content-section">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <div className="h-4 w-32 skeleton-pulse rounded" />
            <div className="h-12 w-full max-w-lg skeleton-pulse rounded" />
            <div className="h-4 w-full max-w-md skeleton-pulse rounded" />
            <div className="h-4 w-3/4 skeleton-pulse rounded" />
            <div className="flex gap-3 mt-4">
              <div className="h-12 w-36 skeleton-pulse rounded-lg" />
              <div className="h-12 w-36 skeleton-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Content grid skeleton */}
      <section className="pb-16">
        <div className="content-section">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 skeleton-pulse rounded" />
            <div className="h-4 w-24 skeleton-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="aspect-[4/3] skeleton-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 skeleton-pulse rounded" />
                  <div className="h-3 w-full skeleton-pulse rounded" />
                  <div className="h-3 w-2/3 skeleton-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Second section skeleton */}
      <section className="pb-16">
        <div className="content-section">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-40 skeleton-pulse rounded" />
            <div className="h-4 w-24 skeleton-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="aspect-video skeleton-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-1/4 skeleton-pulse rounded" />
                  <div className="h-4 w-full skeleton-pulse rounded" />
                  <div className="h-3 w-full skeleton-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
