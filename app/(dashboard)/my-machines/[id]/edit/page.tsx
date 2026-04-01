import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { EditMachineForm } from '@/components/machines/edit-machine-form'
import type { Machine } from '@/types/customer'

export const metadata: Metadata = { title: 'Edit Machine' }

interface EditMachinePageProps {
  params: Promise<{ id: string }>
}

export default async function EditMachinePage({ params }: EditMachinePageProps) {
  const { id } = await params

  // TODO: fetch real machine data — const machine = await getMachine(id)
  // For now, use a placeholder so the UI and form are fully functional.
  const machine: Machine = {
    id,
    nickname:         'My Machine',
    category:         'other',
    model:            '',
    serial_number:    '',
    status:           'operational',
    install_location: null,
    warranty_status:  'unknown',
    warranty_expiry:  null,
    last_service_date:null,
    purchase_date:    null,
    notes:            null,
    created_at:       new Date().toISOString(),
  }

  return (
    <PageContainer size="narrow">
      {/* Back link */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground" asChild>
        <Link href="/my-machines">
          <ArrowLeft className="h-4 w-4" />
          My Machines
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Edit machine details</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the information for <span className="font-medium text-foreground">{machine.nickname}</span>.
        </p>
      </div>

      <EditMachineForm machine={machine} />
    </PageContainer>
  )
}
