'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Cpu, Gauge, Flame, Wind, Droplets, Zap, Truck, Thermometer, HelpCircle,
  MapPin, CalendarDays, ShieldCheck, StickyNote, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { OptionCard } from '@/components/onboarding/option-card'
import { InlineError } from '@/components/shared/error-state'
import {
  machineFormSchema,
  MACHINE_CATALOG,
  MACHINE_CATEGORIES,
  WARRANTY_OPTIONS,
  type MachineFormInput,
} from '@/lib/validations/machine'
import type { Machine } from '@/types/customer'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cnc:        Cpu,
  press:      Gauge,
  welding:    Flame,
  compressor: Wind,
  pump:       Droplets,
  generator:  Zap,
  handling:   Truck,
  hvac:       Thermometer,
  other:      HelpCircle,
}

// ---------------------------------------------------------------------------
// Shared field-group wrapper
// ---------------------------------------------------------------------------

function FieldGroup({
  label,
  hint,
  error,
  children,
}: {
  label?: React.ReactNode
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          {hint}
        </p>
      )}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Edit form — single page, all fields pre-populated
// ---------------------------------------------------------------------------

interface EditMachineFormProps {
  machine: Machine
}

export function EditMachineForm({ machine }: EditMachineFormProps) {
  const router = useRouter()
  const [serverError, setServerError]   = useState<string | null>(null)
  const [customModel, setCustomModel]   = useState(
    // If the stored model isn't in the catalog, start in custom mode
    !MACHINE_CATALOG[machine.category]?.includes(machine.model) && machine.model !== ''
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MachineFormInput>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      category:         machine.category,
      nickname:         machine.nickname,
      model:            machine.model,
      serial_number:    machine.serial_number,
      install_location: machine.install_location ?? '',
      purchase_date:    machine.purchase_date ?? '',
      warranty_status:  machine.warranty_status,
      warranty_expiry:  machine.warranty_expiry ?? '',
      notes:            machine.notes ?? '',
    },
  })

  const category       = watch('category')
  const model          = watch('model')
  const warrantyStatus = watch('warranty_status')

  async function onSubmit(data: MachineFormInput) {
    setServerError(null)
    try {
      // TODO: update machine in Supabase
      // await updateMachine(machine.id, data)
      router.push('/my-machines')
      router.refresh()
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  function handleModelSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === '__other__') {
      setCustomModel(true)
      setValue('model', '')
    } else {
      setCustomModel(false)
      setValue('model', e.target.value, { shouldValidate: true })
    }
  }

  const selectedCategory = MACHINE_CATEGORIES.find((c) => c.id === category)
  const CategoryIcon     = CATEGORY_ICONS[category] ?? HelpCircle

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {serverError && <InlineError message={serverError} />}

      {/* ---- Machine identity ---- */}
      <section className="space-y-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <CategoryIcon className="h-4 w-4" />
          Machine identity
        </h2>

        {/* Category (read-only display + change link) */}
        <FieldGroup label="Machine type">
          <div className="flex items-center justify-between rounded-md border border-input bg-muted/30 px-3 py-2">
            <span className="text-sm">{selectedCategory?.label ?? category}</span>
            <Select
              value={category}
              onChange={(e) => setValue('category', e.target.value, { shouldValidate: true })}
              wrapperClassName="w-40"
              className="border-0 bg-transparent py-0 text-xs text-muted-foreground shadow-none focus-visible:ring-0"
            >
              {MACHINE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </Select>
          </div>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </FieldGroup>

        {/* Nickname */}
        <FieldGroup
          label="Machine nickname"
          hint="The name you and your team use for this machine."
          error={errors.nickname?.message}
        >
          <Input
            id="nickname"
            aria-invalid={!!errors.nickname}
            {...register('nickname')}
          />
        </FieldGroup>

        {/* Model */}
        <FieldGroup
          label="Model"
          hint="Select from the list or type a custom model."
          error={errors.model?.message}
        >
          {category !== 'other' && !customModel ? (
            <Select
              value={model}
              onChange={handleModelSelectChange}
              aria-invalid={!!errors.model}
            >
              <option value="" disabled>Select a model…</option>
              {MACHINE_CATALOG[category]?.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="__other__">My model isn't listed →</option>
            </Select>
          ) : (
            <div className="space-y-1.5">
              <Input
                value={model}
                aria-invalid={!!errors.model}
                onChange={(e) => setValue('model', e.target.value, { shouldValidate: true })}
              />
              {customModel && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  onClick={() => {
                    setCustomModel(false)
                    setValue('model', '')
                  }}
                >
                  ← Back to list
                </button>
              )}
            </div>
          )}
        </FieldGroup>

        {/* Serial number */}
        <FieldGroup
          label="Serial number"
          hint="Found on the machine's nameplate or in the owner's manual."
          error={errors.serial_number?.message}
        >
          <Input
            id="serial_number"
            aria-invalid={!!errors.serial_number}
            {...register('serial_number')}
          />
        </FieldGroup>
      </section>

      <Separator />

      {/* ---- Location & purchase ---- */}
      <section className="space-y-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <MapPin className="h-4 w-4" />
          Location & purchase
        </h2>

        <FieldGroup
          label={
            <span className="flex items-center gap-1.5">
              Install location
              <span className="text-xs font-normal text-muted-foreground">optional</span>
            </span>
          }
          hint='e.g. "Building A, Bay 3"'
          error={errors.install_location?.message}
        >
          <Input
            id="install_location"
            placeholder="e.g. Workshop A, Bay 3"
            {...register('install_location')}
          />
        </FieldGroup>

        <FieldGroup
          label={
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Purchase date
              <span className="text-xs font-normal text-muted-foreground">optional</span>
            </span>
          }
        >
          <Input
            id="purchase_date"
            type="date"
            {...register('purchase_date')}
          />
        </FieldGroup>
      </section>

      <Separator />

      {/* ---- Warranty ---- */}
      <section className="space-y-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          Warranty
        </h2>

        <fieldset className="space-y-2">
          <legend className="sr-only">Warranty status</legend>
          <div className="space-y-2" role="radiogroup">
            {WARRANTY_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                value={opt.value}
                selected={warrantyStatus === opt.value}
                {...register('warranty_status')}
              />
            ))}
          </div>
          {errors.warranty_status && (
            <p className="text-xs text-destructive">{errors.warranty_status.message}</p>
          )}
        </fieldset>

        {warrantyStatus === 'under-warranty' && (
          <FieldGroup
            label="Warranty expiry date"
            error={errors.warranty_expiry?.message}
          >
            <Input
              id="warranty_expiry"
              type="date"
              {...register('warranty_expiry')}
            />
          </FieldGroup>
        )}
      </section>

      <Separator />

      {/* ---- Notes ---- */}
      <section className="space-y-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <StickyNote className="h-4 w-4" />
          Notes
          <span className="text-xs font-normal normal-case tracking-normal text-muted-foreground">
            optional
          </span>
        </h2>

        <FieldGroup
          hint="Any extra information our team should know — recurring issues, access instructions, etc."
          error={errors.notes?.message}
        >
          <Textarea
            id="notes"
            rows={3}
            placeholder="e.g. Requires special tool to access the panel"
            {...register('notes')}
          />
        </FieldGroup>
      </section>

      {/* ---- Actions ---- */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
