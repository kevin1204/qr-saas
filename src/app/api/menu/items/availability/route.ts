import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireStaffUser } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    const staffUser = await requireStaffUser()
    const { itemId, isAvailable } = await request.json()

    if (!itemId || typeof isAvailable !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing itemId or isAvailable' },
        { status: 400 }
      )
    }

    // Verify the menu item belongs to the staff user's restaurant
    const menuItem = await db.menuItem.findFirst({
      where: {
        id: itemId,
        restaurantId: staffUser.restaurantId
      }
    })

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the availability
    const updatedItem = await db.menuItem.update({
      where: { id: itemId },
      data: { isAvailable }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Failed to update item availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
