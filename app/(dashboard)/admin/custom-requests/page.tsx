import type { Metadata } from 'next'
import { FileText } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { getCustomRequests } from '@/lib/admin/queries'
import { RequestActions } from './request-actions'

export const metadata: Metadata = { title: 'Custom Requests' }

type CustomRequestStatus = 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'completed'

const statusVariant: Record<
  CustomRequestStatus,
  'warning' | 'default' | 'neutral' | 'profit' | 'destructive' | 'secondary'
> = {
  new:       'warning',
  reviewing: 'default',
  quoted:    'neutral',
  accepted:  'profit',
  declined:  'destructive',
  completed: 'secondary',
}

export default async function AdminCustomRequestsPage() {
  const requests = await getCustomRequests()

  const counts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const actionableCount = (counts['new'] ?? 0) + (counts['reviewing'] ?? 0)

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Custom Requests"
        description="Bespoke service requests submitted by customers."
        actions={
          actionableCount > 0 ? (
            <Badge variant="warning">{actionableCount} need action</Badge>
          ) : undefined
        }
      />

      {requests.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {(['new', 'reviewing', 'quoted', 'accepted', 'declined', 'completed'] as CustomRequestStatus[]).map(
            (s) => (
              <div key={s} className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-lg font-bold tabular-nums">{counts[s] ?? 0}</p>
                <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">{s}</p>
              </div>
            ),
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All custom requests
            {requests.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {requests.length} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {requests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No custom requests yet"
              description="Custom service requests from customers will appear here."
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {req.request_number}
                      </span>
                      <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium">{req.title}</p>
                    {req.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {req.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{req.customer_name ?? req.customer_email}</span>
                      {req.budget != null && (
                        <span>Budget: ${req.budget.toLocaleString()}</span>
                      )}
                      <span>Submitted {formatDate(req.created_at)}</span>
                    </div>
                  </div>

                  <RequestActions requestId={req.id} currentStatus={req.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
