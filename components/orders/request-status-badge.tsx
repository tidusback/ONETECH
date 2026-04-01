import { Badge } from '@/components/ui/badge'
import type { BadgeProps } from '@/components/ui/badge'
import type { RequestStatus } from '@/lib/orders/queries'

interface StatusConfig {
  label: string
  variant: BadgeProps['variant']
}

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  pending:    { label: 'Pending Review',  variant: 'neutral'     },
  reviewing:  { label: 'Under Review',    variant: 'default'     },
  quoted:     { label: 'Quote Sent',      variant: 'warning'     },
  confirmed:  { label: 'Confirmed',       variant: 'default'     },
  processing: { label: 'Processing',      variant: 'default'     },
  shipped:    { label: 'Shipped',         variant: 'profit'      },
  delivered:  { label: 'Delivered',       variant: 'profit'      },
  cancelled:  { label: 'Cancelled',       variant: 'destructive' },
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const { label, variant } = REQUEST_STATUS_CONFIG[status] ?? {
    label: status,
    variant: 'neutral' as const,
  }
  return <Badge variant={variant}>{label}</Badge>
}
