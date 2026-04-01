import type { Metadata } from 'next'
import { Gift, Clock, CheckCircle2, XCircle, Tag, Package, Banknote, Wrench } from 'lucide-react'
import {
  getAllPendingRedemptions,
  getAllRedemptions,
  getRewardsCatalog,
} from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { RedemptionActions, RewardToggle } from './redemption-actions'

export const metadata: Metadata = { title: 'Rewards Management' }

const CATEGORY_CONFIG: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  voucher:         { label: 'Voucher',        Icon: Tag },
  tool:            { label: 'Tool',            Icon: Wrench },
  merchandise:     { label: 'Merchandise',     Icon: Package },
  cash_equivalent: { label: 'Cash Equiv.',     Icon: Banknote },
}

const STATUS_STYLE: Record<string, { cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  pending:   { cls: 'text-amber-600',           Icon: Clock },
  fulfilled: { cls: 'text-emerald-600',         Icon: CheckCircle2 },
  cancelled: { cls: 'text-muted-foreground',    Icon: XCircle },
}

export default async function AdminRewardsPage() {
  const [pending, all, catalog] = await Promise.all([
    getAllPendingRedemptions(),
    getAllRedemptions(),
    getRewardsCatalog(),
  ])

  const totalPendingPts = pending.reduce((s, r) => s + r.points_spent, 0)

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Rewards Management"
        description="Review and fulfill pending redemption requests, and manage the rewards catalog."
      />

      {/* Summary strip */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending Redemptions
              </p>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-amber-600">
              {pending.length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {totalPendingPts.toLocaleString()} pts value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Fulfilled (recent 200)
              </p>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
              {all.filter((r) => r.status === 'fulfilled').length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">in current view</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Active Rewards
              </p>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
              {catalog.filter((r) => r.is_active).length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              of {catalog.length} total in catalog
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Pending redemptions */}
        <Card>
          <CardHeader className="pb-0 pt-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Redemptions
              {pending.length > 0 && (
                <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {pending.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4 p-0 pb-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState
                        icon={CheckCircle2}
                        title="No pending redemptions"
                        description="All redemption requests have been processed."
                        className="py-10"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  pending.map((r) => {
                    const cat = r.technician_rewards?.category
                      ? (CATEGORY_CONFIG[r.technician_rewards.category] ?? CATEGORY_CONFIG['voucher'])
                      : null
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm">
                          <p className="font-medium">{r.profiles?.full_name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{r.profiles?.email}</p>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {r.technician_rewards?.title ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {cat ? (
                            <span className="flex items-center gap-1">
                              <cat.Icon className="h-3 w-3" />
                              {cat.label}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(r.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-sm font-medium text-amber-600">
                            {r.points_spent.toLocaleString()} pts
                          </span>
                        </TableCell>
                        <TableCell>
                          <RedemptionActions redemptionId={r.id} />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Redemption history */}
        <Card>
          <CardHeader className="pb-0 pt-5">
            <CardTitle className="text-sm font-medium">
              Redemption History
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                (latest 200)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4 p-0 pb-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {all.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No redemptions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  all.map((r) => {
                    const st = STATUS_STYLE[r.status] ?? STATUS_STYLE['pending']
                    const cat = r.technician_rewards?.category
                      ? (CATEGORY_CONFIG[r.technician_rewards.category] ?? CATEGORY_CONFIG['voucher'])
                      : null
                    return (
                      <TableRow
                        key={r.id}
                        className={r.status === 'cancelled' ? 'opacity-50' : ''}
                      >
                        <TableCell className="text-sm">
                          <p className="font-medium">{r.profiles?.full_name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{r.profiles?.email}</p>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {r.technician_rewards?.title ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {cat ? (
                            <span className="flex items-center gap-1">
                              <cat.Icon className="h-3 w-3" />
                              {cat.label}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <span className={cn('flex items-center gap-1 text-xs font-medium', st.cls)}>
                            <st.Icon className="h-3 w-3" />
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(r.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-sm text-muted-foreground">
                            {r.points_spent.toLocaleString()} pts
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Rewards catalog management */}
        <Card>
          <CardHeader className="pb-0 pt-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Gift className="h-4 w-4" />
              Rewards Catalog
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Toggle rewards active or inactive. Inactive rewards are hidden from technicians.
            </p>
          </CardHeader>
          <CardContent className="mt-4 p-0 pb-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState
                        icon={Gift}
                        title="No rewards in catalog"
                        description="Add rewards to the catalog via Supabase or a future admin form."
                        className="py-10"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  catalog.map((reward) => {
                    const cat = CATEGORY_CONFIG[reward.category] ?? CATEGORY_CONFIG['voucher']
                    return (
                      <TableRow key={reward.id} className={reward.is_active ? '' : 'opacity-60'}>
                        <TableCell className="text-sm font-medium">{reward.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <cat.Icon className="h-3 w-3" />
                            {cat.label}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {reward.description ?? '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-sm font-medium text-primary">
                            {reward.points_cost.toLocaleString()} pts
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {reward.stock === null ? 'Unlimited' : reward.stock}
                        </TableCell>
                        <TableCell>
                          <RewardToggle
                            rewardId={reward.id}
                            isActive={reward.is_active}
                            title={reward.title}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
