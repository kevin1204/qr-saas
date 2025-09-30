# QR Orders - Real-time Features & Supabase Integration

## Overview

The QR Orders application uses Supabase Realtime to provide live updates across all clients. This enables real-time order tracking, live menu updates, and instant notifications for restaurant staff and customers.

## Supabase Configuration

### Environment Setup

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Client Setup

**File**: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// Client for browser usage
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

## Real-time Features

### Order Status Updates

Real-time order status updates allow customers to track their orders and staff to manage orders live.

#### Customer Order Tracking

**Component**: `src/components/OrderTracker.tsx`

```typescript
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

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Order status display */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order {order.code}</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live updates' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Status steps */}
      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const isActive = index <= getStatusIndex(order.status)
          const isCompleted = index < getStatusIndex(order.status)
          
          return (
            <div key={step.key} className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500 text-white' : 
                isActive ? 'bg-blue-500 text-white' : 
                'bg-gray-200 text-gray-600'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </p>
                {isActive && order.status === step.key && (
                  <p className="text-sm text-gray-600">
                    {formatTime(order.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

#### Staff Order Management

**Component**: `src/components/Kanban.tsx`

```typescript
export function Kanban({ restaurantId }: KanbanProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isConnected, setIsConnected] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live updates' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-5 gap-4">
        {columns.map((column) => (
          <div key={column.key} className="space-y-4">
            <div className={`p-3 rounded-lg ${column.color}`}>
              <h3 className="font-semibold">{column.label}</h3>
            </div>
            <div className="space-y-2">
              {orders
                .filter(order => order.status === column.key)
                .map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={updateOrderStatus}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Menu Availability Updates

Real-time menu availability updates allow staff to toggle item availability and customers to see live menu status.

#### Menu Management Component

```typescript
export function MenuManagement({ restaurantId }: MenuManagementProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    fetchMenu()

    // Subscribe to menu item updates
    const channel = supabase
      .channel(`menu-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'menu_items',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('Menu item update received:', payload)
          setCategories(prev => 
            prev.map(category => ({
              ...category,
              menuItems: category.menuItems.map(item =>
                item.id === payload.new.id ? { ...item, isAvailable: payload.new.is_available } : item
              )
            }))
          )
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const response = await fetch('/api/menu/items/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isAvailable }),
      })

      if (response.ok) {
        // Optimistic update
        setCategories(prev => 
          prev.map(category => ({
            ...category,
            menuItems: category.menuItems.map(item =>
              item.id === itemId ? { ...item, isAvailable } : item
            )
          }))
        )
      }
    } catch (error) {
      console.error('Failed to toggle item availability:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live updates' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Menu categories and items */}
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle>{category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{formatPrice(item.priceCents)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleItemAvailability(item.id, !item.isAvailable)}
                    >
                      {item.isAvailable ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

## Database Triggers

### Order Status Updates

Set up database triggers to automatically broadcast order updates:

```sql
-- Create function to broadcast order updates
CREATE OR REPLACE FUNCTION broadcast_order_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the orders table in Supabase for realtime
  UPDATE orders 
  SET 
    status = NEW.status,
    updated_at = NEW.updated_at,
    total_cents = NEW.total_cents
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER order_update_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_order_update();
```

### Menu Item Updates

```sql
-- Create function to broadcast menu item updates
CREATE OR REPLACE FUNCTION broadcast_menu_item_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the menu_items table in Supabase for realtime
  UPDATE menu_items 
  SET 
    is_available = NEW.is_available,
    updated_at = NEW.updated_at
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER menu_item_update_trigger
  AFTER UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_menu_item_update();
```

## API Integration

### Order Status Updates

**API Route**: `/api/orders/status`

```typescript
export async function PATCH(request: NextRequest) {
  try {
    const staffUser = await requireStaffUser()
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      )
    }

    // Verify the order belongs to the staff user's restaurant
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        restaurantId: staffUser.restaurantId
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        restaurant: true,
        table: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    })

    // Broadcast realtime update
    await supabase
      .from('orders')
      .upsert({
        id: updatedOrder.id,
        restaurant_id: updatedOrder.restaurantId,
        table_id: updatedOrder.tableId,
        code: updatedOrder.code,
        status: updatedOrder.status,
        total_cents: updatedOrder.totalCents,
        created_at: updatedOrder.createdAt.toISOString(),
        updated_at: updatedOrder.updatedAt.toISOString()
      })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Failed to update order status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Menu Item Availability

**API Route**: `/api/menu/items/availability`

```typescript
export async function PATCH(request: NextRequest) {
  try {
    const staffUser = await requireStaffUser()
    const { itemId, isAvailable } = await request.json()

    if (!itemId || typeof isAvailable !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing itemId or isAvailable' },
        { status: 400 }
      )
    }

    // Verify the menu item belongs to the staff user's restaurant
    const menuItem = await db.menuItem.findFirst({
      where: {
        id: itemId,
        restaurantId: staffUser.restaurantId
      }
    })

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the menu item availability
    const updatedItem = await db.menuItem.update({
      where: { id: itemId },
      data: { isAvailable },
    })

    // Broadcast realtime update
    await supabase
      .from('menu_items')
      .upsert({
        id: updatedItem.id,
        restaurant_id: updatedItem.restaurantId,
        category_id: updatedItem.categoryId,
        name: updatedItem.name,
        price_cents: updatedItem.priceCents,
        description: updatedItem.description,
        image_url: updatedItem.imageUrl,
        is_available: updatedItem.isAvailable,
        sort_order: updatedItem.sortOrder,
        created_at: updatedItem.createdAt.toISOString(),
        updated_at: updatedItem.updatedAt.toISOString()
      })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Failed to update menu item availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Connection Management

### Connection Status

```typescript
// Hook for connection status
export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('connection-status')
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setConnectionError(null)
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          setConnectionError('Connection failed')
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false)
          setConnectionError('Connection timed out')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { isConnected, connectionError }
}
```

### Reconnection Logic

```typescript
// Auto-reconnection hook
export function useRealtimeSubscription(
  table: string,
  filter: string,
  callback: (payload: any) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5

  useEffect(() => {
    let channel: any
    let retryTimeout: NodeJS.Timeout

    const subscribe = () => {
      channel = supabase
        .channel(`${table}-${filter}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter,
          },
          callback
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            setRetryCount(0)
          } else if (status === 'CHANNEL_ERROR' && retryCount < maxRetries) {
            setIsConnected(false)
            retryTimeout = setTimeout(() => {
              setRetryCount(prev => prev + 1)
              subscribe()
            }, 1000 * Math.pow(2, retryCount)) // Exponential backoff
          }
        })
    }

    subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [table, filter, callback, retryCount])

  return { isConnected, retryCount }
}
```

## Performance Optimization

### Selective Subscriptions

```typescript
// Only subscribe to relevant data
export function useOrderSubscription(restaurantId: string, orderId?: string) {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    let channel: any

    if (orderId) {
      // Subscribe to specific order
      channel = supabase
        .channel(`order-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            setOrders(prev => 
              prev.map(order => 
                order.id === payload.new.id ? { ...order, ...payload.new } : order
              )
            )
          }
        )
        .subscribe()
    } else {
      // Subscribe to all orders for restaurant
      channel = supabase
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
            if (payload.eventType === 'INSERT') {
              setOrders(prev => [...prev, payload.new])
            } else if (payload.eventType === 'UPDATE') {
              setOrders(prev => 
                prev.map(order => 
                  order.id === payload.new.id ? { ...order, ...payload.new } : order
                )
              )
            }
          }
        )
        .subscribe()
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [restaurantId, orderId])

  return orders
}
```

### Batch Updates

```typescript
// Batch multiple updates to reduce re-renders
export function useBatchedUpdates<T>(
  initialData: T[],
  updateFn: (data: T[], update: any) => T[]
) {
  const [data, setData] = useState(initialData)
  const [pendingUpdates, setPendingUpdates] = useState<any[]>([])

  useEffect(() => {
    if (pendingUpdates.length === 0) return

    const timeout = setTimeout(() => {
      let updatedData = data
      pendingUpdates.forEach(update => {
        updatedData = updateFn(updatedData, update)
      })
      setData(updatedData)
      setPendingUpdates([])
    }, 100) // Batch updates every 100ms

    return () => clearTimeout(timeout)
  }, [pendingUpdates, data, updateFn])

  const addUpdate = (update: any) => {
    setPendingUpdates(prev => [...prev, update])
  }

  return { data, addUpdate }
}
```

## Error Handling

### Connection Error Handling

```typescript
// Error handling for realtime connections
export function useRealtimeWithErrorHandling(
  table: string,
  filter: string,
  callback: (payload: any) => void
) {
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-${filter}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          try {
            callback(payload)
            setError(null)
          } catch (err) {
            console.error('Error processing realtime update:', err)
            setError('Failed to process update')
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setError(null)
        } else if (err) {
          console.error('Realtime connection error:', err)
          setError('Connection failed')
          setIsConnected(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, callback])

  return { isConnected, error }
}
```

### Fallback Mechanisms

```typescript
// Fallback to polling when realtime fails
export function useOrderUpdatesWithFallback(restaurantId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isRealtime, setIsRealtime] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Try realtime first
  const { isConnected, error } = useRealtimeWithErrorHandling(
    'orders',
    `restaurant_id=eq.${restaurantId}`,
    (payload) => {
      setOrders(prev => updateOrders(prev, payload))
      setLastUpdate(new Date())
    }
  )

  // Fallback to polling if realtime fails
  useEffect(() => {
    if (!isConnected && error) {
      setIsRealtime(false)
      
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/orders?restaurantId=${restaurantId}`)
          if (response.ok) {
            const data = await response.json()
            setOrders(data)
            setLastUpdate(new Date())
          }
        } catch (err) {
          console.error('Polling failed:', err)
        }
      }, 5000) // Poll every 5 seconds

      return () => clearInterval(interval)
    }
  }, [isConnected, error, restaurantId])

  return { orders, isRealtime, lastUpdate }
}
```

## Testing

### Unit Tests

```typescript
// Test realtime subscriptions
describe('Realtime Features', () => {
  it('should subscribe to order updates', async () => {
    const mockCallback = jest.fn()
    
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: 'id=eq.test-order-id',
      }, mockCallback)
      .subscribe()

    // Simulate update
    await supabase
      .from('orders')
      .update({ status: 'PAID' })
      .eq('id', 'test-order-id')

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        new: expect.objectContaining({
          status: 'PAID'
        })
      })
    )

    supabase.removeChannel(channel)
  })
})
```

### Integration Tests

```typescript
// Test complete realtime flow
describe('Order Realtime Flow', () => {
  it('should update order status in real-time', async () => {
    // Create order
    const order = await createTestOrder()
    
    // Subscribe to updates
    const updates: any[] = []
    const channel = supabase
      .channel('test-order')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${order.id}`,
      }, (payload) => updates.push(payload))
      .subscribe()

    // Update order status
    await updateOrderStatus(order.id, 'PAID')
    
    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    expect(updates).toHaveLength(1)
    expect(updates[0].new.status).toBe('PAID')

    supabase.removeChannel(channel)
  })
})
```

## Monitoring

### Connection Monitoring

```typescript
// Monitor realtime connections
export function useConnectionMonitoring() {
  const [metrics, setMetrics] = useState({
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    lastError: null as string | null,
  })

  useEffect(() => {
    const channel = supabase
      .channel('monitoring')
      .subscribe((status, err) => {
        setMetrics(prev => ({
          ...prev,
          totalConnections: prev.totalConnections + 1,
          activeConnections: status === 'SUBSCRIBED' ? prev.activeConnections + 1 : prev.activeConnections,
          failedConnections: err ? prev.failedConnections + 1 : prev.failedConnections,
          lastError: err ? err.message : null,
        }))
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return metrics
}
```

### Performance Metrics

```typescript
// Track realtime performance
export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState({
    updateCount: 0,
    averageLatency: 0,
    errorRate: 0,
  })

  const trackUpdate = (startTime: number, success: boolean) => {
    const latency = Date.now() - startTime
    
    setMetrics(prev => ({
      updateCount: prev.updateCount + 1,
      averageLatency: (prev.averageLatency + latency) / 2,
      errorRate: success ? prev.errorRate : prev.errorRate + 1,
    }))
  }

  return { metrics, trackUpdate }
}
```

This real-time features documentation provides comprehensive guidance for implementing and maintaining live updates in the QR Orders application using Supabase Realtime.
