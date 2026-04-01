import { TableSkeleton } from '@/components/shared/loading-state'
import { Skeleton } from '@/components/ui/skeleton'

export default function DiagnosisHistoryLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-36 rounded-md" />
      </div>
      <TableSkeleton cols={5} rows={6} />
    </div>
  )
}
