import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Radio, Wrench, AlertCircle } from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { getMyApplication } from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { departmentOptions, MACHINE_CATEGORY_OPTIONS, TECHNICIAN_SKILLS } from '@/lib/validations/onboarding'

export const metadata: Metadata = { title: 'Service Areas' }

export default async function ServiceAreasPage() {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'technician') redirect('/dashboard')

  const application = await getMyApplication()

  if (!application) {
    return (
      <PageContainer size="narrow">
        <PageHeader
          title="Service Areas"
          description="Your coverage area and specialisations."
        />
        <EmptyState
          icon={MapPin}
          title="No application on file"
          description="Submit your technician application to set up your service area."
          action={
            <Button size="sm" asChild>
              <Link href="/onboarding">Start Application</Link>
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const departmentLabels = application.departments.map(
    (d) => departmentOptions.find((o) => o.value === d)?.label ?? d
  )
  const machineCategoryLabels = application.machine_categories.map(
    (m) => MACHINE_CATEGORY_OPTIONS.find((o) => o.value === m)?.label ?? m
  )

  const radiusLabel =
    application.service_radius_km != null && application.service_radius_km >= 9999
      ? 'Nationwide'
      : application.service_radius_km != null
      ? `${application.service_radius_km} km from base`
      : null

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="Service Areas"
        description="Your coverage area and technical specialisations."
      />

      {/* Not-approved notice */}
      {application.status !== 'approved' && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Your application is not yet approved. Service area info is visible once your profile is active.
          </p>
        </div>
      )}

      {/* Coverage area */}
      <Card className="mb-4">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-sm font-medium">Coverage Area</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {(application.city || application.province) ? (
            <>
              <div className="flex items-center gap-4 px-6 py-4">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="w-28 shrink-0 text-sm text-muted-foreground">Base location</span>
                <span className="text-sm font-medium">
                  {[application.city, application.province].filter(Boolean).join(', ')}
                </span>
              </div>

              {radiusLabel && (
                <>
                  <Separator />
                  <div className="flex items-center gap-4 px-6 py-4">
                    <Radio className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="w-28 shrink-0 text-sm text-muted-foreground">Travel radius</span>
                    <span className="text-sm font-medium">{radiusLabel}</span>
                  </div>
                </>
              )}

              {application.service_areas.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-start gap-4 px-6 py-4">
                    <div className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="w-28 shrink-0 text-sm text-muted-foreground">Areas covered</span>
                    <div className="flex flex-wrap gap-1.5">
                      {application.service_areas.map((area) => (
                        <span
                          key={area}
                          className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              No location info on file.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Departments */}
      {departmentLabels.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="flex flex-wrap gap-2">
              {departmentLabels.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium"
                >
                  {d}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment categories */}
      {machineCategoryLabels.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm font-medium">Equipment Categories</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="flex flex-wrap gap-2">
              {machineCategoryLabels.map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {application.skills.length > 0 && (
        <Card>
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              Technical Skills
              <span className="ml-auto font-mono text-xs font-normal text-muted-foreground">
                {application.skills.length} of {TECHNICIAN_SKILLS.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="flex flex-wrap gap-2">
              {application.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
