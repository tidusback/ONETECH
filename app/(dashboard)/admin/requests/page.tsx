import type { Metadata } from 'next'
import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'
import { getAllRequests } from '@/lib/orders/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { RequestStatusBadge } from '@/components/orders/request-status-badge'
import { StatusUpdater } from './status-updater'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin — All Requests' }

export default async function AdminRequestsPage() {
  const requests = await getAllRequests()

  // Group counts by status for the summary strip
  const counts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const actionableCount = (counts['pending'] ?? 0) + (counts['reviewing'] ?? 0)

  return (
    <PageContainer size="wide">
      <PageHeader
        title="All Parts Requests"
        description="Review and process incoming parts requests."
        actions={
          actionableCount > 0 ? (
            <Badge variant="warning">
              {actionableCount} need action
            </Badge>
          ) : undefined
        }
      />

      {/* Status summary strip */}
      {requests.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {(['pending','reviewing','quoted','confirmed','processing','shipped','delivered','cancelled'] as const).map(
            (status) => (
              <div key={status} className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {counts[status] ?? 0}
                </p>
                <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">{status}</p>
              </div>
            ),
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-sm font-medium">
            All requests
            {requests.length > 0 && (
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                {requests.length} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {requests.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No requests yet"
              description="Parts requests submitted by customers will appear here."
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {requests.map((req) => (
                <div key={req.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                  {/* Identity */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {req.request_number}
                      </span>
                      <RequestStatusBadge status={req.status} />
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {req.customer_name}
                      {req.customer_company && (
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          · {req.customer_company}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{req.customer_email}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        {req.items?.length ?? 0} part{(req.items?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span>Submitted {formatDate(req.created_at)}</span>
                      {req.admin_notes && (
                        <span className="max-w-xs truncate italic">
                          Note: {req.admin_notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                      <Link href={`/orders/${req.id}`}>
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                    <StatusUpdater
                      requestId={req.id}
                      currentStatus={req.status}
                      adminNotes={req.admin_notes}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
