'use client'

import { CartProvider } from '@/lib/request-cart'

export function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}
