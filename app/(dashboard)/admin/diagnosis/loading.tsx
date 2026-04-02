import { Skeleton } from '@/components/ui/skeleton'

// Loading state for /admin/diagnosis.
// Mirrors: category list with expand/collapse rows + add-category form button.
export default function AdminDiagnosisLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 md:px-6 md:py-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Category rows */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-32" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0"
          >
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
