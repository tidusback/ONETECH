// Next.js 16: proxy.ts replaces middleware.ts (Node.js runtime, same location as app/)
//
// Responsibilities:
//   1. Refresh Supabase session cookies on every request
//   2. Redirect unauthenticated users away from protected routes
//   3. Redirect authenticated users who haven't completed onboarding
//   4. Redirect completed users away from auth/onboarding pages
//
// NOTE: This is the first line of defence. Layout-level guards in
//       (dashboard)/layout.tsx and (onboarding)/layout.tsx provide a second
//       layer — essential because middleware runs before layouts.

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const APP_ROUTES   = [
  '/dashboard',
  '/my-machines',
  '/diagnosis-history',
  '/support-tickets',
  '/orders',
  '/custom-requests',
  '/reviews',
  '/request',
  '/market',
  '/portfolio',
  '/trades',
  '/profile',
  '/settings',
  '/admin',
  '/technician',
]
const AUTH_ROUTES  = ['/login', '/signup', '/forgot-password', '/reset-password']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always call getUser() to refresh the session cookie.
  // Never use getSession() here — it trusts the cookie without server validation.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isOnApp        = APP_ROUTES.some((p) => pathname.startsWith(p))
  const isOnAuth       = AUTH_ROUTES.some((p) => pathname.startsWith(p))
  const isOnOnboarding = pathname.startsWith('/onboarding')

  const onboardingComplete = user?.user_metadata?.onboarding_completed === true

  // ── Unauthenticated ────────────────────────────────────────────────────────

  if (!user) {
    if (isOnApp || isOnOnboarding) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      // Only set redirectTo for safe app routes — never for API paths,
      // static assets, or anything that starts with /api to avoid
      // post-login redirects landing on non-page endpoints.
      if (!pathname.startsWith('/api/')) {
        url.searchParams.set('redirectTo', pathname)
      }
      return NextResponse.redirect(url)
    }
    return response
  }

  // ── Authenticated, onboarding NOT complete ─────────────────────────────────

  if (!onboardingComplete) {
    // Push away from auth pages
    if (isOnAuth) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
    // Push away from app routes
    if (isOnApp) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
    return response
  }

  // ── Authenticated, onboarding complete ────────────────────────────────────

  if (isOnAuth || isOnOnboarding) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
