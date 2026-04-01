// lib/technician/actions.ts
// Browser-side client actions for technician features.
// Called from Client Components during onboarding and job management.

import { createClient } from '@/lib/supabase/client'
import { completeOnboarding } from '@/lib/auth/actions'
import type { TechnicianApplicationInput } from '@/lib/validations/onboarding'
import type { ApplicationStatus, JobStatus } from '@/lib/technician/queries'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyToNull(val: string | undefined | null): string | null {
  return val?.trim() ? val.trim() : null
}

// ---------------------------------------------------------------------------
// Document upload
// ---------------------------------------------------------------------------

export interface UploadedDocs {
  idDocumentUrl: string | null
  qualificationUrls: string[]
}

export async function uploadTechnicianDocuments(
  userId: string,
  idDocument: File | null,
  qualificationFiles: File[]
): Promise<{ data: UploadedDocs; error: Error | null }> {
  const supabase = createClient()
  const result: UploadedDocs = { idDocumentUrl: null, qualificationUrls: [] }

  if (idDocument) {
    const ext = idDocument.name.split('.').pop()
    const path = `${userId}/id-document.${ext}`
    const { data, error } = await supabase.storage
      .from('technician-docs')
      .upload(path, idDocument, { upsert: true })
    if (error) return { data: result, error: new Error(error.message) }
    result.idDocumentUrl = data.path
  }

  for (let i = 0; i < qualificationFiles.length; i++) {
    const file = qualificationFiles[i]
    const ext = file.name.split('.').pop()
    const path = `${userId}/qualifications/${i + 1}-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('technician-docs')
      .upload(path, file, { upsert: true })
    if (error) return { data: result, error: new Error(error.message) }
    result.qualificationUrls.push(data.path)
  }

  return { data: result, error: null }
}

// ---------------------------------------------------------------------------
// Application submission
// ---------------------------------------------------------------------------

export interface SubmitApplicationPayload {
  formData: TechnicianApplicationInput
  idDocument: File | null
  qualificationFiles: File[]
}

export async function submitTechnicianApplication({
  formData,
  idDocument,
  qualificationFiles,
}: SubmitApplicationPayload): Promise<{ error: Error | null }> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: new Error('Not authenticated') }
  }

  let uploadedDocs: UploadedDocs = { idDocumentUrl: null, qualificationUrls: [] }
  if (idDocument || qualificationFiles.length > 0) {
    const { data, error: uploadError } = await uploadTechnicianDocuments(
      user.id,
      idDocument,
      qualificationFiles
    )
    if (uploadError) return { error: uploadError }
    uploadedDocs = data
  }

  const { error: insertError } = await supabase
    .from('technician_applications')
    .insert({
      user_id: user.id,
      full_name: formData.full_name.trim(),
      phone: emptyToNull(formData.phone),
      bio: emptyToNull(formData.bio),
      city: emptyToNull(formData.city),
      province: emptyToNull(formData.province),
      service_radius_km: formData.service_radius_km,
      years_experience: formData.years_experience,
      departments: formData.departments,
      machine_categories: formData.machine_categories,
      skills: formData.skills,
      id_document_url: uploadedDocs.idDocumentUrl,
      qualification_urls: uploadedDocs.qualificationUrls,
      agreed_to_terms: formData.agreed_to_terms,
      agreed_at: formData.agreed_to_terms ? new Date().toISOString() : null,
      status: 'pending',
    })

  if (insertError) return { error: new Error(insertError.message) }

  const { error: onboardingError } = await completeOnboarding({
    role: 'technician',
    full_name: formData.full_name.trim(),
    extra: {
      departments: formData.departments.join(','),
      city: formData.city,
      province: formData.province,
    },
  })

  return { error: onboardingError ? new Error(onboardingError.message) : null }
}

// ---------------------------------------------------------------------------
// Admin: update application status
// ---------------------------------------------------------------------------

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  opts?: { adminNotes?: string; rejectionReason?: string }
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return { error: 'Not authenticated.' }

  // Explicit role check — do not rely on RLS alone for admin operations
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Insufficient permissions.' }

  const { error } = await supabase
    .from('technician_applications')
    .update({
      status,
      admin_notes: opts?.adminNotes ?? null,
      rejection_reason: opts?.rejectionReason ?? null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  return { error: error ? error.message : null }
}

// ---------------------------------------------------------------------------
// Lead accept / decline
// ---------------------------------------------------------------------------

export async function acceptLead(
  leadId: string
): Promise<{ jobId: string | null; jobNumber: string | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('accept_technician_lead', {
    p_lead_id: leadId,
  })
  if (error) return { jobId: null, jobNumber: null, error: error.message }
  const result = data as { job_id: string | null; job_number: string | null; error: string | null }
  return { jobId: result.job_id, jobNumber: result.job_number, error: result.error }
}

export async function declineLead(
  leadId: string,
  reason?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('decline_technician_lead', {
    p_lead_id: leadId,
    p_reason: reason ?? undefined,
  })
  if (error) return { error: error.message }
  const result = data as { error: string | null }
  return { error: result.error }
}

// ---------------------------------------------------------------------------
// Job status updates (technician-initiated)
// All transitions go through the atomic SQL function that also writes a log.
// ---------------------------------------------------------------------------

const JOB_STATUS_TRANSITIONS: Partial<Record<JobStatus, JobStatus[]>> = {
  assigned: ['en_route'],
  en_route: ['on_site'],
  on_site:  ['completed'],
}

export function getNextJobStatuses(current: JobStatus): JobStatus[] {
  return JOB_STATUS_TRANSITIONS[current] ?? []
}

export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  completionNotes?: string,
  actualFault?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('update_job_status_with_log', {
    p_job_id:       jobId,
    p_status:       status,
    p_notes:        completionNotes ?? undefined,
    p_actual_fault: actualFault ?? undefined,
  })
  if (error) return { error: error.message }
  const result = data as { error: string | null }
  return { error: result.error }
}

// ---------------------------------------------------------------------------
// Capture actual fault (can be set any time after job is created)
// ---------------------------------------------------------------------------

export async function captureActualFault(
  jobId: string,
  fault: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('capture_job_fault', {
    p_job_id: jobId,
    p_fault:  fault,
  })
  if (error) return { error: error.message }
  const result = data as { error: string | null }
  return { error: result.error }
}

// ---------------------------------------------------------------------------
// Admin: force job to any status (with audit log)
// ---------------------------------------------------------------------------

export async function adminOverrideJobStatus(
  jobId: string,
  status: JobStatus,
  reason?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('admin_override_job_status', {
    p_job_id: jobId,
    p_status: status,
    p_reason: reason ?? undefined,
  })
  if (error) return { error: error.message }
  const result = data as { error: string | null }
  return { error: result.error }
}

// ---------------------------------------------------------------------------
// Reward redemption
// Uses released balance only. Deduction entry is released immediately so
// the balance reflects the spend straight away.
// ---------------------------------------------------------------------------

export async function redeemReward(
  rewardId: string,
  pointsCost: number
): Promise<{ error: string | null }> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check RELEASED balance only (pending points are not spendable)
  const { data: pointsData } = await supabase
    .from('technician_points')
    .select('points')
    .eq('technician_id', user.id)
    .eq('state', 'released')

  const balance = (pointsData ?? []).reduce((s, r) => s + r.points, 0)
  if (balance < pointsCost) {
    return { error: `Insufficient points. You have ${balance} pts available, need ${pointsCost} pts.` }
  }

  // Fetch reward to include title in note
  const { data: reward } = await supabase
    .from('technician_rewards')
    .select('title, is_active, stock')
    .eq('id', rewardId)
    .single()

  if (!reward?.is_active) return { error: 'This reward is no longer available.' }

  // Insert redemption record
  const { error: redemptionError } = await supabase
    .from('technician_reward_redemptions')
    .insert({
      technician_id: user.id,
      reward_id: rewardId,
      points_spent: pointsCost,
      status: 'pending',
    })

  if (redemptionError) return { error: redemptionError.message }

  // Deduct points — released immediately so the balance drops right away
  const { error: pointsError } = await supabase.from('technician_points').insert({
    technician_id: user.id,
    points: -pointsCost,
    reason: 'redemption',
    state: 'released',
    released_at: new Date().toISOString(),
    note: `Redeemed: ${reward.title}`,
  })

  return { error: pointsError ? pointsError.message : null }
}

// ---------------------------------------------------------------------------
// Admin: points management
// ---------------------------------------------------------------------------

export async function releasePointsEntry(
  pointsId: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('release_points_entry', {
    p_points_id: pointsId,
  })
  if (error) return { error: error.message }
  return { error: (data as { error: string | null }).error }
}

export async function voidPointsEntry(
  pointsId: string,
  reason?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('void_points_entry', {
    p_points_id: pointsId,
    p_reason: reason ?? undefined,
  })
  if (error) return { error: error.message }
  return { error: (data as { error: string | null }).error }
}

export async function adminGrantPoints(
  technicianId: string,
  points: number,
  reason: 'bonus' | 'adjustment',
  note?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('admin_grant_points', {
    p_technician_id: technicianId,
    p_points:        points,
    p_reason:        reason,
    p_note:          note,
  })
  if (error) return { error: error.message }
  return { error: (data as { error: string | null }).error }
}

export async function fulfillRedemption(
  redemptionId: string,
  note?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('fulfill_redemption', {
    p_redemption_id: redemptionId,
    p_note: note ?? undefined,
  })
  if (error) return { error: error.message }
  return { error: (data as { error: string | null }).error }
}

export async function cancelRedemption(
  redemptionId: string,
  note?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('cancel_redemption', {
    p_redemption_id: redemptionId,
    p_note: note ?? undefined,
  })
  if (error) return { error: error.message }
  return { error: (data as { error: string | null }).error }
}

// ---------------------------------------------------------------------------
// Affiliation level progression
// ---------------------------------------------------------------------------

export async function requestLevelPromotion(
  technicianId: string
): Promise<{ requestedLevel: string | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('request_level_promotion', {
    p_technician_id: technicianId,
  })
  if (error) return { requestedLevel: null, error: error.message }
  const result = data as { success?: boolean; requested_level?: string; error?: string }
  return { requestedLevel: result.requested_level ?? null, error: result.error ?? null }
}

export async function approveLevelPromotion(
  requestId: string,
  adminNotes?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('approve_level_promotion', {
    p_request_id:   requestId,
    p_admin_notes:  adminNotes ?? undefined,
  })
  if (error) return { error: error.message }
  return { error: (data as { error?: string }).error ?? null }
}

export async function rejectLevelPromotion(
  requestId: string,
  reason?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('reject_level_promotion', {
    p_request_id: requestId,
    p_reason:     reason ?? undefined,
  })
  if (error) return { error: error.message }
  return { error: (data as { error?: string }).error ?? null }
}

export async function adminSetLevel(
  technicianId: string,
  level: 'affiliate_technician' | 'certified_technician' | 'certified_partner',
  notes?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('admin_set_level', {
    p_technician_id: technicianId,
    p_level:         level,
    p_notes:         notes ?? undefined,
  })
  if (error) return { error: error.message }
  return { error: (data as { error?: string }).error ?? null }
}
