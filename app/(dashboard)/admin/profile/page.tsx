import type { Metadata } from 'next'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from './profile-form'
import { initials, formatDate } from '@/lib/utils'
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Clock,
  Users,
  Zap,
  Briefcase,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Admin Profile' }

// Fetch platform-level stats the admin cares about.
async function getAdminStats() {
  const supabase = await createClient()

  const [usersResult, leadsResult, jobsResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('technician_leads')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('technician_jobs')
      .select('id', { count: 'exact', head: true })
      .in('status', ['assigned', 'en_route', 'on_site']),
  ])

  return {
    totalUsers:  usersResult.count  ?? 0,
    openLeads:   leadsResult.count  ?? 0,
    activeJobs:  jobsResult.count   ?? 0,
  }
}

export default async function AdminProfilePage() {
  const user    = await requireOnboardingComplete()
  const profile = await getProfile(user.id)
  const stats   = await getAdminStats()

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="Admin Profile"
        description="Your account details and platform overview."
      />

      {/* ── Avatar + identity ─────────────────────────────────────────────── */}
      <Card className="mb-4">
        <CardContent className="flex items-center gap-5 p-6">
          <div className="flex h-16 w-16 shrink-0 select-none items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {initials(profile?.full_name ?? profile?.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">
              {profile?.full_name ?? 'No name set'}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {profile?.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="warning" className="capitalize">
                {profile?.role ?? 'admin'}
              </Badge>
              <Badge variant="profit" className="text-[10px]">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Platform snapshot ─────────────────────────────────────────────── */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatTile icon={Users}    label="Total users"  value={stats.totalUsers} />
        <StatTile icon={Zap}      label="Open leads"   value={stats.openLeads} />
        <StatTile icon={Briefcase} label="Active jobs" value={stats.activeJobs} />
      </div>

      {/* ── Account information ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-sm font-medium">Account information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">

          {/* Editable: full name */}
          <div className="flex items-start gap-4 px-6 py-4">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-36 shrink-0 text-sm text-muted-foreground">Full name</span>
            <div className="flex-1">
              <ProfileForm currentName={profile?.full_name ?? null} />
            </div>
          </div>

          <Separator />

          {/* Read-only: email */}
          <DetailRow icon={Mail} label="Email address" value={profile?.email ?? '—'} />
          <Separator />

          {/* Read-only: role */}
          <DetailRow
            icon={ShieldCheck}
            label="Role"
            value={
              <Badge variant="warning" className="capitalize">
                {profile?.role ?? 'admin'}
              </Badge>
            }
          />
          <Separator />

          {/* Read-only: member since */}
          <DetailRow
            icon={Calendar}
            label="Member since"
            value={profile?.created_at ? formatDate(profile.created_at) : '—'}
          />
          <Separator />

          {/* Read-only: last updated */}
          <DetailRow
            icon={Clock}
            label="Last updated"
            value={profile?.updated_at ? formatDate(profile.updated_at) : '—'}
          />
        </CardContent>
      </Card>

      {/* ── Security note ─────────────────────────────────────────────────── */}
      <p className="mt-4 text-xs text-muted-foreground">
        Email address and role can only be changed directly in Supabase. Password
        reset is handled through the login page.
      </p>
    </PageContainer>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="w-36 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <Icon className="mx-auto mb-1.5 h-4 w-4 text-muted-foreground" />
      <p className="text-xl font-bold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
