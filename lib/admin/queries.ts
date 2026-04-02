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

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

export interface AdminSupportTicket {
  id: string
  ticket_number: string
  subject: string
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  customer_name: string | null
  customer_email: string
  assigned_to: string | null
}

export async function getSupportTickets(): Promise<AdminSupportTicket[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('support_tickets')
    .select('id, ticket_number, subject, status, priority, created_at, assigned_to, user:profiles!user_id(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(500)

  type Row = {
    id: string
    ticket_number: string
    subject: string
    status: AdminSupportTicket['status']
    priority: AdminSupportTicket['priority']
    created_at: string
    assigned_to: string | null
    user: { full_name: string | null; email: string } | null
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id:             r.id,
    ticket_number:  r.ticket_number,
    subject:        r.subject,
    status:         r.status,
    priority:       r.priority,
    created_at:     r.created_at,
    assigned_to:    r.assigned_to,
    customer_name:  r.user?.full_name ?? null,
    customer_email: r.user?.email ?? '',
  }))
}

// ---------------------------------------------------------------------------
// Risk Logs
// ---------------------------------------------------------------------------

export interface AdminRiskLog {
  id: string
  event_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  description: string
  created_at: string
  resolved_at: string | null
  actor_name: string | null
  actor_email: string | null
}

export async function getRiskLogs(): Promise<AdminRiskLog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('risk_logs')
    .select('id, event_type, severity, status, description, created_at, resolved_at, actor:profiles!actor_id(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(500)

  type Row = {
    id: string
    event_type: string
    severity: AdminRiskLog['severity']
    status: AdminRiskLog['status']
    description: string
    created_at: string
    resolved_at: string | null
    actor: { full_name: string | null; email: string } | null
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id:           r.id,
    event_type:   r.event_type,
    severity:     r.severity,
    status:       r.status,
    description:  r.description,
    created_at:   r.created_at,
    resolved_at:  r.resolved_at,
    actor_name:   r.actor?.full_name ?? null,
    actor_email:  r.actor?.email ?? null,
  }))
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface AdminReview {
  id: string
  rating: number
  comment: string | null
  is_published: boolean
  created_at: string
  customer_name: string | null
  customer_email: string
  technician_name: string | null
}

export async function getReviews(): Promise<AdminReview[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, comment, is_published, created_at, customer:profiles!user_id(full_name, email), technician:profiles!technician_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(500)

  type Row = {
    id: string
    rating: number
    comment: string | null
    is_published: boolean
    created_at: string
    customer: { full_name: string | null; email: string } | null
    technician: { full_name: string | null } | null
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id:               r.id,
    rating:           r.rating,
    comment:          r.comment,
    is_published:     r.is_published,
    created_at:       r.created_at,
    customer_name:    r.customer?.full_name ?? null,
    customer_email:   r.customer?.email ?? '',
    technician_name:  r.technician?.full_name ?? null,
  }))
}

// ---------------------------------------------------------------------------
// Custom Requests
// ---------------------------------------------------------------------------

export interface AdminCustomRequest {
  id: string
  request_number: string
  title: string
  description: string | null
  status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'completed'
  budget: number | null
  created_at: string
  customer_name: string | null
  customer_email: string
}

export async function getCustomRequests(): Promise<AdminCustomRequest[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('custom_requests')
    .select('id, request_number, title, description, status, budget, created_at, customer:profiles!user_id(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(500)

  type Row = {
    id: string
    request_number: string
    title: string
    description: string | null
    status: AdminCustomRequest['status']
    budget: number | null
    created_at: string
    customer: { full_name: string | null; email: string } | null
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id:             r.id,
    request_number: r.request_number,
    title:          r.title,
    description:    r.description,
    status:         r.status,
    budget:         r.budget,
    created_at:     r.created_at,
    customer_name:  r.customer?.full_name ?? null,
    customer_email: r.customer?.email ?? '',
  }))
}
