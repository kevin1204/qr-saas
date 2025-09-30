'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Minus, Check } from 'lucide-react'
import Image from 'next/image'

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
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: {
    menuItemId: string
    name: string
    priceCents: number
    qty: number
    notes: string
    modifiers: { name: string; priceDeltaCents: number }[]
  }) => void
}

export function ItemDrawer({ item, isOpen, onClose, onAddToCart }: ItemDrawerProps) {
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({})
  const [isAdding, setIsAdding] = useState(false)

  if (!item || !isOpen) return null

  const handleModifierChange = (modifierId: string, optionId: string, isSelected: boolean) => {
    setSelectedModifiers(prev => {
      const current = prev[modifierId] || []
      if (isSelected) {
        return {
          ...prev,
          [modifierId]: [...current, optionId]
        }
      } else {
        return {
          ...prev,
          [modifierId]: current.filter(id => id !== optionId)
        }
      }
    })
  }

  const getSelectedModifiers = () => {
    const modifiers: { name: string; priceDeltaCents: number }[] = []
    
    item.modifiers.forEach(modifier => {
      const selected = selectedModifiers[modifier.id] || []
      if (selected.length > 0) {
        selected.forEach(optionId => {
          // For simplicity, we'll use the modifier name and price
          // In a real app, you'd have separate options with their own prices
          modifiers.push({
            name: modifier.name,
            priceDeltaCents: modifier.priceDeltaCents
          })
        })
      }
    })
    
    return modifiers
  }

  const calculateTotal = () => {
    const basePrice = item.priceCents * qty
    const modifierPrice = getSelectedModifiers().reduce((sum, mod) => sum + mod.priceDeltaCents, 0) * qty
    return basePrice + modifierPrice
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    try {
      await onAddToCart({
        menuItemId: item.id,
        name: item.name,
        priceCents: item.priceCents,
        qty,
        notes,
        modifiers: getSelectedModifiers()
      })
      
      // Reset form
      setQty(1)
      setNotes('')
      setSelectedModifiers({})
      onClose()
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Customize Item</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Item Image */}
              {item.imageUrl && (
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              {/* Item Details */}
              <div>
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="text-lg font-semibold text-green-600">
                  ${(item.priceCents / 100).toFixed(2)}
                </p>
                {item.description && (
                  <p className="text-gray-600 mt-2">{item.description}</p>
                )}
              </div>
              
              {/* Modifiers */}
              {item.modifiers.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Customize your order</h4>
                  {item.modifiers.map((modifier) => (
                    <div key={modifier.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">
                          {modifier.name}
                          {modifier.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {modifier.priceDeltaCents > 0 && (
                          <span className="text-sm text-green-600">
                            +${(modifier.priceDeltaCents / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type={modifier.type === 'SINGLE' ? 'radio' : 'checkbox'}
                            name={modifier.id}
                            checked={(selectedModifiers[modifier.id] || []).length > 0}
                            onChange={(e) => {
                              if (modifier.type === 'SINGLE') {
                                setSelectedModifiers(prev => ({
                                  ...prev,
                                  [modifier.id]: e.target.checked ? ['default'] : []
                                }))
                              } else {
                                handleModifierChange(modifier.id, 'default', e.target.checked)
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">
                            {modifier.type === 'SINGLE' ? 'Add' : 'Include'}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{qty}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQty(qty + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or modifications..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t p-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${(calculateTotal() / 100).toFixed(2)}</span>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || !item.isAvailable}
              className="w-full"
              size="lg"
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart - ${(calculateTotal() / 100).toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}