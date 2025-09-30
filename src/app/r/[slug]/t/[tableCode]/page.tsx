'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MenuGrid } from '@/components/MenuGrid'
import { CartBar } from '@/components/CartBar'
import { ItemDrawer } from '@/components/ItemDrawer'
import { OrderTracker } from '@/components/OrderTracker'
import { ShoppingCart, QrCode, Clock, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface MenuItem {
  id: string
  name: string
  priceCents: number
  description: string | null
  imageUrl: string | null
  isAvailable: boolean
  modifiers: Modifier[]
}

interface Modifier {
  id: string
  name: string
  type: 'SINGLE' | 'MULTI'
  priceDeltaCents: number
  isRequired: boolean
}

interface CartItem {
  id: string
  menuItemId: string
  name: string
  priceCents: number
  qty: number
  notes: string
  modifiers: { name: string; priceDeltaCents: number }[]
}

interface Restaurant {
  id: string
  name: string
  slug: string
  address: string | null
  currency: string
  timezone: string
  serviceType: string
  taxRateBps: number
  defaultTipBps: number
}

interface Table {
  id: string
  label: string
  code: string
}

export default function CustomerOrderingPage() {
  const params = useParams()
  const slug = params.slug as string
  const tableCode = params.tableCode as string

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [table, setTable] = useState<Table | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurantData()
  }, [slug, tableCode])

  const fetchRestaurantData = async () => {
    try {
      const response = await fetch(`/api/restaurants/${slug}`)
      const data = await response.json()

      if (response.ok) {
        setRestaurant(data.restaurant)
        setTable(data.table)
        setMenuItems(data.menuItems)
      } else {
        toast.error('Restaurant not found')
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error)
      toast.error('Failed to load restaurant data')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => 
        cartItem.menuItemId === item.menuItemId &&
        JSON.stringify(cartItem.modifiers) === JSON.stringify(item.modifiers) &&
        cartItem.notes === item.notes
      )

      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === existingItem.id
            ? { ...cartItem, qty: cartItem.qty + item.qty }
            : cartItem
        )
      } else {
        return [...prev, { ...item, id: `${item.menuItemId}-${Date.now()}` }]
      }
    })
    setIsDrawerOpen(false)
    setSelectedItem(null)
  }

  const updateCartItem = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId))
    } else {
      setCart(prev => prev.map(item =>
        item.id === itemId ? { ...item, qty } : item
      ))
    }
  }

  const removeCartItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.priceCents * item.qty
      const modifierTotal = item.modifiers.reduce((modSum, mod) => modSum + mod.priceDeltaCents, 0) * item.qty
      return total + itemTotal + modifierTotal
    }, 0)
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    return Math.round((subtotal * (restaurant?.taxRateBps || 0)) / 10000)
  }

  const calculateTip = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    return Math.round(((subtotal + tax) * (restaurant?.defaultTipBps || 0)) / 10000)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateTip()
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsOrdering(true)

    try {
      const orderData = {
        restaurantId: restaurant?.id,
        tableId: table?.id,
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          qty: item.qty,
          unitPriceCents: item.priceCents,
          notes: item.notes,
          modifiers: item.modifiers
        })),
        subtotalCents: calculateSubtotal(),
        taxCents: calculateTax(),
        tipCents: calculateTip(),
        totalCents: calculateTotal(),
        customerName: '',
        customerEmail: ''
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentOrder(data.order)
        setCart([])
        toast.success('Order placed successfully!')
      } else {
        toast.error(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order')
    } finally {
      setIsOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (!restaurant || !table) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Not Found</h2>
            <p className="text-gray-600">This QR code is invalid or the restaurant is no longer available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentOrder) {
    return <OrderTracker order={currentOrder} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {restaurant.address}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Table {table.label}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {table.code}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2">
            <MenuGrid
              restaurantId={restaurant.id}
              onAddToCart={(item) => {
                setSelectedItem(item)
                setIsDrawerOpen(true)
              }}
            />
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your cart is empty</p>
                      <p className="text-sm">Add items from the menu to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              ${(item.priceCents / 100).toFixed(2)}
                              {item.modifiers.length > 0 && (
                                <span className="ml-2">
                                  + ${(item.modifiers.reduce((sum, mod) => sum + mod.priceDeltaCents, 0) / 100).toFixed(2)}
                                </span>
                              )}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-gray-500 italic">"{item.notes}"</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItem(item.id, item.qty - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.qty}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItem(item.id, item.qty + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${(calculateSubtotal() / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax:</span>
                          <span>${(calculateTax() / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tip:</span>
                          <span>${(calculateTip() / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>${(calculateTotal() / 100).toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleCheckout}
                        disabled={isOrdering}
                        className="w-full"
                        size="lg"
                      >
                        {isOrdering ? 'Processing...' : 'Place Order'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Item Drawer */}
      <ItemDrawer
        item={selectedItem}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedItem(null)
        }}
        onAddToCart={addToCart}
      />
    </div>
  )
}
