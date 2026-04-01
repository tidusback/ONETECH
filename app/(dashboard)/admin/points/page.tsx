import type { Metadata } from 'next'
import { Star, Clock, CheckCircle2, PlusCircle, History } from 'lucide-react'
import { getAllPendingPoints, getAllPointsEntries, getApprovedTechnicians } from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { PointsEntryActions, GrantPointsForm } from './points-actions'

export const metadata: Metadata = { title: 'Points Management' }

const REASON_LABEL: Record<string, string> = {
  job_completed: 'Job Completed',
  bonus:         'Bonus',
  adjustment:    'Adjustment',
  redemption:    'Reward Redemption',
}

const STATE_STYLE: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  released: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-600',
  voided:   'bg-muted text-muted-foreground',
}

export default async function AdminPointsPage() {
  const [pending, all, technicians] = await Promise.all([
    getAllPendingPoints(),
    getAllPointsEntries(),
    getApprovedTechnicians(),
  ])

  const totalPendingPts = pending.reduce((s, e) => s + e.points, 0)

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Points Management"
        description="Review pending points, view history, and grant bonus or adjustment points."
      />

      {/* Summary strip */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending Entries
              </p>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-amber-600">
              {pending.length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {totalPendingPts.toLocaleString()} pts awaiting release
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Released (recent 200)
              </p>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
              {all.filter((e) => e.state === 'released').length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">entries in current view</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Approved Technicians
              </p>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
              {technicians.length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">eligible to receive points</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: pending + history */}
        <div className="space-y-6 lg:col-span-2">

          {/* Pending entries */}
          <Card>
            <CardHeader className="pb-0 pt-5">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending Points
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
                    <TableHead>Reason</TableHead>
                    <TableHead>Note / Job</TableHead>
                    <TableHead>Date</TableHead>
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
                          title="No pending points"
                          description="All points have been reviewed. New entries appear here when jobs are completed."
                          className="py-10"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    pending.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm">
                          <p className="font-medium">
                            {entry.profiles?.full_name ?? '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.profiles?.email}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {REASON_LABEL[entry.reason] ?? entry.reason}
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                          {entry.note ?? (entry.job_id ? (
                            <span className="font-mono text-xs">{entry.job_id.slice(0, 8)}…</span>
                          ) : '—')}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(entry.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-sm font-medium text-amber-600">
                            +{entry.points.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <PointsEntryActions pointsId={entry.id} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent history */}
          <Card>
            <CardHeader className="pb-0 pt-5">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4" />
                Recent History
                <span className="ml-1 font-mono text-xs font-normal text-muted-foreground">
                  (latest 200)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-4 p-0 pb-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Technician</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {all.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No points entries yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    all.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className={entry.state === 'voided' ? 'opacity-40' : ''}
                      >
                        <TableCell className="text-sm">
                          <p className="font-medium">
                            {entry.profiles?.full_name ?? '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.profiles?.email}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {REASON_LABEL[entry.reason] ?? entry.reason}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">
                          {entry.note ?? '—'}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            STATE_STYLE[entry.state] ?? STATE_STYLE['released']
                          )}>
                            {entry.state.charAt(0).toUpperCase() + entry.state.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(entry.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            'font-mono text-sm font-medium',
                            entry.state === 'voided'
                              ? 'text-muted-foreground line-through'
                              : entry.points > 0
                              ? 'text-emerald-600'
                              : 'text-muted-foreground'
                          )}>
                            {entry.points > 0 ? '+' : ''}{entry.points.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right: grant form */}
        <div>
          <Card>
            <CardHeader className="pb-0 pt-5">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <PlusCircle className="h-4 w-4 text-primary" />
                Grant Points
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Manually award bonus or adjustment points to a technician. These are released immediately.
              </p>
            </CardHeader>
            <CardContent className="mt-4">
              <GrantPointsForm technicians={technicians} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
