import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/jobs/[id].
// Mirrors: job detail card + log timeline + override form.
export default function AdminJobDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 md:px-6 md:py-8">
      {/* Back link */}
      <Skeleton className="mb-6 h-4 w-24" />

      {/* Job header card */}
      <div className="mb-6 rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-24 font-mono" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-9 w-32 shrink-0 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Log timeline */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="px-6 py-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
