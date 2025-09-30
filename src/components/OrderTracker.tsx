'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Utensils, 
  Truck,
  Home,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  qty: number
  unitPriceCents: number
  notes: string | null
  modifiers: Array<{
    name: string
    priceDeltaCents: number
  }>
  menuItem: {
    name: string
  }
}

interface Order {
  id: string
  code: string
  status: 'NEW' | 'PAID' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELED'
  subtotalCents: number
  taxCents: number
  tipCents: number
  totalCents: number
  createdAt: string
  orderItems: OrderItem[]
  table?: {
    label: string
  }
  restaurant: {
    name: string
    slug: string
  }
}

interface OrderTrackerProps {
  order: Order
}

const statusSteps = [
  { key: 'NEW', label: 'Order Placed', icon: Clock, color: 'text-blue-600' },
  { key: 'PAID', label: 'Payment Confirmed', icon: CreditCard, color: 'text-green-600' },
  { key: 'IN_PROGRESS', label: 'Preparing', icon: Utensils, color: 'text-yellow-600' },
  { key: 'READY', label: 'Ready for Pickup', icon: CheckCircle, color: 'text-purple-600' },
  { key: 'DELIVERED', label: 'Delivered', icon: Truck, color: 'text-gray-600' },
]

export function OrderTracker({ order }: OrderTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState(order.status)
  const [isTracking, setIsTracking] = useState(true)

  useEffect(() => {
    // In a real app, you'd set up real-time tracking here
    // For now, we'll just use the initial status
    setCurrentStatus(order.status)
  }, [order.status])

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status)
  }

  const currentStepIndex = getStatusIndex(currentStatus)
  const isCompleted = currentStatus === 'DELIVERED'
  const isCanceled = currentStatus === 'CANCELED'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'READY':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstimatedTime = () => {
    const orderTime = new Date(order.createdAt)
    const now = new Date()
    const elapsed = now.getTime() - orderTime.getTime()
    const minutes = Math.floor(elapsed / (1000 * 60))
    
    if (currentStatus === 'NEW' || currentStatus === 'PAID') {
      return '15-20 minutes'
    } else if (currentStatus === 'IN_PROGRESS') {
      return '10-15 minutes'
    } else if (currentStatus === 'READY') {
      return 'Ready now!'
    } else if (currentStatus === 'DELIVERED') {
      return 'Completed'
    }
    return 'Processing...'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/r/${order.restaurant.slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.code}</h1>
            <p className="text-gray-600">{order.restaurant.name}</p>
            {order.table && (
              <p className="text-sm text-gray-500">Table {order.table.label}</p>
            )}
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Status</span>
              <Badge className={getStatusColor(currentStatus)}>
                {currentStatus.replace('_', ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCanceled ? (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-lg font-medium text-gray-900">Order Canceled</p>
                <p className="text-gray-600">This order has been canceled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    {isCompleted ? 'Order Complete!' : 'Order in Progress'}
                  </p>
                  <p className="text-gray-600">
                    {isCompleted ? 'Thank you for your order!' : `Estimated time: ${getEstimatedTime()}`}
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="space-y-3">
                  {statusSteps.map((step, index) => {
                    const StepIcon = step.icon
                    const isActive = index === currentStepIndex
                    const isCompleted = index < currentStepIndex
                    const isUpcoming = index > currentStepIndex

                    return (
                      <div key={step.key} className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : isActive 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.menuItem.name}</span>
                      <span className="text-sm text-gray-500">x{item.qty}</span>
                    </div>
                    {item.modifiers.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {item.modifiers.map((mod, idx) => (
                          <span key={idx}>
                            {mod.name}
                            {mod.priceDeltaCents > 0 && ` (+$${(mod.priceDeltaCents / 100).toFixed(2)})`}
                            {idx < item.modifiers.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-500 italic mt-1">"{item.notes}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${((item.unitPriceCents + item.modifiers.reduce((sum, mod) => sum + mod.priceDeltaCents, 0)) * item.qty / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${(order.subtotalCents / 100).toFixed(2)}</span>
              </div>
              {order.taxCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${(order.taxCents / 100).toFixed(2)}</span>
                </div>
              )}
              {order.tipCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tip:</span>
                  <span>${(order.tipCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${(order.totalCents / 100).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 text-center">
          <Button asChild className="w-full">
            <Link href={`/r/${order.restaurant.slug}`}>
              <Home className="w-4 h-4 mr-2" />
              Order Again
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}