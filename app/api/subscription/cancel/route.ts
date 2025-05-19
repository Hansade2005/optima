import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';
import { cancelSubscription, getSubscriptionDetails } from '@/lib/subscription';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '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';
const stripe = new Stripe(stripeSecretKey);

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get subscription details
    const subscriptionDetails = await getSubscriptionDetails(session.user.id);
    
    if (!subscriptionDetails.success) {
      return NextResponse.json(
        { error: 'Failed to retrieve subscription details' },
        { status: 500 }
      );
    }
    
    if (!subscriptionDetails.data) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }
    const { subscriptionId, paymentProvider } = subscriptionDetails.data;
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }
    
    // Handle cancellation based on payment provider
    if (paymentProvider === 'stripe') {
      // Cancel with Stripe
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
    
    // Update in our database
    const result = await cancelSubscription({
      userId: session.user.id,
      subscriptionId,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period'
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
