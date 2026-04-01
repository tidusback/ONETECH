'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminCreatePart, adminUpdatePart } from '@/lib/admin/actions'

interface PartFormProps {
  /** Pass a part to edit; omit for create mode */
  part?: {
    id: string
    name: string
    part_number: string
    description: string | null
    price: number
  }
  onClose: () => void
}

export function PartForm({ part, onClose }: PartFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const isEdit = Boolean(part)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name        = (fd.get('name') as string).trim()
    const part_number = (fd.get('part_number') as string).trim()
    const description = (fd.get('description') as string).trim() || undefined
    const price       = parseFloat(fd.get('price') as string)

    startTransition(async () => {
      const result = isEdit
        ? await adminUpdatePart(part!.id, { name, part_number, description, price })
        : await adminCreatePart({ name, part_number, description, price })

      if (result.error) {
        setError(result.error)
      } else {
        setError(null)
        onClose()
        router.refresh()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Name *</Label>
          <Input
            name="name"
            required
            defaultValue={part?.name}
            className="h-8 text-sm"
            placeholder="Filter Kit"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Part number *</Label>
          <Input
            name="part_number"
            required
            defaultValue={part?.part_number}
            className="h-8 text-sm"
            placeholder="FK-200"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Input
          name="description"
          defaultValue={part?.description ?? ''}
          className="h-8 text-sm"
          placeholder="Optional description"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Price (ZAR) *</Label>
        <Input
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={part?.price}
          className="h-8 text-sm"
          placeholder="0.00"
        />
      </div>

      {error && (
        <p className="rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create part'}
        </Button>
      </div>
    </form>
  )
}
