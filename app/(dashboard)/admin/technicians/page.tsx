import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Users, MapPin, Wrench, Clock, ShieldCheck } from 'lucide-react'
import {
  getAllApplications,
  getApplicationCounts,
  getPendingLevelRequests,
  getApprovedTechniciansWithLevel,
} from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { FilterBar } from '@/components/admin/filter-bar'
import { ApplicationReviewer } from './application-reviewer'
import { LevelRequestActions, AdminSetLevel } from './level-actions'
import { AffiliateBadge } from '@/components/technician/affiliation-badge'
import { APPLICATION_STATUS_CONFIG } from '@/lib/validations/onboarding'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin — Technicians' }

const STATUS_BADGE_VARIANTS: Record<
  'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info',
  string
> = {
  pending:       'bg-amber-500/10 text-amber-600 border-amber-500/20',
  under_review:  'bg-blue-500/10 text-blue-600 border-blue-500/20',
  approved:      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected:      'bg-destructive/10 text-destructive border-destructive/20',
  requires_info: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
}

const LEVEL_LABEL: Record<string, string> = {
  affiliate_technician: 'Affiliate',
  certified_technician: 'Certified',
  certified_partner:    'Partner',
}

const APP_STATUS_OPTIONS = [
  { value: 'pending',       label: 'Pending' },
  { value: 'under_review',  label: 'Under Review' },
  { value: 'requires_info', label: 'Requires Info' },
  { value: 'approved',      label: 'Approved' },
  { value: 'rejected',      label: 'Rejected' },
]

