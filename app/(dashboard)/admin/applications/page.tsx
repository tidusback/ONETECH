import type { Metadata } from 'next'
import { ClipboardList } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { getAllApplications, getApplicationCounts } from '@/lib/technician/queries'
import { ApplicationActions } from './application-actions'

export const metadata: Metadata = { title: 'Applications' }

type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info'
type AffiliationLevel  = 'affiliate_technician' | 'certified_technician' | 'certified_partner'

const statusVariant: Record<ApplicationStatus, 'warning' | 'default' | 'profit' | 'destructive' | 'neutral'> = {
  pending:       'warning',
  under_review:  'default',
  approved:      'profit',
  rejected:      'destructive',
  requires_info: 'neutral',
}

const levelLabel: Record<AffiliationLevel, string> = {
  affiliate_technician: 'Affiliate',
  certified_technician: 'Certified',
  certified_partner:    'Partner',
}

export default async function AdminApplicationsPage() {
  const [applications, counts] = await Promise.all([
    getAllApplications(),
    getApplicationCounts(),
  ])

  const pendingCount =
    (counts['pending'] ?? 0) +
    (counts['under_review'] ?? 0) +
    (counts['requires_info'] ?? 0)

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Applications"
        description="Technician onboarding applications and approval queue."
        actions={
          pendingCount > 0 ? (
            <Badge variant="warning">{pendingCount} need review</Badge>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {(['pending', 'under_review', 'requires_info', 'approved', 'rejected'] as ApplicationStatus[]).map((s) => (
          <div key={s} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold tabular-nums">{counts[s] ?? 0}</p>
            <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
              {s.replace(/_/g, ' ')}
            </p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All applications
            {applications.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {applications.length} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {applications.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No applications yet"
              description="Technician onboarding applications will appear here once submitted."
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant[app.status as ApplicationStatus]}>
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="secondary">
                        {levelLabel[app.affiliation_level as AffiliationLevel] ?? app.affiliation_level}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {app.profiles?.full_name ?? app.full_name ?? app.profiles?.email ?? 'Unknown'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {app.profiles?.email && <span>{app.profiles.email}</span>}
                      <span>Submitted {formatDate(app.created_at)}</span>
                    </div>
                  </div>

                  <ApplicationActions
                    applicationId={app.id}
                    currentStatus={app.status as ApplicationStatus}
                    currentLevel={app.affiliation_level as AffiliationLevel}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
