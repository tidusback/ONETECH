import { Skeleton } from '@/components/ui/skeleton'

export default function ReviewsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-6 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-8 w-36 rounded-md" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-sm" />
                <Skeleton className="h-3 w-24 self-center" />
              </div>
            </div>
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  )
}
