export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Sidebar skeleton */}
      <aside className="fixed top-0 left-0 h-full w-60 bg-navy border-r border-white/5 z-50 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0">
          <div className="w-8 h-8 skeleton-pulse rounded-lg" />
          <div className="h-5 w-28 skeleton-pulse rounded" />
        </div>
        <div className="flex-1 px-3 py-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 skeleton-pulse rounded-lg" />
          ))}
        </div>
        <div className="border-t border-white/5 px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 skeleton-pulse rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 skeleton-pulse rounded" />
              <div className="h-2 w-14 skeleton-pulse rounded" />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header skeleton */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-navy border-b border-white/5 h-16 flex items-center px-4">
        <div className="w-8 h-8 skeleton-pulse rounded-lg" />
        <div className="h-5 w-28 skeleton-pulse rounded ml-3" />
      </div>

      {/* Main content skeleton */}
      <div className="lg:pl-60 pt-16 lg:pt-0">
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-40 skeleton-pulse rounded" />
              <div className="h-4 w-60 skeleton-pulse rounded" />
            </div>
            <div className="h-10 w-36 skeleton-pulse rounded-lg" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-3 w-24 skeleton-pulse rounded" />
                    <div className="h-8 w-20 skeleton-pulse rounded" />
                    <div className="h-3 w-28 skeleton-pulse rounded" />
                  </div>
                  <div className="w-10 h-10 skeleton-pulse rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-border p-6">
              <div className="h-5 w-32 skeleton-pulse rounded mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 skeleton-pulse rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 skeleton-pulse rounded" />
                      <div className="h-3 w-1/2 skeleton-pulse rounded" />
                    </div>
                    <div className="h-3 w-16 skeleton-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="h-5 w-28 skeleton-pulse rounded mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 skeleton-pulse rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Table skeleton */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="h-5 w-36 skeleton-pulse rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-7 h-7 skeleton-pulse rounded-full" />
                    <div className="h-3 w-32 skeleton-pulse rounded" />
                  </div>
                  <div className="h-3 w-48 skeleton-pulse rounded flex-1" />
                  <div className="h-3 w-20 skeleton-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
