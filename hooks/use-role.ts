'use client'

import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types'

/**
 * Returns the current user's role as a typed UserRole, or null if
 * unauthenticated or still loading.
 *
 * NOTE: This reads from user_metadata in the JWT — it reflects the role
 * at the time the token was last issued. For UI branching (showing/hiding nav
 * items, rendering different components) this is fine. For security decisions,
 * always use server-side requireRole() — never trust the client.
 */
export function useRole(): { role: UserRole | null; loading: boolean } {
  const { user, loading } = useAuth()

  const raw = user?.user_metadata?.role
  const role = (raw === 'admin' || raw === 'technician' || raw === 'customer')
    ? (raw as UserRole)
    : null

  return { role, loading }
}

export function useIsAdmin(): boolean {
  const { role } = useRole()
  return role === 'admin'
}

export function useIsCustomer(): boolean {
  const { role } = useRole()
  return role === 'customer'
}

export function useIsTechnician(): boolean {
  const { role } = useRole()
  return role === 'technician'
}
