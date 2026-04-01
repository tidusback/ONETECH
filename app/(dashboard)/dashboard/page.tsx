import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Wrench, Cpu, ClipboardList, LifeBuoy, Package, FileText, Activity,
  Briefcase, Zap, Star, BadgeCheck, ChevronRight, Award,
} from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { PageContainer } from '@/components/shared/page-container'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { ProfileCompletionBanner } from '@/components/shared/profile-completion-banner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getTechnicianDashboardSummary, getMyApplication } from '@/lib/technician/queries'
import { AffiliateBadge } from '@/components/technician/affiliation-badge'
import { cn, formatDate } from '@/lib/utils'
import { APPLICATION_STATUS_CONFIG } from '@/lib/validations/onboarding'
import type { JobStatus } from '@/lib/technician/queries'

export const metadata: Metadata = { title: 'Dashboard' }

// ---------------------------------------------------------------------------
// Shared quick-action component
// ---------------------------------------------------------------------------
interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
}

function QuickAction({ icon: Icon, title, description, href }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent hover:border-border/80"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 transition-colors group-hover:bg-primary/15">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Job status badge (inline, no shared component needed here)
// ---------------------------------------------------------------------------
const JOB_STATUS: Record<JobStatus, { label: string; cls: string }> = {
  assigned:  { label: 'Assigned',  cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  en_route:  { label: 'En Route',  cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  on_site:   { label: 'On Site',   cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  completed: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  cancelled: { label: 'Cancelled', cls: 'bg-muted text-muted-foreground border-border' },
}

// ---------------------------------------------------------------------------
// Technician dashboard home
// ---------------------------------------------------------------------------
async function TechnicianDashboard({ userId }: { userId: string }) {
  const [summary, application] = await Promise.all([
    getTechnicianDashboardSummary(userId),
    getMyApplication(),
  ])

  const appStatus = application?.status
  const appConfig = appStatus ? APPLICATION_STATUS_CONFIG[appStatus] : null

  return (
    <>
      {/* Application status banner */}
      {appStatus && appStatus !== 'approved' && appConfig && (
        <div
          className={cn(
            'mb-6 flex flex-col gap-1 rounded-lg border px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
            appStatus === 'rejected' || appStatus === 'requires_info'
              ? 'border-destructive/30 bg-destructive/5'
              : 'border-amber-500/30 bg-amber-500/5'
          )}
        >
          <div>
            <p className="text-sm font-medium">
              Application status:{' '}
              <span className={appConfig.color}>{appConfig.label}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{appConfig.description}</p>
            {application?.admin_notes && (
              <p className="mt-1 text-xs italic text-muted-foreground">
                Note from team: {application.admin_notes}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" asChild className="mt-3 shrink-0 sm:mt-0">
            <Link href="/technician/verification">View application</Link>
          </Button>
        </div>
      )}

      {/* Level badge strip (approved technicians only) */}
      {application?.status === 'approved' && application.affiliation_level && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Affiliation level:</span>
          <AffiliateBadge level={application.affiliation_level} size="sm" full />
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Jobs"     value={String(summary.activeJobs)} />
        <StatCard label="Open Leads"      value={String(summary.openLeads)} />
        <StatCard label="Points Balance"  value={summary.pointsBalance.toLocaleString()} />
        <StatCard label="Jobs Completed"  value={String(summary.jobsCompleted)} />
      </div>

      {/* Quick actions */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction icon={Zap}       title="Browse Leads"    description="Find available job opportunities"  href="/technician/leads" />
        <QuickAction icon={Briefcase} title="My Jobs"         description="View and update your active jobs"  href="/technician/jobs" />
        <QuickAction icon={Star}      title="My Points"       description="Check your earnings and balance"   href="/technician/points" />
        <QuickAction icon={Award}     title="My Level"        description="Track your affiliation tier"       href="/technician/level" />
      </div>

      {/* Recent jobs */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4 pt-5">
          <CardTitle className="text-sm font-medium">Recent Jobs</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/technician/jobs">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          {summary.recentJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs yet"
              description="Assigned jobs will appear here. Check available leads to get started."
              action={
                <Button size="sm" variant="outline" asChild>
                  <Link href="/technician/leads">Browse leads</Link>
                </Button>
              }
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {summary.recentJobs.map((job) => {
                const st = JOB_STATUS[job.status]
                return (
                  <div key={job.id} className="flex items-center justify-between gap-3 px-6 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{job.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{job.job_number}</span>
                        {job.location_city && <span>· {job.location_city}</span>}
                        {job.scheduled_date && (
                          <span>· {formatDate(job.scheduled_date)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          st.cls
                        )}
                      >
                        {st.label}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={`/technician/jobs/${job.id}`}>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification nudge if not approved */}
      {appStatus !== 'approved' && (
        <div className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-4 pt-5">
              <CardTitle className="text-sm font-medium">Profile &amp; Verification</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/technician/profile">View profile</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              <EmptyState
                icon={BadgeCheck}
                title="Application under review"
                description="Your access to leads and jobs will be enabled once your application is approved."
                action={
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/technician/verification">Check status</Link>
                  </Button>
                }
                className="py-10"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Customer dashboard home (unchanged logic, extracted for clarity)
// ---------------------------------------------------------------------------
function CustomerDashboard() {
  const PLACEHOLDER_STATS = [
    { label: 'Active Machines', value: '—' },
    { label: 'Open Tickets',    value: '—' },
    { label: 'Pending Orders',  value: '—' },
    { label: 'Reviews Given',   value: '—' },
  ]

  return (
    <>
      <ProfileCompletionBanner className="mb-6" />

      {/* Hero */}
      <div className="mb-6 flex flex-col items-center rounded-xl border border-border bg-card px-6 py-10 text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Machine not performing right?</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Book a professional diagnosis or repair — backed by certified technicians and genuine OEM parts.
        </p>
        <Button size="lg" className="mt-6 px-10" asChild>
          <Link href="/support/new">Fix My Machine</Link>
        </Button>
        <p className="mt-4 text-[11px] tracking-wide text-muted-foreground/70">
          Fast turnaround · Certified technicians · Genuine parts
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction icon={ClipboardList} title="Request Diagnosis" description="Book a machine check-up"         href="/support/new" />
        <QuickAction icon={LifeBuoy}      title="Open a Ticket"     description="Get support from our team"       href="/support-tickets" />
        <QuickAction icon={Package}       title="Track Orders"      description="Check parts & service orders"    href="/orders" />
        <QuickAction icon={FileText}      title="Custom Request"    description="Request a tailored quote"        href="/custom-requests" />
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLACEHOLDER_STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4 pt-5">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/diagnosis-history">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Your service requests and updates will appear here."
            action={
              <Button size="sm" asChild>
                <Link href="/diagnosis-history">
                  <Wrench className="h-3.5 w-3.5" />
                  Request a diagnosis
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>

      <div className="mt-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-4 pt-5">
            <CardTitle className="text-sm font-medium">Your Machines</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/my-machines">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 pb-1">
            <EmptyState
              icon={Cpu}
              title="No machines registered"
              description="Register your equipment to start tracking service history."
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/my-machines">Add a machine</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Entry point — role-aware
// ---------------------------------------------------------------------------
export default async function DashboardPage() {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)
  const isTechnician = profile?.role === 'technician'

  return (
    <PageContainer>
      {isTechnician ? (
        <TechnicianDashboard userId={user.id} />
      ) : (
        <CustomerDashboard />
      )}
    </PageContainer>
  )
}
