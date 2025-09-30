import { NextRequest, NextResponse } from 'next/server';
import { requireRestaurant } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const tablesSchema = z.object({
  tableLabels: z.array(z.string().min(1, 'Table label is required')),
});

export async function POST(request: NextRequest) {
  try {
    const restaurant = await requireRestaurant();
    const body = await request.json();
    const { tableLabels } = tablesSchema.parse(body);

    // Check if tables already exist
    const existingTables = await db.table.findMany({
      where: { restaurantId: restaurant.id },
    });

    if (existingTables.length > 0) {
      return NextResponse.json(
        { error: 'Tables already exist for this restaurant' },
        { status: 400 }
      );
    }

    // Create tables
    const tables = await Promise.all(
      tableLabels.map((label, index) =>
        db.table.create({
          data: {
            restaurantId: restaurant.id,
            label,
            code: label, // Use label as code for simplicity
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      tables,
    });
  } catch (error) {
    console.error('Error creating tables:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create tables' },
      { status: 500 }
    );
  }
}
