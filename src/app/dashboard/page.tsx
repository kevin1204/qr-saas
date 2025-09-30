'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  QrCode, 
  Menu, 
  Users, 
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3,
  Plus
} from 'lucide-react'

interface Order {
  id: string
  code: string
  tableLabel: string | null
  status: 'NEW' | 'PAID' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELED'
  totalCents: number
  createdAt: string
  orderItems: Array<{
    id: string
    qty: number
    unitPriceCents: number
    notes: string | null
    menuItem: {
      name: string
    }
  }>
}

interface Restaurant {
  id: string
  name: string
  slug: string
  address: string | null
  currency: string
  chargesEnabled: boolean
  _count: {
    orders: number
    staffUsers: number
    tables: number
    menuItems: number
  }
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    totalTables: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, restaurantRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/restaurant/profile')
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
        
        // Calculate stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayOrders = ordersData.filter((order: Order) => 
          new Date(order.createdAt) >= today
        )
        
        const todayRevenue = todayOrders.reduce((sum: number, order: Order) => 
          sum + order.totalCents, 0
        )
        
        const activeOrders = ordersData.filter((order: Order) => 
          ['NEW', 'PAID', 'IN_PROGRESS', 'READY'].includes(order.status)
        ).length

        setStats({
          todayOrders: todayOrders.length,
          todayRevenue,
          activeOrders,
          totalTables: restaurant?.tables || 0
        })
      }

      if (restaurantRes.ok) {
        const restaurantData = await restaurantRes.json()
        setRestaurant(restaurantData)
        setStats(prev => ({ ...prev, totalTables: restaurantData.tables || 0 }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <AlertCircle className="w-4 h-4" />
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />
      case 'READY':
        return <CheckCircle className="w-4 h-4" />
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />
      case 'CANCELED':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening at {restaurant?.name || 'your restaurant'}.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
              <p className="text-xs text-muted-foreground">
                Orders placed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats.todayRevenue / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tables</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTables}</div>
              <p className="text-xs text-muted-foreground">
                Total tables
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20">
              <Link href="/admin/qr">
                <div className="text-center">
                  <QrCode className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Manage QR Codes</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20">
              <Link href="/admin/menu">
                <div className="text-center">
                  <Menu className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Manage Menu</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20">
              <Link href="/admin/settings">
                <div className="text-center">
                  <Settings className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Restaurant Settings</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20">
              <Link href="/admin/billing">
                <div className="text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Billing & Payments</div>
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest orders from customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet</p>
                  <p className="text-sm">Orders will appear here when customers place them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">#{order.code}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.tableLabel ? `Table ${order.tableLabel}` : 'Pickup'} • 
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${(order.totalCents / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restaurant Status</CardTitle>
              <CardDescription>
                Current configuration and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Setup</span>
                  <Badge variant={restaurant?.chargesEnabled ? 'default' : 'secondary'}>
                    {restaurant?.chargesEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Menu Items</span>
                  <span className="text-sm text-gray-600">
                    {restaurant?._count.menuItems || 0} items
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tables</span>
                  <span className="text-sm text-gray-600">
                    {restaurant?._count.tables || 0} tables
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Staff Members</span>
                  <span className="text-sm text-gray-600">
                    {restaurant?._count.staffUsers || 0} members
                  </span>
                </div>
                
                <div className="pt-4 border-t">
                  <Button asChild className="w-full">
                    <Link href="/admin/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Restaurant
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}