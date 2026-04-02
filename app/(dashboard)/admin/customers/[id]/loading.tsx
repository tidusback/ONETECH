import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/customers/[id].
// Mirrors: profile header card + requests history list.
export default function AdminCustomerDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 md:px-6 md:py-8">
      {/* Back link */}
      <Skeleton className="mb-6 h-4 w-28" />

      {/* Profile card */}
      <div className="mb-6 rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Requests list */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-36" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0"
          >
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20 font-mono" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-7 w-16 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
