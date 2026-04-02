import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/points.
// Mirrors: stats strip + points ledger table + grant-points form.
export default function AdminPointsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Stats strip — 4 cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center space-y-1.5">
            <Skeleton className="mx-auto h-6 w-12" />
            <Skeleton className="mx-auto h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Ledger table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-28" />
        </div>
        {/* Table header */}
        <div className="flex gap-8 border-b border-border bg-muted/30 px-6 py-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-8 items-center border-b border-border/60 px-6 py-3 last:border-0"
          >
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-20" />
            ))}
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
