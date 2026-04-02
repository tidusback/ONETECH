import type { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, MapPin, Calendar, ArrowRight } from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { getMyJobs } from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JobStatusUpdater } from '@/components/technician/job-status-updater'
import { cn, formatDate } from '@/lib/utils'
import type { JobStatus } from '@/lib/technician/queries'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'My Jobs' }

const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; cls: string }> = {
  assigned:  { label: 'Assigned',  cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  en_route:  { label: 'En Route',  cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  on_site:   { label: 'On Site',   cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  completed: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  cancelled: { label: 'Cancelled', cls: 'bg-muted text-muted-foreground border-border' },
}

export default async function JobsPage() {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'technician') redirect('/dashboard')

  const jobs = await getMyJobs(user.id)

  const activeJobs    = jobs.filter((j) => !['completed', 'cancelled'].includes(j.status))
  const completedJobs = jobs.filter((j) => j.status === 'completed')

  return (
    <PageContainer size="wide">
      <PageHeader
        title="My Jobs"
        description="All assigned work orders and their current status."
        actions={
          activeJobs.length > 0 ? (
            <Badge variant="warning">{activeJobs.length} active</Badge>
          ) : undefined
        }
      />

      {/* Active jobs */}
      <Card className="mb-6">
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-sm font-medium">
            Active Jobs
            <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
              {activeJobs.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {activeJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No active jobs"
              description="Your assigned jobs will appear here."
              className="py-10"
            />
          ) : (
            <div className="divide-y divide-border">
              {activeJobs.map((job) => {
                const st = JOB_STATUS_CONFIG[job.status]
                return (
                  <div key={job.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {job.job_number}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                            st.cls
                          )}
                        >
                          {st.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium">{job.title}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {(job.location_city || job.location_province) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[job.location_city, job.location_province].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {job.scheduled_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(job.scheduled_date)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                        <Link href={`/technician/jobs/${job.id}`}>
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                      <JobStatusUpdater jobId={job.id} currentStatus={job.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed / history */}
      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-sm font-medium">
            Completed Jobs
            <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
              {completedJobs.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 overflow-x-auto p-0 pb-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Points</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={Briefcase}
                      title="No completed jobs yet"
                      description="Finished jobs will appear here."
                      className="py-10"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                completedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {job.job_number}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {job.title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {job.category ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {job.completed_at ? formatDate(job.completed_at) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {job.points_awarded != null ? (
                        <span className="text-emerald-600">+{job.points_awarded}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                        <Link href={`/technician/jobs/${job.id}`}>
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
