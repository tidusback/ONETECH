// Customer domain types — Trivelox machine service platform

export type MachineStatus = 'operational' | 'needs-service' | 'out-of-service' | 'archived'
export type WarrantyStatus = 'under-warranty' | 'out-of-warranty' | 'unknown'
export type DiagnosisStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type CustomerOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
export type RequestStatus = 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'declined'

export interface Machine {
  id: string
  nickname: string          // user-friendly name, e.g. "Floor Press #2"
  category: string          // category id: 'cnc' | 'press' | 'welding' | …
  model: string             // specific model name
  serial_number: string
  status: MachineStatus
  install_location: string | null
  warranty_status: WarrantyStatus
  warranty_expiry: string | null
  last_service_date: string | null
  purchase_date: string | null
  notes: string | null
  created_at: string
}

export interface Diagnosis {
  id: string
  machine_id: string
  machine_name: string
  technician_name: string | null
  status: DiagnosisStatus
  summary: string | null
  findings: string | null
  recommended_action: string | null
  scheduled_at: string | null
  completed_at: string | null
  created_at: string
}

export interface SupportTicket {
  id: string
  ticket_number: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  assigned_to: string | null
  machine_id: string | null
  machine_name: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  unit_price: number
}

export interface CustomerOrder {
  id: string
  order_number: string
  description: string
  status: CustomerOrderStatus
  amount: number
  items: OrderItem[]
  machine_id: string | null
  machine_name: string | null
  created_at: string
  estimated_delivery: string | null
  delivered_at: string | null
}

export interface CustomRequest {
  id: string
  request_number: string
  title: string
  description: string
  status: RequestStatus
  quoted_amount: number | null
  machine_id: string | null
  machine_name: string | null
  created_at: string
  quoted_at: string | null
  responded_at: string | null
}

export interface Review {
  id: string
  technician_name: string
  service_type: string
  rating: number // 1–5
  comment: string | null
  diagnosis_id: string | null
  order_id: string | null
  created_at: string
}
