import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin (the hub overview page).
// Mirrors the hub layout: 3 stat cards + 4 section grids of module cards.
export default function AdminOverviewLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">
      {/* Page header */}
      <div className="mb-8 space-y-1.5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats strip — Customers / Technicians / Admins */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Section grids */}
      {[4, 6, 1, 2].map((count, gi) => (
        <div key={gi} className="mb-8">
          <Skeleton className="mb-3 h-3 w-24" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card px-5 py-5 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-3 w-44" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
