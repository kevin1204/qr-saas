'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Plus, 
  Edit, 
  Trash2, 
  QrCode, 
  Menu, 
  Users, 
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
}

interface Table {
  id: string
  name: string
  qrCode: string
}

interface Order {
  id: string
  tableName: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: 'NEW' | 'PREPARING' | 'READY' | 'DELIVERED'
  createdAt: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'tables' | 'orders'>('overview')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isAddingTable, setIsAddingTable] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course'
  })
  const [newTable, setNewTable] = useState({ name: '' })

  // Load sample data on mount
  useEffect(() => {
    // Sample menu items
    setMenuItems([
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, basil',
        price: 15.99,
        category: 'Main Course',
        available: true
      },
      {
        id: '2',
        name: 'Caesar Salad',
        description: 'Romaine lettuce, parmesan, croutons',
        price: 12.99,
        category: 'Salads',
        available: true
      },
      {
        id: '3',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with ganache',
        price: 8.99,
        category: 'Desserts',
        available: true
      }
    ])

    // Sample tables
    setTables([
      { id: '1', name: 'Table 1', qrCode: 'T1' },
      { id: '2', name: 'Table 2', qrCode: 'T2' },
      { id: '3', name: 'Table 3', qrCode: 'T3' }
    ])

    // Sample orders
    setOrders([
      {
        id: '1',
        tableName: 'Table 1',
        items: [
          { name: 'Margherita Pizza', quantity: 1, price: 15.99 },
          { name: 'Caesar Salad', quantity: 1, price: 12.99 }
        ],
        total: 28.98,
        status: 'NEW',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        tableName: 'Table 2',
        items: [
          { name: 'Chocolate Cake', quantity: 2, price: 8.99 }
        ],
        total: 17.98,
        status: 'PREPARING',
        createdAt: new Date(Date.now() - 300000).toISOString()
      }
    ])
  }, [])

  const addMenuItem = () => {
    if (!newItem.name || !newItem.price) return
    
    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      category: newItem.category,
      available: true
    }
    
    setMenuItems([...menuItems, item])
    setNewItem({ name: '', description: '', price: '', category: 'Main Course' })
    setIsAddingItem(false)
  }

  const addTable = () => {
    if (!newTable.name) return
    
    const table: Table = {
      id: Date.now().toString(),
      name: newTable.name,
      qrCode: `T${tables.length + 1}`
    }
    
    setTables([...tables, table])
    setNewTable({ name: '' })
    setIsAddingTable(false)
  }

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ))
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800'
      case 'PREPARING': return 'bg-yellow-100 text-yellow-800'
      case 'READY': return 'bg-green-100 text-green-800'
      case 'DELIVERED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const activeOrders = orders.filter(order => order.status !== 'DELIVERED').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your QR ordering system</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: CheckCircle },
                { id: 'menu', name: 'Menu', icon: Menu },
                { id: 'tables', name: 'Tables', icon: Users },
                { id: 'orders', name: 'Orders', icon: ShoppingCart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{activeOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Menu className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Menu Items</p>
                      <p className="text-2xl font-bold text-gray-900">{menuItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tables</p>
                      <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.tableName}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${order.total.toFixed(2)}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              <Button onClick={() => setIsAddingItem(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Add Item Form */}
            {isAddingItem && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Menu Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Item name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    />
                    <Input
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={addMenuItem}>Add Item</Button>
                    <Button variant="outline" onClick={() => setIsAddingItem(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant={item.available ? "default" : "secondary"}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <p className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Table Management</h2>
              <Button onClick={() => setIsAddingTable(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Table
              </Button>
            </div>

            {/* Add Table Form */}
            {isAddingTable && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Table</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Table name (e.g., Table 4)"
                    value={newTable.name}
                    onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={addTable}>Add Table</Button>
                    <Button variant="outline" onClick={() => setIsAddingTable(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <Card key={table.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{table.name}</h3>
                      <Badge variant="outline">{table.qrCode}</Badge>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                      <div className="text-center">
                        <QrCode className="w-16 h-16 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600 mt-2">QR Code: {table.qrCode}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order Management</h2>
            
            {/* Order Status Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { status: 'NEW', title: 'New Orders', color: 'bg-blue-50 border-blue-200' },
                { status: 'PREPARING', title: 'Preparing', color: 'bg-yellow-50 border-yellow-200' },
                { status: 'READY', title: 'Ready', color: 'bg-green-50 border-green-200' },
                { status: 'DELIVERED', title: 'Delivered', color: 'bg-gray-50 border-gray-200' }
              ].map((column) => (
                <Card key={column.status} className={column.color}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{column.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {orders.filter(order => order.status === column.status).length} orders
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {orders
                      .filter(order => order.status === column.status)
                      .map((order) => (
                        <div key={order.id} className="p-3 bg-white rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-sm">{order.tableName}</p>
                            <p className="text-sm font-bold">${order.total.toFixed(2)}</p>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                          </p>
                          <div className="flex space-x-1">
                            {column.status !== 'DELIVERED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => {
                                  const statuses = ['NEW', 'PREPARING', 'READY', 'DELIVERED']
                                  const currentIndex = statuses.indexOf(order.status)
                                  if (currentIndex < statuses.length - 1) {
                                    updateOrderStatus(order.id, statuses[currentIndex + 1] as Order['status'])
                                  }
                                }}
                              >
                                Next
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
