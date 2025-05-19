import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { createCheckoutSession } from '@/lib/payment/stripe';
import { updateUserSubscription } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    // Get the domain from the request
    const { origin } = new URL(request.url);
    
    // Create success and cancel URLs
    const successUrl = `${origin}/settings?success=true`;
    const cancelUrl = `${origin}/settings?canceled=true`;
    
    // Create the checkout session
    const { sessionId, url } = await createCheckoutSession({
      customerEmail: session.user.email as string,
      successUrl,
      cancelUrl,
    });
    
    // Mark the user as having a pending subscription
    await updateUserSubscription(session.user.id, {
      subscriptionStatus: 'incomplete',
    });
    
    return NextResponse.json({ 
      sessionId,
      url 
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}