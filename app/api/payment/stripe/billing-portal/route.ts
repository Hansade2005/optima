import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { createBillingPortalSession } from '@/lib/payment/stripe';
import { getUserSubscription } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const subscription = await getUserSubscription(session.user.id);
    
    if (!subscription || subscription.paymentProvider !== 'stripe' || !subscription.id) {
      return NextResponse.json(
        { error: 'No active Stripe subscription found' },
        { status: 400 }
      );
    }
    
    // Get the domain from the request
    const { origin } = new URL(request.url);
    
    // Create the billing portal session
    const { url } = await createBillingPortalSession({
      customerId: subscription.id,
      returnUrl: `${origin}/settings`,
    });
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Stripe billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}