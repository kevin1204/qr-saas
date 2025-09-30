import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staffUser = await requireStaffUser()
    const { id } = params

    // Verify table belongs to restaurant
    const table = await db.table.findFirst({
      where: {
        id,
        restaurantId: staffUser.restaurantId
      }
    })

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    // Check if table has orders
    const orderCount = await db.order.count({
      where: { tableId: id }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete table with existing orders' },
        { status: 400 }
      )
    }

    await db.table.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    )
  }
}
