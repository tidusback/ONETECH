import { Skeleton } from '@/components/ui/skeleton'

export default function MyMachinesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-sm" />
            </div>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-28" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
