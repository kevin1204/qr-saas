'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'

interface CartItem {
  id: string
  menuItemId: string
  name: string
  priceCents: number
  qty: number
  notes: string
  modifiers: { name: string; priceDeltaCents: number }[]
}

interface CartBarProps {
  items: CartItem[]
  onUpdateQuantity: (itemId: string, qty: number) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
  subtotalCents: number
  taxCents: number
  tipCents: number
  totalCents: number
  isCheckingOut: boolean
}

export function CartBar({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  subtotalCents,
  taxCents,
  tipCents,
  totalCents,
  isCheckingOut
}: CartBarProps) {
  if (items.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-4">
            <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Your cart is empty</p>
            <p className="text-sm text-gray-500">Add items from the menu to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <Badge variant="outline">{items.length} items</Badge>
            </div>
            <div className="text-sm text-gray-600">
              Subtotal: <span className="font-semibold">${(subtotalCents / 100).toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold text-lg">${(totalCents / 100).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={onCheckout}
              disabled={isCheckingOut}
              size="lg"
              className="px-8"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </Button>
          </div>
        </div>
        
        {/* Cart Items Preview */}
        <div className="mt-3 max-h-32 overflow-y-auto">
          <div className="space-y-2">
            {items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500">x{item.qty}</span>
                  {item.modifiers.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.modifiers.length} mods
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">
                    ${((item.priceCents + item.modifiers.reduce((sum, mod) => sum + mod.priceDeltaCents, 0)) * item.qty / 100).toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.qty - 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.qty + 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {items.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{items.length - 3} more items
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}