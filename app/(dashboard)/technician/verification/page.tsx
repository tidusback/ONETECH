import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  FileText, User, MapPin, Briefcase, Wrench, FileCheck,
} from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { getMyApplication } from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { APPLICATION_STATUS_CONFIG, departmentOptions, MACHINE_CATEGORY_OPTIONS } from '@/lib/validations/onboarding'
import { formatDate, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Verification Status' }

// Timeline steps — maps application lifecycle to a display order
const TIMELINE_STEPS = [
  {
    key: 'submitted',
    label: 'Application Submitted',
    description: 'Your application was received by Trivelox.',
    icon: FileText,
  },
  {
    key: 'under_review',
    label: 'Under Review',
    description: 'Our team is reviewing your credentials and documents.',
    icon: Clock,
  },
  {
    key: 'approved',
    label: 'Approved',
    description: 'Your profile is active and you can receive job assignments.',
    icon: CheckCircle2,
  },
] as const

function getTimelineState(
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info'
): { submittedDone: boolean; reviewDone: boolean; approvedDone: boolean } {
  return {
    submittedDone: true, // always done once we have an application
    reviewDone: ['under_review', 'approved', 'rejected', 'requires_info'].includes(status),
    approvedDone: status === 'approved',
  }
}

export default async function VerificationPage() {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'technician') redirect('/dashboard')

  const application = await getMyApplication()

  // No application yet
  if (!application) {
    return (
      <PageContainer size="narrow">
        <PageHeader
          title="Verification"
          description="Track your application and verification status."
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No Application Found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven't submitted a technician application yet.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/onboarding">Start Application</Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const statusConfig = APPLICATION_STATUS_CONFIG[application.status]
  const timeline = getTimelineState(application.status)
  const isRejected = application.status === 'rejected'
  const requiresInfo = application.status === 'requires_info'

  const departmentLabels = application.departments.map(
    (d) => departmentOptions.find((o) => o.value === d)?.label ?? d
  )
  const machineCategoryLabels = application.machine_categories.map(
    (m) => MACHINE_CATEGORY_OPTIONS.find((o) => o.value === m)?.label ?? m
  )

  const statusIcon = isRejected
    ? XCircle
    : requiresInfo
    ? AlertCircle
    : timeline.approvedDone
    ? CheckCircle2
    : Clock

  const StatusIcon = statusIcon

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="Verification"
        description="Track your application and verification status."
      />

      {/* Status banner */}
      <div
        className={cn(
          'mb-6 rounded-lg border p-5',
          isRejected
            ? 'border-destructive/30 bg-destructive/5'
            : requiresInfo
            ? 'border-orange-500/30 bg-orange-500/5'
            : timeline.approvedDone
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-amber-500/30 bg-amber-500/5'
        )}
      >
        <div className="flex items-start gap-3">
          <StatusIcon
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0',
              isRejected
                ? 'text-destructive'
                : requiresInfo
                ? 'text-orange-500'
                : timeline.approvedDone
                ? 'text-emerald-500'
                : 'text-amber-500'
            )}
          />
          <div>
            <p className={cn('font-semibold', statusConfig.color)}>{statusConfig.label}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{statusConfig.description}</p>
          </div>
        </div>
      </div>

      {/* Admin message (rejection reason or requires_info notes) */}
      {(application.rejection_reason || (requiresInfo && application.admin_notes)) && (
        <Card className="mb-4 border-orange-500/30">
          <CardHeader className="pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-orange-600">
              Message from Trivelox
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {application.rejection_reason ?? application.admin_notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card className="mb-4">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-sm font-medium">Application Progress</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="relative flex flex-col gap-0">
            {/* Submitted */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2',
                    'border-emerald-500 bg-emerald-500 text-white'
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="mt-1 w-0.5 flex-1 bg-border" />
              </div>
              <div className="pb-6 pt-0.5">
                <p className="text-sm font-medium">Application Submitted</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(application.created_at)}
                </p>
              </div>
            </div>

            {/* Under Review */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2',
                    timeline.reviewDone && !isRejected
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isRejected
                      ? 'border-destructive bg-destructive text-white'
                      : 'border-border bg-muted text-muted-foreground'
                  )}
                >
                  {isRejected ? (
                    <XCircle className="h-3.5 w-3.5" />
                  ) : timeline.reviewDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="mt-1 w-0.5 flex-1 bg-border" />
              </div>
              <div className="pb-6 pt-0.5">
                <p
                  className={cn(
                    'text-sm font-medium',
                    !timeline.reviewDone && 'text-muted-foreground'
                  )}
                >
                  Under Review
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRejected
                    ? 'Reviewed — not approved'
                    : timeline.reviewDone
                    ? 'Currently being reviewed'
                    : 'Waiting for review'}
                </p>
              </div>
            </div>

            {/* Approved */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2',
                    timeline.approvedDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-border bg-muted text-muted-foreground'
                  )}
                >
                  {timeline.approvedDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                </div>
              </div>
              <div className="pt-0.5">
                <p
                  className={cn(
                    'text-sm font-medium',
                    !timeline.approvedDone && 'text-muted-foreground'
                  )}
                >
                  Profile Active
                </p>
                <p className="text-xs text-muted-foreground">
                  {timeline.approvedDone
                    ? application.reviewed_at
                      ? `Approved ${formatDate(application.reviewed_at)}`
                      : 'Approved'
                    : 'Pending approval'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submitted data summary */}
      <Card>
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-sm font-medium">Submitted Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {/* Personal */}
          <div className="flex items-center gap-4 px-6 py-4">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Full name</p>
              <p className="text-sm font-medium">{application.full_name}</p>
            </div>
            {application.phone && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{application.phone}</p>
              </div>
            )}
          </div>
          <Separator />

          {/* Location */}
          {(application.city || application.province) && (
            <>
              <div className="flex items-center gap-4 px-6 py-4">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">
                    {[application.city, application.province].filter(Boolean).join(', ')}
                  </p>
                </div>
                {application.service_radius_km != null && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Radius</p>
                    <p className="text-sm font-medium">
                      {application.service_radius_km >= 9999
                        ? 'Nationwide'
                        : `${application.service_radius_km} km`}
                    </p>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Experience */}
          <div className="flex items-center gap-4 px-6 py-4">
            <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="text-sm font-medium">
                {application.years_experience != null
                  ? `${application.years_experience} year${application.years_experience !== 1 ? 's' : ''}`
                  : '—'}
              </p>
            </div>
          </div>
          <Separator />

          {/* Departments */}
          {departmentLabels.length > 0 && (
            <>
              <div className="flex items-start gap-4 px-6 py-4">
                <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Departments</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {departmentLabels.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Machine categories */}
          {machineCategoryLabels.length > 0 && (
            <>
              <div className="flex items-start gap-4 px-6 py-4">
                <div className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Equipment categories</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {machineCategoryLabels.map((m) => (
                      <span
                        key={m}
                        className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Documents */}
          <div className="flex items-center gap-4 px-6 py-4">
            <FileCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Documents submitted</p>
              <div className="mt-1 flex flex-wrap gap-3 text-sm font-medium">
                {application.id_document_url ? (
                  <span className="text-emerald-600">ID document ✓</span>
                ) : (
                  <span className="text-muted-foreground">No ID document</span>
                )}
                {application.qualification_urls.length > 0 ? (
                  <span className="text-emerald-600">
                    {application.qualification_urls.length} qualification
                    {application.qualification_urls.length !== 1 ? 's' : ''} ✓
                  </span>
                ) : (
                  <span className="text-muted-foreground">No qualifications</span>
                )}
              </div>
            </div>
          </div>
          <Separator />

          {/* Submitted date */}
          <div className="flex items-center gap-4 px-6 py-4">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="text-sm font-medium">{formatDate(application.created_at)}</p>
            </div>
            {application.updated_at !== application.created_at && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">{formatDate(application.updated_at)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
