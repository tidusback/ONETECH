import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Types returned by queries
// ---------------------------------------------------------------------------

export type RequestStatus =
  | 'pending'
  | 'reviewing'
  | 'quoted'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface PartRequestItem {
  id: string
  request_id: string
  part_number: string
  part_name: string
  part_category: string
  quantity: number
  notes: string | null
  created_at: string
}

export interface PartRequest {
  id: string
  request_number: string
  user_id: string
  status: RequestStatus
  customer_name: string
  customer_email: string
  customer_company: string | null
  customer_phone: string | null
  shipping_address: string | null
  notes: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  items?: PartRequestItem[]
}

// ---------------------------------------------------------------------------
// Customer queries
// ---------------------------------------------------------------------------

export async function getMyRequests(userId: string): Promise<PartRequest[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('part_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getMyRequests error:', error)
    return []
  }
  return (data ?? []) as PartRequest[]
}

export async function getRequestById(id: string): Promise<PartRequest | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('part_requests')
    .select(`
      *,
      items:part_request_items(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('getRequestById error:', error)
    return null
  }
  return data as PartRequest
}

// ---------------------------------------------------------------------------
// Admin queries
// ---------------------------------------------------------------------------

export async function getAllRequests(): Promise<PartRequest[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('part_requests')
    .select(`
      *,
      items:part_request_items(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllRequests error:', error)
    return []
  }
  return (data ?? []) as PartRequest[]
}
