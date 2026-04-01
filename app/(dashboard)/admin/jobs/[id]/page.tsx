import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, User, Calendar, FileText } from 'lucide-react'
import { getAdminJobWithLogs } from '@/lib/admin/queries'
import { PageContainer } from '@/components/shared/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JobOverridePanel } from './job-override'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Job Details' }

type JobStatus = 'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled'

const statusVariant: Record<JobStatus, 'neutral' | 'default' | 'warning' | 'profit' | 'destructive'> = {
  assigned:  'neutral',
  en_route:  'default',
  on_site:   'warning',
  completed: 'profit',
  cancelled: 'destructive',
}

const LOG_ACTION_LABEL: Record<string, string> = {
  status_changed:    'Status changed',
  admin_note_added:  'Admin note',
  job_accepted:      'Job accepted',
  arrived_on_site:   'Arrived on-site',
  en_route:          'En route',
  job_completed:     'Completed',
  job_cancelled:     'Cancelled',
}

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getAdminJobWithLogs(id)

  if (!job) notFound()

  return (
    <PageContainer size="default">
      {/* Back */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 px-0 text-xs text-muted-foreground">
          <Link href="/admin/jobs">
            <ArrowLeft className="h-3.5 w-3.5" />
            All jobs
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{job.job_number}</span>
            <Badge variant={statusVariant[job.status as JobStatus]}>
              {job.status.replace('_', ' ')}
            </Badge>
          </div>
          <h1 className="text-xl font-semibold">{job.title}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Job details */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Job details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {job.description && (
                <p className="text-muted-foreground">{job.description}</p>
              )}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {job.customer_name && (
                  <>
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" /> Customer
                    </dt>
                    <dd>{job.customer_name}</dd>
                  </>
                )}
                {job.customer_phone && (
                  <>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{job.customer_phone}</dd>
                  </>
                )}
                {(job.location_city || job.location_province) && (
                  <>
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Location
                    </dt>
                    <dd>{[job.location_address, job.location_city, job.location_province].filter(Boolean).join(', ')}</dd>
                  </>
                )}
                {job.scheduled_date && (
                  <>
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Scheduled
                    </dt>
                    <dd>{formatDate(job.scheduled_date)}</dd>
                  </>
                )}
                {job.category && (
                  <>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd>{job.category}</dd>
                  </>
                )}
                {job.points_awarded != null && (
                  <>
                    <dt className="text-muted-foreground">Points awarded</dt>
                    <dd>{job.points_awarded}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Created</dt>
                <dd>{formatDate(job.created_at)}</dd>
                {job.completed_at && (
                  <>
                    <dt className="text-muted-foreground">Completed</dt>
                    <dd>{formatDate(job.completed_at)}</dd>
                  </>
                )}
              </dl>

              {job.completion_notes && (
                <div className="rounded-md bg-muted p-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Completion notes</p>
                  <p className="text-xs">{job.completion_notes}</p>
                </div>
              )}
              {job.actual_fault && (
                <div className="rounded-md bg-muted p-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Actual fault</p>
                  <p className="text-xs">{job.actual_fault}</p>
                </div>
              )}
              {job.cancelled_reason && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="mb-1 text-xs font-medium text-destructive">Cancellation reason</p>
                  <p className="text-xs">{job.cancelled_reason}</p>
                </div>
              )}
              {job.admin_notes && (
                <div className="rounded-md bg-primary/5 p-3">
                  <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <FileText className="h-3 w-3" /> Admin notes
                  </p>
                  <p className="text-xs">{job.admin_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity log */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Activity log</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              {job.logs.length === 0 ? (
                <p className="px-6 py-4 text-xs text-muted-foreground">No activity logged yet.</p>
              ) : (
                <ol className="relative ml-6 border-l border-border py-2">
                  {job.logs.map((log) => (
                    <li key={log.id} className="mb-4 ml-4 last:mb-0">
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-border bg-background" />
                      <div className="pr-6">
                        <p className="text-xs font-medium">
                          {LOG_ACTION_LABEL[log.action] ?? log.action}
                        </p>
                        {log.note && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{log.note}</p>
                        )}
                        <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground">
                          {log.actor?.full_name && (
                            <span>{log.actor.full_name} ({log.actor.role})</span>
                          )}
                          <span>{formatDate(log.created_at)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <JobOverridePanel jobId={job.id} currentStatus={job.status as JobStatus} />
        </div>
      </div>
    </PageContainer>
  )
}
