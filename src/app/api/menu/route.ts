import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireStaffUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const staffUser = await requireStaffUser()
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId || staffUser.restaurantId !== restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const categories = await db.menuCategory.findMany({
      where: { restaurantId },
      include: {
        menuItems: {
          include: {
            modifiers: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch menu:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
