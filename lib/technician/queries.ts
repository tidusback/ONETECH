// lib/technician/queries.ts
// Server-side data fetching for all technician-facing features.
// Used only in Server Components and Route Handlers.

import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database.types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TechnicianApplication = Tables<'technician_applications'>
export type ApplicationStatus = TechnicianApplication['status']
export type AffiliationLevel  = TechnicianApplication['affiliation_level']

export type TechnicianLevelRequest  = Tables<'technician_level_requests'>
export type LevelRequestStatus      = TechnicianLevelRequest['status']
export type TechnicianLevelCriteria = Tables<'technician_level_criteria'>

export type TechnicianLead = Tables<'technician_leads'>
export type LeadStatus = TechnicianLead['status']
export type LeadUrgency = TechnicianLead['urgency']

export type TechnicianJob = Tables<'technician_jobs'>
export type JobStatus = TechnicianJob['status']

export type TechnicianPoints = Tables<'technician_points'>
export type TechnicianReward = Tables<'technician_rewards'>
export type RewardRedemption = Tables<'technician_reward_redemptions'>
export type LeadAssignment = Tables<'technician_lead_assignments'>
export type JobLog = Tables<'technician_job_logs'>
export type JobLogAction = JobLog['action']

export interface ApplicationWithProfile extends TechnicianApplication {
  profiles: { email: string; full_name: string | null } | null
}

export interface RedemptionWithReward extends RewardRedemption {
  technician_rewards: { title: string; category: string } | null
}

export interface JobLogWithActor extends JobLog {
  profiles: { full_name: string | null; role: string } | null
}

// ---------------------------------------------------------------------------
// Application queries
// ---------------------------------------------------------------------------

export async function getMyApplication(): Promise<TechnicianApplication | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('technician_applications')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return data ?? null
}

export async function getAllApplications(): Promise<ApplicationWithProfile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_applications')
    .select('*, profiles(email, full_name)')
    .order('created_at', { ascending: false })
  return (data ?? []) as ApplicationWithProfile[]
}

export async function getApplicationCounts(): Promise<Record<ApplicationStatus, number>> {
  const supabase = await createClient()
  const { data } = await supabase.from('technician_applications').select('status')
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }
  return counts as Record<ApplicationStatus, number>
}

// ---------------------------------------------------------------------------
// Leads queries
// ---------------------------------------------------------------------------

/**
 * Returns all open leads visible to the current technician.
 * Opportunistically expires stale leads before fetching.
 */
export async function getOpenLeads(): Promise<TechnicianLead[]> {
  const supabase = await createClient()
  // Expire any stale leads first (lazy expiry — no background job needed)
  await supabase.rpc('expire_stale_leads')
  const { data } = await supabase
    .from('technician_leads')
    .select('*')
    .eq('status', 'open')
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: false })
  return data ?? []
}

/**
 * Returns the current technician's assignment record for a given lead, if any.
 */
export async function getMyLeadAssignment(
  leadId: string,
  technicianId: string
): Promise<LeadAssignment | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_lead_assignments')
    .select('*')
    .eq('lead_id', leadId)
    .eq('technician_id', technicianId)
    .maybeSingle()
  return data ?? null
}

/**
 * Returns all assignment records for the current technician,
 * useful for filtering leads they've already declined.
 */
export async function getMyLeadAssignments(technicianId: string): Promise<LeadAssignment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_lead_assignments')
    .select('*')
    .eq('technician_id', technicianId)
  return data ?? []
}

export async function getLeadById(id: string): Promise<TechnicianLead | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_leads')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data ?? null
}

// ---------------------------------------------------------------------------
// Jobs queries
// ---------------------------------------------------------------------------

