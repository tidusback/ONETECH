'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MoreHorizontal, Pencil, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '@/lib/admin/actions'

export interface Category {
  id: string
  label: string
  description: string
  sort_order: number
  is_active: boolean
}

// ---------------------------------------------------------------------------
// Inline form (shared for create & edit)
// ---------------------------------------------------------------------------

interface CategoryFormProps {
  category?: Category
  onClose: () => void
}

function CategoryForm({ category, onClose }: CategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = Boolean(category)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const label       = (fd.get('label') as string).trim()
    const description = (fd.get('description') as string).trim()
    const sort_order  = parseInt(fd.get('sort_order') as string, 10) || 0

    startTransition(async () => {
      const result = isEdit
        ? await adminUpdateCategory(category!.id, { label, description, sort_order })
        : await adminCreateCategory({ label, description, sort_order })

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-card/60 p-4">
      <div className="grid grid-cols-[1fr_80px] gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Label *</Label>
          <Input
            name="label"
            required
            defaultValue={category?.label}
            className="h-8 text-sm"
            placeholder="e.g. Washing Machine Issues"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Order</Label>
          <Input
            name="sort_order"
            type="number"
            min="0"
            defaultValue={category?.sort_order ?? 0}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Description *</Label>
        <Input
          name="description"
          required
          defaultValue={category?.description}
          className="h-8 text-sm"
          placeholder="Short description shown to customers"
        />
      </div>

      {error && (
        <p className="rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Category row
// ---------------------------------------------------------------------------

function CategoryRow({ category }: { category: Category }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggleActive() {
    startTransition(async () => {
      await adminUpdateCategory(category.id, { is_active: !category.is_active })
      router.refresh()
    })
  }

  function handleDelete() {
    if (!window.confirm(`Delete category "${category.label}"? This cannot be undone.`)) return
    startTransition(async () => {
      await adminDeleteCategory(category.id)
      router.refresh()
    })
  }

  if (editing) {
    return (
      <div className="border-b border-border px-6 py-4">
        <CategoryForm category={category} onClose={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">#{category.sort_order}</span>
          <span className="text-sm font-medium">{category.label}</span>
          <Badge variant={category.is_active ? 'profit' : 'neutral'}>
            {category.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        {category.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{category.description}</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleActive}>
            {category.is_active ? (
              <><ToggleLeft className="mr-2 h-3.5 w-3.5" /> Deactivate</>
            ) : (
              <><ToggleRight className="mr-2 h-3.5 w-3.5" /> Activate</>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Manager (exported)
// ---------------------------------------------------------------------------

interface CategoryManagerProps {
  categories: Category[]
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [creating, setCreating] = useState(false)

  return (
    <div>
      {/* Create form */}
      {creating && (
        <div className="border-b border-border px-6 py-4">
          <CategoryForm onClose={() => setCreating(false)} />
        </div>
      )}

      {/* Rows */}
      {categories.map((cat) => (
        <CategoryRow key={cat.id} category={cat} />
      ))}

      {/* Add button at bottom */}
      {!creating && (
        <div className="px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={() => setCreating(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add category
          </Button>
        </div>
      )}
    </div>
  )
}
