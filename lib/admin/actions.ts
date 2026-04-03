'use server'
// lib/admin/actions.ts
// Next.js Server Actions for admin mutations.
// Auth guard runs on the server — only admin role can execute these.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/guards'

async function ensureAdmin() {
  const { profile } = await requireRole('admin')
  return profile
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function adminCreateLead(formData: {
  title: string
  description?: string
  category?: string
  location_city?: string
  location_province?: string
  urgency: 'low' | 'normal' | 'high' | 'urgent'
}): Promise<{ error: string | null }> {
  const admin = await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('technician_leads').insert({
    title:              formData.title.trim(),
    description:        formData.description?.trim() || null,
    category:           formData.category?.trim() || null,
    location_city:      formData.location_city?.trim() || null,
    location_province:  formData.location_province?.trim() || null,
    urgency:            formData.urgency,
    status:             'open',
    created_by:         admin.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/leads')
  return { error: null }
}

export async function adminForceAssignLead(
  leadId: string,
  technicianId: string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  // Update the lead itself
  const { error: leadError } = await supabase
    .from('technician_leads')
    .update({ status: 'assigned', assigned_to: technicianId })
    .eq('id', leadId)

  if (leadError) return { error: leadError.message }

  // Upsert an assignment record (admin force-assigned)
  const { error: assignError } = await supabase
    .from('technician_lead_assignments')
    .upsert(
      {
        lead_id:       leadId,
        technician_id: technicianId,
        status:        'accepted',
        responded_at:  new Date().toISOString(),
      },
      { onConflict: 'lead_id,technician_id' },
    )

  if (assignError) return { error: assignError.message }

  revalidatePath('/admin/leads')
  return { error: null }
}

export async function adminCloseLead(
  leadId: string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('technician_leads')
    .update({ status: 'closed' })
    .eq('id', leadId)

  if (error) return { error: error.message }
  revalidatePath('/admin/leads')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function adminOverrideJobStatus(
  jobId:  string,
  status: 'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled',
  reason?: string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('admin_override_job_status', {
    p_job_id: jobId,
    p_status: status,
    p_reason: reason ?? undefined,
  })

  if (error) return { error: error.message }
  const result = data as { error: string | null }
  if (result?.error) return { error: result.error }

  revalidatePath('/admin/jobs')
  revalidatePath(`/admin/jobs/${jobId}`)
  return { error: null }
}

export async function adminAddJobNote(
  jobId: string,
  note:  string,
): Promise<{ error: string | null }> {
  const admin = await ensureAdmin()
  const supabase = await createClient()

  const [noteError, logError] = await Promise.all([
    supabase.from('technician_jobs').update({ admin_notes: note }).eq('id', jobId),
    supabase.from('technician_job_logs').insert({
      job_id:     jobId,
      actor_id:   admin.id,
      actor_role: 'admin',
      action:     'admin_note_added',
      note,
    }),
  ])

  if (noteError.error) return { error: noteError.error.message }
  if (logError.error)  return { error: logError.error.message }

  revalidatePath(`/admin/jobs/${jobId}`)
  return { error: null }
}

// ---------------------------------------------------------------------------
// Parts (DB table)
// ---------------------------------------------------------------------------

export async function adminCreatePart(formData: {
  name:           string
  part_number:    string
  description?:   string
  price:          number
  stock?:         number | null
  compatibility?: string | null
}): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('parts').insert({
    name:          formData.name.trim(),
    part_number:   formData.part_number.trim(),
    description:   formData.description?.trim() || null,
    price:         formData.price,
    is_active:     true,
    stock:         formData.stock ?? null,
    compatibility: formData.compatibility?.trim() || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/parts')
  return { error: null }
}

export async function adminUpdatePart(
  id:      string,
  updates: {
    name?:          string
    part_number?:   string
    description?:   string | null
    price?:         number
    stock?:         number | null
    compatibility?: string | null
  },
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('parts').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/parts')
  return { error: null }
}

export async function adminTogglePartActive(
  id:       string,
  isActive: boolean,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('parts').update({ is_active: isActive }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/parts')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Diagnosis categories
// ---------------------------------------------------------------------------

export async function adminCreateCategory(formData: {
  label:       string
  description: string
  sort_order?: number
}): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('issue_categories').insert({
    label:       formData.label.trim(),
    description: formData.description.trim(),
    sort_order:  formData.sort_order ?? 0,
    is_active:   true,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/diagnosis')
  return { error: null }
}

export async function adminUpdateCategory(
  id:      string,
  updates: { label?: string; description?: string; sort_order?: number; is_active?: boolean },
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('issue_categories').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/diagnosis')
  return { error: null }
}

export async function adminDeleteCategory(id: string): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('issue_categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/diagnosis')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

export async function adminUpdateTicketStatus(
  ticketId: string,
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed',
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const updates: Record<string, unknown> = { status }
  if (status === 'resolved' || status === 'closed') {
    updates.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticketId)

  if (error) return { error: error.message }
  revalidatePath('/admin/support')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Risk Logs
// ---------------------------------------------------------------------------

export async function adminUpdateRiskStatus(
  logId: string,
  status: 'open' | 'investigating' | 'resolved' | 'dismissed',
): Promise<{ error: string | null }> {
  const admin = await ensureAdmin()
  const supabase = await createClient()

  const updates: Record<string, unknown> = { status }
  if (status === 'resolved' || status === 'dismissed') {
    updates.resolved_at = new Date().toISOString()
    updates.resolved_by = admin.id
  }

  const { error } = await supabase
    .from('risk_logs')
    .update(updates)
    .eq('id', logId)

  if (error) return { error: error.message }
  revalidatePath('/admin/risk-logs')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function adminToggleReviewPublished(
  reviewId: string,
  isPublished: boolean,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('reviews')
    .update({ is_published: isPublished })
    .eq('id', reviewId)

  if (error) return { error: error.message }
  revalidatePath('/admin/reviews')
  return { error: null }
}

export async function adminDeleteReview(
  reviewId: string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
  if (error) return { error: error.message }
  revalidatePath('/admin/reviews')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Technician Applications
// ---------------------------------------------------------------------------

type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info'
type AffiliationLevel  = 'affiliate_technician' | 'certified_technician' | 'certified_partner'

export async function adminUpdateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  opts?: {
    affiliationLevel?: AffiliationLevel
    adminNotes?: string | null
    rejectionReason?: string | null
  },
): Promise<{ error: string | null }> {
  const admin = await ensureAdmin()
  const supabase = await createClient()

  const updates: Record<string, unknown> = {
    status,
    updated_at:   new Date().toISOString(),
    reviewed_by:  admin.id,
    reviewed_at:  new Date().toISOString(),
  }
  if (opts?.affiliationLevel) updates.affiliation_level = opts.affiliationLevel
  if (status === 'approved' && opts?.affiliationLevel) {
    updates.level_updated_at = new Date().toISOString()
  }
  if (opts?.adminNotes !== undefined)    updates.admin_notes      = opts.adminNotes ?? null
  if (opts?.rejectionReason !== undefined) updates.rejection_reason = opts.rejectionReason ?? null

  const { error } = await supabase
    .from('technician_applications')
    .update(updates)
    .eq('id', applicationId)

  if (error) return { error: error.message }
  revalidatePath('/admin/applications')
  revalidatePath('/admin/technicians')
  return { error: null }
}

export async function adminSetAffiliationLevel(
  applicationId: string,
  level: AffiliationLevel,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('technician_applications')
    .update({ affiliation_level: level, level_updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (error) return { error: error.message }
  revalidatePath('/admin/applications')
  revalidatePath('/admin/technicians')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Rewards catalog
// ---------------------------------------------------------------------------

type RewardCategory = 'voucher' | 'tool' | 'merchandise' | 'cash_equivalent'

export async function adminCreateReward(formData: {
  title:       string
  description?: string
  points_cost: number
  category:    RewardCategory
  stock?:      number | null
}): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('technician_rewards').insert({
    title:       formData.title.trim(),
    description: formData.description?.trim() || null,
    points_cost: formData.points_cost,
    category:    formData.category,
    stock:       formData.stock ?? null,
    is_active:   true,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/rewards')
  return { error: null }
}

export async function adminUpdateReward(
  id:      string,
  updates: { title?: string; description?: string | null; points_cost?: number; category?: RewardCategory; stock?: number | null },
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('technician_rewards').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/rewards')
  return { error: null }
}

export async function adminToggleRewardActive(
  id:       string,
  isActive: boolean,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('technician_rewards')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/rewards')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Points lifecycle
// ---------------------------------------------------------------------------

export async function adminReleasePoints(
  pointsId: string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('release_points_entry', {
    p_points_id: pointsId,
  })

  if (error) return { error: error.message }
  const result = data as { error: string | null }
  if (result?.error) return { error: result.error }

  revalidatePath('/admin/points')
  return { error: null }
}

export async function adminVoidPoints(
  pointsId: string,
  reason?:  string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('void_points_entry', {
    p_points_id: pointsId,
    p_reason:    reason ?? undefined,
  })

  if (error) return { error: error.message }
  const result = data as { error: string | null }
  if (result?.error) return { error: result.error }

  revalidatePath('/admin/points')
  return { error: null }
}

export async function adminGrantPoints(
  technicianId: string,
  points:       number,
  reason:       'bonus' | 'adjustment',
  note?:        string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('admin_grant_points', {
    p_technician_id: technicianId,
    p_points:        points,
    p_reason:        reason,
    p_note:          note ?? undefined,
  })

  if (error) return { error: error.message }
  const result = data as { error: string | null }
  if (result?.error) return { error: result.error }

  revalidatePath('/admin/points')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Reward redemptions
// ---------------------------------------------------------------------------

export async function adminFulfillRedemption(
  redemptionId: string,
  note?:        string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('fulfill_redemption', {
    p_redemption_id: redemptionId,
    p_note:          note ?? undefined,
  })

  if (error) return { error: error.message }
  const result = data as { error: string | null }
  if (result?.error) return { error: result.error }

  revalidatePath('/admin/rewards')
  revalidatePath('/admin/points')
  return { error: null }
}

export async function adminCancelRedemption(
  redemptionId: string,
  note?:        string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('cancel_redemption', {
    p_redemption_id: redemptionId,
    p_note:          note ?? undefined,
  })

  if (error) return { error: error.message }
  const result = data as { error: string | null }
  if (result?.error) return { error: result.error }

  revalidatePath('/admin/rewards')
  revalidatePath('/admin/points')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Custom Requests
// ---------------------------------------------------------------------------

export async function adminUpdateCustomRequestStatus(
  requestId: string,
  status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'completed',
  adminNotes?: string,
): Promise<{ error: string | null }> {
  await ensureAdmin()
  const supabase = await createClient()

  const updates: Record<string, unknown> = { status }
  if (adminNotes !== undefined) updates.admin_notes = adminNotes.trim() || null

  const { error } = await supabase
    .from('custom_requests')
    .update(updates)
    .eq('id', requestId)

  if (error) return { error: error.message }
  revalidatePath('/admin/custom-requests')
  return { error: null }
}

// ---------------------------------------------------------------------------
// Admin profile
// ---------------------------------------------------------------------------

export async function adminUpdateProfile(updates: {
  full_name: string
}): Promise<{ error: string | null }> {
  const admin = await ensureAdmin()
  const supabase = await createClient()

  const name = updates.full_name.trim()
  if (!name) return { error: 'Full name cannot be empty.' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: name, updated_at: new Date().toISOString() })
    .eq('id', admin.id)

  if (error) return { error: error.message }
  revalidatePath('/admin/profile')
  return { error: null }
}
