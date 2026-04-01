import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Zap, MapPin, Clock } from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { getOpenLeads, getMyLeadAssignments } from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadResponseButtons } from '@/components/technician/lead-response-buttons'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { LeadUrgency, LeadAssignment } from '@/lib/technician/queries'

export const metadata: Metadata = { title: 'My Leads' }

const URGENCY_CONFIG: Record<LeadUrgency, { label: string; cls: string }> = {
  low:    { label: 'Low',    cls: 'bg-muted text-muted-foreground border-border' },
  normal: { label: 'Normal', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  high:   { label: 'High',   cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  urgent: { label: 'Urgent', cls: 'bg-destructive/10 text-destructive border-destructive/20' },
}

const CATEGORY_ICONS: Record<string, string> = {
  CNC:        '⚙️',
  Press:      '🔩',
  Welding:    '🔥',
  Compressor: '💨',
  Pump:       '💧',
  Generator:  '⚡',
  Handling:   '🏗️',
  HVAC:       '❄️',
  Other:      '🔧',
}

export default async function LeadsPage() {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'technician') redirect('/dashboard')

  const [leads, myAssignments] = await Promise.all([
    getOpenLeads(),
    getMyLeadAssignments(user.id),
  ])

  // Build a quick lookup: leadId → assignment
  const assignmentMap = myAssignments.reduce<Record<string, LeadAssignment>>(
    (acc, a) => { acc[a.lead_id] = a; return acc },
    {}
  )

  // Filter out leads already declined by this technician
  const visibleLeads = leads.filter(
    (l) => assignmentMap[l.id]?.status !== 'declined'
  )

  return (
    <PageContainer size="wide">
      <PageHeader
        title="My Leads"
        description="Available job opportunities. Accept a lead to create a work order."
        actions={
          visibleLeads.length > 0 ? (
            <Badge variant="secondary">{visibleLeads.length} open</Badge>
          ) : undefined
        }
      />

      {visibleLeads.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Zap}
              title="No open leads"
              description="New job opportunities will appear here as they become available. Check back soon."
              className="py-16"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleLeads.map((lead) => {
            const urgency = URGENCY_CONFIG[lead.urgency]
            const categoryIcon = lead.category ? (CATEGORY_ICONS[lead.category] ?? '🔧') : '🔧'
            const assignment = assignmentMap[lead.id] ?? null

            return (
              <Card key={lead.id} className="flex flex-col">
                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl" aria-hidden>{categoryIcon}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{lead.title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {lead.lead_number}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                        urgency.cls
                      )}
                    >
                      {urgency.label}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-3 pb-5">
                  {lead.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {lead.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {(lead.location_city || lead.location_province) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[lead.location_city, lead.location_province]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                    {lead.category && (
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3 shrink-0" />
                        {lead.category}
                      </div>
                    )}
                    {lead.expires_at && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        Expires {formatDate(lead.expires_at)}
                      </div>
                    )}
                  </div>

                  {/* Accept / Decline */}
                  <div className="mt-auto pt-3 border-t border-border">
                    <LeadResponseButtons
                      leadId={lead.id}
                      existingStatus={assignment?.status ?? null}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground/60">
                    Posted {formatDate(lead.created_at)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
