'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartItem {
  partNumber: string
  partName: string
  partCategory: string
  slug: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (partNumber: string) => void
  updateQuantity: (partNumber: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  hasItem: (partNumber: string) => boolean
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'trx_parts_request'

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Start with empty array — hydrate from localStorage in effect to avoid
  // server/client mismatch.
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[]
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {
      // Ignore malformed data
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback((part: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.partNumber === part.partNumber)
      if (existing) {
        return prev.map((i) =>
          i.partNumber === part.partNumber
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      }
      return [...prev, { ...part, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((partNumber: string) => {
    setItems((prev) => prev.filter((i) => i.partNumber !== partNumber))
  }, [])

  const updateQuantity = useCallback((partNumber: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((i) => (i.partNumber === partNumber ? { ...i, quantity } : i)),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const hasItem = useCallback(
    (partNumber: string) => items.some((i) => i.partNumber === partNumber),
    [items],
  )

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, hasItem }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
