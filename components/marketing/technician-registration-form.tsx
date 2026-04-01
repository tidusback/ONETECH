'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  company: z.string().min(1, 'Required'),
  jobTitle: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  certLevel: z.enum(['associate', 'professional', 'master'], {
    required_error: 'Select a certification level',
  }),
  equipmentFocus: z.string().min(1, 'Required'),
  yearsExperience: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

const CERT_LEVELS = [
  { value: 'associate', label: 'Associate Technician', sub: 'Entry level — 0–2 years experience' },
  { value: 'professional', label: 'Professional Technician', sub: 'Mid level — 3–7 years experience' },
  { value: 'master', label: 'Master Technician', sub: 'Senior level — 8+ years experience' },
]

const EQUIPMENT_OPTIONS = [
  'Packaging Machinery',
  'Processing Equipment',
  'Material Handling',
  'Automation & Controls',
  'Multiple / General',
]

const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1–2 years',
  '3–5 years',
  '6–10 years',
  '10+ years',
]

export function TechnicianRegistrationForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const selectedLevel = watch('certLevel')

  // TODO: wire to /api/technician-program or a form service endpoint
  const onSubmit = async (_data: FormValues) => {
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-lg border border-primary/30 bg-primary/5 px-8 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
          <CheckCircle className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Application Received</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Thank you for applying to the Trivelox Technician Program. Our training
            coordinator will contact you within 2 business days to confirm your
            enrollment and discuss scheduling.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...register('firstName')} placeholder="John" />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...register('lastName')} placeholder="Smith" />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work Email</Label>
          <Input id="email" type="email" {...register('email')} placeholder="you@company.com" />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" {...register('phone')} placeholder="+1 (555) 000-0000" />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Company */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company">Company / Employer</Label>
          <Input id="company" {...register('company')} placeholder="ACME Manufacturing Ltd." />
          {errors.company && (
            <p className="text-xs text-destructive">{errors.company.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input id="jobTitle" {...register('jobTitle')} placeholder="Maintenance Technician" />
          {errors.jobTitle && (
            <p className="text-xs text-destructive">{errors.jobTitle.message}</p>
          )}
        </div>
      </div>

      {/* Country + experience */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} placeholder="Canada" />
          {errors.country && (
            <p className="text-xs text-destructive">{errors.country.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="yearsExperience">Years of Technical Experience</Label>
          <select
            id="yearsExperience"
            {...register('yearsExperience')}
            className="flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select range…</option>
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {errors.yearsExperience && (
            <p className="text-xs text-destructive">{errors.yearsExperience.message}</p>
          )}
        </div>
      </div>

      {/* Equipment focus */}
      <div className="space-y-1.5">
        <Label htmlFor="equipmentFocus">Primary Equipment Focus</Label>
        <select
          id="equipmentFocus"
          {...register('equipmentFocus')}
          className="flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select equipment type…</option>
          {EQUIPMENT_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {errors.equipmentFocus && (
          <p className="text-xs text-destructive">{errors.equipmentFocus.message}</p>
        )}
      </div>

      {/* Cert level selector */}
      <div className="space-y-2">
        <Label>Desired Certification Level</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CERT_LEVELS.map(({ value, label, sub }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('certLevel', value as FormValues['certLevel'], { shouldValidate: true })}
              className={cn(
                'rounded-lg border p-4 text-left transition-all',
                selectedLevel === value
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:border-primary/40',
              )}
            >
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            </button>
          ))}
        </div>
        {errors.certLevel && (
          <p className="text-xs text-destructive">{errors.certLevel.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          'Submit Application'
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By submitting, you agree to be contacted by a Trivelox training coordinator.
        We do not share your information with third parties.
      </p>
    </form>
  )
}
