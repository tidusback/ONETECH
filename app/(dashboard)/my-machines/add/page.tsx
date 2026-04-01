import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { AddMachineForm } from '@/components/machines/add-machine-form'

export const metadata: Metadata = { title: 'Register a Machine' }

export default function AddMachinePage() {
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
        <h1 className="text-xl font-semibold tracking-tight">Register a machine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your equipment so we can track its service history and help you keep it running.
        </p>
      </div>

      <AddMachineForm />
    </PageContainer>
  )
}
