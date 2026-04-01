import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, CheckCircle2 } from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getRequestById } from '@/lib/orders/queries'
import { getProfile } from '@/lib/auth/utils'
import { PageContainer } from '@/components/shared/page-container'
import { RequestStatusBadge } from '@/components/orders/request-status-badge'
import { StatusTimeline } from '@/components/orders/status-timeline'
import { CancelRequestButton } from './cancel-request-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDatetime } from '@/lib/utils'

export const metadata: Metadata = { title: 'Order Detail' }

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ submitted?: string }>
}) {
  const { id } = await params
  const { submitted } = await searchParams
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  const request = await getRequestById(id)
  if (!request) notFound()

  // Only the owner or an admin can view this request
  if (request.user_id !== user.id && profile?.role !== 'admin') {
    redirect('/orders')
  }

  const canCancel =
    request.user_id === user.id &&
    ['pending', 'reviewing'].includes(request.status)

  return (
    <PageContainer size="wide">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-5 gap-1.5 text-muted-foreground">
        <Link href="/orders">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      {/* Submitted confirmation banner */}
      {submitted === '1' && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-profit/30 bg-profit/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-profit" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Request submitted — {request.request_number}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Our parts team will review your request and respond within 2 business hours
              with pricing and availability.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{request.request_number}</p>
          <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
            Parts Request
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submitted {formatDatetime(request.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RequestStatusBadge status={request.status} />
          {canCancel && <CancelRequestButton requestId={request.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Left col: items + customer details ──────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Items */}
          <Card>
            <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-sm font-semibold">
                Requested Parts ({request.items?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              {request.items && request.items.length > 0 ? (
                <div className="divide-y divide-border">
                  {request.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{item.part_name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {item.part_number}
                        </p>
                        {item.part_category && (
                          <p className="text-xs text-muted-foreground">{item.part_category}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-foreground">
                          ×{item.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">qty</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-6 py-4 text-sm text-muted-foreground">No items found.</p>
              )}
            </CardContent>
          </Card>

          {/* Customer details */}
          <Card>
            <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-sm font-semibold">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Name</dt>
                  <dd className="mt-0.5 text-foreground">{request.customer_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 text-foreground">{request.customer_email}</dd>
                </div>
                {request.customer_company && (
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Company</dt>
                    <dd className="mt-0.5 text-foreground">{request.customer_company}</dd>
                  </div>
                )}
                {request.customer_phone && (
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
                    <dd className="mt-0.5 text-foreground">{request.customer_phone}</dd>
                  </div>
                )}
                {request.shipping_address && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Shipping Address
                    </dt>
                    <dd className="mt-0.5 text-foreground">{request.shipping_address}</dd>
                  </div>
                )}
                {request.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-muted-foreground">Notes</dt>
                    <dd className="mt-0.5 leading-relaxed text-foreground">{request.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Admin notes (visible to admin or when populated) */}
          {request.admin_notes && (
            <Card>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-sm font-semibold">Update from Trivelox</CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <p className="text-sm leading-relaxed text-foreground">{request.admin_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right col: status timeline ───────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Card>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-sm font-semibold">Order Status</CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <StatusTimeline status={request.status} />
              </CardContent>
            </Card>

            {/* Key dates */}
            {(request.confirmed_at || request.shipped_at || request.delivered_at) && (
              <Card>
                <CardHeader className="pb-3 pt-5">
                  <CardTitle className="text-sm font-semibold">Key Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pb-5">
                  {request.confirmed_at && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Confirmed</span>
                      <span className="font-medium">{formatDate(request.confirmed_at)}</span>
                    </div>
                  )}
                  {request.shipped_at && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Shipped</span>
                      <span className="font-medium">{formatDate(request.shipped_at)}</span>
                    </div>
                  )}
                  {request.delivered_at && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Delivered</span>
                      <span className="font-medium">{formatDate(request.delivered_at)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Help */}
            <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Need to make a change?</p>
              <p className="mt-1 leading-relaxed">
                Contact our parts team and quote your request number{' '}
                <span className="font-mono text-foreground">{request.request_number}</span>.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-3 w-full">
                <Link href="/contact">Contact Parts Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
