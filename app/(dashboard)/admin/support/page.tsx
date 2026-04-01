import type { Metadata } from 'next'
import { LifeBuoy, MoreHorizontal } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Support Tickets' }

// TODO: add migration for `support_tickets` table, then replace with a real query
type TicketStatus   = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

type SupportTicket = {
  id: string
  ticket_number: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  customer_name: string | null
  customer_email: string
}

const statusVariant: Record<TicketStatus, 'warning' | 'default' | 'neutral' | 'profit' | 'secondary'> = {
  open:             'warning',
  in_progress:      'default',
  waiting_customer: 'neutral',
  resolved:         'profit',
  closed:           'secondary',
}

const priorityVariant: Record<TicketPriority, 'destructive' | 'warning' | 'neutral' | 'secondary'> = {
  urgent: 'destructive',
  high:   'warning',
  medium: 'neutral',
  low:    'secondary',
}

async function getSupportTickets(): Promise<SupportTicket[]> {
  // Stub: support_tickets table migration pending
  return []
}

export default async function AdminSupportPage() {
  const tickets = await getSupportTickets()

  const counts = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})

  const openCount = (counts['open'] ?? 0) + (counts['in_progress'] ?? 0)

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Support Tickets"
        description="All customer support requests and their resolution status."
        actions={
          openCount > 0 ? (
            <Badge variant="warning">{openCount} open</Badge>
          ) : undefined
        }
      />

      {/* Status strip */}
      {tickets.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'] as TicketStatus[]).map(
            (s) => (
              <div key={s} className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-lg font-bold tabular-nums">{counts[s] ?? 0}</p>
                <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
                  {s.replace(/_/g, ' ')}
                </p>
              </div>
            ),
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All tickets
            {tickets.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {tickets.length} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {tickets.length === 0 ? (
            <EmptyState
              icon={LifeBuoy}
              title="No support tickets"
              description="Support tickets submitted by customers will appear here."
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {ticket.ticket_number}
                      </span>
                      <Badge variant={statusVariant[ticket.status]}>
                        {ticket.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant={priorityVariant[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium">{ticket.subject}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{ticket.customer_name ?? ticket.customer_email}</span>
                      <span>Opened {formatDate(ticket.created_at)}</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View ticket</DropdownMenuItem>
                      <DropdownMenuItem>Assign to agent</DropdownMenuItem>
                      <DropdownMenuItem>Mark in progress</DropdownMenuItem>
                      <DropdownMenuItem>Mark resolved</DropdownMenuItem>
                      <DropdownMenuItem>Close ticket</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
