import { NextRequest, NextResponse } from 'next/server';
import { requireRestaurant } from '@/lib/auth';
import { createConnectedAccount, createAccountLink } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const restaurant = await requireRestaurant();
    
    if (restaurant.stripeAccountId) {
      return NextResponse.json(
        { error: 'Stripe account already connected' },
        { status: 400 }
      );
    }

    // Get user email from Clerk (you might need to fetch this from Clerk API)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'restaurant@example.com'; // Fallback

    // Create Stripe Connect account
    const account = await createConnectedAccount(restaurant.name, email);

    // Update restaurant with Stripe account ID
    await db.restaurant.update({
      where: { id: restaurant.id },
      data: { stripeAccountId: account.id },
    });

    // Create account link for onboarding
    const accountLink = await createAccountLink(
      account.id,
      process.env.STRIPE_CONNECT_RETURN_URL!,
      process.env.STRIPE_CONNECT_REFRESH_URL!
    );

    return NextResponse.json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}
