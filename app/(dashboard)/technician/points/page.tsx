import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Star, TrendingUp, TrendingDown, Gift, Clock } from 'lucide-react'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import {
  getMyPointsBalance,
  getMyPendingPoints,
  getMyPointsHistory,
} from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'My Points' }

const REASON_LABEL: Record<string, string> = {
  job_completed: 'Job Completed',
  bonus:         'Bonus',
  adjustment:    'Adjustment',
  redemption:    'Reward Redemption',
}

const STATE_LABEL: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pending',  cls: 'text-amber-500' },
  released: { label: 'Released', cls: 'text-emerald-600' },
}

export default async function PointsPage() {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'technician') redirect('/dashboard')

  const [balance, pendingBalance, history] = await Promise.all([
    getMyPointsBalance(user.id),
    getMyPendingPoints(user.id),
    getMyPointsHistory(user.id),
  ])

  // Totals from released history only
  const releasedHistory = history.filter((t) => t.state === 'released')
  const totalEarned = releasedHistory.filter((t) => t.points > 0).reduce((s, t) => s + t.points, 0)
  const totalSpent  = releasedHistory.filter((t) => t.points < 0).reduce((s, t) => s + t.points, 0)

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="My Points"
        description="Track your earnings and spend your rewards."
        actions={
          <Button asChild size="sm">
            <Link href="/technician/rewards">
              <Gift className="h-3.5 w-3.5" />
              Redeem Rewards
            </Link>
          </Button>
        }
      />

      {/* Balance cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Available (spendable) */}
        <Card className="sm:col-span-2 lg:col-span-2 border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Available Balance
            </p>
            <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-primary">
              {balance.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">points available to spend</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className={pendingBalance > 0 ? 'border-amber-500/30 bg-amber-500/5' : ''}>
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending
              </p>
            </div>
            <p className={cn(
              'mt-2 font-mono text-2xl font-semibold tabular-nums',
              pendingBalance > 0 ? 'text-amber-600' : 'text-muted-foreground'
            )}>
              {pendingBalance > 0 ? `+${pendingBalance.toLocaleString()}` : '0'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">awaiting admin release</p>
          </CardContent>
        </Card>

        {/* Total spent */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Spent
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-muted-foreground">
              {totalSpent.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">redeemed</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending notice */}
      {pendingBalance > 0 && (
        <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>{pendingBalance.toLocaleString()} pts</strong> are pending admin review and will
            be available once released. Pending points cannot be redeemed yet.
          </p>
        </div>
      )}

      {/* Transaction history */}
      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-sm font-medium">
            Transaction History
            {history.length > 0 && (
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                {history.length} entries
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={Star}
                      title="No points yet"
                      description="Complete jobs to earn points that can be redeemed for rewards."
                      action={
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/technician/jobs">View my jobs</Link>
                        </Button>
                      }
                      className="py-12"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                history.map((entry) => {
                  const stateCfg = STATE_LABEL[entry.state] ?? STATE_LABEL['released']
                  return (
                    <TableRow key={entry.id} className={entry.state === 'pending' ? 'opacity-75' : ''}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="flex items-center gap-1.5">
                          {entry.points > 0 ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-muted-foreground" />
                          )}
                          {REASON_LABEL[entry.reason] ?? entry.reason}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">
                        {entry.note ?? '—'}
                      </TableCell>
                      <TableCell>
                        <span className={cn('text-xs font-medium', stateCfg.cls)}>
                          {stateCfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-mono text-sm font-medium',
                            entry.state === 'pending'
                              ? 'text-amber-600'
                              : entry.points > 0
                              ? 'text-emerald-600'
                              : 'text-muted-foreground'
                          )}
                        >
                          {entry.points > 0 ? '+' : ''}{entry.points.toLocaleString()}
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
