'use client'

import { useState, useTransition } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminUpdateProfile } from '@/lib/admin/actions'

interface ProfileFormProps {
  currentName: string | null
}

export function ProfileForm({ currentName }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)
  const [editing, setEditing] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const fd        = new FormData(e.currentTarget)
    const full_name = (fd.get('full_name') as string).trim()

    if (!full_name) {
      setError('Full name cannot be empty.')
      return
    }

    startTransition(async () => {
      const result = await adminUpdateProfile({ full_name })
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setEditing(false)
        // Auto-clear success indicator after 3 s
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{currentName ?? '—'}</p>
          {saved && (
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved successfully
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSaved(false); setEditing(true) }}
        >
          Edit
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="full_name" className="text-xs">Full name</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={currentName ?? ''}
          required
          autoFocus
          className="h-9 text-sm"
          placeholder="Your full name"
        />
      </div>

      {error && (
        <p className="rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Save changes
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { setEditing(false); setError(null) }}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
