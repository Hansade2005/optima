import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/payments/stripe';

// Process Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    
    const result = await handleStripeWebhook(payload, signature);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}
