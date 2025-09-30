import { NextRequest, NextResponse } from 'next/server';
import { requireRestaurant } from '@/lib/auth';
import { createBillingPortalSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const restaurant = await requireRestaurant();
    
    if (!restaurant.billingCustomerId) {
      return NextResponse.json(
        { error: 'No billing customer found' },
        { status: 400 }
      );
    }

    const portalSession = await createBillingPortalSession(
      restaurant.billingCustomerId,
      process.env.STRIPE_BILLING_PORTAL_RETURN_URL!
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
