import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LifeBuoy } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterBar } from '@/components/admin/filter-bar'
import { formatDate } from '@/lib/utils'
import { getSupportTickets } from '@/lib/admin/queries'
import { TicketActions } from './ticket-actions'

export const metadata: Metadata = { title: 'Support Tickets' }

type TicketStatus   = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

const STATUS_OPTIONS = [
  { value: 'open',             label: 'Open' },
  { value: 'in_progress',      label: 'In Progress' },
  { value: 'waiting_customer', label: 'Waiting Customer' },
  { value: 'resolved',         label: 'Resolved' },
  { value: 'closed',           label: 'Closed' },
]

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high',   label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low',    label: 'Low' },
]

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

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; priority?: string }>
}) {
  const sp = await searchParams
  const tickets = await getSupportTickets()

  const filtered = tickets.filter((t) => {
    if (sp.status && t.status !== sp.status) return false
    if (sp.priority && t.priority !== sp.priority) return false
    if (sp.search) {
      const q = sp.search.toLowerCase()
      if (
        !t.subject.toLowerCase().includes(q) &&
        !(t.customer_name ?? '').toLowerCase().includes(q) &&
        !t.customer_email.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

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
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All tickets
            {filtered.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {filtered.length}
                {tickets.length !== filtered.length ? ` of ${tickets.length}` : ''}
              </span>
            )}
          </CardTitle>
          <Suspense>
            <FilterBar
              searchPlaceholder="Search by subject or customer…"
              statusOptions={STATUS_OPTIONS}
              extraFilters={[
                { param: 'priority', placeholder: 'All priorities', options: PRIORITY_OPTIONS },
              ]}
              className="w-auto"
            />
          </Suspense>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {filtered.length === 0 ? (
            <EmptyState
              icon={LifeBuoy}
              title="No support tickets"
              description={
                tickets.length === 0
                  ? 'Support tickets submitted by customers will appear here.'
                  : 'No tickets match the current filters.'
              }
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((ticket) => (
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

                  <TicketActions ticketId={ticket.id} currentStatus={ticket.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
