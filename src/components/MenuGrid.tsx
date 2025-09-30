'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ItemDrawer } from '@/components/ItemDrawer'
import { Plus } from 'lucide-react'

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
}

interface MenuCategory {
  id: string
  name: string
  menuItems: MenuItem[]
}

interface MenuGridProps {
  categories: MenuCategory[]
  restaurantSlug: string
  tableCode: string
}

export function MenuGrid({ categories, restaurantSlug, tableCode }: MenuGridProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No menu items available</h3>
        <p className="text-gray-500 mt-2">Please check back later.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id} className="scroll-mt-20" id={`category-${category.id}`}>
            {/* Enhanced Category Header */}
            <div className="sticky top-20 z-10 bg-gradient-to-r from-gray-50 to-gray-100 -mx-4 px-4 py-3 mb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                {category.name}
              </h2>
            </div>
            
            {/* Mobile-Optimized Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {category.menuItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="group overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white"
                >
                  {/* Enhanced Image Section */}
                  {item.imageUrl ? (
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <div className="text-4xl text-blue-300">🍽️</div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-gray-900 leading-tight">
                          {item.name}
                        </CardTitle>
                        {item.description && (
                          <CardDescription className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(item.priceCents)}
                        </div>
                        {item.modifiers.length > 0 && (
                          <Badge variant="outline" className="mt-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                            + Options
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-4 pb-4 pt-0">
                    <Button
                      onClick={() => setSelectedItem(item)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 shadow-sm"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <ItemDrawer
          item={selectedItem}
          restaurantSlug={restaurantSlug}
          tableCode={tableCode}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  )
}
