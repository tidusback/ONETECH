import { Skeleton } from '@/components/ui/skeleton'

export default function AdminSupportLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 md:px-6 md:py-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-6 w-16" />
      </div>
      {/* Status strip */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center space-y-1.5">
            <Skeleton className="mx-auto h-6 w-8" />
            <Skeleton className="mx-auto h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-7 w-24 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
