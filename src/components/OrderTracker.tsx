'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Clock, Coffee, Truck, CheckCircle2 } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  unitPriceCents: number
  notes: string | null
  modifiers: any
  menuItem: {
    id: string
    name: string
    description: string | null
  }
}

interface Order {
  id: string
  code: string
  status: 'NEW' | 'PAID' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELED'
  totalCents: number
  notes: string | null
  createdAt: string
  updatedAt: string
  restaurant: {
    id: string
    name: string
    currency: string
  }
  table: {
    id: string
    label: string
    code: string
  } | null
  orderItems: OrderItem[]
}

interface OrderTrackerProps {
  order: Order
}

const statusSteps = [
  { key: 'PAID', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'IN_PROGRESS', label: 'Preparing', icon: Coffee },
  { key: 'READY', label: 'Ready for Pickup', icon: CheckCircle2 },
  { key: 'DELIVERED', label: 'Delivered', icon: Truck },
]

export function OrderTracker({ order: initialOrder }: OrderTrackerProps) {
  const [order, setOrder] = useState(initialOrder)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Subscribe to realtime updates for this order
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          console.log('Order update received:', payload)
          setOrder(prev => ({
            ...prev,
            status: payload.new.status as any,
            updatedAt: payload.new.updated_at,
          }))
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [order.id])

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status)
  }

  const currentStepIndex = getStatusIndex(order.status)
  const isReady = order.status === 'READY'
  const isDelivered = order.status === 'DELIVERED'
  const isCanceled = order.status === 'CANCELED'

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{order.restaurant.name}</h1>
        <p className="text-gray-600 mt-1">Order #{order.code}</p>
        {order.table && (
          <p className="text-sm text-gray-500">Table {order.table.label}</p>
        )}
      </div>

      {/* Status Banner */}
      {isReady && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-green-800 mb-2">
              Your order is ready for pickup!
            </h2>
            <p className="text-green-700">
              Please come to the counter to collect your order.
            </p>
          </CardContent>
        </Card>
      )}

      {isDelivered && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Truck className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-blue-800 mb-2">
              Order delivered!
            </h2>
            <p className="text-blue-700">
              Thank you for your order. Enjoy your meal!
            </p>
          </CardContent>
        </Card>
      )}

      {isCanceled && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Order canceled
            </h2>
            <p className="text-red-700">
              This order has been canceled.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Order Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.key} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && !isCompleted && (
                      <p className="text-sm text-gray-500">In progress...</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>
            Placed at {formatTime(order.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.menuItem.name}</span>
                  <Badge variant="outline" className="text-xs">
                    x{item.quantity}
                  </Badge>
                </div>
                
                {item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                  <div className="mt-1 text-sm text-gray-600">
                    {item.modifiers.map((modifier: any, index: number) => (
                      <span key={index}>
                        + {modifier.name}
                        {modifier.priceDeltaCents > 0 && (
                          <span> (+{formatPrice(modifier.priceDeltaCents, order.restaurant.currency)})</span>
                        )}
                        {index < item.modifiers.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                )}
                
                {item.notes && (
                  <p className="mt-1 text-sm text-gray-500 italic">
                    Note: {item.notes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatPrice(item.unitPriceCents * item.quantity, order.restaurant.currency)}
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.totalCents, order.restaurant.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <div className="text-center text-sm text-gray-500">
        {isConnected ? (
          <span className="text-green-600">● Live updates enabled</span>
        ) : (
          <span className="text-gray-400">● Connecting to live updates...</span>
        )}
      </div>
    </div>
  )
}
