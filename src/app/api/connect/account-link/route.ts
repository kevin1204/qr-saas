import { NextRequest, NextResponse } from 'next/server';
import { requireRestaurant } from '@/lib/auth';
import { createAccountLink } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const restaurant = await requireRestaurant();
    
    if (!restaurant.stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe account connected' },
        { status: 400 }
      );
    }

    const accountLink = await createAccountLink(
      restaurant.stripeAccountId,
      process.env.STRIPE_CONNECT_RETURN_URL!,
      process.env.STRIPE_CONNECT_REFRESH_URL!
    );

    return NextResponse.json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating account link:', error);
    return NextResponse.json(
      { error: 'Failed to create account link' },
      { status: 500 }
    );
  }
}
