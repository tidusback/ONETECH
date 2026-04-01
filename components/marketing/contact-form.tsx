'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  company: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Select a subject'),
  message: z.string().min(20, 'Please provide at least 20 characters'),
})

type FormValues = z.infer<typeof schema>

const SUBJECTS = [
  'Equipment Quote / Inquiry',
  'Spare Parts Order',
  'Service & Maintenance',
  'Technician Program',
  'Installation / Commissioning',
  'Emergency Support',
  'General Inquiry',
]

// TODO: POST to /api/contact or a form service (e.g. Resend, Formspree)
async function submitContact(_data: FormValues): Promise<void> {
  await new Promise((r) => setTimeout(r, 900))
}

interface ContactFormProps {
  defaultPartNumber?: string
  defaultPartName?: string
}

export function ContactForm({ defaultPartNumber, defaultPartName }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const defaultMessage =
    defaultPartNumber && defaultPartName
      ? `Hi,\n\nI'd like to request a quote for the following part:\n\nPart Number: ${defaultPartNumber}\nPart Name: ${defaultPartName}\n\nPlease provide pricing, availability, and lead time. Thank you.`
      : ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: defaultPartNumber ? 'Spare Parts Order' : '',
      message: defaultMessage,
    },
  })

  const onSubmit = async (data: FormValues) => {
    await submitContact(data)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-lg border border-primary/30 bg-primary/5 px-8 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
          <CheckCircle className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Message Sent</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Thank you for reaching out. A member of the Trivelox team will respond
            within 4 business hours. For urgent matters, call{' '}
            <a href="tel:+18005551234" className="text-primary hover:underline">
              +1 (800) 555-1234
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Name + company */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register('name')} placeholder="Jane Kowalski" />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register('company')} placeholder="ACME Manufacturing" />
          {errors.company && (
            <p className="text-xs text-destructive">{errors.company.message}</p>
          )}
        </div>
      </div>

      {/* Email + phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work Email</Label>
          <Input id="email" type="email" {...register('email')} placeholder="you@company.com" />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Phone{' '}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="phone" type="tel" {...register('phone')} placeholder="+1 (555) 000-0000" />
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <select
          id="subject"
          {...register('subject')}
          className="flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select a subject…</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {errors.subject && (
          <p className="text-xs text-destructive">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          {...register('message')}
          rows={5}
          placeholder="Describe your equipment requirements, service needs, or question in as much detail as possible…"
          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          'Send Message'
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We typically respond within 4 business hours. Emergency support:{' '}
        <a href="tel:+18005559999" className="text-primary hover:underline">
          +1 (800) 555-9999
        </a>
      </p>
    </form>
  )
}
