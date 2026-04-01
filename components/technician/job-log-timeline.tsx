import {
  PlusCircle, ArrowRight, FileText, AlertTriangle,
  ShieldAlert, XCircle, Star, MessageSquare, Clock,
} from 'lucide-react'
import type { JobLogWithActor } from '@/lib/technician/queries'
import { formatDatetime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface JobLogTimelineProps {
  logs: JobLogWithActor[]
}

const ACTION_CONFIG: Record<
  string,
  {
    label: (log: JobLogWithActor) => string
    icon: React.ComponentType<{ className?: string }>
    iconCls: string
  }
> = {
  job_created: {
    label: () => 'Job created',
    icon: PlusCircle,
    iconCls: 'text-emerald-500',
  },
  status_changed: {
    label: (l) => `Status: ${l.prev_value} → ${l.next_value}`,
    icon: ArrowRight,
    iconCls: 'text-blue-500',
  },
  note_added: {
    label: () => 'Note added',
    icon: MessageSquare,
    iconCls: 'text-muted-foreground',
  },
  fault_captured: {
    label: () => 'Fault recorded',
    icon: AlertTriangle,
    iconCls: 'text-amber-500',
  },
  admin_override: {
    label: (l) => `Admin override: ${l.prev_value} → ${l.next_value}`,
    icon: ShieldAlert,
    iconCls: 'text-orange-500',
  },
  admin_note_added: {
    label: () => 'Admin note added',
    icon: FileText,
    iconCls: 'text-muted-foreground',
  },
  cancelled: {
    label: () => 'Job cancelled',
    icon: XCircle,
    iconCls: 'text-destructive',
  },
  points_awarded: {
    label: (l) => `Points awarded: +${l.next_value}`,
    icon: Star,
    iconCls: 'text-emerald-500',
  },
}

function ActorBadge({ log }: { log: JobLogWithActor }) {
  if (log.actor_role === 'admin') {
    return (
      <span className="rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
        Admin
      </span>
    )
  }
  if (log.actor_role === 'system') {
    return (
      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        System
      </span>
    )
  }
  return null
}

export function JobLogTimeline({ logs }: JobLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        No activity recorded yet.
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {logs.map((log, i) => {
        const cfg = ACTION_CONFIG[log.action] ?? {
          label: () => log.action,
          icon: FileText,
          iconCls: 'text-muted-foreground',
        }
        const Icon = cfg.icon
        const isLast = i === logs.length - 1

        return (
          <div key={log.id} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background',
                  log.actor_role === 'admin'
                    ? 'border-orange-500/30'
                    : 'border-border'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', cfg.iconCls)} />
              </div>
              {!isLast && (
                <div className="mt-1 w-px flex-1 bg-border" style={{ minHeight: '1.5rem' }} />
              )}
            </div>

            {/* Content */}
            <div className={cn('min-w-0 flex-1', isLast ? 'pb-0' : 'pb-4')}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{cfg.label(log)}</span>
                <ActorBadge log={log} />
              </div>

              {/* Note / detail */}
              {log.note && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {log.note}
                </p>
              )}

              {/* Fault value */}
              {log.action === 'fault_captured' && log.next_value && (
                <p className="mt-1 rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-xs text-foreground">
                  {log.next_value}
                </p>
              )}

              {/* Actor name */}
              {log.profiles?.full_name && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  by {log.profiles.full_name}
                </p>
              )}

              <time className="mt-0.5 block text-[11px] text-muted-foreground">
                {formatDatetime(log.created_at)}
              </time>
            </div>
          </div>
        )
      })}
    </div>
  )
}
