// lib/auth/actions.ts
// Centralised client-side auth operations.
//
// DESIGN INTENT: auth pages import ONLY from this file — never directly from
// @supabase/supabase-js. Adding a new provider (e.g. Facebook OAuth) means:
//   1. Extend AuthProvider
//   2. Enable the provider in the Supabase dashboard
//   3. Remove `disabled` from OAuthButton in the UI
//   No other files need to change.

import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

export type AuthProvider = 'google' | 'facebook'

// ---------------------------------------------------------------------------
// Email / Password
// ---------------------------------------------------------------------------

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, error }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { full_name?: string }
) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata ?? {} },
  })
  return { user: data.user, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPasswordForEmail(email: string) {
  const supabase = createClient()
  // The callback route exchanges the code then redirects to /reset-password
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/callback?next=/reset-password`
      : '/api/auth/callback?next=/reset-password'

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  return { error }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error }
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------
// Facebook setup checklist:
//   1. Create a Facebook App at https://developers.facebook.com
//   2. Enable "Facebook Login" on the app
//   3. Add this OAuth redirect URI in the Facebook app settings:
//        https://<your-project-ref>.supabase.co/auth/v1/callback
//   4. Copy the App ID and App Secret into:
//        Supabase Dashboard → Authentication → Providers → Facebook
//   5. In the UI, remove `disabled` from the Facebook OAuthButton

export async function signInWithProvider(provider: AuthProvider) {
  const supabase = createClient()
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/callback`
      : '/api/auth/callback'

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  })
  return { error }
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------
// Extra fields (company, experience, department) are stored in auth
// user_metadata for now and read without a DB round-trip.
// Move them to dedicated DB columns in the schema phase.

// Known extra keys written to auth user_metadata during onboarding.
// This is an explicit allowlist — only these keys may be set via the
// extra field to prevent arbitrary metadata injection.
const ALLOWED_EXTRA_KEYS = ['departments', 'city', 'province', 'experience', 'company'] as const
type AllowedExtraKey = (typeof ALLOWED_EXTRA_KEYS)[number]

export interface OnboardingPayload {
  role: Extract<UserRole, 'customer' | 'technician'>
  full_name?: string
  extra?: Partial<Record<AllowedExtraKey, string>>
}

export async function completeOnboarding(payload: OnboardingPayload) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: userError ?? new Error('Not authenticated') }
  }

  // Persist role + name + completion timestamp to the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role: payload.role,
      ...(payload.full_name ? { full_name: payload.full_name } : {}),
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (profileError) return { error: profileError }

  // Build the safe extra object — only allowlisted keys, values capped at 500 chars
  const safeExtra: Partial<Record<AllowedExtraKey, string>> = {}
  if (payload.extra) {
    for (const key of ALLOWED_EXTRA_KEYS) {
      const val = payload.extra[key]
      if (val !== undefined) {
        safeExtra[key] = String(val).slice(0, 500)
      }
    }
  }

  // Stamp auth metadata — proxy.ts reads this to gate dashboard access
  // without a DB query on every request
  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      onboarding_completed: true,
      role: payload.role,
      ...(payload.full_name ? { full_name: payload.full_name } : {}),
      ...safeExtra,
    },
  })

  return { error: metaError }
}
