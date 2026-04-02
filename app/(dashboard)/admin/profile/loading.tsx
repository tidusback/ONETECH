import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/profile.
// Mirrors: avatar card + 3 stat tiles + account info rows.
export default function AdminProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 md:px-6 md:py-8">
      {/* Page header */}
      <div className="mb-6 space-y-1.5 border-b border-border pb-5">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Avatar card */}
      <div className="mb-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-5">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats tiles */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 text-center space-y-1.5">
            <Skeleton className="mx-auto h-4 w-4 rounded" />
            <Skeleton className="mx-auto h-7 w-10" />
            <Skeleton className="mx-auto h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Account info rows */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-4 w-40" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0">
            <Skeleton className="h-4 w-4 shrink-0 rounded" />
            <Skeleton className="h-4 w-36 shrink-0" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    </div>
  )
}
