import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const tableCode = searchParams.get('tableCode')

    // Get restaurant with basic info
    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        currency: true,
        timezone: true,
        serviceType: true,
        taxRateBps: true,
        defaultTipBps: true,
        chargesEnabled: true,
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    if (!restaurant.chargesEnabled) {
      return NextResponse.json(
        { error: 'Restaurant is not accepting orders' },
        { status: 400 }
      )
    }

    // Get table if tableCode provided
    let table = null
    if (tableCode) {
      table = await db.table.findFirst({
        where: {
          restaurantId: restaurant.id,
          code: tableCode
        },
        select: {
          id: true,
          label: true,
          code: true
        }
      })

      if (!table) {
        return NextResponse.json(
          { error: 'Table not found' },
          { status: 404 }
        )
      }
    }

    // Get menu items with categories
    const categories = await db.menuCategory.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        menuItems: {
          where: { isAvailable: true },
          include: {
            modifiers: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // Flatten menu items for easier consumption
    const menuItems = categories.flatMap(category => 
      category.menuItems.map(item => ({
        ...item,
        categoryName: category.name
      }))
    )

    return NextResponse.json({
      restaurant,
      table,
      menuItems,
      categories
    })
  } catch (error) {
    console.error('Error fetching restaurant data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant data' },
      { status: 500 }
    )
  }
}
