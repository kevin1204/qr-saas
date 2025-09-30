'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Menu, 
  Settings, 
  BarChart3, 
  Users, 
  ShoppingCart,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react'

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [restaurant, setRestaurant] = useState({
    name: 'My Restaurant',
    slug: 'my-restaurant',
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567',
    email: 'contact@myrestaurant.com',
    plan: 'professional',
    tableCount: 8,
    menuItemCount: 24,
    totalOrders: 156,
    todayOrders: 12
  })

  const [tables, setTables] = useState([
    { id: '1', name: 'Table 1', code: 'T1', qrGenerated: true },
    { id: '2', name: 'Table 2', code: 'T2', qrGenerated: true },
    { id: '3', name: 'Table 3', code: 'T3', qrGenerated: false },
    { id: '4', name: 'Table 4', code: 'T4', qrGenerated: false },
    { id: '5', name: 'Table 5', code: 'T5', qrGenerated: false },
    { id: '6', name: 'Table 6', code: 'T6', qrGenerated: false },
    { id: '7', name: 'Table 7', code: 'T7', qrGenerated: false },
    { id: '8', name: 'Table 8', code: 'T8', qrGenerated: false },
  ])

  const [menuItems, setMenuItems] = useState([
    { id: '1', name: 'Margherita Pizza', category: 'Pizza', price: 18.99, available: true },
    { id: '2', name: 'Caesar Salad', category: 'Salads', price: 12.99, available: true },
    { id: '3', name: 'Chicken Wings', category: 'Appetizers', price: 14.99, available: false },
    { id: '4', name: 'Pasta Carbonara', category: 'Pasta', price: 16.99, available: true },
  ])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'menu', name: 'Menu', icon: Menu },
    { id: 'tables', name: 'Tables', icon: QrCode },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  const generateQRCode = (tableCode: string) => {
    // In a real app, this would generate and download a QR code
    console.log(`Generating QR code for table ${tableCode}`)
    alert(`QR code generated for ${tableCode}!`)
  }

  const downloadAllQRCodes = () => {
    // In a real app, this would download all QR codes as a ZIP file
    console.log('Downloading all QR codes')
    alert('All QR codes downloaded!')
  }

  const toggleMenuItemAvailability = (itemId: string) => {
    setMenuItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, available: !item.available }
          : item
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
              <p className="text-sm text-gray-600">Restaurant Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {restaurant.plan} Plan
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.name}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ShoppingCart className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{restaurant.todayOrders}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Menu className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Menu Items</p>
                          <p className="text-2xl font-bold text-gray-900">{restaurant.menuItemCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <QrCode className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Tables</p>
                          <p className="text-2xl font-bold text-gray-900">{restaurant.tableCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <BarChart3 className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{restaurant.totalOrders}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>Latest customer orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { id: '1', table: 'Table 2', items: 3, total: 45.97, status: 'preparing' },
                          { id: '2', table: 'Table 1', items: 2, total: 32.98, status: 'ready' },
                          { id: '3', table: 'Table 5', items: 1, total: 18.99, status: 'completed' },
                        ].map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{order.table}</p>
                              <p className="text-sm text-gray-600">{order.items} items • ${order.total}</p>
                            </div>
                            <Badge variant={order.status === 'ready' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Menu Item
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR Codes
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Restaurant Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {menuItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              <Badge variant="outline">{item.category}</Badge>
                              <Badge variant={item.available ? 'default' : 'secondary'}>
                                {item.available ? 'Available' : 'Unavailable'}
                              </Badge>
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mt-1">${item.price}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleMenuItemAvailability(item.id)}
                            >
                              {item.available ? 'Hide' : 'Show'}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tables Tab */}
            {activeTab === 'tables' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
                  <Button onClick={downloadAllQRCodes}>
                    <Download className="w-4 h-4 mr-2" />
                    Download All QR Codes
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tables.map((table) => (
                        <div key={table.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-900">{table.name}</h3>
                            <Badge variant={table.qrGenerated ? 'default' : 'secondary'}>
                              {table.qrGenerated ? 'QR Generated' : 'No QR Code'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Code: {table.code}</p>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateQRCode(table.code)}
                            >
                              <QrCode className="w-4 h-4 mr-1" />
                              Generate QR
                            </Button>
                            {table.qrGenerated && (
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Orders will appear here when customers start placing them.
                      </p>
                      <Button variant="outline">
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR Codes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Restaurant Settings</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Restaurant Information</CardTitle>
                    <CardDescription>Update your restaurant details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Restaurant Name
                        </label>
                        <input
                          type="text"
                          value={restaurant.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={restaurant.phone}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={restaurant.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={restaurant.address}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
