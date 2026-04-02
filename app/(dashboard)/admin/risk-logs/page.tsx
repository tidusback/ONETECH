import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { getRiskLogs } from '@/lib/admin/queries'
import { RiskLogActions } from './risk-log-actions'

export const metadata: Metadata = { title: 'Risk Logs' }

type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'
type RiskStatus   = 'open' | 'investigating' | 'resolved' | 'dismissed'

const severityVariant: Record<RiskSeverity, 'neutral' | 'warning' | 'destructive' | 'loss'> = {
  low:      'neutral',
  medium:   'warning',
  high:     'destructive',
  critical: 'loss',
}

const statusVariant: Record<RiskStatus, 'warning' | 'default' | 'profit' | 'secondary'> = {
  open:          'warning',
  investigating: 'default',
  resolved:      'profit',
  dismissed:     'secondary',
}

export default async function AdminRiskLogsPage() {
  const logs = await getRiskLogs()

  const bySeverity = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.severity] = (acc[l.severity] ?? 0) + 1
    return acc
  }, {})

  const openCount = logs.filter(
    (l) => l.status === 'open' || l.status === 'investigating',
  ).length

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Risk Logs"
        description="Flagged events, anomalies, and the security audit trail."
        actions={
          openCount > 0 ? (
            <Badge variant="destructive">{openCount} unresolved</Badge>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['critical', 'high', 'medium', 'low'] as RiskSeverity[]).map((s) => (
          <div key={s} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold tabular-nums">{bySeverity[s] ?? 0}</p>
            <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All events
            {logs.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {logs.length} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {logs.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="No risk events"
              description="Flagged platform events and anomalies will appear here."
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={severityVariant[log.severity]}>{log.severity}</Badge>
                      <Badge variant={statusVariant[log.status]}>{log.status}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {log.event_type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{log.description}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {(log.actor_name ?? log.actor_email) && (
                        <span>{log.actor_name ?? log.actor_email}</span>
                      )}
                      <span>{formatDate(log.created_at)}</span>
                      {log.resolved_at && (
                        <span>Resolved {formatDate(log.resolved_at)}</span>
                      )}
                    </div>
                  </div>

                  <RiskLogActions logId={log.id} currentStatus={log.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
