import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Briefcase, ArrowRight } from 'lucide-react'
import { getAllJobsAdmin } from '@/lib/admin/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterBar } from '@/components/admin/filter-bar'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Service Jobs' }

type JobStatus = 'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled'

const statusVariant: Record<JobStatus, 'neutral' | 'default' | 'warning' | 'profit' | 'destructive'> = {
  assigned:  'neutral',
  en_route:  'default',
  on_site:   'warning',
  completed: 'profit',
  cancelled: 'destructive',
}

const STATUS_OPTIONS = [
  { value: 'assigned',  label: 'Assigned' },
  { value: 'en_route',  label: 'En route' },
  { value: 'on_site',   label: 'On-site' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const sp = await searchParams
  const jobs = await getAllJobsAdmin()

  const filtered = jobs.filter((j) => {
    if (sp.status && j.status !== sp.status) return false
    if (sp.search) {
      const q = sp.search.toLowerCase()
      if (
        !j.title.toLowerCase().includes(q) &&
        !(j.customer_name ?? '').toLowerCase().includes(q) &&
        !(j.location_city ?? '').toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const counts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Service Jobs"
        description="All field service jobs across the technician network."
        actions={
          (counts['on_site'] ?? 0) > 0 ? (
            <Badge variant="warning">{counts['on_site']} on-site</Badge>
          ) : undefined
        }
      />

      {/* Status strip */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {(['assigned', 'en_route', 'on_site', 'completed', 'cancelled'] as JobStatus[]).map((s) => (
          <div key={s} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold tabular-nums">{counts[s] ?? 0}</p>
            <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
              {s.replace('_', ' ')}
            </p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All jobs
            {filtered.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {filtered.length}{jobs.length !== filtered.length ? ` of ${jobs.length}` : ''} total
              </span>
            )}
          </CardTitle>
          <Suspense>
            <FilterBar
              searchPlaceholder="Search jobs…"
              statusOptions={STATUS_OPTIONS}
              className="w-auto"
            />
          </Suspense>
        </CardHeader>

        <CardContent className="mt-4 p-0 pb-1">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No service jobs found"
              description={
                jobs.length === 0
                  ? 'Jobs will appear here once technicians accept leads.'
                  : 'No jobs match the current filters.'
              }
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {job.job_number}
                      </span>
                      <Badge variant={statusVariant[job.status as JobStatus]}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium">{job.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {job.customer_name && <span>{job.customer_name}</span>}
                      {job.location_city && <span>{job.location_city}</span>}
                      {job.scheduled_date && (
                        <span>Scheduled {formatDate(job.scheduled_date)}</span>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" asChild className="shrink-0 gap-1.5 text-xs">
                    <Link href={`/admin/jobs/${job.id}`}>
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
