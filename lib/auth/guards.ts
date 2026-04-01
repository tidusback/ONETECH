import { redirect } from 'next/navigation'
import { getUser, getProfile } from '@/lib/auth/utils'
import type { UserRole } from '@/types'

/**
 * Asserts the request is authenticated.
 * Call at the top of protected layouts and pages.
 * Redirects to /login if not authenticated.
 */
export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

/**
 * Asserts the user holds a specific role.
 * Redirects to /dashboard if authenticated but lacking the role.
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  const profile = await getProfile(user.id)

  if (!profile || profile.role !== role) {
    redirect('/dashboard')
  }

  return { user, profile }
}

/**
 * For the (auth) group layouts — redirects authenticated users.
 * If onboarding is complete → /dashboard.
 * If authenticated but no onboarding → /onboarding.
 */
export async function redirectIfAuthenticated() {
  const user = await getUser()
  if (!user) return

  if (user.user_metadata?.onboarding_completed) {
    redirect('/dashboard')
  } else {
    redirect('/onboarding')
  }
}

/**
 * For the (onboarding) group layout — asserts authenticated + onboarding incomplete.
 * If onboarding is already complete → /dashboard.
 */
export async function requireOnboardingIncomplete() {
  const user = await requireAuth()
  if (user.user_metadata?.onboarding_completed) {
    redirect('/dashboard')
  }
  return user
}

/**
 * For the (dashboard) group layout — asserts authenticated + onboarding complete.
 * If onboarding is missing → /onboarding.
 */
export async function requireOnboardingComplete() {
  const user = await requireAuth()
  if (!user.user_metadata?.onboarding_completed) {
    redirect('/onboarding')
  }
  return user
}
