import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/parts.
// Mirrors: page header with "Add Part" button + parts list with price/stock/compatibility.
export default function AdminPartsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      {/* Parts list */}
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border-b border-border/60 px-6 py-4 last:border-0 sm:flex-row sm:items-start"
          >
            {/* Left: identity + compatibility */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20 font-mono" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-16 rounded" />
                ))}
              </div>
            </div>
            {/* Right: price + stock + action */}
            <div className="flex shrink-0 items-center gap-4">
              <div className="space-y-1 text-right">
                <Skeleton className="ml-auto h-4 w-20" />
                <Skeleton className="ml-auto h-3 w-12" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