export default async function AdminTechniciansPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const sp = await searchParams
  const [applications, counts, pendingLevelReqs, approvedTechs] = await Promise.all([
    getAllApplications(),
    getApplicationCounts(),
    getPendingLevelRequests(),
    getApprovedTechniciansWithLevel(),
  ])

  const filteredApps = applications.filter((app) => {
    if (sp.status && app.status !== sp.status) return false
    if (sp.search) {
      const q = sp.search.toLowerCase()
      if (
        !(app.full_name ?? '').toLowerCase().includes(q) &&
        !(app.profiles?.email ?? '').toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const actionableCount = (counts['pending'] ?? 0) + (counts['requires_info'] ?? 0)

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Technicians"
        description="Manage applications, review promotion requests, and set affiliation levels."
        actions={
          actionableCount > 0 ? (
            <Badge variant="warning">{actionableCount} need action</Badge>
          ) : undefined
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* Pending level promotion requests                                    */}
      {/* ------------------------------------------------------------------ */}
      {pendingLevelReqs.length > 0 && (
        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-0 pt-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              Pending Level Requests
              <span className="ml-1 rounded-full bg-blue-500/15 px-2 py-0.5 font-mono text-xs text-blue-600 dark:text-blue-400">
                {pendingLevelReqs.length}
              </span>
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              These technicians have requested a promotion. Review the snapshot and approve or reject.
            </p>
          </CardHeader>
          <CardContent className="mt-4 p-0 pb-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Requesting</TableHead>
                  <TableHead className="text-center">Jobs</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                  <TableHead className="text-center">Days at level</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLevelReqs.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-sm">
                      <p className="font-medium">{req.profiles?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{req.profiles?.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">
                          {LEVEL_LABEL[req.current_level] ?? req.current_level}
                        </span>
                        <AffiliateBadge level={req.requested_level} size="sm" full />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm">{req.snapshot_jobs_completed}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm">{req.snapshot_points_balance.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm">{req.snapshot_days_at_level}d</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(req.created_at)}
                    </TableCell>
                    <TableCell>
                      <LevelRequestActions requestId={req.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Approved technicians — level overview + direct set                  */}
      {/* ------------------------------------------------------------------ */}
      {approvedTechs.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-0 pt-5">
            <CardTitle className="text-sm font-medium">
              Approved Technicians — Level Overview
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                {approvedTechs.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4 p-0 pb-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Current Level</TableHead>
                  <TableHead>Level Since</TableHead>
                  <TableHead>Territory Priority</TableHead>
                  <TableHead>Admin Override</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedTechs.map((tech) => (
                  <TableRow key={tech.user_id}>
                    <TableCell className="text-sm">
                      <p className="font-medium">{tech.profiles?.full_name ?? tech.full_name}</p>
                      <p className="text-xs text-muted-foreground">{tech.profiles?.email}</p>
                    </TableCell>
                    <TableCell>
                      <AffiliateBadge level={tech.affiliation_level} size="sm" full />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tech.level_updated_at ? formatDate(tech.level_updated_at) : '—'}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-muted-foreground">
                        {tech.territory_priority > 0 ? `+${tech.territory_priority}` : '0'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AdminSetLevel
                        technicianId={tech.user_id}
                        currentLevel={tech.affiliation_level}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Application status summary strip                                    */}
      {/* ------------------------------------------------------------------ */}
      {applications.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            ['pending', 'under_review', 'approved', 'rejected', 'requires_info'] as const
          ).map((status) => (
            <div
              key={status}
              className="rounded-lg border border-border bg-card p-3 text-center"
            >
              <p className="text-lg font-bold tabular-nums">{counts[status] ?? 0}</p>
              <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
                {APPLICATION_STATUS_CONFIG[status].label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* All applications                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All Applications
            {filteredApps.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {filteredApps.length}
                {applications.length !== filteredApps.length ? ` of ${applications.length}` : ''}
              </span>
            )}
          </CardTitle>
          <Suspense>
            <FilterBar
              searchPlaceholder="Search by name or email…"
              statusOptions={APP_STATUS_OPTIONS}
              className="w-auto"
            />
          </Suspense>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {filteredApps.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No applications yet"
              description={
                applications.length === 0
                  ? 'Technician applications will appear here once submitted.'
                  : 'No applications match the current filters.'
              }
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start"
                >
                  {/* Identity & details */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{app.full_name}</span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          STATUS_BADGE_VARIANTS[app.status]
                        )}
                      >
                        {APPLICATION_STATUS_CONFIG[app.status].label}
                      </span>
                      {app.status === 'approved' && (
                        <AffiliateBadge level={app.affiliation_level} size="sm" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {app.profiles?.email ?? '—'}
                      {app.phone && <span className="ml-2">· {app.phone}</span>}
                    </p>

                    {(app.city || app.province) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[app.city, app.province].filter(Boolean).join(', ')}
                        {app.service_radius_km && app.service_radius_km < 9999 && (
                          <span className="ml-1">· {app.service_radius_km} km radius</span>
                        )}
                        {app.service_radius_km === 9999 && (
                          <span className="ml-1">· Nationwide</span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {app.years_experience != null && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {app.years_experience} yr{app.years_experience !== 1 ? 's' : ''} exp.
                        </span>
                      )}
                      {app.departments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          {app.departments.join(', ').replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    {app.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {app.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                        {app.skills.length > 5 && (
                          <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                            +{app.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      {app.id_document_url && (
                        <span className="rounded border border-border px-1.5 py-0.5">
                          ID document uploaded
                        </span>
                      )}
                      {app.qualification_urls.length > 0 && (
                        <span className="rounded border border-border px-1.5 py-0.5">
                          {app.qualification_urls.length} qualification
                          {app.qualification_urls.length !== 1 ? 's' : ''} uploaded
                        </span>
                      )}
                    </div>

                    {app.admin_notes && (
                      <p className="max-w-md truncate text-xs italic text-muted-foreground">
                        Note: {app.admin_notes}
                      </p>
                    )}
                    {app.rejection_reason && (
                      <p className="max-w-md text-xs text-destructive">
                        Rejection: {app.rejection_reason}
                      </p>
                    )}

                    <p className="text-[11px] text-muted-foreground/60">
                      Submitted {formatDate(app.created_at)}
                      {app.reviewed_at && ` · Reviewed ${formatDate(app.reviewed_at)}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <ApplicationReviewer
                      applicationId={app.id}
                      currentStatus={app.status}
                      adminNotes={app.admin_notes}
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
