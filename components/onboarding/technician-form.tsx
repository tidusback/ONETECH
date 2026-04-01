'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  FileText,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { InlineError } from '@/components/shared/error-state'
import { StepIndicator } from '@/components/onboarding/step-indicator'
import { submitTechnicianApplication } from '@/lib/technician/actions'
import { cn } from '@/lib/utils'
import {
  technicianApplicationSchema,
  TECH_APP_STEP_FIELDS,
  departmentOptions,
  SA_PROVINCES,
  SERVICE_RADIUS_OPTIONS,
  MACHINE_CATEGORY_OPTIONS,
  TECHNICIAN_SKILLS,
  type TechnicianApplicationInput,
} from '@/lib/validations/onboarding'

interface TechnicianFormProps {
  defaultFullName: string
}

const STEP_LABELS = [
  'Personal details',
  'Service area',
  'Experience',
  'Skills',
  'Documents & agreement',
]

const TOTAL_STEPS = 5

// ---------------------------------------------------------------------------
// Sub-components — defined outside TechnicianForm so React does not treat them
// as new component types on every render (which would cause full remounts).
// ---------------------------------------------------------------------------

function StepBar({ step }: { step: number }) {
  return (
    <div className="mb-7 flex items-center gap-1.5">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
        <div
          key={s}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            s < step
              ? 'bg-primary'
              : s === step
                ? 'bg-primary/60'
                : 'bg-border'
          )}
        />
      ))}
    </div>
  )
}

function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
      )}
    >
      {selected && <CheckCircle2 className="h-3 w-3 shrink-0" />}
      {label}
    </button>
  )
}

