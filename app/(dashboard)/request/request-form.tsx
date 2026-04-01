'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, Package, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCart } from '@/lib/request-cart'
import { submitPartRequest } from '@/lib/orders/actions'
import type { Profile } from '@/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  customerName:    z.string().min(2, 'Enter your full name'),
  customerEmail:   z.string().email('Enter a valid email'),
  customerCompany: z.string().optional(),
  customerPhone:   z.string().optional(),
  shippingAddress: z.string().optional(),
  notes:           z.string().max(500).optional(),
})
type FormValues = z.infer<typeof schema>

// ---------------------------------------------------------------------------
// Quantity control
// ---------------------------------------------------------------------------

function QuantityControl({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-8 text-center font-mono text-sm tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RequestFormProps {
  profile: Profile | null
}

export function RequestForm({ profile }: RequestFormProps) {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName:  profile?.full_name ?? '',
      customerEmail: profile?.email     ?? '',
    },
  })

  const onSubmit = (values: FormValues) => {
    setSubmitError(null)
    startTransition(async () => {
      const result = await submitPartRequest({
        items: items.map((i) => ({
          partNumber:   i.partNumber,
          partName:     i.partName,
          partCategory: i.partCategory,
          quantity:     i.quantity,
        })),
        ...values,
      })

      if (!result.success) {
        setSubmitError(result.error)
        return
      }

      clearCart()
      router.push(`/orders/${result.requestId}?submitted=1`)
    })
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-lg border border-dashed border-border bg-card py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">Your request is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the parts catalog and add items to get started.
          </p>
        </div>
        <Button asChild>
          <Link href="/parts">Browse Parts Catalog</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* ── Left: items + customer details ─────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Cart items */}
          <Card>
            <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-sm font-semibold">
                Request Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.partNumber} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.partName}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {item.partNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.partCategory}</p>
                    </div>
                    <QuantityControl
                      value={item.quantity}
                      onChange={(q) => updateQuantity(item.partNumber, q)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.partNumber)}
                      className="ml-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${item.partName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer details */}
          <Card>
            <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-sm font-semibold">Your Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input id="customerName" {...register('customerName')} />
                  {errors.customerName && (
                    <p className="text-xs text-destructive">{errors.customerName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customerEmail">Work Email</Label>
                  <Input id="customerEmail" type="email" {...register('customerEmail')} />
                  {errors.customerEmail && (
                    <p className="text-xs text-destructive">{errors.customerEmail.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customerCompany">
                    Company <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input id="customerCompany" {...register('customerCompany')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customerPhone">
                    Phone <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input id="customerPhone" type="tel" {...register('customerPhone')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shippingAddress">
                  Shipping Address <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="shippingAddress"
                  placeholder="Street, City, State / Province, ZIP, Country"
                  {...register('shippingAddress')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">
                  Notes <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Urgency, machine context, preferred shipping method, or anything else our team should know…"
                  {...register('notes')}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.notes && (
                  <p className="text-xs text-destructive">{errors.notes.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: summary + submit ─────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Card>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-sm font-semibold">Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.partNumber} className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-muted-foreground leading-relaxed">{item.partName}</span>
                      <span className="shrink-0 font-mono font-medium text-foreground">
                        ×{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
                  <p>
                    Pricing will be confirmed within{' '}
                    <span className="font-medium text-foreground">2 business hours</span>.
                    You&apos;ll receive a detailed quote before any commitment.
                  </p>
                </div>

                {submitError && (
                  <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-4 w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">What happens next?</p>
              <ol className="mt-2 space-y-1.5 list-decimal list-inside">
                <li>Our parts team reviews your request</li>
                <li>We confirm availability and pricing</li>
                <li>You approve before we dispatch</li>
                <li>Parts shipped with full tracking</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
