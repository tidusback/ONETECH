import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/risk-logs.
// Mirrors: status strip (4 statuses) + severity strip (4 severities) + log rows.
export default function AdminRiskLogsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Status strip — 4 statuses */}
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center space-y-1.5">
            <Skeleton className="mx-auto h-6 w-8" />
            <Skeleton className="mx-auto h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Severity strip — 4 severities */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center space-y-1.5">
            <Skeleton className="mx-auto h-6 w-8" />
            <Skeleton className="mx-auto h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Risk log rows */}
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-52 rounded-md" />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border-b border-border/60 px-6 py-4 last:border-0 sm:flex-row sm:items-center"
          >
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-3 w-72" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-7 w-28 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
