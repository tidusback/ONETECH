import { Skeleton } from '@/components/ui/skeleton'
import { StatCardSkeleton } from '@/components/shared/loading-state'

export default function AdminUsersLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 md:px-6 md:py-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <StatCardSkeleton count={4} />
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-28" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-52" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
