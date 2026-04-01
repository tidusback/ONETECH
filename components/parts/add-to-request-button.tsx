'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/request-cart'

interface AddToRequestButtonProps {
  partNumber: string
  partName: string
  partCategory: string
  slug: string
  className?: string
  size?: 'default' | 'sm' | 'lg'
}

export function AddToRequestButton({
  partNumber,
  partName,
  partCategory,
  slug,
  className,
  size = 'default',
}: AddToRequestButtonProps) {
  const { addItem, hasItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const alreadyInCart = hasItem(partNumber)

  useEffect(() => {
    if (!justAdded) return
    const id = setTimeout(() => setJustAdded(false), 2000)
    return () => clearTimeout(id)
  }, [justAdded])

  function handleAdd() {
    addItem({ partNumber, partName, partCategory, slug })
    setJustAdded(true)
  }

  if (alreadyInCart) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <Check className="h-4 w-4" />
        Added to Request
      </Button>
    )
  }

  return (
    <Button
      size={size}
      className={className}
      onClick={handleAdd}
    >
      {justAdded ? (
        <>
          <Check className="h-4 w-4" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Add to Request
        </>
      )}
    </Button>
  )
}
