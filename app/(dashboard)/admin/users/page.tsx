import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, ArrowRight, ShieldCheck, Wrench, User } from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { getAllProfiles } from '@/lib/admin/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterBar } from '@/components/admin/filter-bar'
import { formatDate } from '@/lib/utils'
import type { UserRole } from '@/types'

export const metadata: Metadata = { title: 'Users' }

const ROLE_OPTIONS = [
  { value: 'customer',    label: 'Customers' },
  { value: 'technician',  label: 'Technicians' },
  { value: 'admin',       label: 'Admins' },
]

const ONBOARDING_OPTIONS = [
  { value: 'onboarded',  label: 'Onboarded' },
  { value: 'incomplete', label: 'Incomplete' },
]

const roleVariant: Record<UserRole, 'neutral' | 'default' | 'warning'> = {
  customer:   'neutral',
  technician: 'default',
  admin:      'warning',
}

const RoleIcon: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  customer:   User,
  technician: Wrench,
  admin:      ShieldCheck,
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; role?: string }>
}) {
  const sp = await searchParams
  const user    = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'admin') redirect('/dashboard')

  const users = await getAllProfiles()

  const filtered = users.filter((u) => {
    if (sp.role && u.role !== sp.role) return false
    if (sp.status === 'onboarded' && !u.onboarding_completed_at) return false
    if (sp.status === 'incomplete' && u.onboarding_completed_at) return false
    if (sp.search) {
      const q = sp.search.toLowerCase()
      if (
        !(u.full_name ?? '').toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const byRole = {
    customer:   users.filter((u) => u.role === 'customer').length,
    technician: users.filter((u) => u.role === 'technician').length,
    admin:      users.filter((u) => u.role === 'admin').length,
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Users"
        description="All registered accounts across every role."
        actions={<Badge variant="neutral">{users.length} total</Badge>}
      />

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{users.length}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{byRole.customer}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Customers</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{byRole.technician}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Technicians</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{byRole.admin}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Admins</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All users
            {filtered.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {filtered.length}
                {users.length !== filtered.length ? ` of ${users.length}` : ''}
              </span>
            )}
          </CardTitle>
          <Suspense>
            <FilterBar
              searchPlaceholder="Search by name or email…"
              statusOptions={ONBOARDING_OPTIONS}
              extraFilters={[
                { param: 'role', placeholder: 'All roles', options: ROLE_OPTIONS },
              ]}
              className="w-auto"
            />
          </Suspense>
        </CardHeader>

        <CardContent className="mt-4 p-0 pb-1">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description={
                users.length === 0
                  ? 'User accounts will appear here once people register.'
                  : 'No users match the current filters.'
              }
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((user) => {
                const Icon = RoleIcon[user.role]
                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">
                            {user.full_name ?? (
                              <span className="italic text-muted-foreground">No name</span>
                            )}
                          </p>
                          <Badge variant={roleVariant[user.role]} className="text-[10px]">
                            {user.role}
                          </Badge>
                          {user.onboarding_completed_at ? (
                            <Badge variant="profit" className="text-[10px]">Onboarded</Badge>
                          ) : (
                            <Badge variant="neutral" className="text-[10px]">Incomplete</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                          Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>

                    {user.role === 'customer' && (
                      <Button variant="ghost" size="sm" asChild className="shrink-0 gap-1.5 text-xs">
                        <Link href={`/admin/customers/${user.id}`}>
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                    {user.role === 'technician' && (
                      <Button variant="ghost" size="sm" asChild className="shrink-0 gap-1.5 text-xs">
                        <Link href="/admin/technicians">
                          Manage <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
