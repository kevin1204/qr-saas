import Stripe from 'stripe';

// Only initialize Stripe if we have a real secret key (not placeholder)
const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
  !process.env.STRIPE_SECRET_KEY.includes('placeholder') &&
  process.env.STRIPE_SECRET_KEY.startsWith('sk_');

export const stripe = isStripeConfigured 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null;

// Platform fee configuration
export const PLATFORM_FEE_BPS = parseInt(process.env.PLATFORM_FEE_BPS || '0');
export const PLATFORM_FEE_FIXED_CENTS = parseInt(process.env.PLATFORM_FEE_FIXED_CENTS || '0');

export function calculatePlatformFee(amountCents: number): number {
  const percentageFee = Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);
  return percentageFee + PLATFORM_FEE_FIXED_CENTS;
}

// Stripe Connect utilities
export async function createConnectedAccount(restaurantName: string, email: string) {
  if (!stripe) throw new Error('Stripe is not configured');
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
  if (!stripe) throw new Error('Stripe is not configured');
  return await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  });
}

export async function getAccountStatus(accountId: string) {
  if (!stripe) throw new Error('Stripe is not configured');
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    requirements: account.requirements,
  };
}

export async function createLoginLink(accountId: string) {
  if (!stripe) throw new Error('Stripe is not configured');
  return await stripe.accounts.createLoginLink(accountId);
}

// Stripe Billing utilities
export async function createBillingCustomer(email: string, name: string) {
  if (!stripe) throw new Error('Stripe is not configured');
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function createSubscription(customerId: string, priceId: string, trialDays: number = 14) {
  if (!stripe) throw new Error('Stripe is not configured');
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
  if (!stripe) throw new Error('Stripe is not configured');
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
  if (!stripe) throw new Error('Stripe is not configured');
  
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
