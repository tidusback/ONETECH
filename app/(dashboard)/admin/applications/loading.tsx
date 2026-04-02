import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/applications.
// Mirrors: status strip (5 cards) + application rows list.
export default function AdminApplicationsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Status strip — 5 statuses */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center space-y-1.5">
            <Skeleton className="mx-auto h-6 w-8" />
            <Skeleton className="mx-auto h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Application rows */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-36" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-border/60 px-6 py-5 last:border-0"
          >
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-52" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-16 rounded-full" />
                ))}
              </div>
            </div>
            <Skeleton className="h-8 w-28 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
