import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/reviews.
// Mirrors: stats strip (total + published + pending) + review rows with star ratings.
export default function AdminReviewsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Stats strip — 3 cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center space-y-1.5">
            <Skeleton className="mx-auto h-6 w-10" />
            <Skeleton className="mx-auto h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Reviews list */}
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border-b border-border/60 px-6 py-4 last:border-0 sm:flex-row sm:items-start"
          >
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Star rating placeholder */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-3.5 w-3.5 rounded-sm" />
                  ))}
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-72" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-7 w-24 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
