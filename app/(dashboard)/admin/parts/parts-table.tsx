'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { MoreHorizontal, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PartForm } from '@/components/admin/part-form'
import { adminTogglePartActive } from '@/lib/admin/actions'
import type { DbPart } from '@/lib/admin/queries'

interface PartsTableProps {
  parts: DbPart[]
}

function PartRow({ part }: { part: DbPart }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggleActive() {
    startTransition(async () => {
      await adminTogglePartActive(part.id, !part.is_active)
      router.refresh()
    })
  }

  if (editing) {
    return (
      <div className="border-b border-border">
        <div className="px-2 py-1">
          <p className="px-2 pt-2 text-xs font-medium text-muted-foreground">Editing: {part.name}</p>
          <PartForm
            part={part}
            onClose={() => setEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{part.part_number}</span>
          <Badge variant={part.is_active ? 'profit' : 'neutral'}>
            {part.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <p className="mt-0.5 text-sm font-medium">{part.name}</p>
        {part.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{part.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="font-mono text-sm font-medium">
          R {part.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isPending}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleActive}>
              {part.is_active ? (
                <>
                  <ToggleLeft className="mr-2 h-3.5 w-3.5" /> Deactivate
                </>
              ) : (
                <>
                  <ToggleRight className="mr-2 h-3.5 w-3.5" /> Activate
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function PartsTable({ parts }: PartsTableProps) {
  return (
    <div>
      {parts.map((p) => (
        <PartRow key={p.id} part={p} />
      ))}
    </div>
  )
}
