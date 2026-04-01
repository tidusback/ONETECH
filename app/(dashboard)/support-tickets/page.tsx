import type { Metadata } from 'next'
import { LifeBuoy, Plus } from 'lucide-react'
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
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import type { SupportTicket, TicketStatus, TicketPriority } from '@/types/customer'
import type { BadgeProps } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Support Tickets' }

// Placeholder — replace with real DB query
const tickets: SupportTicket[] = []

const statusConfig: Record<TicketStatus, { label: string; variant: BadgeProps['variant'] }> = {
  'open':        { label: 'Open',        variant: 'warning'     },
  'in-progress': { label: 'In Progress', variant: 'default'     },
  'resolved':    { label: 'Resolved',    variant: 'profit'      },
  'closed':      { label: 'Closed',      variant: 'neutral'     },
}

const priorityConfig: Record<TicketPriority, { label: string; variant: BadgeProps['variant'] }> = {
  'low':    { label: 'Low',    variant: 'neutral'     },
  'medium': { label: 'Medium', variant: 'secondary'   },
  'high':   { label: 'High',   variant: 'warning'     },
  'urgent': { label: 'Urgent', variant: 'destructive' },
}

export default function SupportTicketsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Support Tickets"
        description="Track and manage your service support requests."
        actions={
          <Button size="sm" disabled>
            <Plus className="h-4 w-4" />
            New ticket
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-sm font-medium">All tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1 mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opened</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={LifeBuoy}
                      title="No support tickets"
                      description="Need help? Open a ticket and our team will get back to you promptly."
                      action={
                        <Button size="sm" disabled>
                          <Plus className="h-3.5 w-3.5" />
                          Open a ticket
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => {
                  const status = statusConfig[ticket.status]
                  const priority = priorityConfig[ticket.priority]
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {ticket.ticket_number}
                      </TableCell>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {ticket.machine_name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={priority.variant}>{priority.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(ticket.created_at)}
                      </TableCell>
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
