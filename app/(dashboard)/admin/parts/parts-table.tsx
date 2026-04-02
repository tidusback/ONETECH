'use client'

import { useState, useTransition, useMemo } from 'react'
import { MoreHorizontal, Pencil, ToggleLeft, ToggleRight, Package } from 'lucide-react'
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

function StockBadge({ stock }: { stock: number | null }) {
  if (stock === null) {
    return <span className="text-xs text-muted-foreground">Unlimited</span>
  }
  if (stock === 0) {
    return <Badge variant="destructive" className="text-[10px]">Out of stock</Badge>
  }
  if (stock <= 5) {
    return <Badge variant="warning" className="font-mono text-[10px]">{stock} left</Badge>
  }
  return <span className="font-mono text-xs text-muted-foreground">{stock}</span>
}

function PartRow({ part }: { part: DbPart }) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Memoize the sanitized models array to avoid recomputation
  const models = useMemo(() => {
    return part.compatibility?.split(',').map(m => m.trim()).filter(Boolean) || []
  }, [part.compatibility])

  function toggleActive() {
    startTransition(async () => {
      await adminTogglePartActive(part.id, !part.is_active)
    })
  }

  if (editing) {
    return (
      <div className="border-b border-border">
        <div className="px-2 py-1">
          <p className="px-2 pt-2 text-xs font-medium text-muted-foreground">
            Editing: {part.name}
          </p>
          <PartForm part={part} onClose={() => setEditing(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-start">
      {/* Left: identity + compatibility */}
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
        {models.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {models.slice(0, 4).map((model) => (
              <span
                key={model}
                className="inline-flex items-center gap-0.5 rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                <Package className="h-2.5 w-2.5" />
                {model}
              </span>
            ))}
            {models.length > 4 && (
              <span className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{models.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: price + stock + actions */}
      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className="font-mono text-sm font-medium">
            R {part.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-0.5 flex justify-end">
            <StockBadge stock={part.stock ?? null} />
          </div>
        </div>

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
                <><ToggleLeft className="mr-2 h-3.5 w-3.5" /> Deactivate</>
              ) : (
                <><ToggleRight className="mr-2 h-3.5 w-3.5" /> Activate</>
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
