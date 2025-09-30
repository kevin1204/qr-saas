import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event);
        break;

      case 'account.updated':
        await handleAccountUpdated(event);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(event: any) {
  const session = event.data.object;
  
  // For Connect events, the account ID is in event.account
  const connectedAccountId = event.account;
  
  if (!connectedAccountId) {
    console.error('No connected account ID in webhook event');
    return;
  }

  // Find order by session ID
  const order = await db.order.findFirst({
    where: { stripeSessionId: session.id },
    include: { restaurant: true },
  });

  if (!order) {
    console.error(`Order not found for session ${session.id}`);
    return;
  }

  // Verify the order belongs to the connected account
  if (order.restaurant.stripeAccountId !== connectedAccountId) {
    console.error(`Order ${order.id} does not belong to connected account ${connectedAccountId}`);
    return;
  }

  // Update order status to PAID
  await db.order.update({
    where: { id: order.id },
    data: { 
      status: 'PAID',
      totalCents: session.amount_total || order.totalCents,
    },
  });

  // Broadcast real-time update via Supabase
  await supabase
    .from('orders')
    .update({ 
      status: 'PAID', 
      updated_at: new Date().toISOString(),
      total_cents: session.amount_total || order.totalCents,
    })
    .eq('id', order.id);

  console.log(`Order ${order.id} marked as PAID for restaurant ${order.restaurantId}`);
}

async function handleSubscriptionChange(event: any) {
  const subscription = event.data.object;
  
  // Find restaurant by billing subscription ID
  const restaurant = await db.restaurant.findFirst({
    where: { billingSubscriptionId: subscription.id },
  });

  if (!restaurant) {
    console.error(`Restaurant not found for subscription ${subscription.id}`);
    return;
  }

  // Update subscription status
  await db.restaurant.update({
    where: { id: restaurant.id },
    data: {
      trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
  });

  console.log(`Subscription ${subscription.id} updated for restaurant ${restaurant.id}`);
}

async function handleAccountUpdated(event: any) {
  const account = event.data.object;
  
  // Find restaurant by Stripe account ID
  const restaurant = await db.restaurant.findFirst({
    where: { stripeAccountId: account.id },
  });

  if (!restaurant) {
    console.error(`Restaurant not found for Stripe account ${account.id}`);
    return;
  }

  // Update account status
  await db.restaurant.update({
    where: { id: restaurant.id },
    data: {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    },
  });

  console.log(`Stripe account ${account.id} updated for restaurant ${restaurant.id}`);
}

async function handleCheckoutSessionExpired(event: any) {
  const session = event.data.object;
  
  // Update order status to CANCELED
  await db.order.updateMany({
    where: { stripeSessionId: session.id },
    data: { status: 'CANCELED' }
  });

  console.log(`Order with session ${session.id} expired`);
}