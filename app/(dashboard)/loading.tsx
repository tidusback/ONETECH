import { StatCardSkeleton, TableSkeleton } from '@/components/shared/loading-state'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <Skeleton className="h-6 w-40" />
      <StatCardSkeleton count={4} />
      <TableSkeleton cols={5} rows={6} />
    </div>
  )
}
