import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Cpu, Gauge, Flame, Wind, Droplets, Zap, Truck, Thermometer, HelpCircle,
  Plus, Calendar, Tag, AlertCircle, MapPin, ShieldCheck, Pencil,
} from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { MACHINE_CATEGORIES } from '@/lib/validations/machine'
import type { Machine, MachineStatus } from '@/types/customer'
import type { BadgeProps } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'My Machines' }

// Placeholder — replace with real DB query
const machines: Machine[] = []

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const statusConfig: Record<MachineStatus, { label: string; variant: BadgeProps['variant'] }> = {
  'operational':    { label: 'Operational',    variant: 'profit'      },
  'needs-service':  { label: 'Needs Service',  variant: 'warning'     },
  'out-of-service': { label: 'Out of Service', variant: 'destructive' },
  'archived':       { label: 'Archived',       variant: 'neutral'     },
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  cnc:        Cpu,
  press:      Gauge,
  welding:    Flame,
  compressor: Wind,
  pump:       Droplets,
  generator:  Zap,
  handling:   Truck,
  hvac:       Thermometer,
  other:      HelpCircle,
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyMachinesPage() {
  const machineCount = machines.length

  return (
    <PageContainer>
      <PageHeader
        title="My Machines"
        description={
          machineCount > 0
            ? `${machineCount} machine${machineCount !== 1 ? 's' : ''} registered`
            : 'Register your equipment to start tracking service history.'
        }
        actions={
          <Button size="sm" asChild>
            <Link href="/my-machines/add">
              <Plus className="h-4 w-4" />
              Add machine
            </Link>
          </Button>
        }
      />

      {machines.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Cpu}
              title="No machines registered yet"
              description="Add your equipment so we can track its service history and help you keep it running."
              action={
                <Button size="sm" asChild>
                  <Link href="/my-machines/add">
                    <Plus className="h-3.5 w-3.5" />
                    Register your first machine
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

// ---------------------------------------------------------------------------
// Machine card
// ---------------------------------------------------------------------------

function MachineCard({ machine }: { machine: Machine }) {
  const { label, variant } = statusConfig[machine.status]
  const categoryLabel      = MACHINE_CATEGORIES.find((c) => c.id === machine.category)?.label
  const CategoryIcon       = categoryIcons[machine.category] ?? HelpCircle

  return (
    <Card className="group transition-colors hover:bg-accent/20">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <CategoryIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={variant}>{label}</Badge>
            {/* Edit button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              asChild
            >
              <Link href={`/my-machines/${machine.id}/edit`} aria-label="Edit machine">
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Names */}
        <p className="font-semibold leading-tight">{machine.nickname}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{machine.model}</p>
        {categoryLabel && (
          <p className="mt-0.5 text-xs text-muted-foreground/70">{categoryLabel}</p>
        )}

        {/* Meta rows */}
        <div className="mt-4 space-y-1.5">
          <MetaRow icon={Tag} label={machine.serial_number} />

          {machine.install_location && (
            <MetaRow icon={MapPin} label={machine.install_location} />
          )}

          {machine.warranty_status === 'under-warranty' && (
            <MetaRow
              icon={ShieldCheck}
              label={
                machine.warranty_expiry
                  ? `Warranty until ${formatDate(machine.warranty_expiry)}`
                  : 'Under warranty'
              }
              className="text-profit"
            />
          )}

          {machine.last_service_date && (
            <MetaRow
              icon={Calendar}
              label={`Last service: ${formatDate(machine.last_service_date)}`}
            />
          )}

          {machine.status === 'needs-service' && (
            <MetaRow
              icon={AlertCircle}
              label="Service recommended"
              className="text-warning-semantic"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MetaRow({
  icon: Icon,
  label,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  )
}
