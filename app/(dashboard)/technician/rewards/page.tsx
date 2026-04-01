import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Gift, Star, Tag, Package, Banknote, Wrench, CheckCircle2, Clock } from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { getActiveRewards, getMyRedemptions, getMyPointsBalance } from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RedeemButton } from '@/components/technician/redeem-button'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Rewards' }

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  voucher:          { label: 'Voucher',         icon: Tag },
  tool:             { label: 'Tool',             icon: Wrench },
  merchandise:      { label: 'Merchandise',      icon: Package },
  cash_equivalent:  { label: 'Cash Equivalent',  icon: Banknote },
}

const REDEMPTION_STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending:    { label: 'Pending',    cls: 'text-amber-600',   icon: Clock },
  fulfilled:  { label: 'Fulfilled',  cls: 'text-emerald-600', icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  cls: 'text-muted-foreground', icon: Clock },
}

export default async function RewardsPage() {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'technician') redirect('/dashboard')

  const [balance, rewards, redemptions] = await Promise.all([
    getMyPointsBalance(user.id),
    getActiveRewards(),
    getMyRedemptions(user.id),
  ])

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Rewards"
        description="Spend your points on vouchers, tools, and more."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/technician/points">
              <Star className="h-3.5 w-3.5" />
              {balance.toLocaleString()} pts
            </Link>
          </Button>
        }
      />

      {/* Points balance banner */}
      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Available Balance
            </p>
            <p className="mt-0.5 font-mono text-3xl font-bold tabular-nums text-primary">
              {balance.toLocaleString()}
              <span className="ml-1.5 text-base font-normal text-muted-foreground">points</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete jobs to earn more points
          </p>
        </div>
      </div>

      {/* Rewards catalog */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold tracking-tight">Rewards Catalog</h2>
        {rewards.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="No rewards available"
            description="Check back soon — new rewards will be added regularly."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rewards.map((reward) => {
              const cat = CATEGORY_CONFIG[reward.category] ?? CATEGORY_CONFIG['voucher']
              const CategoryIcon = cat.icon
              const canAfford = balance >= reward.points_cost

              return (
                <Card
                  key={reward.id}
                  className={canAfford ? '' : 'opacity-60'}
                >
                  <CardContent className="p-5">
                    {/* Category badge */}
                    <div className="mb-3 flex items-center gap-1.5">
                      <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {cat.label}
                      </span>
                    </div>

                    {/* Title & description */}
                    <h3 className="text-sm font-semibold leading-snug">{reward.title}</h3>
                    {reward.description && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {reward.description}
                      </p>
                    )}

                    {/* Points cost */}
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="font-mono text-xl font-bold tabular-nums text-primary">
                        {reward.points_cost.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>

                    {/* Redeem button */}
                    <div className="mt-3">
                      <RedeemButton
                        rewardId={reward.id}
                        pointsCost={reward.points_cost}
                        balance={balance}
                        title={reward.title}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Redemption history */}
      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-sm font-medium">
            Redemption History
            {redemptions.length > 0 && (
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                {redemptions.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redemptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={Gift}
                      title="No redemptions yet"
                      description="Redeem your points for rewards above."
                      className="py-10"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                redemptions.map((r) => {
                  const st = REDEMPTION_STATUS_CONFIG[r.status] ?? REDEMPTION_STATUS_CONFIG['pending']
                  const StatusIcon = st.icon
                  const cat = r.technician_rewards?.category
                    ? (CATEGORY_CONFIG[r.technician_rewards.category] ?? CATEGORY_CONFIG['voucher'])
                    : null

                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(r.created_at)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {r.technician_rewards?.title ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cat ? (
                          <span className="flex items-center gap-1">
                            <cat.icon className="h-3 w-3" />
                            {cat.label}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-sm text-muted-foreground">
                          -{r.points_spent.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 text-xs font-medium ${st.cls}`}>
                          <StatusIcon className="h-3 w-3" />
                          {st.label}
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
    </PageContainer>
  )
}
