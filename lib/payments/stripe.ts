import Stripe from 'stripe';
import { updateUserSubscription } from '../subscription';
import type { Stripe as StripeTypes } from 'stripe';

// Initialize Stripe with the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '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';
const stripeClient = new Stripe(stripeSecretKey);

export async function createStripeCheckoutSession({
  customerId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: customerEmail,
      client_reference_id: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Plan',
              description: 'Access to all premium features',
            },
            unit_amount: 2046, // $20.46 USD (equivalent to 12,000 XAF)
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return { success: false, error };
  }
}

export async function handleStripeWebhook(payload: string | Buffer, signature: string) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    if (webhookSecret) {
      event = stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
    } else {
      event = JSON.parse(payload as string) as Stripe.Event;
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Create the subscription
        await handleSuccessfulSubscription(session);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        // Handle successful recurring payment
        await handleSuccessfulPayment(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        // Handle failed payment
        await handleFailedPayment(invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        // Handle subscription updates
        await handleSubscriptionUpdate(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // Handle subscription cancellation
        await handleSubscriptionCancellation(subscription);
        break;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return { success: false, error };
  }
}

async function handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
  // Get subscription details
  const subscription = await stripeClient.subscriptions.retrieve(session.subscription as string);
  const customerId = session.client_reference_id || '';

  const startDate = new Date((subscription as any).current_period_start * 1000);
  const endDate = new Date((subscription as any).current_period_end * 1000);

  // Update user subscription in our database
  await updateUserSubscription({
    userId: customerId,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status as any,
    subscriptionPlan: 'premium',
    paymentProvider: 'stripe',
    subscriptionPeriodStart: startDate,
    subscriptionPeriodEnd: endDate,
  });
}

async function handleSuccessfulPayment(invoice: any) {
  // Get the subscription
  const subscription = await stripeClient.subscriptions.retrieve(invoice.subscription as string);
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : '';

  // Update the subscription period in our database
  const startDate = new Date((subscription as any).current_period_start * 1000);
  const endDate = new Date((subscription as any).current_period_end * 1000);

  await updateUserSubscription({
    userId: customerId,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status as any,
    subscriptionPlan: 'premium',
    paymentProvider: 'stripe',
    subscriptionPeriodStart: startDate,
    subscriptionPeriodEnd: endDate,
  });
}

async function handleFailedPayment(invoice: any) {
  const subscriptionId = invoice.subscription as string;
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : '';

  // Update subscription status
  await updateUserSubscription({
    userId: customerId,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status as any,
    subscriptionPlan: 'premium',
    paymentProvider: 'stripe',
    subscriptionPeriodStart: new Date((subscription as any).current_period_start * 1000),
    subscriptionPeriodEnd: new Date((subscription as any).current_period_end * 1000),
  });
}

async function handleSubscriptionUpdate(subscription: StripeTypes.Subscription) {
  // Handle subscription update events
  const customerId = subscription.customer as string;
  
  await updateUserSubscription({
    userId: customerId,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status as any,
    subscriptionPlan: 'premium',
    paymentProvider: 'stripe',
    subscriptionPeriodStart: new Date((subscription as any).current_period_start * 1000),
    subscriptionPeriodEnd: new Date((subscription as any).current_period_end * 1000),
  });
}

async function handleSubscriptionCancellation(subscription: StripeTypes.Subscription) {
  const customerId = subscription.customer as string;

  // Update subscription status
  await updateUserSubscription({
    userId: customerId,
    subscriptionId: subscription.id,
    subscriptionStatus: 'canceled',
    subscriptionPlan: 'premium', // Will remain premium until period ends
    paymentProvider: 'stripe',
    subscriptionPeriodStart: new Date((subscription as any).current_period_start * 1000),
    subscriptionPeriodEnd: new Date((subscription as any).current_period_end * 1000),
  });
}
