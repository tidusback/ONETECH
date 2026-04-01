// lib/admin/queries.ts
// Server-side admin queries. Call only from Server Components or Server Actions.

import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database.types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminLead = Tables<'technician_leads'> & {
  assigned_technician: { full_name: string | null; email: string } | null
}

export type AdminJob = Tables<'technician_jobs'> & {
  technician: { full_name: string | null; email: string } | null
}

export interface AdminJobWithLogs extends AdminJob {
  logs: Array<
    Tables<'technician_job_logs'> & {
      actor: { full_name: string | null; role: string } | null
    }
  >
}

export type AdminCustomer = Tables<'profiles'> & {
  request_count: number
}

export type DbPart = Tables<'parts'>

export interface CustomerDetail {
  profile:   Tables<'profiles'>
  requests:  Array<Tables<'part_requests'> & { items: Tables<'part_request_items'>[] }>
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function getAllLeads(): Promise<AdminLead[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  return (data ?? []) as AdminLead[]
}

export async function getLeadById(id: string): Promise<AdminLead | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_leads')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return (data ?? null) as AdminLead | null
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function getAllJobsAdmin(): Promise<AdminJob[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  return (data ?? []) as AdminJob[]
}

export async function getAdminJobWithLogs(id: string): Promise<AdminJobWithLogs | null> {
  const supabase = await createClient()

  const [jobRes, logsRes] = await Promise.all([
    supabase.from('technician_jobs').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('technician_job_logs')
      .select('*, actor:profiles!actor_id(full_name, role)')
      .eq('job_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!jobRes.data) return null

  return {
    ...(jobRes.data as AdminJob),
    logs: ((logsRes.data ?? []) as unknown as AdminJobWithLogs['logs']),
  }
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function getCustomers(): Promise<Tables<'profiles'>[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getCustomerDetail(userId: string): Promise<CustomerDetail | null> {
  const supabase = await createClient()

  const [profileRes, requestsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase
      .from('part_requests')
      .select('*, items:part_request_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  if (!profileRes.data) return null

  return {
    profile:  profileRes.data as Tables<'profiles'>,
    requests: (requestsRes.data ?? []) as CustomerDetail['requests'],
  }
}

// ---------------------------------------------------------------------------
// Parts (DB table — diagnosis-linked parts)
// ---------------------------------------------------------------------------

export async function getAllDbParts(): Promise<DbPart[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('parts')
    .select('*')
    .order('name', { ascending: true })
  return data ?? []
}

// ---------------------------------------------------------------------------
// Approved technicians (for lead assignment selector)
// ---------------------------------------------------------------------------

export async function getApprovedTechnicianProfiles(): Promise<
  Array<{ id: string; full_name: string | null; email: string }>
> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_applications')
    .select('profiles!user_id(id, full_name, email)')
    .eq('status', 'approved')
  type Row = { profiles: { id: string; full_name: string | null; email: string } | null }
  return ((data ?? []) as unknown as Row[])
    .map((r) => r.profiles)
    .filter((p): p is { id: string; full_name: string | null; email: string } => p !== null)
}
