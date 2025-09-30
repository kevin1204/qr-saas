import { NextRequest, NextResponse } from 'next/server';
import { requireRestaurant } from '@/lib/auth';
import { createBillingCustomer, createSubscription } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const restaurant = await requireRestaurant();
    
    if (restaurant.billingSubscriptionId) {
      return NextResponse.json(
        { error: 'Subscription already exists' },
        { status: 400 }
      );
    }

    // Get user email from Clerk (you might need to fetch this from Clerk API)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'restaurant@example.com'; // Fallback

    // Create billing customer
    const customer = await createBillingCustomer(email, restaurant.name);

    // Create subscription with 14-day trial
    const subscription = await createSubscription(
      customer.id,
      process.env.STRIPE_PRICE_ID_MVP_STANDARD!,
      14 // 14-day trial
    );

    // Update restaurant with billing info
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    await db.restaurant.update({
      where: { id: restaurant.id },
      data: {
        billingCustomerId: customer.id,
        billingSubscriptionId: subscription.id,
        trialEndsAt,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trialEndsAt,
      },
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      { error: 'Failed to start trial' },
      { status: 500 }
    );
  }
}
