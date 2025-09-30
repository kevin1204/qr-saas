'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Clock, CheckCircle, Coffee, Truck, X } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  unitPriceCents: number
  notes: string | null
  modifiers: any
  menuItem: {
    id: string
    name: string
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
  table: {
    id: string
    label: string
    code: string
  } | null
  orderItems: OrderItem[]
}

interface KanbanProps {
  restaurantId: string
}

const columns = [
  { key: 'NEW', label: 'New Orders', color: 'bg-red-100 text-red-800' },
  { key: 'PAID', label: 'Paid', color: 'bg-blue-100 text-blue-800' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'READY', label: 'Ready', color: 'bg-green-100 text-green-800' },
  { key: 'DELIVERED', label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
]

export function Kanban({ restaurantId }: KanbanProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    // Fetch initial orders
    fetchOrders()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`restaurant-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('Order update received:', payload)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            fetchOrders() // Refetch all orders for simplicity
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?restaurantId=${restaurantId}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (response.ok) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
              : order
          )
        )
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    return date.toLocaleDateString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW': return <Clock className="w-4 h-4" />
      case 'PAID': return <CheckCircle className="w-4 h-4" />
      case 'IN_PROGRESS': return <Coffee className="w-4 h-4" />
      case 'READY': return <CheckCircle className="w-4 h-4" />
      case 'DELIVERED': return <Truck className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const statusOrder = ['NEW', 'PAID', 'IN_PROGRESS', 'READY', 'DELIVERED']
    const currentIndex = statusOrder.indexOf(currentStatus)
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {isConnected ? (
            <span className="text-green-600">● Live updates enabled</span>
          ) : (
            <span className="text-gray-400">● Connecting to live updates...</span>
          )}
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnOrders = getOrdersByStatus(column.key)
          
          return (
            <div key={column.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{column.label}</h3>
                <Badge variant="secondary">{columnOrders.length}</Badge>
              </div>
              
              <div className="space-y-2 min-h-[400px]">
                {columnOrders.map((order) => (
                  <Card 
                    key={order.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">#{order.code}</CardTitle>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {order.table ? `Table ${order.table.label}` : 'Pickup'} • {formatTime(order.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1">
                        {order.orderItems.slice(0, 2).map((item) => (
                          <div key={item.id} className="text-xs text-gray-600">
                            {item.quantity}x {item.menuItem.name}
                          </div>
                        ))}
                        {order.orderItems.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{order.orderItems.length - 2} more items
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {formatPrice(order.totalCents)}
                          </span>
                          {getNextStatus(order.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, getNextStatus(order.status)!)
                              }}
                              className="text-xs h-6 px-2"
                            >
                              Next
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Order #{selectedOrder.code}</CardTitle>
                <CardDescription>
                  {selectedOrder.table ? `Table ${selectedOrder.table.label}` : 'Pickup'} • 
                  {formatTime(selectedOrder.createdAt)}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item) => (
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
                                  <span> (+{formatPrice(modifier.priceDeltaCents)})</span>
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
                          {formatPrice(item.unitPriceCents * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-medium mb-2">Order Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.totalCents)}</span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex space-x-2 pt-4">
                {getNextStatus(selectedOrder.status) && (
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)
                      setSelectedOrder(null)
                    }}
                    className="flex-1"
                  >
                    Mark as {getNextStatus(selectedOrder.status)}
                  </Button>
                )}
                
                {selectedOrder.status !== 'CANCELED' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'CANCELED')
                      setSelectedOrder(null)
                    }}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