export function TechnicianForm({ defaultFullName }: TechnicianFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [serverError, setServerError] = useState<string | null>(null)

  // Document files are managed outside the form schema (File objects)
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [qualificationFiles, setQualificationFiles] = useState<File[]>([])
  const idInputRef = useRef<HTMLInputElement>(null)
  const qualInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<TechnicianApplicationInput>({
    resolver: zodResolver(technicianApplicationSchema),
    defaultValues: {
      full_name: defaultFullName,
      phone: '',
      bio: '',
      city: '',
      province: '',
      service_radius_km: 50,
      years_experience: 0,
      departments: [],
      machine_categories: [],
      skills: [],
      agreed_to_terms: false,
    },
  })

  const departments = watch('departments') ?? []
  const machineCategories = watch('machine_categories') ?? []
  const skills = watch('skills') ?? []
  const agreedToTerms = watch('agreed_to_terms')

  // ---------------------------------------------------------------------------
  // Array field toggles
  // ---------------------------------------------------------------------------
  function toggleDepartment(val: string) {
    const updated = departments.includes(val)
      ? departments.filter((v) => v !== val)
      : [...departments, val]
    setValue('departments', updated, { shouldValidate: true })
  }

  function toggleCategory(val: string) {
    const updated = machineCategories.includes(val)
      ? machineCategories.filter((v) => v !== val)
      : [...machineCategories, val]
    setValue('machine_categories', updated, { shouldValidate: true })
  }

  function toggleSkill(val: string) {
    const updated = skills.includes(val)
      ? skills.filter((v) => v !== val)
      : [...skills, val]
    setValue('skills', updated, { shouldValidate: true })
  }

  // ---------------------------------------------------------------------------
  // Step navigation
  // ---------------------------------------------------------------------------
  async function goNext() {
    const fields = TECH_APP_STEP_FIELDS[step]
    const valid = await trigger(fields)
    if (valid) setStep((s) => (s < TOTAL_STEPS ? ((s + 1) as typeof step) : s))
  }

  function goBack() {
    setStep((s) => (s > 1 ? ((s - 1) as typeof step) : s))
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  async function onSubmit(data: TechnicianApplicationInput) {
    setServerError(null)
    const { error } = await submitTechnicianApplication({
      formData: data,
      idDocument,
      qualificationFiles,
    })

    if (error) {
      setServerError(error.message ?? 'Something went wrong. Please try again.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full max-w-lg">
      <StepIndicator
        label={STEP_LABELS[step - 1]}
        current={step}
        total={TOTAL_STEPS}
        className="mb-3"
      />

      <StepBar step={step} />

      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight">
          {step === 1 && 'Personal details'}
          {step === 2 && 'Service area'}
          {step === 3 && 'Experience & equipment'}
          {step === 4 && 'Technical skills'}
          {step === 5 && 'Documents & agreement'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1 && 'Tell us a bit about yourself.'}
          {step === 2 && 'Where are you based and how far can you travel?'}
          {step === 3 && 'What industries and equipment have you worked on?'}
          {step === 4 && 'Select all skills that apply to your work.'}
          {step === 5 && 'Upload supporting documents and confirm your application.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <InlineError message={serverError} className="mb-5" />}

        {/* ------------------------------------------------------------------ */}
        {/* Step 1 — Personal details */}
        {/* ------------------------------------------------------------------ */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                placeholder="Jane Smith"
                autoComplete="name"
                aria-invalid={!!errors.full_name}
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">
                Phone{' '}
                <span className="text-xs font-normal text-muted-foreground">optional</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+27 82 000 0000"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">
                About you{' '}
                <span className="text-xs font-normal text-muted-foreground">optional</span>
              </Label>
              <textarea
                id="bio"
                rows={3}
                placeholder="Brief background — experience, industries, anything relevant."
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-xs text-destructive">{errors.bio.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 2 — Service area */}
        {/* ------------------------------------------------------------------ */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Johannesburg"
                  autoComplete="address-level2"
                  aria-invalid={!!errors.city}
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-xs text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="province">Province</Label>
                <select
                  id="province"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-invalid={!!errors.province}
                  {...register('province')}
                >
                  <option value="">Select province</option>
                  {SA_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="text-xs text-destructive">{errors.province.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service_radius_km">Travel radius</Label>
              <select
                id="service_radius_km"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('service_radius_km')}
              >
                {SERVICE_RADIUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Maximum distance you're willing to travel for on-site work.
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 3 — Experience */}
        {/* ------------------------------------------------------------------ */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="years_experience">Years of experience</Label>
              <Input
                id="years_experience"
                type="number"
                min={0}
                max={60}
                placeholder="e.g. 5"
                aria-invalid={!!errors.years_experience}
                {...register('years_experience')}
              />
              {errors.years_experience && (
                <p className="text-xs text-destructive">{errors.years_experience.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Department(s)
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  select all that apply
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {departmentOptions.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    selected={departments.includes(opt.value)}
                    onToggle={() => toggleDepartment(opt.value)}
                  />
                ))}
              </div>
              {errors.departments && (
                <p className="text-xs text-destructive">{errors.departments.message}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Equipment categories
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  select all that apply
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {MACHINE_CATEGORY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    selected={machineCategories.includes(opt.value)}
                    onToggle={() => toggleCategory(opt.value)}
                  />
                ))}
              </div>
              {errors.machine_categories && (
                <p className="text-xs text-destructive">{errors.machine_categories.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 4 — Skills */}
        {/* ------------------------------------------------------------------ */}
        {step === 4 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {skills.length === 0
                ? 'Select all skills that apply to your work.'
                : `${skills.length} skill${skills.length !== 1 ? 's' : ''} selected`}
            </p>
            <div className="flex flex-wrap gap-2">
              {TECHNICIAN_SKILLS.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  selected={skills.includes(skill)}
                  onToggle={() => toggleSkill(skill)}
                />
              ))}
            </div>
            {errors.skills && (
              <p className="text-xs text-destructive">{errors.skills.message}</p>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 5 — Documents & agreement */}
        {/* ------------------------------------------------------------------ */}
        {step === 5 && (
          <div className="space-y-6">
            {/* ID / License upload */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                ID / Licence document
                <span className="ml-1 text-xs font-normal text-muted-foreground">optional</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Upload a copy of your ID, driver's licence, or trade certificate. PDF, JPG or PNG — max 10 MB.
              </p>

              {idDocument ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm">{idDocument.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdDocument(null)}
                    className="ml-2 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => idInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/30 hover:text-foreground"
                >
                  <Upload className="h-4 w-4" />
                  Click to upload ID / licence
                </button>
              )}
              <input
                ref={idInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setIdDocument(file)
                  e.target.value = ''
                }}
              />
            </div>

            {/* Qualification files */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Qualifications / certifications
                <span className="ml-1 text-xs font-normal text-muted-foreground">optional</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Upload trade certificates, diplomas, or other relevant credentials. You can add multiple files.
              </p>

              {qualificationFiles.length > 0 && (
                <div className="space-y-1.5">
                  {qualificationFiles.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-xs">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setQualificationFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="ml-2 shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => qualInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/30 hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
                {qualificationFiles.length > 0 ? 'Add another file' : 'Upload qualifications'}
              </button>
              <input
                ref={qualInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  if (files.length) {
                    setQualificationFiles((prev) => [...prev, ...files])
                  }
                  e.target.value = ''
                }}
              />
            </div>

            <Separator />

            {/* Agreement */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Declaration</p>
              <label className="flex cursor-pointer gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/20">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                  {...register('agreed_to_terms')}
                />
                <div className="text-sm leading-relaxed text-muted-foreground">
                  I confirm that all information provided is accurate and complete. I understand
                  this is an application for a technician role and that Trivelox Trading reserves
                  the right to verify all submitted details.
                </div>
              </label>
              {errors.agreed_to_terms && (
                <p className="text-xs text-destructive">{errors.agreed_to_terms.message}</p>
              )}
            </div>

            {/* Application summary */}
            <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">What happens next?</p>
              <ul className="space-y-1">
                <li>· Your application is submitted for internal review</li>
                <li>· You'll receive access to the dashboard immediately</li>
                <li>· Our team will review your details and may be in touch</li>
                <li>· You can track your application status in your profile</li>
              </ul>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Navigation */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-8 flex gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={goBack}
              disabled={isSubmitting}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Back
            </Button>
          )}

          {step < TOTAL_STEPS ? (
            <Button type="button" className="flex-1" onClick={goNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !agreedToTerms}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit application'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
