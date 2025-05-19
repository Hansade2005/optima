import Stripe from 'stripe';
import { env } from '@/lib/env';

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

export async function createCheckoutSession({
  customerId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  customerId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const stripe = getStripeClient();
    
    if (!env.STRIPE_PREMIUM_PRICE_ID) {
      throw new Error('Missing STRIPE_PREMIUM_PRICE_ID environment variable');
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: !customerId ? customerEmail : undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price: env.STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan: 'premium',
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const stripe = getStripeClient();
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

export type StripeWebhookEvent = {
  type: string;
  data: {
    object: any;
  };
};

export async function handleStripeWebhook(
  payload: any,
  signature: string
): Promise<StripeWebhookEvent | null> {
  const stripe = getStripeClient();

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    return event as StripeWebhookEvent;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}