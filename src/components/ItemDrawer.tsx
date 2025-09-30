'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { X, Plus, Minus } from 'lucide-react'

interface Modifier {
  id: string
  name: string
  type: 'SINGLE' | 'MULTI'
  priceDeltaCents: number
  isRequired: boolean
}

interface MenuItem {
  id: string
  name: string
  priceCents: number
  description: string | null
  imageUrl: string | null
  isAvailable: boolean
  modifiers: Modifier[]
}

interface ItemDrawerProps {
  item: MenuItem
  restaurantSlug: string
  tableCode: string
  onClose: () => void
}

interface SelectedModifier {
  id: string
  name: string
  priceDeltaCents: number
}

export function ItemDrawer({ item, restaurantSlug, tableCode, onClose }: ItemDrawerProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([])
  const [notes, setNotes] = useState('')
  const { addToast } = useToast()

  const handleModifierChange = (modifier: Modifier, isSelected: boolean) => {
    if (modifier.type === 'SINGLE') {
      // For single selection, replace any existing selection for this modifier type
      setSelectedModifiers(prev => 
        prev.filter(m => m.name !== modifier.name).concat(
          isSelected ? [{
            id: modifier.id,
            name: modifier.name,
            priceDeltaCents: modifier.priceDeltaCents
          }] : []
        )
      )
    } else {
      // For multi selection, add/remove from array
      if (isSelected) {
        setSelectedModifiers(prev => [...prev, {
          id: modifier.id,
          name: modifier.name,
          priceDeltaCents: modifier.priceDeltaCents
        }])
      } else {
        setSelectedModifiers(prev => prev.filter(m => m.id !== modifier.id))
      }
    }
  }

  const calculateTotal = () => {
    const basePrice = item.priceCents * quantity
    const modifierPrice = selectedModifiers.reduce((sum, mod) => sum + mod.priceDeltaCents, 0) * quantity
    return basePrice + modifierPrice
  }

  const addToCart = () => {
    const cartKey = `cart:${restaurantSlug}:${tableCode}`
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      quantity,
      unitPriceCents: item.priceCents,
      modifiers: selectedModifiers,
      notes: notes.trim(),
      totalCents: calculateTotal()
    }

    const newCart = [...existingCart, cartItem]
    localStorage.setItem(cartKey, JSON.stringify(newCart))

    addToast({
      title: 'Added to cart',
      description: `${quantity}x ${item.name} added to your cart`,
    })

    onClose()
  }

  const isRequiredModifierSelected = (modifier: Modifier) => {
    if (!modifier.isRequired) return true
    return selectedModifiers.some(m => m.name === modifier.name)
  }

  const canAddToCart = item.modifiers.every(isRequiredModifierSelected)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {item.description && (
            <p className="text-sm text-gray-600">{item.description}</p>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Modifiers */}
          {item.modifiers.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Customize your order</h4>
              {item.modifiers.map((modifier) => (
                <div key={modifier.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium">
                      {modifier.name}
                      {modifier.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {modifier.priceDeltaCents > 0 && (
                      <span className="text-sm text-gray-600">
                        +{formatPrice(modifier.priceDeltaCents)}
                      </span>
                    )}
                  </div>
                  
                  {modifier.type === 'SINGLE' ? (
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={modifier.name}
                          checked={selectedModifiers.some(m => m.name === modifier.name)}
                          onChange={(e) => handleModifierChange(modifier, e.target.checked)}
                          className="text-primary"
                        />
                        <span className="text-sm">None</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={modifier.name}
                          checked={selectedModifiers.some(m => m.id === modifier.id)}
                          onChange={(e) => handleModifierChange(modifier, e.target.checked)}
                          className="text-primary"
                        />
                        <span className="text-sm">{modifier.name}</span>
                      </label>
                    </div>
                  ) : (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedModifiers.some(m => m.id === modifier.id)}
                        onChange={(e) => handleModifierChange(modifier, e.target.checked)}
                        className="text-primary"
                      />
                      <span className="text-sm">{modifier.name}</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="font-medium">Special Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests?"
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>

          {/* Total and Add to Cart */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">{formatPrice(calculateTotal())}</span>
            </div>
            
            <Button
              onClick={addToCart}
              disabled={!canAddToCart}
              className="w-full"
            >
              Add to Cart - {formatPrice(calculateTotal())}
            </Button>
            
            {!canAddToCart && (
              <p className="text-sm text-red-500 mt-2 text-center">
                Please select all required options
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
