import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, Calendar, User, Phone, Wrench, CheckCircle2,
  Clock, Navigation, ArrowLeft, History,
} from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { getJobById, getJobLogs } from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { JobStatusUpdater } from '@/components/technician/job-status-updater'
import { JobFaultCapture } from '@/components/technician/job-fault-capture'
import { JobLogTimeline } from '@/components/technician/job-log-timeline'
import { cn, formatDate, formatDatetime } from '@/lib/utils'
import type { JobStatus } from '@/lib/technician/queries'

export const metadata: Metadata = { title: 'Job Details' }

const JOB_STATUS_CONFIG: Record<
  JobStatus,
  { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }
> = {
  assigned:  { label: 'Assigned',  cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20',       icon: Clock },
  en_route:  { label: 'En Route',  cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20',    icon: Navigation },
  on_site:   { label: 'On Site',   cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20', icon: Wrench },
  completed: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', cls: 'bg-muted text-muted-foreground border-border',           icon: Clock },
}

const STATUS_ORDER: JobStatus[] = ['assigned', 'en_route', 'on_site', 'completed']

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'technician') redirect('/dashboard')

  const [job, logs] = await Promise.all([
    getJobById(id),
    getJobLogs(id),
  ])

  if (!job || job.technician_id !== user.id) notFound()

  const st = JOB_STATUS_CONFIG[job.status]
  const StatusIcon = st.icon
  const currentStepIdx = STATUS_ORDER.indexOf(job.status)

  return (
    <PageContainer size="narrow">
      {/* Back */}
      <div className="mb-5">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5 text-muted-foreground">
          <Link href="/technician/jobs">
            <ArrowLeft className="h-3.5 w-3.5" />
            My Jobs
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{job.job_number}</span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
                st.cls
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {st.label}
            </span>
          </div>
          <h1 className="mt-2 text-lg font-semibold tracking-tight">{job.title}</h1>
          {job.category && (
            <p className="mt-0.5 text-sm text-muted-foreground">{job.category}</p>
          )}
        </div>
        <JobStatusUpdater jobId={job.id} currentStatus={job.status} />
      </div>

      {/* Progress tracker */}
      {job.status !== 'cancelled' && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-0">
              {STATUS_ORDER.map((s, i) => {
                const passed    = i <= currentStepIdx
                const isCurrent = i === currentStepIdx
                return (
                  <div key={s} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                          passed
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted text-muted-foreground'
                        )}
                      >
                        {passed && !isCurrent ? '✓' : i + 1}
                      </div>
                      <span className={cn('whitespace-nowrap text-[9px] font-medium', passed ? 'text-foreground' : 'text-muted-foreground')}>
                        {JOB_STATUS_CONFIG[s].label}
                      </span>
                    </div>
                    {i < STATUS_ORDER.length - 1 && (
                      <div
                        className={cn(
                          'mb-4 h-0.5 flex-1',
                          i < currentStepIdx ? 'bg-primary' : 'bg-border'
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled notice */}
      {job.status === 'cancelled' && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">This job has been cancelled.</p>
          {job.cancelled_reason && (
            <p className="mt-0.5 text-xs text-muted-foreground">{job.cancelled_reason}</p>
          )}
        </div>
      )}

      {/* Actual fault capture — shown on_site and beyond */}
      <div className="mb-4">
        <JobFaultCapture
          jobId={job.id}
          currentFault={job.actual_fault ?? null}
          jobStatus={job.status}
        />
      </div>

      {/* Job details */}
      <Card className="mb-4">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-sm font-medium">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {job.description && (
            <>
              <div className="px-6 py-4">
                <p className="text-xs leading-relaxed text-muted-foreground">{job.description}</p>
              </div>
              <Separator />
            </>
          )}

          {job.scheduled_date && (
            <>
              <div className="flex items-center gap-4 px-6 py-4">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="w-32 shrink-0 text-sm text-muted-foreground">Scheduled</span>
                <span className="text-sm font-medium">{formatDatetime(job.scheduled_date)}</span>
              </div>
              <Separator />
            </>
          )}

          {(job.location_address || job.location_city) && (
            <>
              <div className="flex items-center gap-4 px-6 py-4">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="w-32 shrink-0 text-sm text-muted-foreground">Location</span>
                <span className="text-sm font-medium">
                  {[job.location_address, job.location_city, job.location_province]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
              <Separator />
            </>
          )}

          {job.customer_name && (
            <>
              <div className="flex items-center gap-4 px-6 py-4">
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="w-32 shrink-0 text-sm text-muted-foreground">Customer</span>
                <span className="text-sm font-medium">{job.customer_name}</span>
              </div>
              <Separator />
            </>
          )}

          {job.customer_phone && (
            <>
              <div className="flex items-center gap-4 px-6 py-4">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="w-32 shrink-0 text-sm text-muted-foreground">Phone</span>
                <a
                  href={`tel:${job.customer_phone}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {job.customer_phone}
                </a>
              </div>
              <Separator />
            </>
          )}

          <div className="flex items-center gap-4 px-6 py-4">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-sm text-muted-foreground">Assigned</span>
            <span className="text-sm font-medium">{formatDate(job.created_at)}</span>
          </div>

          {job.completed_at && (
            <>
              <Separator />
              <div className="flex items-center gap-4 px-6 py-4">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="w-32 shrink-0 text-sm text-muted-foreground">Completed</span>
                <span className="text-sm font-medium text-emerald-600">
                  {formatDatetime(job.completed_at)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Admin notes */}
      {job.admin_notes && (
        <Card className="mb-4">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm font-medium">Notes from Trivelox</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{job.admin_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Completion notes */}
      {job.completion_notes && (
        <Card className="mb-4">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm font-medium">Completion Notes</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{job.completion_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Points earned */}
      {job.points_awarded != null && job.status === 'completed' && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">Points earned for this job</p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-600">
            +{job.points_awarded}
          </p>
        </div>
      )}

      {/* Activity log */}
      <Card>
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4 text-muted-foreground" />
            Activity Log
            {logs.length > 0 && (
              <span className="ml-auto font-mono text-xs font-normal text-muted-foreground">
                {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <JobLogTimeline logs={logs} />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
