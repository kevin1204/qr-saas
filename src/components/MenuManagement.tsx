'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react'

interface Modifier {
  id: string
  name: string
  type: 'SINGLE' | 'MULTI'
  priceDeltaCents: number
  isRequired: boolean
}

interface MenuItem {
  id: string
  name: string
  priceCents: number
  description: string | null
  imageUrl: string | null
  isAvailable: boolean
  sortOrder: number
  modifiers: Modifier[]
}

interface MenuCategory {
  id: string
  name: string
  sortOrder: number
  menuItems: MenuItem[]
}

interface MenuManagementProps {
  restaurantId: string
}

export function MenuManagement({ restaurantId }: MenuManagementProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenu()
  }, [restaurantId])

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/menu?restaurantId=${restaurantId}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const response = await fetch('/api/menu/items/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, isAvailable }),
      })

      if (response.ok) {
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{category.name}</span>
              <Badge variant="outline">
                {category.menuItems.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{item.name}</h3>
                      <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                      {item.modifiers.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {item.modifiers.length} modifiers
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="font-medium">{formatPrice(item.priceCents)}</span>
                      {item.modifiers.length > 0 && (
                        <span>{item.modifiers.length} customization options</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleItemAvailability(item.id, !item.isAvailable)}
                    >
                      {item.isAvailable ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {category.menuItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No items in this category</p>
                  <Button className="mt-2" size="sm">
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu categories</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first category and menu items.</p>
            <Button>Create Category</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
