'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { OrderTracker } from '@/components/OrderTracker'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

interface Order {
  id: string
  code: string
  status: 'NEW' | 'PAID' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELED'
  subtotalCents: number
  taxCents: number
  tipCents: number
  totalCents: number
  createdAt: string
  orderItems: Array<{
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
  }>
  table?: {
    label: string
  }
  restaurant: {
    name: string
    slug: string
  }
}

export default function OrderPage() {
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Order not found')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600">{error || 'This order could not be found.'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <OrderTracker order={order} />
}
