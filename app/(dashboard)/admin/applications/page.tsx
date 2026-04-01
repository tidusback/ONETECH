import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList, MoreHorizontal, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Applications' }

type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info'

const statusVariant: Record<ApplicationStatus, 'warning' | 'default' | 'profit' | 'destructive' | 'neutral'> = {
  pending:       'warning',
  under_review:  'default',
  approved:      'profit',
  rejected:      'destructive',
  requires_info: 'neutral',
}

const statusLabel: Record<ApplicationStatus, string> = {
  pending:       'Pending',
  under_review:  'Under Review',
  approved:      'Approved',
  rejected:      'Rejected',
  requires_info: 'Needs Info',
}

async function getApplications() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_applications')
    .select(`
      id,
      status,
      full_name,
      phone,
      city,
      created_at,
      reviewed_at,
      rejection_reason,
      admin_notes,
      profile:profiles!user_id(email)
    `)
    .order('created_at', { ascending: false })
  return (data ?? []) as unknown as Array<{
    id: string
    status: ApplicationStatus
    full_name: string
    phone: string | null
    city: string | null
    created_at: string
    reviewed_at: string | null
    rejection_reason: string | null
    admin_notes: string | null
    profile: { email: string } | null
  }>
}

export default async function AdminApplicationsPage() {
  const applications = await getApplications()

  const counts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})

  const pendingCount = (counts['pending'] ?? 0) + (counts['under_review'] ?? 0)

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Technician Applications"
        description="Review and process incoming technician applications."
        actions={
          pendingCount > 0 ? (
            <Badge variant="warning">{pendingCount} need review</Badge>
          ) : undefined
        }
      />

      {/* Status strip */}
      {applications.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(['pending', 'under_review', 'approved', 'rejected', 'requires_info'] as ApplicationStatus[]).map(
            (s) => (
              <div key={s} className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-lg font-bold tabular-nums">{counts[s] ?? 0}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{statusLabel[s]}</p>
              </div>
            ),
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All applications
            {applications.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {applications.length} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {applications.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No applications yet"
              description="Technician applications will appear here once submitted."
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{app.full_name}</span>
                      <Badge variant={statusVariant[app.status]}>
                        {statusLabel[app.status]}
                      </Badge>
                    </div>
                    {app.profile && (
                      <p className="text-xs text-muted-foreground">{app.profile.email}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {app.city && <span>{app.city}</span>}
                      <span>Submitted {formatDate(app.created_at)}</span>
                      {app.admin_notes && (
                        <span className="max-w-xs truncate italic">Note: {app.admin_notes}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                      <Link href={`/admin/technicians`}>
                        Review <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark as under review</DropdownMenuItem>
                        <DropdownMenuItem>Request more info</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-profit focus:text-profit">
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
