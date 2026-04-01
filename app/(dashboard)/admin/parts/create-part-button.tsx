'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PartForm } from '@/components/admin/part-form'

export function CreatePartButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button size="sm" className="gap-1.5" onClick={() => setOpen((v) => !v)}>
        <Plus className="h-3.5 w-3.5" />
        Add part
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[420px]">
          <Card className="shadow-xl">
            <p className="px-4 pt-4 font-medium">Add part to catalog</p>
            <PartForm onClose={() => setOpen(false)} />
          </Card>
        </div>
      )}
    </div>
  )
}
