import type { Metadata } from 'next'
import { ClipboardList, Plus } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import type { Diagnosis, DiagnosisStatus } from '@/types/customer'
import type { BadgeProps } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Diagnosis History' }

// Placeholder — replace with real DB query
const diagnoses: Diagnosis[] = []

const statusConfig: Record<DiagnosisStatus, { label: string; variant: BadgeProps['variant'] }> = {
  'pending':     { label: 'Pending',     variant: 'warning'  },
  'in-progress': { label: 'In Progress', variant: 'default'  },
  'completed':   { label: 'Completed',   variant: 'profit'   },
  'cancelled':   { label: 'Cancelled',   variant: 'neutral'  },
}

export default function DiagnosisHistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Diagnosis History"
        description="All service diagnoses requested for your machines."
        actions={
          <Button size="sm" disabled>
            <Plus className="h-4 w-4" />
            Request diagnosis
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-sm font-medium">All diagnoses</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1 mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnoses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={ClipboardList}
                      title="No diagnoses yet"
                      description="Your machine diagnosis requests will appear here once submitted."
                      action={
                        <Button size="sm" disabled>
                          <Plus className="h-3.5 w-3.5" />
                          Request your first diagnosis
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                diagnoses.map((d) => {
                  const { label, variant } = statusConfig[d.status]
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(d.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">{d.machine_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {d.technician_name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>{label}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {d.summary ?? '—'}
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
