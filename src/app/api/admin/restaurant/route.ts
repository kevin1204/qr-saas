import { NextRequest, NextResponse } from 'next/server';
import { requireRestaurant } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateRestaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  address: z.string().optional(),
  taxRateBps: z.number().min(0).max(10000),
  defaultTipBps: z.number().min(0).max(10000),
});

export async function GET() {
  try {
    const restaurant = await requireRestaurant();
    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const restaurant = await requireRestaurant();
    const body = await request.json();
    const validatedData = updateRestaurantSchema.parse(body);

    const updatedRestaurant = await db.restaurant.update({
      where: { id: restaurant.id },
      data: validatedData,
    });

    return NextResponse.json({ restaurant: updatedRestaurant });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    );
  }
}
