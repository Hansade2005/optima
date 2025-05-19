import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/payment/stripe';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { updateUserSubscription } from '@/lib/subscription';
import { eq } from 'drizzle-orm';

// This is needed to process the webhook raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Get the signature from the header
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }
    
    // Get the raw body of the request
    const body = await request.text();
    
    // Verify the webhook and get the event
    const event = await handleStripeWebhook(body, signature);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    // Handle the specific event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_details?.email;
        
        if (!customerEmail) {
          return NextResponse.json(
            { error: 'Customer email not found' },
            { status: 400 }
          );
        }
        
        // Find user by email
        const [userData] = await db
          .select()
          .from(user)
          .where(eq(user.email, customerEmail));
        
        if (!userData) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }
        
        // Update the user subscription
        await updateUserSubscription(userData.id, {
          subscriptionId: subscriptionId,
          subscriptionStatus: 'active',
          subscriptionPlan: 'premium',
          type: 'premium',
          paymentProvider: 'stripe',
        });
        
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const customerId = invoice.customer;
        
        if (!subscriptionId) break;
        
        // Find user by subscription ID
        const [userData] = await db
          .select()
          .from(user)
          .where(eq(user.subscriptionId, subscriptionId));
        
        if (!userData) break;
        
        // Update subscription period
        const currentPeriodEnd = new Date(invoice.lines.data[0].period.end * 1000);
        const currentPeriodStart = new Date(invoice.lines.data[0].period.start * 1000);
        
        await updateUserSubscription(userData.id, {
          subscriptionStatus: 'active',
          type: 'premium',
          subscriptionPeriodStart: currentPeriodStart,
          subscriptionPeriodEnd: currentPeriodEnd,
        });
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        
        // Find user by subscription ID
        const [userData] = await db
          .select()
          .from(user)
          .where(eq(user.subscriptionId, subscriptionId));
        
        if (!userData) break;
        
        // Cancel the subscription
        await updateUserSubscription(userData.id, {
          subscriptionStatus: 'canceled',
          subscriptionPlan: 'free',
          type: 'regular',
        });
        
        break;
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}