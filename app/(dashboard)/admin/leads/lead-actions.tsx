'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminCreateLead } from '@/lib/admin/actions'

export function CreateLeadButton() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    startTransition(async () => {
      const result = await adminCreateLead({
        title:             data.title as string,
        description:       (data.description as string) || undefined,
        category:          (data.category as string) || undefined,
        location_city:     (data.location_city as string) || undefined,
        location_province: (data.location_province as string) || undefined,
        urgency:           data.urgency as 'low' | 'normal' | 'high' | 'urgent',
      })
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setError(null)
        form.reset()
        router.refresh()
      }
    })
  }

  return (
    <div className="relative">
      <Button size="sm" className="gap-1.5" onClick={() => setOpen((v) => !v)}>
        <Plus className="h-3.5 w-3.5" />
        New lead
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-popover p-4 shadow-xl">
          <p className="mb-4 font-medium">Create lead</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Title *</Label>
              <Input name="title" required className="h-8 text-sm" placeholder="e.g. Washing machine repair" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input name="description" className="h-8 text-sm" placeholder="Optional details" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">City</Label>
                <Input name="location_city" className="h-8 text-sm" placeholder="Cape Town" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Province</Label>
                <Input name="location_province" className="h-8 text-sm" placeholder="WC" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Input name="category" className="h-8 text-sm" placeholder="Appliances, HVAC…" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Urgency</Label>
              <select
                name="urgency"
                defaultValue="normal"
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {error && (
              <p className="rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Create
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
