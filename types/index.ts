// UserRole — matches the actual business domain.
// 'customer'   = trader/client accessing the platform
// 'technician' = internal staff (risk, analytics, support)
// 'admin'      = platform administrator
export type UserRole = 'customer' | 'technician' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  onboarding_completed_at: string | null
  created_at: string
  updated_at: string
}

// Generic server action / async operation result
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// API response wrapper
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