export async function getMyJobs(technicianId: string): Promise<TechnicianJob[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_jobs')
    .select('*')
    .eq('technician_id', technicianId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getMyActiveJobs(technicianId: string): Promise<TechnicianJob[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_jobs')
    .select('*')
    .eq('technician_id', technicianId)
    .not('status', 'in', '("completed","cancelled")')
    .order('scheduled_date', { ascending: true })
  return data ?? []
}

export async function getJobById(id: string): Promise<TechnicianJob | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data ?? null
}

// ---------------------------------------------------------------------------
// Points queries
// ---------------------------------------------------------------------------

/**
 * Spendable balance: only sums rows where state = 'released'.
 * Pending rows are excluded until admin approves them.
 */
export async function getMyPointsBalance(technicianId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_points')
    .select('points')
    .eq('technician_id', technicianId)
    .eq('state', 'released')
  return (data ?? []).reduce((sum, row) => sum + row.points, 0)
}

/**
 * Returns total of pending (not yet released) positive points.
 * Useful for showing a "pending" balance on the dashboard.
 */
export async function getMyPendingPoints(technicianId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_points')
    .select('points')
    .eq('technician_id', technicianId)
    .eq('state', 'pending')
    .gt('points', 0)
  return (data ?? []).reduce((sum, row) => sum + row.points, 0)
}

export async function getMyPointsHistory(technicianId: string): Promise<TechnicianPoints[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_points')
    .select('*')
    .eq('technician_id', technicianId)
    .neq('state', 'voided')   // hide voided entries from technician view
    .order('created_at', { ascending: false })
  return data ?? []
}

// ---------------------------------------------------------------------------
// Admin points queries
// ---------------------------------------------------------------------------

export interface PointsEntryWithTechnician extends TechnicianPoints {
  profiles: { full_name: string | null; email: string } | null
}

export interface RedemptionWithDetail extends RewardRedemption {
  technician_rewards: { title: string; category: string } | null
  profiles:           { full_name: string | null; email: string } | null
}

export async function getAllPendingPoints(): Promise<PointsEntryWithTechnician[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_points')
    .select('*, profiles(full_name, email)')
    .eq('state', 'pending')
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as PointsEntryWithTechnician[]
}

export async function getAllPointsEntries(technicianId?: string): Promise<PointsEntryWithTechnician[]> {
  const supabase = await createClient()
  let query = supabase
    .from('technician_points')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (technicianId) query = query.eq('technician_id', technicianId)
  const { data } = await query
  return (data ?? []) as unknown as PointsEntryWithTechnician[]
}

export async function getAllPendingRedemptions(): Promise<RedemptionWithDetail[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_reward_redemptions')
    .select('*, technician_rewards(title, category), profiles(full_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as RedemptionWithDetail[]
}

export async function getAllRedemptions(): Promise<RedemptionWithDetail[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_reward_redemptions')
    .select('*, technician_rewards(title, category), profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(200)
  return (data ?? []) as unknown as RedemptionWithDetail[]
}

export async function getRewardsCatalog(): Promise<TechnicianReward[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_rewards')
    .select('*')
    .order('points_cost', { ascending: true })
  return data ?? []
}

export interface ApprovedTechnicianProfile {
  id:        string
  full_name: string | null
  email:     string
}

export async function getApprovedTechnicians(): Promise<ApprovedTechnicianProfile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_applications')
    .select('profiles(id, full_name, email)')
    .eq('status', 'approved')
  type Row = { profiles: ApprovedTechnicianProfile | null }
  return ((data ?? []) as Row[])
    .map((r) => r.profiles)
    .filter((p): p is ApprovedTechnicianProfile => p !== null)
}

// ---------------------------------------------------------------------------
// Rewards queries
// ---------------------------------------------------------------------------

export async function getActiveRewards(): Promise<TechnicianReward[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_cost', { ascending: true })
  return data ?? []
}

export async function getMyRedemptions(technicianId: string): Promise<RedemptionWithReward[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_reward_redemptions')
    .select('*, technician_rewards(title, category)')
    .eq('technician_id', technicianId)
    .order('created_at', { ascending: false })
  return (data ?? []) as unknown as RedemptionWithReward[]
}

// ---------------------------------------------------------------------------
// Job logs queries
// ---------------------------------------------------------------------------

export async function getJobLogs(jobId: string): Promise<JobLogWithActor[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_job_logs')
    .select('*, profiles(full_name, role)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as JobLogWithActor[]
}

// ---------------------------------------------------------------------------
// Dashboard summary — fetches all stats in parallel
// ---------------------------------------------------------------------------

export interface TechnicianDashboardSummary {
  activeJobs: number
  openLeads: number
  pointsBalance: number
  jobsCompleted: number
  recentJobs: TechnicianJob[]
}

export async function getTechnicianDashboardSummary(
  technicianId: string
): Promise<TechnicianDashboardSummary> {
  const supabase = await createClient()

  const [jobsRes, leadsRes, pointsRes] = await Promise.all([
    supabase
      .from('technician_jobs')
      .select('id, status, title, category, location_city, scheduled_date, created_at, job_number')
      .eq('technician_id', technicianId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('technician_leads').select('id').eq('status', 'open'),
    supabase.from('technician_points').select('points').eq('technician_id', technicianId).eq('state', 'released'),
  ])

  const jobs = jobsRes.data ?? []
  const activeJobs = jobs.filter(
    (j) => !['completed', 'cancelled'].includes(j.status)
  ).length
  const jobsCompleted = jobs.filter((j) => j.status === 'completed').length
  const openLeads = (leadsRes.data ?? []).length
  const pointsBalance = (pointsRes.data ?? []).reduce((s, r) => s + r.points, 0)
  const recentJobs = jobs.slice(0, 5) as TechnicianJob[]

  return { activeJobs, openLeads, pointsBalance, jobsCompleted, recentJobs }
}

// ---------------------------------------------------------------------------
// Affiliation level queries
// ---------------------------------------------------------------------------

/**
 * Evaluate criteria for the next level up.
 * Returns a structured snapshot with met/unmet flags.
 */
export interface ProgressionCriteria {
  current_level:     AffiliationLevel
  next_level:        'certified_technician' | 'certified_partner' | null
  at_max_level:      boolean
  jobs_completed:    number
  points_balance:    number
  days_at_level:     number
  criteria: {
    min_jobs_completed: number
    min_points_balance: number
    min_days_at_level:  number
    description:        string | null
  } | null
  meets_jobs:    boolean
  meets_points:  boolean
  meets_tenure:  boolean
  meets_all:     boolean
  has_pending_request: boolean
}

export async function getMyProgressionCriteria(
  technicianId: string
): Promise<ProgressionCriteria | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('evaluate_progression_criteria', {
    p_technician_id: technicianId,
  })
  if (error || !data) return null
  if ((data as Record<string, unknown>)['error']) return null
  return data as unknown as ProgressionCriteria
}

export interface LevelRequestWithProfile extends TechnicianLevelRequest {
  profiles: { full_name: string | null; email: string } | null
}

export async function getPendingLevelRequests(): Promise<LevelRequestWithProfile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_level_requests')
    .select('*, profiles(full_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as LevelRequestWithProfile[]
}

export async function getMyLevelRequests(
  technicianId: string
): Promise<TechnicianLevelRequest[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_level_requests')
    .select('*')
    .eq('technician_id', technicianId)
    .order('created_at', { ascending: false })
  return data ?? []
}

/**
 * Admin: all approved technicians with their current affiliation level,
 * joined with profile for name/email.
 */
export interface TechnicianWithLevel {
  user_id:           string
  full_name:         string
  affiliation_level: AffiliationLevel
  level_updated_at:  string | null
  territory_priority: number
  profiles:          { full_name: string | null; email: string } | null
}

export async function getApprovedTechniciansWithLevel(): Promise<TechnicianWithLevel[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('technician_applications')
    .select('user_id, full_name, affiliation_level, level_updated_at, territory_priority, profiles(full_name, email)')
    .eq('status', 'approved')
    .order('affiliation_level', { ascending: false })
  return (data ?? []) as unknown as TechnicianWithLevel[]
}
