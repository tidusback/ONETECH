import type { Metadata } from 'next'
import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getMyRequests } from '@/lib/orders/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { RequestStatusBadge } from '@/components/orders/request-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Orders' }

export default async function OrdersPage() {
  const user = await requireOnboardingComplete()
  const requests = await getMyRequests(user.id)

  return (
    <PageContainer>
      <PageHeader
        title="Orders"
        description="Track parts requests and fulfilment status."
        actions={
          <Button asChild size="sm">
            <Link href="/request">New Request</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-sm font-medium">
            Request history
            {requests.length > 0 && (
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                {requests.length} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={Package}
                      title="No orders yet"
                      description="Parts requests you submit will appear here. Browse the catalog to get started."
                      action={
                        <Button asChild size="sm" variant="outline">
                          <Link href="/parts">Browse Parts</Link>
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {req.request_number}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {req.notes ?? <span className="text-muted-foreground/40">—</span>}
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(req.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                        <Link href={`/orders/${req.id}`}>
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
