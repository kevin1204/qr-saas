'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Star } from 'lucide-react'
import Image from 'next/image'

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
  modifiers: Modifier[]
  categoryName: string
}

interface MenuGridProps {
  restaurantId: string
  onAddToCart: (item: MenuItem) => void
}

export function MenuGrid({ restaurantId, onAddToCart }: MenuGridProps) {
  const [categories, setCategories] = useState<Array<{
    id: string
    name: string
    menuItems: MenuItem[]
  }>>([])
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

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((j) => (
                <div key={j} className="h-32 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Menu Coming Soon</h3>
        <p className="text-gray-600">This restaurant is still setting up their menu.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            <Badge variant="outline">{category.menuItems.length} items</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.menuItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  {item.imageUrl ? (
                    <div className="aspect-video relative">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="secondary">Unavailable</Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-semibold text-green-600">
                          ${(item.priceCents / 100).toFixed(2)}
                        </span>
                        {item.modifiers.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Customizable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {item.description && (
                    <CardDescription className="text-sm text-gray-600 mb-4">
                      {item.description}
                    </CardDescription>
                  )}
                  
                  {item.modifiers.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Options available:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.modifiers.slice(0, 3).map((modifier) => (
                          <Badge key={modifier.id} variant="outline" className="text-xs">
                            {modifier.name}
                            {modifier.priceDeltaCents > 0 && (
                              <span className="ml-1">
                                +${(modifier.priceDeltaCents / 100).toFixed(2)}
                              </span>
                            )}
                          </Badge>
                        ))}
                        {item.modifiers.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.modifiers.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => onAddToCart(item)}
                    disabled={!item.isAvailable}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {item.isAvailable ? 'Add to Order' : 'Unavailable'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}