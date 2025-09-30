import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { StaffRole } from '@prisma/client';
import { z } from 'zod';

const businessSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  address: z.string().optional(),
  currency: z.string().min(3).max(3),
  timezone: z.string(),
  serviceType: z.enum(['TABLE', 'PICKUP']),
  taxRateBps: z.number().min(0).max(10000),
  defaultTipBps: z.number().min(0).max(10000),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = businessSchema.parse(body);

    // Check if slug is already taken
    const existingRestaurant = await db.restaurant.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'This URL slug is already taken. Please choose a different one.' },
        { status: 400 }
      );
    }

    // Check if user already has a restaurant
    const existingStaffUser = await db.staffUser.findUnique({
      where: { clerkUserId: userId },
    });

    if (existingStaffUser) {
      return NextResponse.json(
        { error: 'You already have a restaurant. Redirecting to dashboard...' },
        { status: 400 }
      );
    }

    // Create restaurant and staff user
    const result = await db.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          address: validatedData.address,
          currency: validatedData.currency,
          timezone: validatedData.timezone,
          serviceType: validatedData.serviceType,
          taxRateBps: validatedData.taxRateBps,
          defaultTipBps: validatedData.defaultTipBps,
        },
      });

      const staffUser = await tx.staffUser.create({
        data: {
          restaurantId: restaurant.id,
          clerkUserId: userId,
          role: StaffRole.OWNER,
        },
      });

      return { restaurant, staffUser };
    });

    return NextResponse.json({
      success: true,
      restaurant: result.restaurant,
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}
