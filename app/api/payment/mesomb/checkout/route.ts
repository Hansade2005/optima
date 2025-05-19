import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { createMeSombPayment } from '@/lib/payment/mesomb';
import { updateUserSubscription } from '@/lib/subscription';
import { z } from 'zod';

const checkoutSchema = z.object({
  phoneNumber: z.string().min(9).max(12),
  service: z.enum(['MTN', 'ORANGE', 'AIRTEL']),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { phoneNumber, service } = checkoutSchema.parse(body);
    
    // 12,000 XAF for the premium plan (as specified in requirements)
    const amount = 12000;
    
    const response = await createMeSombPayment({
      amount,
      payer: phoneNumber,
      fees: true,
      service,
      currency: 'XAF',
      message: "Optima AI Premium Subscription",
      country: 'CM'
    });
    
    if (response.success && response.data) {
      // Update user with pending subscription
      await updateUserSubscription(session.user.id, {
        subscriptionId: response.data.reference,
        subscriptionStatus: 'incomplete',
        subscriptionPlan: 'premium',
        paymentProvider: 'mesomb',
      });
      
      return NextResponse.json({
        success: true,
        message: 'Payment initiated successfully',
        reference: response.data.reference,
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: response.message || 'Payment failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('MeSomb checkout error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}