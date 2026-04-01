'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Cpu, Gauge, Flame, Wind, Droplets, Zap, Truck, Thermometer,
  HelpCircle, ArrowLeft, ArrowRight, CheckCircle2, MapPin,
  CalendarDays, ShieldCheck, StickyNote, Tag, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { OptionCard } from '@/components/onboarding/option-card'
import { InlineError } from '@/components/shared/error-state'
import { cn } from '@/lib/utils'
import {
  machineFormSchema,
  MACHINE_CATALOG,
  MACHINE_CATEGORIES,
  WARRANTY_OPTIONS,
  type MachineFormInput,
} from '@/lib/validations/machine'

// ---------------------------------------------------------------------------
// Category icons (keyed by category id)
// ---------------------------------------------------------------------------

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
// Step progress bar
// ---------------------------------------------------------------------------

function StepBar({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Machine type' },
    { n: 2, label: 'Details'      },
    { n: 3, label: 'Location'     },
  ]
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.n} className="flex flex-1 items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                  current > step.n
                    ? 'border-primary bg-primary text-primary-foreground'
                    : current === step.n
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-transparent text-muted-foreground'
                )}
              >
                {current > step.n ? <CheckCircle2 className="h-4 w-4" /> : step.n}
              </div>
              <span
                className={cn(
                  'hidden text-xs sm:block',
                  current === step.n ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 flex-1 transition-colors',
                  current > step.n ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section label helper
// ---------------------------------------------------------------------------

function FieldGroup({
  label,
  hint,
  error,
  children,
}: {
  label: React.ReactNode
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
// Main form
// ---------------------------------------------------------------------------

export function AddMachineForm() {
  const router = useRouter()
  const [step, setStep]           = useState<1 | 2 | 3>(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [customModel, setCustomModel] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<MachineFormInput>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      category:         '',
      nickname:         '',
      model:            '',
      serial_number:    '',
      install_location: '',
      purchase_date:    '',
      warranty_status:  'unknown',
      warranty_expiry:  '',
      notes:            '',
    },
  })

  const category       = watch('category')
  const model          = watch('model')
  const warrantyStatus = watch('warranty_status')

  // ---- Step navigation ----

  function handleCategorySelect(id: string) {
    setValue('category', id, { shouldValidate: true })
    // Reset model when category changes
    setValue('model', '')
    setCustomModel(false)
    setStep(2)
  }

  async function handleStep2Next() {
    const ok = await trigger(['nickname', 'model', 'serial_number'])
    if (ok) setStep(3)
  }

  async function onSubmit(data: MachineFormInput) {
    setServerError(null)
    try {
      // TODO: insert into Supabase
      // await createMachine(data)
      router.push('/my-machines')
      router.refresh()
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  // ---- Model select helpers ----

  function handleModelSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === '__other__') {
      setCustomModel(true)
      setValue('model', '')
    } else {
      setCustomModel(false)
      setValue('model', e.target.value, { shouldValidate: true })
    }
  }

  // ---- Render ----

  const selectedCategory = MACHINE_CATEGORIES.find((c) => c.id === category)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepBar current={step} />

      {/* ------------------------------------------------------------------ */}
      {/* Step 1 — Choose machine type                                        */}
      {/* ------------------------------------------------------------------ */}
      {step === 1 && (
        <div>
          <div className="mb-6">
            <h2 className="text-base font-semibold">What type of machine is it?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select the category that best describes your equipment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MACHINE_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] ?? HelpCircle
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-2.5 rounded-xl border p-5 text-center transition-all',
                    'hover:border-primary/50 hover:bg-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    category === cat.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-lg transition-colors',
                      category === cat.id ? 'bg-primary/15' : 'bg-muted'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        category === cat.id ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{cat.label}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {cat.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {errors.category && (
            <p className="mt-3 text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step 2 — Machine details                                            */}
      {/* ------------------------------------------------------------------ */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold">
              Tell us about your {selectedCategory?.label ?? 'machine'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These details help us identify and service your equipment correctly.
            </p>
          </div>

          {serverError && <InlineError message={serverError} />}

          {/* Nickname */}
          <FieldGroup
            label="What do you call this machine?"
            hint={`Use a name you and your team will recognise, e.g. "Hydraulic Press #2" or "Workshop Compressor"`}
            error={errors.nickname?.message}
          >
            <Input
              id="nickname"
              placeholder='e.g. "Floor Press #2"'
              aria-invalid={!!errors.nickname}
              {...register('nickname')}
            />
          </FieldGroup>

          <Separator />

          {/* Model */}
          <FieldGroup
            label="Which model is it?"
            hint={
              category === 'other'
                ? 'Enter the model name as it appears on the machine nameplate.'
                : "Select from the list or type a custom model if yours isn't there."
            }
            error={errors.model?.message}
          >
            {category !== 'other' && !customModel && (
              <Select
                defaultValue=""
                onChange={handleModelSelectChange}
                aria-invalid={!!errors.model}
              >
                <option value="" disabled>Select a model…</option>
                {MACHINE_CATALOG[category]?.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="__other__">My model isn't listed →</option>
              </Select>
            )}

            {(category === 'other' || customModel) && (
              <div className="space-y-1.5">
                <Input
                  placeholder="Type the model name"
                  value={model}
                  aria-invalid={!!errors.model}
                  onChange={(e) =>
                    setValue('model', e.target.value, { shouldValidate: true })
                  }
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
            hint="Usually found on a metal plate or sticker on the machine, or in the owner's manual."
            error={errors.serial_number?.message}
          >
            <Input
              id="serial_number"
              placeholder="e.g. SN-2024-00438"
              aria-invalid={!!errors.serial_number}
              {...register('serial_number')}
            />
          </FieldGroup>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="button" className="flex-1" onClick={handleStep2Next}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step 3 — Location & warranty                                        */}
      {/* ------------------------------------------------------------------ */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold">Installation & warranty</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional details that help our technicians prepare for site visits.
            </p>
          </div>

          {serverError && <InlineError message={serverError} />}

          {/* Install location */}
          <FieldGroup
            label={
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Where is this machine installed?
                <span className="ml-1 text-xs font-normal text-muted-foreground">optional</span>
              </span>
            }
            hint='e.g. "Building A, Bay 3" or "Ground floor, near loading dock"'
            error={errors.install_location?.message}
          >
            <Input
              id="install_location"
              placeholder="e.g. Workshop A, Bay 3"
              {...register('install_location')}
            />
          </FieldGroup>

          {/* Purchase date */}
          <FieldGroup
            label={
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Purchase date
                <span className="ml-1 text-xs font-normal text-muted-foreground">optional</span>
              </span>
            }
          >
            <Input
              id="purchase_date"
              type="date"
              {...register('purchase_date')}
            />
          </FieldGroup>

          <Separator />

          {/* Warranty status */}
          <fieldset className="space-y-2">
            <legend className="flex items-center gap-1.5 text-sm font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Warranty status
            </legend>
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

          {/* Warranty expiry — only if under warranty */}
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

          <Separator />

          {/* Notes */}
          <FieldGroup
            label={
              <span className="flex items-center gap-1.5">
                <StickyNote className="h-3.5 w-3.5" />
                Notes
                <span className="ml-1 text-xs font-normal text-muted-foreground">optional</span>
              </span>
            }
            hint="Any extra information our team should know — recurring issues, access instructions, etc."
            error={errors.notes?.message}
          >
            <Textarea
              id="notes"
              placeholder="e.g. Requires special tool to open the access panel"
              rows={3}
              {...register('notes')}
            />
          </FieldGroup>

          {/* Summary card */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="mb-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Machine summary
              </p>
              <div className="space-y-1.5">
                <SummaryRow icon={Tag}      label={watch('nickname') || '—'} />
                <SummaryRow icon={Cpu}      label={watch('model')    || '—'} />
                <SummaryRow icon={ShieldCheck} label={watch('serial_number') || '—'} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Registering…' : 'Register machine'}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

function SummaryRow({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </div>
  )
}
