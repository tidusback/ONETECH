import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, CheckCircle2, Clock } from 'lucide-react'
import { getCustomerDetail } from '@/lib/admin/queries'
import { PageContainer } from '@/components/shared/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { Tables } from '@/types/database.types'

export const metadata: Metadata = { title: 'Customer Details' }

type RequestStatus = Tables<'part_requests'>['status']

const requestStatusVariant: Record<RequestStatus, 'warning' | 'default' | 'neutral' | 'profit' | 'destructive' | 'secondary'> = {
  pending:    'warning',
  reviewing:  'default',
  quoted:     'neutral',
  confirmed:  'default',
  processing: 'neutral',
  shipped:    'default',
  delivered:  'profit',
  cancelled:  'destructive',
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await getCustomerDetail(id)

  if (!detail) notFound()

  const { profile, requests } = detail
  const totalRequests  = requests.length
  const deliveredCount = requests.filter((r) => r.status === 'delivered').length

  return (
    <PageContainer size="default">
      {/* Back */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 px-0 text-xs text-muted-foreground">
          <Link href="/admin/customers">
            <ArrowLeft className="h-3.5 w-3.5" />
            All customers
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{profile.full_name ?? 'Unnamed customer'}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <Badge variant={profile.onboarding_completed_at ? 'profit' : 'warning'}>
          {profile.onboarding_completed_at ? 'Onboarded' : 'Not onboarded'}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Part requests */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium">Part requests</h2>

          {requests.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No part requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {req.request_number}
                      </span>
                      <Badge variant={requestStatusVariant[req.status]}>
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatDate(req.created_at)}
                    </p>
                    {req.items.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {req.items.map((item) => (
                          <li key={item.id} className="text-xs">
                            <span className="font-medium">{item.part_name}</span>
                            <span className="text-muted-foreground"> × {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Profile sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span>{formatDate(profile.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Onboarding</span>
                <span className="flex items-center gap-1">
                  {profile.onboarding_completed_at ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-profit" />
                      {formatDate(profile.onboarding_completed_at)}
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 text-warning" />
                      Pending
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total requests</span>
                <span className="font-medium tabular-nums">{totalRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivered</span>
                <span className="font-medium tabular-nums">{deliveredCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
