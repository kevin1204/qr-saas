import { redirect } from 'next/navigation'
import { getCurrentUser, requireSuperadmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, CreditCard, QrCode, Plus, Eye, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function SuperadminDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  if (!user.isSuperadmin) {
    redirect('/dashboard')
  }

  // Get all restaurants with their stats
  const restaurants = await db.restaurant.findMany({
    include: {
      staffUsers: true,
      orders: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      },
      _count: {
        select: {
          orders: true,
          staffUsers: true,
          tables: true,
          menuItems: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate total stats
  const totalRestaurants = restaurants.length
  const totalOrders = restaurants.reduce((sum, r) => sum + r._count.orders, 0)
  const totalStaff = restaurants.reduce((sum, r) => sum + r._count.staffUsers, 0)
  const activeRestaurants = restaurants.filter(r => r.chargesEnabled).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Superadmin Dashboard</h1>
          <p className="text-gray-600">Manage all restaurants and monitor platform activity</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRestaurants}</div>
              <p className="text-xs text-muted-foreground">
                {activeRestaurants} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStaff}</div>
              <p className="text-xs text-muted-foreground">
                Across all restaurants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Restaurants</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRestaurants}</div>
              <p className="text-xs text-muted-foreground">
                With payments enabled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/superadmin/invite">
                <Plus className="w-4 h-4 mr-2" />
                Invite Restaurant
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/superadmin/settings">
                <Settings className="w-4 h-4 mr-2" />
                Platform Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Restaurants List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Restaurants</h2>
          
          {restaurants.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants yet</h3>
                <p className="text-gray-600 mb-4">Start by inviting your first restaurant to the platform.</p>
                <Button asChild>
                  <Link href="/superadmin/invite">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Restaurant
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                        <CardDescription>
                          {restaurant.address} • {restaurant.currency}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={restaurant.chargesEnabled ? 'default' : 'secondary'}>
                          {restaurant.chargesEnabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {restaurant._count.staffUsers} staff
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{restaurant._count.orders}</div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{restaurant._count.tables}</div>
                        <div className="text-sm text-gray-600">Tables</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{restaurant._count.menuItems}</div>
                        <div className="text-sm text-gray-600">Menu Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{restaurant.orders.length}</div>
                        <div className="text-sm text-gray-600">Recent Orders</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/superadmin/restaurants/${restaurant.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/r/${restaurant.slug}/t/T1`} target="_blank">
                          <QrCode className="w-4 h-4 mr-2" />
                          View Ordering
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/superadmin/restaurants/${restaurant.id}/settings`}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
