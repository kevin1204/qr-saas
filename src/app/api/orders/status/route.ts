import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireStaffUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PATCH(request: NextRequest) {
  try {
    const staffUser = await requireStaffUser()
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      )
    }

    // Verify the order belongs to the staff user's restaurant
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        restaurantId: staffUser.restaurantId
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        restaurant: true,
        table: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    })

    // Broadcast realtime update
    await supabase
      .from('orders')
      .upsert({
        id: updatedOrder.id,
        restaurant_id: updatedOrder.restaurantId,
        table_id: updatedOrder.tableId,
        code: updatedOrder.code,
        status: updatedOrder.status,
        total_cents: updatedOrder.totalCents,
        created_at: updatedOrder.createdAt.toISOString(),
        updated_at: updatedOrder.updatedAt.toISOString()
      })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Failed to update order status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
