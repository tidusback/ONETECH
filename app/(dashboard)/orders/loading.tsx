import { TableSkeleton } from '@/components/shared/loading-state'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <Skeleton className="h-6 w-28" />
      <TableSkeleton cols={6} rows={6} />
    </div>
  )
}
