import type { Metadata } from 'next'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { initials, formatDate } from '@/lib/utils'
import { User, Mail, ShieldCheck, Calendar, Pencil } from 'lucide-react'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="Profile"
        description="Manage your account details and preferences."
        actions={
          <Button variant="outline" size="sm" disabled>
            <Pencil className="h-3.5 w-3.5" />
            Edit profile
          </Button>
        }
      />

      {/* Avatar + identity */}
      <Card className="mb-4">
        <CardContent className="flex items-center gap-5 p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground select-none">
            {initials(profile?.full_name ?? profile?.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">
              {profile?.full_name ?? 'No name set'}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {profile?.email}
            </p>
            <Badge variant="secondary" className="mt-2 capitalize">
              {profile?.role ?? 'customer'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-sm font-medium">Account information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          <DetailRow
            icon={User}
            label="Full name"
            value={profile?.full_name ?? '—'}
          />
          <Separator />
          <DetailRow
            icon={Mail}
            label="Email address"
            value={profile?.email ?? '—'}
          />
          <Separator />
          <DetailRow
            icon={ShieldCheck}
            label="Role"
            value={
              <Badge variant="secondary" className="capitalize">
                {profile?.role ?? 'customer'}
              </Badge>
            }
          />
          <Separator />
          <DetailRow
            icon={Calendar}
            label="Member since"
            value={profile?.created_at ? formatDate(profile.created_at) : '—'}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

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
