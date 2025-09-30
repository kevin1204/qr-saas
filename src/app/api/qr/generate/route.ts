import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth'
import { db } from '@/lib/db'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const staffUser = await requireStaffUser()
    const { tableId } = await request.json()

    if (!tableId) {
      return NextResponse.json(
        { error: 'Table ID is required' },
        { status: 400 }
      )
    }

    // Verify table belongs to restaurant
    const table = await db.table.findFirst({
      where: {
        id: tableId,
        restaurantId: staffUser.restaurantId
      },
      include: {
        restaurant: true
      }
    })

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    // Generate QR code URL
    const baseUrl = process.env.APP_URL || 'http://localhost:3000'
    const qrUrl = `${baseUrl}/r/${table.restaurant.slug}/t/${table.code}`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      success: true,
      qrUrl,
      qrCodeDataUrl,
      table: {
        id: table.id,
        label: table.label,
        code: table.code
      },
      restaurant: {
        name: table.restaurant.name,
        slug: table.restaurant.slug
      }
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
