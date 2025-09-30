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

    const orders = await db.order.findMany({
      where: { restaurantId },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
