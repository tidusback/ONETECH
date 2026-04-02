import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/requests.
// Mirrors: status strip (8 statuses) + request rows list.
export default function AdminRequestsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      {/* Status strip — 8 statuses */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center space-y-1.5">
            <Skeleton className="mx-auto h-6 w-8" />
            <Skeleton className="mx-auto h-3 w-14" />
          </div>
        ))}
      </div>

      {/* Request rows */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-24" />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border-b border-border/60 px-6 py-4 last:border-0 sm:flex-row sm:items-center"
          >
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-3 w-24 font-mono" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-3 w-44" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-7 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
