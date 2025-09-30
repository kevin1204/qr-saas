import { NextRequest, NextResponse } from 'next/server';
import { requireRestaurant } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const restaurant = await requireRestaurant();
    
    if (!restaurant.billingSubscriptionId) {
      return NextResponse.json({ subscription: null });
    }

    const subscription = await stripe.subscriptions.retrieve(restaurant.billingSubscriptionId);
    
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
