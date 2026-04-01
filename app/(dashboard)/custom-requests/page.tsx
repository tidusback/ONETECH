import type { Metadata } from 'next'
import { FileText, Plus } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableNumericCell,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { CustomRequest, RequestStatus } from '@/types/customer'
import type { BadgeProps } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Custom Requests' }

// Placeholder — replace with real DB query
const requests: CustomRequest[] = []

const statusConfig: Record<RequestStatus, { label: string; variant: BadgeProps['variant'] }> = {
  'pending':   { label: 'Pending',   variant: 'neutral'    },
  'reviewing': { label: 'Reviewing', variant: 'warning'    },
  'quoted':    { label: 'Quoted',    variant: 'default'    },
  'accepted':  { label: 'Accepted',  variant: 'profit'     },
  'declined':  { label: 'Declined',  variant: 'destructive'},
}

export default function CustomRequestsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Custom Requests"
        description="Request tailored parts, services, or quotes outside standard offerings."
        actions={
          <Button size="sm" disabled>
            <Plus className="h-4 w-4" />
            New request
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-sm font-medium">All requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1 mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Quote</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={FileText}
                      title="No custom requests"
                      description="Need something specific? Submit a request and we'll provide a tailored quote."
                      action={
                        <Button size="sm" disabled>
                          <Plus className="h-3.5 w-3.5" />
                          Submit a request
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => {
                  const { label, variant } = statusConfig[req.status]
                  return (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {req.request_number}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {req.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {req.machine_name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>{label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(req.created_at)}
                      </TableCell>
                      <TableNumericCell>
                        {req.quoted_amount != null ? formatCurrency(req.quoted_amount) : '—'}
                      </TableNumericCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
