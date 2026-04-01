import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Users, ArrowRight } from 'lucide-react'
import { getCustomers } from '@/lib/admin/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterBar } from '@/components/admin/filter-bar'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Customers' }

const ONBOARDING_OPTIONS = [
  { value: 'onboarded',   label: 'Onboarded' },
  { value: 'incomplete',  label: 'Incomplete' },
]

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const sp = await searchParams
  const customers = await getCustomers()

  const filtered = customers.filter((c) => {
    if (sp.status === 'onboarded' && !c.onboarding_completed_at) return false
    if (sp.status === 'incomplete' && c.onboarding_completed_at) return false
    if (sp.search) {
      const q = sp.search.toLowerCase()
      if (
        !(c.full_name ?? '').toLowerCase().includes(q) &&
        !c.email.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Customers"
        description="All registered customer accounts."
        actions={<Badge variant="neutral">{customers.length} total</Badge>}
      />

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{customers.length}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">
            {customers.filter((c) => c.onboarding_completed_at).length}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Onboarded</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">
            {customers.filter((c) => !c.onboarding_completed_at).length}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Incomplete</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All customers
            {filtered.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {filtered.length}{customers.length !== filtered.length ? ` of ${customers.length}` : ''} total
              </span>
            )}
          </CardTitle>
          <Suspense>
            <FilterBar
              searchPlaceholder="Search customers…"
              statusOptions={ONBOARDING_OPTIONS}
              className="w-auto"
            />
          </Suspense>
        </CardHeader>

        <CardContent className="mt-4 p-0 pb-1">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers found"
              description={
                customers.length === 0
                  ? 'Customer accounts will appear here once users register.'
                  : 'No customers match the current filters.'
              }
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((customer) => (
                <div
                  key={customer.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {customer.full_name ?? (
                        <span className="italic text-muted-foreground">No name</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Joined {formatDate(customer.created_at)}</span>
                      {customer.onboarding_completed_at ? (
                        <Badge variant="profit" className="text-[10px]">Onboarded</Badge>
                      ) : (
                        <Badge variant="neutral" className="text-[10px]">Setup incomplete</Badge>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" asChild className="shrink-0 gap-1.5 text-xs">
                    <Link href={`/admin/customers/${customer.id}`}>
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
