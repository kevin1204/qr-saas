import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createTableSchema = z.object({
  label: z.string().min(1, 'Table label is required'),
})

export async function GET(request: NextRequest) {
  try {
    const staffUser = await requireStaffUser()
    
    const tables = await db.table.findMany({
      where: { restaurantId: staffUser.restaurantId },
      orderBy: { label: 'asc' }
    })

    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const staffUser = await requireStaffUser()
    const body = await request.json()
    const { label } = createTableSchema.parse(body)

    // Generate table code from label
    const code = label.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // Check if code already exists
    const existingTable = await db.table.findFirst({
      where: {
        restaurantId: staffUser.restaurantId,
        code
      }
    })

    if (existingTable) {
      return NextResponse.json(
        { error: 'A table with this code already exists' },
        { status: 400 }
      )
    }

    const table = await db.table.create({
      data: {
        restaurantId: staffUser.restaurantId,
        label,
        code
      }
    })

    return NextResponse.json(table)
  } catch (error) {
    console.error('Error creating table:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    )
  }
}