import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-6">
      <Skeleton className="h-6 w-32" />
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
            <Skeleton className="h-5 w-20 rounded-sm" />
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
    </div>
  )
}
