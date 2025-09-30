import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Platform fee configuration
export const PLATFORM_FEE_BPS = parseInt(process.env.PLATFORM_FEE_BPS || '0');
export const PLATFORM_FEE_FIXED_CENTS = parseInt(process.env.PLATFORM_FEE_FIXED_CENTS || '0');

export function calculatePlatformFee(amountCents: number): number {
  const percentageFee = Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);
  return percentageFee + PLATFORM_FEE_FIXED_CENTS;
}

// Stripe Connect utilities
export async function createConnectedAccount(restaurantName: string, email: string) {
  return await stripe.accounts.create({
    type: 'standard',
    country: 'US', // You might want to make this configurable
    email,
    business_profile: {
      name: restaurantName,
    },
  });
}

export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  return await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  });
}

export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    requirements: account.requirements,
  };
}

export async function createLoginLink(accountId: string) {
  return await stripe.accounts.createLoginLink(accountId);
}

// Stripe Billing utilities
export async function createBillingCustomer(email: string, name: string) {
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function createSubscription(customerId: string, priceId: string, trialDays: number = 14) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Checkout utilities for Direct Charges
export async function createCheckoutSession({
  restaurantId,
  stripeAccountId,
  lineItems,
  successUrl,
  cancelUrl,
  customerEmail,
  metadata,
}: {
  restaurantId: string;
  stripeAccountId: string;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata: Record<string, string>;
}) {
  const platformFee = calculatePlatformFee(
    lineItems.reduce((total, item) => total + (item.amount || 0) * (item.quantity || 1), 0)
  );

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    payment_method_types: ['card'],
    automatic_payment_methods: {
      enabled: true,
    },
    ...(customerEmail && { customer_email: customerEmail }),
    ...(platformFee > 0 && { application_fee_amount: platformFee }),
  };

  return await stripe.checkout.sessions.create(sessionParams, {
    stripeAccount: stripeAccountId,
  });
}
