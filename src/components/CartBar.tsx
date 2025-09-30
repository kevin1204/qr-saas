'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Trash2 } from 'lucide-react'

interface CartItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  unitPriceCents: number
  modifiers: Array<{
    id: string
    name: string
    priceDeltaCents: number
  }>
  notes: string
  totalCents: number
}

interface CartBarProps {
  restaurantSlug: string
  tableCode: string
  currency: string
}

export function CartBar({ restaurantSlug, tableCode, currency }: CartBarProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const cartKey = `cart:${restaurantSlug}:${tableCode}`

  useEffect(() => {
    const savedCart = localStorage.getItem(cartKey)
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    // Listen for storage changes (when items are added from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === cartKey) {
        const newCart = e.newValue ? JSON.parse(e.newValue) : []
        setCart(newCart)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [cartKey])

  const removeItem = (itemId: string) => {
    const newCart = cart.filter(item => item.id !== itemId)
    setCart(newCart)
    localStorage.setItem(cartKey, JSON.stringify(newCart))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    const newCart = cart.map(item => {
      if (item.id === itemId) {
        const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.priceDeltaCents, 0)
        const newTotalCents = (item.unitPriceCents + modifierTotal) * newQuantity
        return { ...item, quantity: newQuantity, totalCents: newTotalCents }
      }
      return item
    })
    
    setCart(newCart)
    localStorage.setItem(cartKey, JSON.stringify(newCart))
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.totalCents, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantSlug,
          tableCode,
          items: cart,
        }),
      })

      if (!response.ok) {
        throw new Error('Checkout failed')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    }
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <>
      {/* Enhanced Mobile Cart Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-16 px-6 shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
          size="lg"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
              >
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            </div>
            <div className="text-left">
              <div className="text-lg font-bold">
                {formatPrice(calculateSubtotal(), currency)}
              </div>
              <div className="text-xs opacity-90">
                {cart.length} item{cart.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </Button>
      </div>

      {/* Enhanced Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl sm:rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} item{cart.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''} • Table {tableCode}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="rounded-full h-10 w-10 hover:bg-gray-200"
              >
                <span className="text-xl">×</span>
              </Button>
            </div>

            {/* Enhanced Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-base">{item.name}</h3>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(item.totalCents, currency)}
                    </span>
                  </div>
                  
                  {item.modifiers.length > 0 && (
                    <div className="mb-3">
                      {item.modifiers.map((modifier) => (
                        <div key={modifier.id} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-green-600">+</span>
                          <span>{modifier.name}</span>
                          {modifier.priceDeltaCents > 0 && (
                            <span className="text-green-600 font-medium">
                              (+{formatPrice(modifier.priceDeltaCents, currency)})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {item.notes && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-xs text-yellow-800 font-medium">Note:</div>
                      <div className="text-sm text-yellow-700 italic">{item.notes}</div>
                    </div>
                  )}

                  {/* Enhanced Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0 rounded-full border-2 hover:bg-red-50 hover:border-red-300"
                      >
                        <span className="text-red-600 font-bold">−</span>
                      </Button>
                      <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0 rounded-full border-2 hover:bg-green-50 hover:border-green-300"
                      >
                        <span className="text-green-600 font-bold">+</span>
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Footer */}
            <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl sm:rounded-b-2xl">
              <div className="flex items-center justify-between text-xl font-bold mb-4">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">{formatPrice(calculateSubtotal(), currency)}</span>
              </div>
              
              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg text-lg"
                size="lg"
              >
                🛒 Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
