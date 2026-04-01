'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/auth/utils'
import type { ActionResult } from '@/types'
import type { RequestStatus } from './queries'

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const requestItemSchema = z.object({
  partNumber:   z.string().min(1).max(100).trim(),
  partName:     z.string().min(1).max(200).trim(),
  partCategory: z.string().min(1).max(100).trim(),
  quantity:     z.number().int().min(1).max(999),
})

const submitRequestSchema = z.object({
  items:           z.array(requestItemSchema).min(1, 'Your request has no items.').max(50),
  customerName:    z.string().min(1, 'Name is required').max(200).trim(),
  customerEmail:   z.string().email('Enter a valid email address').max(320).trim(),
  customerCompany: z.string().max(200).trim().optional(),
  customerPhone:   z.string().max(50).trim().optional(),
  shippingAddress: z.string().max(500).trim().optional(),
  notes:           z.string().max(2000).trim().optional(),
})

// ---------------------------------------------------------------------------
// Submit a new parts request
// ---------------------------------------------------------------------------

export interface SubmitRequestInput {
  items: Array<{
    partNumber: string
    partName: string
    partCategory: string
    quantity: number
  }>
  customerName: string
  customerEmail: string
  customerCompany?: string
  customerPhone?: string
  shippingAddress?: string
  notes?: string
}

export type SubmitRequestResult =
  | { success: true; requestId: string; requestNumber: string }
  | { success: false; error: string }

export async function submitPartRequest(
  input: SubmitRequestInput,
): Promise<SubmitRequestResult> {
  const user = await getUser()
  if (!user) return { success: false, error: 'You must be signed in to submit a request.' }

  // Server-side validation
  const parsed = submitRequestSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    return { success: false, error: first?.message ?? 'Invalid request data.' }
  }
  const validated = parsed.data

  const supabase = await createClient()

  const { data: request, error: reqError } = await supabase
    .from('part_requests')
    .insert({
      user_id:          user.id,
      customer_name:    validated.customerName,
      customer_email:   validated.customerEmail,
      customer_company: validated.customerCompany ?? null,
      customer_phone:   validated.customerPhone ?? null,
      shipping_address: validated.shippingAddress ?? null,
      notes:            validated.notes ?? null,
    })
    .select('id, request_number')
    .single()

  if (reqError || !request) {
    console.error('submitPartRequest insert error:', reqError)
    return { success: false, error: 'Failed to create request. Please try again.' }
  }

  const { error: itemsError } = await supabase
    .from('part_request_items')
    .insert(
      validated.items.map((item) => ({
        request_id:    request.id,
        part_number:   item.partNumber,
        part_name:     item.partName,
        part_category: item.partCategory,
        quantity:      item.quantity,
      })),
    )

  if (itemsError) {
    console.error('submitPartRequest items error:', itemsError)
    // Clean up the orphaned request header so the DB stays consistent
    await supabase.from('part_requests').delete().eq('id', request.id)
    return { success: false, error: 'Failed to save request items. Please try again.' }
  }

  revalidatePath('/orders')

  return {
    success: true,
    requestId:     request.id,
    requestNumber: request.request_number,
  }
}

// ---------------------------------------------------------------------------
// Customer: cancel own pending/reviewing request
// ---------------------------------------------------------------------------

export async function cancelRequest(requestId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const supabase = await createClient()

  // RLS policy already enforces ownership + status check at DB level;
  // this extra check gives a clear error message.
  const { data: existing } = await supabase
    .from('part_requests')
    .select('status, user_id')
    .eq('id', requestId)
    .single()

  if (!existing) return { success: false, error: 'Request not found.' }
  if (existing.user_id !== user.id) return { success: false, error: 'Not authorised.' }
  if (!['pending', 'reviewing'].includes(existing.status)) {
    return { success: false, error: 'This request can no longer be cancelled.' }
  }

  const { error } = await supabase
    .from('part_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)

  if (error) return { success: false, error: 'Failed to cancel request.' }

  revalidatePath('/orders')
  revalidatePath(`/orders/${requestId}`)

  return { success: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Admin: update request status + optional admin notes
// ---------------------------------------------------------------------------

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  adminNotes?: string,
): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') return { success: false, error: 'Insufficient permissions.' }

  const supabase = await createClient()

  const patch: Record<string, unknown> = { status }
  if (adminNotes !== undefined) patch.admin_notes = adminNotes

  // Set milestone timestamps
  if (status === 'confirmed') patch.confirmed_at = new Date().toISOString()
  if (status === 'shipped')   patch.shipped_at   = new Date().toISOString()
  if (status === 'delivered') patch.delivered_at = new Date().toISOString()

  const { error } = await supabase
    .from('part_requests')
    .update(patch)
    .eq('id', requestId)

  if (error) return { success: false, error: 'Failed to update status.' }

  revalidatePath('/admin/requests')
  revalidatePath('/orders')
  revalidatePath(`/orders/${requestId}`)

  return { success: true, data: undefined }
}
