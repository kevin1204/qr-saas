import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true
              }
            }
          }
        },
        table: {
          select: {
            label: true
          }
        },
        restaurant: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
