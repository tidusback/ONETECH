import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { User, Phone, MapPin, Briefcase, Wrench, Mail, Calendar } from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { getMyApplication } from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { APPLICATION_STATUS_CONFIG, departmentOptions, MACHINE_CATEGORY_OPTIONS } from '@/lib/validations/onboarding'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'My Profile' }

export default async function TechnicianProfilePage() {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'technician') redirect('/dashboard')

  const application = await getMyApplication()

  const departmentLabels = (application?.departments ?? []).map(
    (d) => departmentOptions.find((o) => o.value === d)?.label ?? d
  )
  const machineCategoryLabels = (application?.machine_categories ?? []).map(
    (m) => MACHINE_CATEGORY_OPTIONS.find((o) => o.value === m)?.label ?? m
  )

  const statusConfig = application
    ? APPLICATION_STATUS_CONFIG[application.status]
    : null

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="My Profile"
        description="Your account information and technician details."
      />

      {/* Account info */}
      <Card className="mb-4">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-sm font-medium">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          <div className="flex items-center gap-4 px-6 py-4">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{profile?.email}</span>
          </div>
          <Separator />
          <div className="flex items-center gap-4 px-6 py-4">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">
              {application?.full_name ?? profile?.full_name ?? '—'}
            </span>
          </div>
          {application?.phone && (
            <>
              <Separator />
              <div className="flex items-center gap-4 px-6 py-4">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="w-32 shrink-0 text-sm text-muted-foreground">Phone</span>
                <a
                  href={`tel:${application.phone}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {application.phone}
                </a>
              </div>
            </>
          )}
          <Separator />
          <div className="flex items-center gap-4 px-6 py-4">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium">{formatDate(profile?.created_at ?? '')}</span>
          </div>
          {statusConfig && (
            <>
              <Separator />
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-4 shrink-0" />
                <span className="w-32 shrink-0 text-sm text-muted-foreground">Status</span>
                <span className={cn('text-sm font-medium', statusConfig.color)}>
                  {statusConfig.label}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bio */}
      {application?.bio && (
        <Card className="mb-4">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm font-medium">About Me</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{application.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Experience & specialisation */}
      {application && (
        <Card className="mb-4">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm font-medium">Experience & Specialisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {application.years_experience != null && (
              <>
                <div className="flex items-center gap-4 px-6 py-4">
                  <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="w-32 shrink-0 text-sm text-muted-foreground">Experience</span>
                  <span className="text-sm font-medium">
                    {application.years_experience} year{application.years_experience !== 1 ? 's' : ''}
                  </span>
                </div>
                <Separator />
              </>
            )}

            {departmentLabels.length > 0 && (
              <>
                <div className="flex items-start gap-4 px-6 py-4">
                  <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="w-32 shrink-0 text-sm text-muted-foreground">Departments</span>
                  <div className="flex flex-wrap gap-1.5">
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
                <Separator />
              </>
            )}

            {machineCategoryLabels.length > 0 && (
              <>
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="w-32 shrink-0 text-sm text-muted-foreground">Equipment</span>
                  <div className="flex flex-wrap gap-1.5">
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
                <Separator />
              </>
            )}

            {application.skills.length > 0 && (
              <div className="flex items-start gap-4 px-6 py-4">
                <div className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="w-32 shrink-0 text-sm text-muted-foreground">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {application.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Location */}
      {application && (application.city || application.province) && (
        <Card>
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm font-medium">Service Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {(application.city || application.province) && (
              <>
                <div className="flex items-center gap-4 px-6 py-4">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="w-32 shrink-0 text-sm text-muted-foreground">Based in</span>
                  <span className="text-sm font-medium">
                    {[application.city, application.province].filter(Boolean).join(', ')}
                  </span>
                </div>
                {application.service_radius_km != null && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-4 px-6 py-4">
                      <div className="h-4 w-4 shrink-0" />
                      <span className="w-32 shrink-0 text-sm text-muted-foreground">Radius</span>
                      <span className="text-sm font-medium">
                        {application.service_radius_km >= 9999
                          ? 'Nationwide'
                          : `${application.service_radius_km} km`}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
