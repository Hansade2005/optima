import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';
import { createStripeCheckoutSession } from '@/lib/payments/stripe';

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

    // Get the current origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    
    // Create a checkout session
    const result = await createStripeCheckoutSession({
      customerId: session.user.id,
      customerEmail: session.user.email || '',
      successUrl: `${origin}/account?status=success`,
      cancelUrl: `${origin}/account?status=canceled`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
