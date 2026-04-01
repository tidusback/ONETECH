'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { InlineError } from '@/components/shared/error-state'
import { StepIndicator } from '@/components/onboarding/step-indicator'
import { OptionCard } from '@/components/onboarding/option-card'
import { completeOnboarding } from '@/lib/auth/actions'
import {
  customerOnboardingSchema,
  experienceOptions,
  type CustomerOnboardingInput,
} from '@/lib/validations/onboarding'

interface CustomerFormProps {
  defaultFullName: string
}

export function CustomerForm({ defaultFullName }: CustomerFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerOnboardingInput>({
    resolver: zodResolver(customerOnboardingSchema),
    defaultValues: { full_name: defaultFullName },
  })

  const experience = watch('experience')

  async function onSubmit(data: CustomerOnboardingInput) {
    setServerError(null)

    const { error } = await completeOnboarding({
      role: 'customer',
      full_name: data.full_name,
      extra: {
        experience: data.experience,
        ...(data.company ? { company: data.company } : {}),
      },
    })

    if (error) {
      setServerError((error as Error).message ?? 'Something went wrong. Please try again.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <StepIndicator label="Customer setup" current={2} total={2} className="mb-3" />

      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight">Tell us about yourself</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Two quick questions to personalise your experience.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {serverError && <InlineError message={serverError} />}

        {/* Name */}
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

        {/* Experience level */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            Trading experience
            <span className="ml-1 text-xs font-normal text-muted-foreground">required</span>
          </legend>
          <div className="space-y-2" role="radiogroup" aria-required>
            {experienceOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                value={opt.value}
                selected={experience === opt.value}
                aria-invalid={!!errors.experience}
                {...register('experience')}
              />
            ))}
          </div>
          {errors.experience && (
            <p className="text-xs text-destructive">{errors.experience.message}</p>
          )}
        </fieldset>

        <Separator />

        {/* Company — optional */}
        <div className="space-y-1.5">
          <Label htmlFor="company">
            Company / Firm{' '}
            <span className="text-xs font-normal text-muted-foreground">optional</span>
          </Label>
          <Input
            id="company"
            placeholder="Acme Capital"
            autoComplete="organization"
            {...register('company')}
          />
          {errors.company && (
            <p className="text-xs text-destructive">{errors.company.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Continue to dashboard'}
          </Button>
        </div>
      </form>
    </div>
  )
}
