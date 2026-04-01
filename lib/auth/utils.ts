import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

/**
 * Returns the authenticated Supabase user, or null.
 * Use in Server Components and Server Actions.
 * Always calls getUser() (not getSession()) so the JWT is validated server-side.
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

/**
 * Returns the profile row for a given user ID.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

/**
 * Returns both the auth user and their profile in one call.
 */
export async function getUserWithProfile() {
  const user = await getUser()
  if (!user) return { user: null, profile: null }
  const profile = await getProfile(user.id)
  return { user, profile }
}
