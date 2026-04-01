import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Clock } from 'lucide-react'
import { getAllLeads, getApprovedTechnicianProfiles } from '@/lib/admin/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterBar } from '@/components/admin/filter-bar'
import { CreateLeadButton } from './lead-actions'
import { LeadsList } from './leads-list'

export const metadata: Metadata = { title: 'Leads' }

type LeadStatus  = 'open' | 'assigned' | 'closed' | 'expired'

const STATUS_OPTIONS = [
  { value: 'open',     label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'closed',   label: 'Closed' },
  { value: 'expired',  label: 'Expired' },
]

const URGENCY_OPTIONS = [
  { value: 'low',    label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high',   label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; urgency?: string }>
}) {
  const sp = await searchParams
  const [leads, technicians] = await Promise.all([
    getAllLeads(),
    getApprovedTechnicianProfiles(),
  ])

  const filtered = leads.filter((l) => {
    if (sp.status && l.status !== sp.status) return false
    if (sp.urgency && l.urgency !== sp.urgency) return false
    if (sp.search) {
      const q = sp.search.toLowerCase()
      if (
        !l.title.toLowerCase().includes(q) &&
        !(l.location_city ?? '').toLowerCase().includes(q) &&
        !(l.category ?? '').toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const counts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Leads"
        description="Service leads created and dispatched to technicians."
        actions={
          <div className="flex items-center gap-2">
            {(counts['open'] ?? 0) > 0 && (
              <Badge variant="profit">{counts['open']} open</Badge>
            )}
            <Suspense>
              <CreateLeadButton />
            </Suspense>
          </div>
        }
      />

      {/* Status strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['open', 'assigned', 'closed', 'expired'] as LeadStatus[]).map((s) => (
          <div key={s} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold tabular-nums">{counts[s] ?? 0}</p>
            <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All leads
            {filtered.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {filtered.length}{leads.length !== filtered.length ? ` of ${leads.length}` : ''} total
              </span>
            )}
          </CardTitle>
          <Suspense>
            <FilterBar
              searchPlaceholder="Search leads…"
              statusOptions={STATUS_OPTIONS}
              extraFilters={[{ param: 'urgency', placeholder: 'All urgency', options: URGENCY_OPTIONS }]}
              className="w-auto"
            />
          </Suspense>
        </CardHeader>

        <CardContent className="mt-4 p-0 pb-1">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No leads found"
              description={
                leads.length === 0
                  ? 'Create a lead to dispatch it to technicians.'
                  : 'No leads match the current filters.'
              }
              className="py-12"
            />
          ) : (
            <Suspense>
              <LeadsList leads={filtered} technicians={technicians} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
