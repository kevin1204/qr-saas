import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { MenuGrid } from '@/components/MenuGrid'
import { CartBar } from '@/components/CartBar'

interface PageProps {
  params: {
    slug: string
    tableCode: string
  }
}

async function getRestaurantAndTable(slug: string, tableCode: string) {
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    include: {
      menuCategories: {
        include: {
          menuItems: {
            where: { isAvailable: true },
            include: { modifiers: true },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  if (!restaurant) {
    return null
  }

  const table = await db.table.findFirst({
    where: {
      restaurantId: restaurant.id,
      code: tableCode
    }
  })

  if (!table) {
    return null
  }

  return { restaurant, table }
}

export default async function MenuPage({ params }: PageProps) {
  const { slug, tableCode } = await params
  const data = await getRestaurantAndTable(slug, tableCode)

  if (!data) {
    notFound()
  }

  const { restaurant, table } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{restaurant.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Table {table.label}</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Live Menu</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 hidden sm:inline">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content with Better Mobile Spacing */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <MenuGrid 
          categories={restaurant.menuCategories}
          restaurantSlug={restaurant.slug}
          tableCode={table.code}
        />
      </div>

      {/* Enhanced Mobile Cart */}
      <CartBar 
        restaurantSlug={restaurant.slug}
        tableCode={table.code}
        currency={restaurant.currency}
      />
    </div>
  )
}
