'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, X, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PartCard } from '@/components/parts/part-card'
import { cn } from '@/lib/utils'
import {
  PARTS_CATALOG,
  PART_CATEGORY_META,
  MACHINE_TYPE_LABELS,
  searchParts,
  type PartCategory,
  type MachineType,
} from '@/lib/parts-catalog'

const ALL_CATEGORIES = Object.entries(PART_CATEGORY_META).map(([id, meta]) => ({
  id: id as PartCategory,
  label: meta.label,
}))

const ALL_MACHINE_TYPES = Object.entries(MACHINE_TYPE_LABELS).map(([id, label]) => ({
  id: id as MachineType,
  label,
}))

export function PartsCatalog() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<PartCategory | 'all'>('all')
  const [activeMachine, setActiveMachine] = useState<MachineType | 'all'>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const results = useMemo(
    () => searchParts(PARTS_CATALOG, query, activeCategory, activeMachine),
    [query, activeCategory, activeMachine],
  )

  const hasActiveFilters = activeCategory !== 'all' || activeMachine !== 'all'

  function clearFilters() {
    setActiveCategory('all')
    setActiveMachine('all')
    setQuery('')
  }

  return (
    <div>
      {/* ── Search + filter bar ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by part name, number, or keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            'shrink-0 gap-2',
            (filtersOpen || hasActiveFilters) && 'border-primary/40 text-primary',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {(activeCategory !== 'all' ? 1 : 0) + (activeMachine !== 'all' ? 1 : 0)}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* ── Expandable filter panel ──────────────────────────────────────── */}
      {filtersOpen && (
        <div className="mt-4 rounded-lg border border-border bg-card p-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Category filter */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Part Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    activeCategory === 'all'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                >
                  All Categories
                </button>
                {ALL_CATEGORIES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      activeCategory === id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Machine type filter */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Machine Compatibility
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveMachine('all')}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    activeMachine === 'all'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                >
                  All Machines
                </button>
                {ALL_MACHINE_TYPES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveMachine(id)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      activeMachine === id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick machine pills (always-visible shortcut) ────────────────── */}
      {!filtersOpen && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveMachine('all')}
            className={cn(
              'rounded-full border px-3.5 py-1 text-xs font-medium transition-colors',
              activeMachine === 'all'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}
          >
            All Machines
          </button>
          {ALL_MACHINE_TYPES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveMachine(id)}
              className={cn(
                'rounded-full border px-3.5 py-1 text-xs font-medium transition-colors',
                activeMachine === id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Result count ─────────────────────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length === PARTS_CATALOG.length ? (
            <>Showing all <span className="font-medium text-foreground">{results.length}</span> parts</>
          ) : (
            <>
              <span className="font-medium text-foreground">{results.length}</span> of{' '}
              {PARTS_CATALOG.length} parts
            </>
          )}
        </p>
      </div>

      {/* ── Results grid ─────────────────────────────────────────────────── */}
      {results.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium text-foreground">No parts matched your search</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Try a broader term, or{' '}
            <button
              onClick={clearFilters}
              className="underline underline-offset-2 hover:text-foreground"
            >
              clear all filters
            </button>
          </p>
        </div>
      )}

      {/* ── Inquiry CTA ──────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Can't find the part you need?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Our parts team handles obsolete references, custom specs, and emergency sourcing.
            Send us a part number, photo, or machine nameplate — we'll track it down.
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/contact">Submit a Parts Request</Link>
        </Button>
      </div>
    </div>
  )
}
