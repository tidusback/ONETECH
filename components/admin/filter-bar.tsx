'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps {
  searchPlaceholder?: string
  statusOptions?: FilterOption[]
  /** Additional filter selects beyond the built-in status one */
  extraFilters?: Array<{
    param: string
    placeholder: string
    options: FilterOption[]
  }>
  className?: string
}

/**
 * URL-driven filter bar. Writes to ?search=&status= search params
 * so the Server Component above re-renders with new data.
 */
export function FilterBar({
  searchPlaceholder = 'Search…',
  statusOptions,
  extraFilters,
  className,
}: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== '__all__') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams, startTransition],
  )

  const hasFilters =
    searchParams.get('search') ||
    searchParams.get('status') ||
    (extraFilters ?? []).some((f) => searchParams.get(f.param))

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Search */}
      <div className="relative min-w-[180px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={searchParams.get('search') ?? ''}
          placeholder={searchPlaceholder}
          className="h-8 pl-8 text-sm"
          onChange={(e) => {
            const val = e.target.value
            if (val === '' || val.length >= 2) update('search', val)
          }}
        />
      </div>

      {/* Status */}
      {statusOptions && statusOptions.length > 0 && (
        <Select
          className="h-8 w-[140px] text-xs"
          value={searchParams.get('status') ?? '__all__'}
          onChange={(e) => update('status', e.target.value)}
        >
          <option value="__all__">All statuses</option>
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      )}

      {/* Extra filters */}
      {extraFilters?.map((f) => (
        <Select
          key={f.param}
          className="h-8 w-[140px] text-xs"
          value={searchParams.get(f.param) ?? '__all__'}
          onChange={(e) => update(f.param, e.target.value)}
        >
          <option value="__all__">{f.placeholder}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      ))}

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs text-muted-foreground"
          onClick={() => {
            startTransition(() => router.replace(pathname))
          }}
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}
