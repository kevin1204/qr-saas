import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const staffUser = await requireStaffUser()
    
    const restaurant = await db.restaurant.findUnique({
      where: { id: staffUser.restaurantId },
      include: {
        _count: {
          select: {
            orders: true,
            staffUsers: true,
            tables: true,
            menuItems: true
          }
        }
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Error fetching restaurant profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant profile' },
      { status: 500 }
    )
  }
}
